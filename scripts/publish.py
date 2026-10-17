"""Publish a packaged video to TikTok, Instagram and YouTube through Postiz (user decision 2026-10-11).

Usage: .venv/bin/python scripts/publish.py <id> [--slot | --at "YYYY-MM-DD HH:MM"] [--draft] [--only tiktok,instagram,youtube] [--dry-run]

Needs `status: ready` (scripts/package.py passed) and POSTIZ_API_KEY in .env. Uploads out/<id>/<id>-tiktok.mp4 to the
Postiz media library and creates one post per channel in a single request:
  TikTok     caption, DIRECT_POST, comments on, duet/stitch off, cover frame `cover_ms`
  Instagram  Reel (post_type post) with the caption, cover frame `cover_ms`
  YouTube    Short: title from <id>-youtube-title.txt, caption as description, public, not made for kids
Default: publish right away (user decision 2026-10-11: "jetzt, in demselben Moment", not at a later slot).
--slot schedules for the next start of the note's "- Post at:" window instead, --at for a given time, --draft only
creates drafts in Postiz. TikTok and Instagram can't take our designed cover through the API, only a frame of the video
(`cover_ms:` in the note, default 1000 ms = the hook card); YouTube Shorts ignore custom thumbnails.
Writes `status: scheduled`, `scheduled:` and `postiz:` (post ids) to the note. Any failure (no key, Postiz refuses,
network) raises the upload-failed alert (scripts/postiz.py fail: note, Log, desktop notification) so the user can upload
by hand. scripts/postiz.py check (run by scripts/sync_channel.py every session) catches later errors and marks it posted.
"""

import json
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path

from package import field, section
from postiz import CHANNELS, call, fail
from render import set_field

ROOT = Path(__file__).resolve().parent.parent


def arg(name: str) -> str | None:
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else None


def publish_time(post: str) -> datetime:
    """Next start of the "- Post at: 18:00–21:00" window, at least 20 min away; inside the window: in 20 min."""
    now = datetime.now().astimezone()
    times = re.findall(r"(\d{1,2}):(\d{2})", (re.search(r"^- Post at:\s*(.+)$", post, flags=re.M) or [None, "18:00–21:00"])[1])
    (h1, m1), (h2, m2) = (times + [("21", "00")])[:2] if times else (("18", "00"), ("21", "00"))
    start = now.replace(hour=int(h1), minute=int(m1), second=0, microsecond=0)
    end = now.replace(hour=int(h2), minute=int(m2), second=0, microsecond=0)
    soon = now + timedelta(minutes=20)
    if soon <= start:
        return start
    if soon <= end:
        return soon.replace(second=0, microsecond=0)
    return start + timedelta(days=1)


def settings(kind: str, yt_title: str) -> dict:
    if kind == "tiktok":
        return {"__type": "tiktok-business", "privacy_level": "PUBLIC_TO_EVERYONE", "duet": False, "stitch": False,
                "comment": True, "autoAddMusic": "no", "brand_content_toggle": False, "brand_organic_toggle": False,
                "video_made_with_ai": False, "content_posting_method": "DIRECT_POST"}
    if kind == "instagram":
        return {"__type": "instagram-standalone", "post_type": "post", "is_trial_reel": False, "collaborators": []}
    return {"__type": "youtube", "title": yt_title, "type": "public", "selfDeclaredMadeForKids": "no", "tags": []}


def html(text: str) -> str:
    """Postiz stores post content as HTML paragraphs; one <p> per line keeps the caption's line breaks."""
    esc = lambda s: s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return "".join(f"<p>{esc(line)}</p>" for line in text.splitlines())


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    vid = sys.argv[1]
    try:
        publish(vid)
    except SystemExit:
        raise
    except Exception as e:  # the fallback: never fail silently, the user uploads by hand
        if "--dry-run" in sys.argv or "--draft" in sys.argv:
            raise
        fail(vid, f"{type(e).__name__}: {e}")
        sys.exit(1)


def publish(vid: str) -> None:
    note = ROOT / "SudoRaccoon" / "Videos" / f"{vid}.md"
    md = note.read_text()
    status = field(md, "status")
    if status != "ready" and "--draft" not in sys.argv:
        sys.exit(f"{vid} is '{status}', needs 'ready' (run scripts/package.py {vid} first)")
    out = ROOT / "out" / vid
    video = ROOT / (field(md, "output") or f"out/{vid}/{vid}-tiktok.mp4")
    caption = (out / f"{vid}-caption.txt").read_text().strip()
    yt_title = (out / f"{vid}-youtube-title.txt").read_text().strip()
    cover_ms = int(field(md, "cover_ms") or 1000)
    only = (arg("--only") or ",".join(CHANNELS)).split(",")

    if "--draft" in sys.argv:
        kind, when = "draft", datetime.now().astimezone()
    elif arg("--at"):
        kind, when = "schedule", datetime.strptime(arg("--at"), "%Y-%m-%d %H:%M").astimezone()
    elif "--slot" in sys.argv:
        kind, when = "schedule", publish_time(section(md, "Post"))
    else:
        kind, when = "now", datetime.now().astimezone()

    integrations = call("GET", "/integrations").json()
    ids = {}
    for name in only:
        match = [i for i in integrations if i["identifier"] == CHANNELS[name] and not i.get("disabled")]
        if not match:
            raise RuntimeError(f"no connected {name} channel in Postiz ({CHANNELS[name]}): reconnect it at platform.postiz.com")
        ids[name] = match[0]["id"]

    print(f"{vid}: {kind} {when:%Y-%m-%d %H:%M %Z} → {', '.join(only)} · cover frame {cover_ms} ms · {video.name}")
    if "--dry-run" in sys.argv:
        return

    with video.open("rb") as f:
        media = call("POST", "/upload", files={"file": (video.name, f, "video/mp4")}, timeout=600).json()
    image = [{"id": media["id"], "path": media["path"], "thumbnailTimestamp": cover_ms}]

    body = {
        "type": kind, "date": when.astimezone().isoformat(timespec="seconds"), "shortLink": False, "tags": [],
        "posts": [{"integration": {"id": ids[n]}, "value": [{"content": html(caption), "image": image}],
                   "settings": settings(n, yt_title)} for n in only],
    }
    r = call("POST", "/posts", headers={"Content-Type": "application/json"}, data=json.dumps(body), timeout=120)
    names = {v: k for k, v in ids.items()}
    posts = {names.get(p.get("integration"), p.get("integration")): p.get("postId") for p in r.json()}
    if set(posts) != set(only):
        raise RuntimeError(f"Postiz created posts only for {', '.join(posts) or 'nothing'} (wanted {', '.join(only)})")

    if kind != "draft":
        md = set_field(md, "status", "scheduled")
        md = set_field(md, "scheduled", f"{when:%Y-%m-%d %H:%M}")
        md = set_field(md, "postiz", json.dumps(posts))
        md = re.sub(r"^upload_error:.*\n", "", md, flags=re.M)
        note.write_text(md)
    print(f"{kind}: " + ", ".join(f"{k} {v}" for k, v in posts.items()))


if __name__ == "__main__":
    main()
