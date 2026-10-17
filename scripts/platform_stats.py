"""YouTube and Instagram numbers for the channel sync (TikTok lives in sync_channel.py). Added 2026-10-11.

YouTube (@sudoraccoon): yt-dlp on each note's `youtube_url` (views, likes, comments; subscribers from the same page).
  Videos found on the channel's Shorts tab get `youtube_url` by title match (the note's `- YouTube title:`), so hand
  uploads are tracked too.
Instagram (@sudoraccoon): followers and posts from the public profile page; per Reel views, likes, comments, shares,
  saves from Postiz post analytics (the note's `postiz:` instagram id), so only Reels published through Postiz have stats.
Each returns (account, rows) and writes `yt_*` / `ig_*` fields into the notes. Best effort: errors are reported, never fatal.
"""

import json
import os
import re
import subprocess
import time
import urllib.request
from datetime import datetime
from pathlib import Path

from render import set_field

ROOT = Path(__file__).resolve().parent.parent


def env_val(key: str) -> str:
    env = ROOT / ".env"
    for line in env.read_text().splitlines() if env.exists() else []:
        if line.startswith(f"{key}="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    return ""


HANDLE = (os.environ.get("CHANNEL_HANDLE") or env_val("CHANNEL_HANDLE") or "sudoraccoon").lstrip("@")
YT = f"https://www.youtube.com/@{HANDLE}"
IG = f"https://www.instagram.com/{HANDLE}/"
LAST = 50
UA_BOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"


def field(md: str, name: str) -> str:
    m = re.search(rf"^{name}:[ \t]*(.*)$", md, flags=re.M)
    return m.group(1).strip().strip('"') if m else ""


def norm(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def write(path: Path, notes: dict[Path, str], values: dict) -> None:
    md = notes[path]
    for k, v in values.items():
        if v is not None:
            md = set_field(md, k, str(v))
    if md != notes[path]:
        path.write_text(md)
        notes[path] = md


def latest(notes: dict[Path, str], key: str, limit: int | None = LAST) -> list[Path]:
    have = [p for p, md in notes.items() if field(md, key)]
    res = sorted(have, key=lambda p: field(notes[p], "posted") or "", reverse=True)
    return res[:limit] if limit else res


def ytdlp(*args: str) -> dict:
    out = subprocess.run(["yt-dlp", "-J", "--no-warnings", *args], capture_output=True, text=True, timeout=180)
    if out.returncode:
        raise RuntimeError(out.stderr.strip().splitlines()[-1] if out.stderr.strip() else "yt-dlp failed")
    return json.loads(out.stdout)


def get_instagram_followers(say=print) -> int | None:
    """Robust Instagram follower count fetch: Cache -> Mobile SSR -> Socialblade -> Picuki -> og:tag."""
    # 1. Check omarchy menubar cache first if fresh (< 1 hour)
    cache_path = Path.home() / ".cache" / "omarchy-social-followers.json"
    if cache_path.exists():
        try:
            d = json.loads(cache_path.read_text())
            ig = d.get("instagram")
            if ig and str(ig).strip() not in ("...", "0", ""):
                val = str(ig).replace(",", "").strip()
                num = int(float(val.rstrip("KkMm")) * (1000 if val[-1] in "Kk" else 1_000_000 if val[-1] in "Mm" else 1))
                if time.time() - d.get("last_updated", 0) < 3600:
                    return num
        except Exception:
            pass

    # 2. Direct mobile SSR with iPhone User-Agent
    try:
        req = urllib.request.Request(IG, headers={
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        })
        html = urllib.request.urlopen(req, timeout=8).read().decode("utf-8", "ignore")
        m = re.search(r'"follower_count":\s*(\d+)', html)
        if m and m.group(1).strip() not in ("", "0"):
            return int(m.group(1).strip())
    except Exception:
        pass

    # 3. Socialblade fallback
    try:
        url = f"https://socialblade.com/instagram/user/{HANDLE}"
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        })
        with urllib.request.urlopen(req, timeout=6) as resp:
            html = resp.read().decode("utf-8", "ignore")
        m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html)
        if m:
            data = json.loads(m.group(1))
            for q in data.get("props", {}).get("pageProps", {}).get("trpcState", {}).get("json", {}).get("queries", []):
                d = q.get("state", {}).get("data")
                if isinstance(d, dict) and d.get("username", "").lower() == HANDLE.lower():
                    fol = d.get("followers") or d.get("stats", {}).get("followers")
                    if fol is not None:
                        return int(fol)
    except Exception:
        pass

    # 4. Picuki fallback
    try:
        req = urllib.request.Request(f"https://www.picuki.com/profile/{HANDLE}", headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        with urllib.request.urlopen(req, timeout=6) as resp:
            html = resp.read().decode("utf-8", "ignore")
        m = re.search(r'<span class="profile-stat-number">([^<]+)</span>\s*<span class="profile-stat-label">\s*followers', html, re.I)
        if m and m.group(1).strip() not in ("", "0"):
            s = m.group(1).strip().replace(",", "")
            return int(float(s.rstrip("KkMm")) * (1000 if s[-1] in "Kk" else 1_000_000 if s[-1] in "Mm" else 1))
    except Exception:
        pass

    # 5. og:description fallback
    try:
        req = urllib.request.Request(IG, headers={"User-Agent": UA_BOT})
        html = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", "replace")
        m = re.search(r'og:description" content="([\d.,KkMm]+) Followers', html)
        if m:
            s = m.group(1).replace(",", "")
            return int(float(s.rstrip("KkMm")) * (1000 if s[-1] in "Kk" else 1_000_000 if s[-1] in "Mm" else 1))
    except Exception as e:
        say("instagram profile unavailable:", e)

    return None


def youtube(notes: dict[Path, str], say=print, limit: int = LAST) -> tuple[dict, list[dict]]:
    # hand uploads: match the Shorts tab to notes by title (fails quietly until the tab exists)
    try:
        tab_args = ["--flat-playlist", "--playlist-end", str(limit)]
        tab = ytdlp(*tab_args, f"{YT}/shorts")
        titles = {norm(re.search(r"^- YouTube title:\s*(.+)$", md, flags=re.M)[1]): p
                  for p, md in notes.items() if re.search(r"^- YouTube title:\s*(.+)$", md, flags=re.M)}
        for e in tab.get("entries") or []:
            p = titles.get(norm(e.get("title") or ""))
            if p and not field(notes[p], "youtube_url"):
                write(p, notes, {"youtube_url": f"https://www.youtube.com/shorts/{e['id']}"})
    except Exception:
        pass

    account, rows = {}, []
    target_notes = latest(notes, "youtube_url", limit=limit)

    for idx, p in enumerate(target_notes):
        if idx > 0:
            time.sleep(1.2)  # polite pause to respect YouTube rate limits
        try:
            d = ytdlp("--skip-download", field(notes[p], "youtube_url"))
        except Exception as e:
            err_str = str(e).lower()
            say(f"youtube {p.stem}: {e}")
            if "429" in err_str or "too many requests" in err_str or "rate limit" in err_str:
                say(f"youtube rate limit encountered on {p.stem}; pausing further video queries to protect IP.")
                break
            continue
        account["subscribers"] = d.get("channel_follower_count", account.get("subscribers"))
        stats = {"yt_views": d.get("view_count"), "yt_likes": d.get("like_count"), "yt_comments": d.get("comment_count")}
        write(p, notes, stats)
        rows.append({"id": p.stem, "url": field(notes[p], "youtube_url"), **stats})
    return account, rows


def fetch_public_instagram_reels(handle: str, say=print) -> tuple[int | None, dict[str, dict]]:
    """Fetch follower_count and per-Reel play/like/comment counts from Instagram's public /reels/ page + GraphQL."""
    followers = None
    by_code: dict[str, dict] = {}
    try:
        import yt_dlp
        from yt_dlp.extractor.instagram import InstagramIE
        from yt_dlp.utils import urlencode_postdata

        with yt_dlp.YoutubeDL({"quiet": True}) as ydl:
            ie = InstagramIE(ydl)
            ie._real_initialize()
            html, _ = ie._download_webpage_handle(f"https://www.instagram.com/{handle}/reels/", handle)
            cursor = None
            target_id = None

            def walk(obj):
                nonlocal cursor, followers, target_id
                if isinstance(obj, dict):
                    if "follower_count" in obj and obj["follower_count"] is not None:
                        followers = int(obj["follower_count"])
                    if "code" in obj and "play_count" in obj:
                        by_code[obj["code"]] = obj
                        if not target_id and obj.get("pk"):
                            target_id = str(obj["pk"])
                    if "page_info" in obj and isinstance(obj["page_info"], dict) and obj["page_info"].get("end_cursor"):
                        cursor = obj["page_info"]["end_cursor"]
                    for v in obj.values():
                        walk(v)
                elif isinstance(obj, list):
                    for v in obj:
                        walk(v)

            for m in re.finditer(r"<script\b[^>]+\bdata-sjs>(\{.+?\})</script>", html):
                walk(json.loads(m.group(1)))

            if cursor and target_id:
                ie._download_json(
                    "https://www.instagram.com/api/v1/web/get_ruling_for_content/", handle,
                    fatal=False, headers=ie._api_headers,
                    query={"content_type": "MEDIA", "target_id": target_id},
                )
                csrf = ie._get_cookies("https://www.instagram.com").get("csrftoken")
                content, _ = ie._download_webpage_handle(
                    "https://www.instagram.com/api/graphql", handle,
                    headers={
                        **ie._api_headers,
                        "X-FB-Friendly-Name": "PolarisLoggedOutDesktopWWWProfileReelsTabContentQuery",
                        "X-CSRFToken": csrf.value if csrf else "",
                        "X-FB-LSD": ie._lsd_token,
                        "X-Requested-With": "XMLHttpRequest",
                        "Sec-Fetch-Dest": "empty",
                        "Sec-Fetch-Mode": "cors",
                        "Sec-Fetch-Site": "same-origin",
                        "Referer": f"https://www.instagram.com/{handle}/reels/",
                    },
                    data=urlencode_postdata({
                        "lsd": ie._lsd_token,
                        "fb_api_caller_class": "RelayModern",
                        "fb_api_req_friendly_name": "PolarisLoggedOutDesktopWWWProfileReelsTabContentQuery",
                        "server_timestamps": "true",
                        "variables": json.dumps({"after": cursor, "first": 12, "username": handle}, separators=(",", ":")),
                        "doc_id": "27838951732404191",
                    }),
                )
                walk(json.loads(content))
    except Exception as e:
        say("public instagram reels fetch unavailable:", e)
    return followers, by_code


def instagram(notes: dict[Path, str], say=print, limit: int = LAST) -> tuple[dict, list[dict]]:
    pub_followers, by_code = fetch_public_instagram_reels(HANDLE, say)
    followers = pub_followers or get_instagram_followers(say)
    account = {"followers": followers}

    rows = []
    target_notes = latest(notes, "instagram_url", limit=limit)
    account["posts"] = len(target_notes)

    for p in target_notes:
        ig_url = field(notes[p], "instagram_url")
        m = re.search(r"/reel/([^/?#]+)", ig_url)
        code = m.group(1) if m else ""
        stats = {
            "ig_views": int(field(notes[p], "ig_views")) if field(notes[p], "ig_views").isdigit() else None,
            "ig_likes": int(field(notes[p], "ig_likes")) if field(notes[p], "ig_likes").isdigit() else None,
            "ig_comments": int(field(notes[p], "ig_comments")) if field(notes[p], "ig_comments").isdigit() else None,
            "ig_shares": int(field(notes[p], "ig_shares")) if field(notes[p], "ig_shares").isdigit() else None,
            "ig_saves": int(field(notes[p], "ig_saves")) if field(notes[p], "ig_saves").isdigit() else None,
        }
        if code in by_code:
            it = by_code[code]
            stats["ig_views"] = it.get("play_count") or stats["ig_views"]
            stats["ig_likes"] = it.get("like_count") if it.get("like_count") is not None else stats["ig_likes"]
            stats["ig_comments"] = it.get("comment_count") if it.get("comment_count") is not None else stats["ig_comments"]
            write(p, notes, stats)
        rows.append({"id": p.stem, "url": ig_url, **stats})
    return account, rows


if __name__ == "__main__":
    vault = Path(__file__).resolve().parent.parent / "SudoRaccoon" / "Videos"
    ns = {p: p.read_text() for p in sorted(vault.glob("*.md"))}
    print("youtube", youtube(ns))
    print("instagram", instagram(ns))
    print(f"{datetime.now():%H:%M}")
