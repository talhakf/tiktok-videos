"""Pull the latest 5 videos from TikTok, YouTube and Instagram into the vault: which videos are posted and their stats.

Usage: .venv/bin/python scripts/sync_channel.py [--quiet]

Reads https://www.tiktok.com/@sudoraccoon (yt-dlp for videos, the profile page for followers) and:
  - matches each of the latest 5 TikTok videos to a note in SudoRaccoon/Videos/ (by `url:`, else by caption text,
    else the only `ready`/`scheduled` note with the same duration ±2s, in case a caption was edited)
  - sets `status: posted`, `posted`, `url`, `views`, `likes`, `saves`, `comments`, `shares` on that note
  - rewrites SudoRaccoon/Channel stats.md (current numbers, videos not in the vault, daily history)
  - appends to Log.md only when something new happens (a video went live, a video is missing a note)
First runs scripts/postiz.py check: scheduled Postiz posts that errored or got stuck raise the upload-failed alert,
fully published ones become `posted`.
YouTube and Instagram (followers + per-video numbers as `yt_*` / `ig_*` fields) come from scripts/platform_stats.py.
History lives in SudoRaccoon/Research/Signals/channel-stats.jsonl (one snapshot per day, last one wins).
Run by the `sudo-raccoon` skill at the start of every session. Older videos keep their last synced stats.
"""

import json
import re
import subprocess
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

import os
from platform_stats import env_val, instagram, youtube
from postiz import check as postiz_check
from render import set_field

ROOT = Path(__file__).resolve().parent.parent
VAULT = ROOT / "SudoRaccoon"
HANDLE = (os.environ.get("CHANNEL_HANDLE") or env_val("CHANNEL_HANDLE") or "sudoraccoon").lstrip("@")
PROFILE = f"https://www.tiktok.com/@{HANDLE}"
LIMIT = 50
for i, arg in enumerate(sys.argv):
    if arg == "--limit" and i + 1 < len(sys.argv):
        try:
            LIMIT = int(sys.argv[i + 1])
        except ValueError:
            pass
LAST = LIMIT
HISTORY = VAULT / "Research/Signals/channel-stats.jsonl"
STATS_PAGE = VAULT / "Channel stats.md"
QUIET = "--quiet" in sys.argv
ALL = "--all" in sys.argv
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"


def say(*a) -> None:
    if not QUIET:
        print(*a)


def channel_videos(empty_ok: bool, limit: int = LIMIT) -> list[dict]:
    cmd = ["yt-dlp", "--flat-playlist", "--playlist-end", str(limit), "-j", "--no-warnings", PROFILE]
    out = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    rows = [json.loads(l) for l in out.stdout.splitlines() if l.startswith("{")]
    if not rows and out.returncode != 0 and not empty_ok:
        sys.exit(f"yt-dlp failed: {out.stderr.strip()[-300:]}")
    return rows


def profile_stats() -> dict:
    stats = {}
    try:
        req = urllib.request.Request(PROFILE, headers={"User-Agent": UA})
        html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
        if '"statusCode":10221' in html:
            say(f"@{HANDLE} does not exist on TikTok yet")
            return {}
        m = re.search(r'"stats":\{[^}]*"followerCount":(\d+)[^}]*"heartCount":(\d+)[^}]*"videoCount":(\d+)', html)
        if m:
            stats = {"followers": int(m[1]), "hearts": int(m[2]), "videos": int(m[3])}
    except Exception as e:  # profile page is best effort; videos still sync
        say("profile stats unavailable:", e)

    if not stats.get("followers"):
        cache_path = Path.home() / ".cache" / "omarchy-social-followers.json"
        if cache_path.exists():
            try:
                c = json.loads(cache_path.read_text())
                tt = c.get("tiktok")
                if tt and str(tt).strip() not in ("...", "0", ""):
                    val = str(tt).replace(",", "").strip()
                    stats["followers"] = int(float(val.rstrip("KkMm")) * (1000 if val[-1] in "Kk" else 1_000_000 if val[-1] in "Mm" else 1))
            except Exception:
                pass
    return stats


def field(md: str, name: str) -> str:
    m = re.search(rf"^{name}:[ \t]*(.*)$", md, flags=re.M)
    return m.group(1).strip().strip('"') if m else ""


def norm(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()[:80]


def find_note(video: dict, notes: dict[Path, str]) -> Path | None:
    vid = str(video["id"])
    for path, md in notes.items():
        if vid in field(md, "url"):
            return path
    desc = norm(video.get("description") or video.get("title") or "")
    for path, md in notes.items():
        cap = norm(field(md, "caption"))
        if cap and desc and (cap.startswith(desc[:60]) or desc.startswith(cap[:60])):
            return path
    # a caption may have been edited on the platform: fall back to the only ready/scheduled note of the same length
    dur = video.get("duration")
    if dur:
        same = [p for p, md in notes.items() if field(md, "status") in ("ready", "scheduled") and not field(md, "url")
                and field(md, "duration") and abs(float(field(md, "duration")) - float(dur)) <= 2]
        if len(same) == 1:
            return same[0]
    return None


def log(lines: list[str]) -> None:
    path = VAULT / "Log.md"
    md = path.read_text()
    entry = f"## {datetime.now():%Y-%m-%d} (channel sync)\n" + "\n".join(f"- {l}" for l in lines) + "\n\n"
    i = md.find("\n## ")
    md = md[: i + 1] + entry + md[i + 1 :] if i >= 0 else md + "\n" + entry
    path.write_text(md)


def main() -> None:
    for line in postiz_check():  # scheduled uploads: errors → alert, published → posted
        print(line)
    profile = profile_stats()
    videos = channel_videos(empty_ok=profile.get("videos") == 0, limit=LIMIT)  # a new account has no videos yet
    notes = {p: p.read_text() for p in sorted((VAULT / "Videos").glob("*.md"))}
    now = datetime.now()
    news, rows, unmatched = [], [], []

    for v in sorted(videos, key=lambda v: v.get("timestamp") or 0):
        url = f"{PROFILE}/video/{v['id']}"
        posted = datetime.fromtimestamp(v["timestamp"]).strftime("%Y-%m-%d %H:%M") if v.get("timestamp") else ""
        stats = {
            "views": v.get("view_count"), "likes": v.get("like_count"), "saves": v.get("save_count"),
            "comments": v.get("comment_count"), "shares": v.get("repost_count"),
        }
        path = find_note(v, notes)
        row = {"id": path.stem if path else None, "tiktok_id": str(v["id"]), "url": url, "posted": posted,
               "duration": v.get("duration"), **stats}
        rows.append(row)
        if not path:
            unmatched.append(row | {"description": v.get("description") or v.get("title") or ""})
            continue
        md = notes[path]
        was = field(md, "status")
        if was != "posted":
            md = set_field(md, "status", "posted")
            news.append(f"[[{path.stem}]] is live on TikTok ({posted}): {url}")
        if not field(md, "posted"):
            md = set_field(md, "posted", posted)
        md = set_field(md, "url", url)
        if not re.search(r"^shares:", md, flags=re.M):  # older notes lack it; keep it next to comments
            md = re.sub(r"^(comments:.*)$", r"\1\nshares:", md, count=1, flags=re.M)
        for k, val in stats.items():
            if val is not None:
                md = set_field(md, k, str(val))
        if md != notes[path]:
            path.write_text(md)
            notes[path] = md
        say(f"{path.stem}: {stats}")

    yt_account, yt_rows = youtube(notes, say, limit=LIMIT)
    ig_account, ig_rows = instagram(notes, say, limit=LIMIT)
    say(f"youtube: {yt_account.get('subscribers', '?')} subscribers, {len(yt_rows)} videos · "
        f"instagram: {ig_account.get('followers', '?')} followers, {len(ig_rows)} reels")

    # daily history, one snapshot per day (last run of the day wins)
    HISTORY.parent.mkdir(parents=True, exist_ok=True)
    snaps = [json.loads(l) for l in HISTORY.read_text().splitlines()] if HISTORY.exists() else []
    today = f"{now:%Y-%m-%d}"
    snaps = [s for s in snaps if s["date"] != today]
    snaps.append({"date": today, "time": f"{now:%H:%M}", **profile, "videos": rows,
                  "youtube": {**yt_account, "videos": yt_rows}, "instagram": {**ig_account, "videos": ig_rows}})
    HISTORY.parent.mkdir(parents=True, exist_ok=True)
    HISTORY.write_text("".join(json.dumps(s) + "\n" for s in snaps))

    write_stats_page(now, profile, rows, unmatched, snaps, limit=LIMIT)

    known = {r["tiktok_id"] for s in snaps[:-1] for r in s.get("videos", []) if r.get("id") is None}
    for u in unmatched:
        if u["tiktok_id"] not in known:
            news.append(f"Video on TikTok without a vault note: {u['url']} (\"{u['description'][:60]}…\")")
    if news:
        log(news)
    for n in news:
        print(n)
    say(f"synced {len(rows)} TikTok videos, {len(unmatched)} without a note, followers {profile.get('followers', '?')}")


def fmt(n) -> str:
    return "–" if n is None else f"{n:,}"


def write_stats_page(now, profile, rows, unmatched, snaps, limit: int = LIMIT) -> None:
    snap = snaps[-1]
    yt, ig = snap.get("youtube", {}), snap.get("instagram", {})
    prev = snaps[-2] if len(snaps) > 1 else {}  # last snapshot from an earlier day
    total = lambda vs, k: fmt(sum(v.get(k) or 0 for v in vs)) if vs else "–"

    def change(now_v, prev_v) -> str:
        if now_v is None or prev_v is None or now_v == prev_v:
            return ""
        return f" ({now_v - prev_v:+,} since {prev['date'][5:]})"

    tt_f, yt_f, ig_f = profile.get("followers"), yt.get("subscribers"), ig.get("followers")
    scope_str = f"latest {limit} videos each"
    view_col_header = f"Views (latest {limit})"
    L = [
        "# Channel stats",
        "",
        f"Live numbers for **@{HANDLE}** on [TikTok]({PROFILE}), [YouTube](https://www.youtube.com/@{HANDLE}) and "
        f"[Instagram](https://www.instagram.com/{HANDLE}/), pulled by `scripts/sync_channel.py` ({scope_str}). Last sync: **{now:%Y-%m-%d %H:%M}**.",
        "Do not edit by hand; the script rewrites this page. Learnings go in each video note's `## Results & learnings`.",
        "",
        "## Account",
        f"| Platform | Followers | Videos | {view_col_header} | Likes | Comments | Saves |",
        "| --- | --- | --- | --- | --- | --- | --- |",
        f"| [TikTok]({PROFILE}) | **{fmt(tt_f)}**{change(tt_f, prev.get('followers'))} | {fmt(profile.get('videos'))} | "
        f"{total(rows, 'views')} | {total(rows, 'likes')} | {total(rows, 'comments')} | {total(rows, 'saves')} |",
        f"| [YouTube](https://www.youtube.com/@{HANDLE}) | **{fmt(yt_f)}**{change(yt_f, prev.get('youtube', {}).get('subscribers'))} | "
        f"{len(yt.get('videos', []))} | {total(yt.get('videos', []), 'yt_views')} | {total(yt.get('videos', []), 'yt_likes')} | "
        f"{total(yt.get('videos', []), 'yt_comments')} | – |",
        f"| [Instagram](https://www.instagram.com/{HANDLE}/) | **{fmt(ig_f)}**{change(ig_f, prev.get('instagram', {}).get('followers'))} | "
        f"{fmt(ig.get('posts'))} | {total(ig.get('videos', []), 'ig_views')} | {total(ig.get('videos', []), 'ig_likes')} | "
        f"{total(ig.get('videos', []), 'ig_comments')} | {total(ig.get('videos', []), 'ig_saves')} |",
        "",
        "YouTube followers = subscribers. Instagram per-Reel numbers come from Postiz, so only Reels it published are counted.",
        "",
        f"## TikTok, latest {limit}",
        "| Video | Posted | Views | Likes | Saves | Comments | Shares |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    for r in sorted(rows, key=lambda r: r["posted"], reverse=True):
        name = f"[[{r['id']}]]" if r["id"] else f"[not in vault]({r['url']})"
        L.append(f"| {name} | {r['posted']} | {fmt(r['views'])} | {fmt(r['likes'])} | {fmt(r['saves'])} | "
                 f"{fmt(r['comments'])} | {fmt(r['shares'])} |")
    L += ["", f"## YouTube, latest {limit}", "| Video | Views | Likes | Comments |", "| --- | --- | --- | --- |"]
    L += [f"| [[{r['id']}]] ([watch]({r['url']})) | {fmt(r['yt_views'])} | {fmt(r['yt_likes'])} | {fmt(r['yt_comments'])} |"
          for r in yt.get("videos", [])]
    L += ["", f"## Instagram, latest {limit}", "| Video | Views | Likes | Comments | Shares | Saves |", "| --- | --- | --- | --- | --- | --- |"]
    L += [f"| [[{r['id']}]] | {fmt(r['ig_views'])} | {fmt(r['ig_likes'])} | {fmt(r['ig_comments'])} | {fmt(r['ig_shares'])} | {fmt(r['ig_saves'])} |"
          for r in ig.get("videos", [])]
    if unmatched:
        L += ["", "## On TikTok but not in the vault", ""]
        L += [f"- [{u['tiktok_id']}]({u['url']}) {u['posted']}: {u['description'][:120]}" for u in unmatched]
    L += ["", f"## History (daily, latest {limit} videos each)",
          "| Date | TikTok followers | TikTok views | YouTube subscribers | YouTube views | Instagram followers | Instagram views |",
          "| --- | --- | --- | --- | --- | --- | --- |"]
    for sn in reversed(snaps[-60:]):
        y, i = sn.get("youtube", {}), sn.get("instagram", {})
        L.append(f"| {sn['date']} | {fmt(sn.get('followers'))} | {total(sn.get('videos', []), 'views')} | "
                 f"{fmt(y.get('subscribers'))} | {total(y.get('videos', []), 'yt_views')} | "
                 f"{fmt(i.get('followers'))} | {total(i.get('videos', []), 'ig_views')} |")
    STATS_PAGE.write_text("\n".join(L) + "\n")

if __name__ == "__main__":
    main()
