"""Postiz helpers: API access, the upload-failed alert, and the check of scheduled posts (user decision 2026-10-11).

Usage:
  .venv/bin/python scripts/postiz.py check                 check every `status: scheduled` note against Postiz
  .venv/bin/python scripts/postiz.py fail <id> "<reason>"  raise the upload-failed alert by hand (e.g. publish was blocked)

The alert (`fail`) is the fallback whenever a video can't be published automatically, for whatever reason:
  - the note gets `upload_error: "<reason>"` and goes back to `status: ready` (shown under Ready to upload on Home)
  - Log.md gets an "upload failed" entry
  - a critical desktop notification (notify-send) and an `UPLOAD FAILED` line on stdout, which Claude repeats to the user
The user then uploads by hand ([[Posting checklist]] → By hand).

`check` (run by scripts/sync_channel.py at the start of every session) reads each scheduled note's `postiz:` post ids:
  ERROR in Postiz, post deleted, or still not published 2 h after `scheduled` → alert for that channel
  all channels published → `status: posted`, `posted`, `instagram_url`, `youtube_url`, `tiktok_url`
  (the TikTok sync then adds `url` and the stats)
"""

import json
import re
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests

from render import set_field

ROOT = Path(__file__).resolve().parent.parent
VAULT = ROOT / "SudoRaccoon"
API = "https://api.postiz.com/public/v1"
CHANNELS = {"tiktok": "tiktok-business", "instagram": "instagram-standalone", "youtube": "youtube"}
STUCK = timedelta(hours=2)  # still not published this long after the scheduled time → alert


def field(md: str, name: str) -> str:
    m = re.search(rf"^{name}:[ \t]*(.*)$", md, flags=re.M)
    return m.group(1).strip().strip('"') if m else ""


def api_key() -> str:
    env = ROOT / ".env"
    for line in env.read_text().splitlines() if env.exists() else []:
        if line.startswith("POSTIZ_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"')
    raise RuntimeError("POSTIZ_API_KEY missing in .env (Postiz → Settings → Public API; set once per computer)")


def call(method: str, path: str, **kw) -> requests.Response:
    r = requests.request(method, f"{API}{path}", headers={"Authorization": api_key()} | kw.pop("headers", {}),
                         timeout=kw.pop("timeout", 60), **kw)
    if not r.ok:
        raise RuntimeError(f"Postiz {method} {path} → {r.status_code}: {r.text[:500]}")
    return r


def log(lines: list[str], title: str) -> None:
    path = VAULT / "Log.md"
    md = path.read_text()
    entry = f"## {datetime.now():%Y-%m-%d} ({title})\n" + "\n".join(f"- {l}" for l in lines) + "\n\n"
    i = md.find("\n## ")
    path.write_text(md[: i + 1] + entry + md[i + 1 :] if i >= 0 else md + "\n" + entry)


def fail(vid: str, reason: str) -> None:
    """The fallback: tell the user this video is NOT (fully) online and why, so they can upload it by hand."""
    reason = " ".join(reason.split())[:400]
    note = VAULT / "Videos" / f"{vid}.md"
    if note.exists():
        md = note.read_text()
        md = set_field(md, "upload_error", json.dumps(f"{datetime.now():%Y-%m-%d %H:%M} {reason}", ensure_ascii=False))
        if field(md, "status") in ("scheduled", "rendered", "ready"):
            md = set_field(md, "status", "ready")
        note.write_text(md)
    log([f"**Upload failed:** [[{vid}]] is not online: {reason}. Upload it by hand ([[Posting checklist]] → By hand), "
         f"files in `out/{vid}/`."], "upload failed")
    try:
        app_name = "Sudo the Raccoon"
        env = ROOT / ".env"
        for line in env.read_text().splitlines() if env.exists() else []:
            if line.startswith("CHANNEL_NAME="):
                app_name = line.split("=", 1)[1].strip().strip('"').strip("'") or app_name
        subprocess.run(["notify-send", "-u", "critical", "-a", app_name, f"Upload failed: {vid}",
                        f"{reason}\nUpload by hand: out/{vid}/"], timeout=10)
    except Exception:
        pass
    print(f"UPLOAD FAILED {vid}: {reason} → upload by hand (Posting checklist), files in out/{vid}/")


def check() -> list[str]:
    """Compare every scheduled note with Postiz; returns one line per change."""
    news = []
    for note in sorted((VAULT / "Videos").glob("*.md")):
        md = note.read_text()
        if field(md, "status") != "scheduled":
            continue
        vid = note.stem
        try:
            ids = json.loads(field(md, "postiz") or "{}")
            when = datetime.strptime(field(md, "scheduled"), "%Y-%m-%d %H:%M").astimezone()
            win = {"startDate": f"{(when - timedelta(days=2)).astimezone(timezone.utc):%Y-%m-%dT%H:%M:%S}Z",
                   "endDate": f"{(when + timedelta(days=30)).astimezone(timezone.utc):%Y-%m-%dT%H:%M:%S}Z"}
            posts = {p["id"]: p for p in call("GET", "/posts", params=win).json().get("posts", [])}
        except Exception as e:  # Postiz unreachable: say so, keep the note as it is, try again next session
            news.append(f"{vid}: could not check Postiz ({e})")
            continue
        late = datetime.now().astimezone() > when + STUCK
        problems, urls = [], {}
        for ch, pid in ids.items():
            p = posts.get(pid)
            if not p:
                problems.append(f"{ch} post is gone from Postiz")
            elif p.get("state") == "ERROR":
                problems.append(f"{ch}: {p.get('error') or 'Postiz reported an error'}")
            elif p.get("state") == "PUBLISHED":
                urls[ch] = p.get("releaseURL") or ""
            elif late:
                problems.append(f"{ch} still '{p.get('state')}' {STUCK.seconds // 3600} h after {when:%H:%M}")
        for ch, url in urls.items():
            if url:
                md = set_field(md, f"{ch}_url", url)
        if problems:
            note.write_text(md)
            done = f" ({', '.join(urls)} went live)" if urls else ""
            fail(vid, "; ".join(problems) + done)
            news.append(f"{vid}: upload failed: {'; '.join(problems)}")
        elif len(urls) == len(ids) and ids:
            md = set_field(md, "status", "posted")
            if not field(md, "posted"):
                md = set_field(md, "posted", f"{when:%Y-%m-%d %H:%M}")
            note.write_text(md)
            log([f"[[{vid}]] is live on {', '.join(urls)} via Postiz: " + " · ".join(u for u in urls.values() if u)], "published")
            news.append(f"{vid}: live on {', '.join(urls)}")
        else:
            note.write_text(md)
            news.append(f"{vid}: scheduled {when:%Y-%m-%d %H:%M}, waiting ({', '.join(f'{c} {posts[i]['state']}' for c, i in ids.items() if i in posts)})")
    return news


if __name__ == "__main__":
    if sys.argv[1:2] == ["check"]:
        for line in check():
            print(line)
    elif sys.argv[1:2] == ["fail"] and len(sys.argv) >= 4:
        fail(sys.argv[2], " ".join(sys.argv[3:]))
    else:
        sys.exit(__doc__)
