"""Check a rendered video + its post copy, and produce everything needed to upload it.

Usage: .venv/bin/python scripts/package.py <id>

Reads SudoRaccoon/Videos/<id>.md:
  ## Post   a ```text block with the caption (hashtags at the end), a "- Keyword:" and a "- YouTube title:" line
Checks the caption against Playbook/Caption and hashtags.md, the video against TikTok specs and the cover
(out/<id>/<id>-cover.jpg from scripts/render.py, 1080×1440). Writes:
  out/<id>/<id>-caption.txt   caption, ready to paste (TikTok, Instagram, YouTube description)
  out/<id>/<id>-youtube-title.txt   YouTube Shorts title (≤ 100 chars)
  note frontmatter `caption:` (shown in the Videos base) and `status: ready` when nothing failed.
Next: scripts/publish.py uploads it through Postiz (status: scheduled); the session sync then sets `status: posted`.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

from render import set_field

ROOT = Path(__file__).resolve().parent.parent
TAG = re.compile(r"#[A-Za-z0-9_]+")
# user decision 2026-10-10: no song names or credits of any kind in captions
NO_CREDITS = re.compile(r"🎵|♪|chill day|lakey|\bcredits?\b|\bmusic by\b|\bsong\b|\bcc by", re.I)


def section(md: str, heading: str) -> str:
    m = re.search(rf"^## {re.escape(heading)}[ \t]*\n(.*?)(?=^## |\Z)", md, flags=re.S | re.M)
    return m.group(1) if m else ""


def field(md: str, name: str) -> str:
    m = re.search(rf"^{name}:[ \t]*(.*)$", md, flags=re.M)
    return m.group(1).strip().strip('"') if m else ""


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    vid = next(a for a in sys.argv[1:] if not a.startswith("--"))
    note = ROOT / "SudoRaccoon" / "Videos" / f"{vid}.md"
    md = note.read_text()
    post = section(md, "Post")
    fails, warns = [], []

    # ---------- caption ----------
    block = re.search(r"```text\n(.*?)\n```", post, flags=re.S)
    if not block:
        sys.exit(f"no ```text caption block under ## Post in {note.name}")
    caption = block.group(1).strip()
    tags = TAG.findall(caption)
    body = TAG.sub("", caption).strip()
    keyword = (re.search(r"^- Keyword:\s*(.+)$", post, flags=re.M) or [None, ""])[1].strip()
    yt_title = (re.search(r"^- YouTube title:\s*(.+)$", post, flags=re.M) or [None, ""])[1].strip()

    if not 10 <= len(yt_title) <= 100:
        fails.append(f"YouTube title {len(yt_title)} chars (need a '- YouTube title:' line, 10–100 chars)")

    if not 3 <= len(tags) <= 5:
        fails.append(f"{len(tags)} hashtags (need 3–5; TikTok caps at 5)")
    if len(set(t.lower() for t in tags)) != len(tags):
        fails.append("duplicate hashtags")
    if any(t != t.lower() for t in tags):
        fails.append("hashtags must be lowercase: " + " ".join(t for t in tags if t != t.lower()))
    if len(caption) > 4000:
        fails.append(f"caption is {len(caption)} chars (TikTok max 4000)")
    if not 120 <= len(body) <= 400:
        warns.append(f"caption text is {len(body)} chars (aim for 150–300 before the hashtags)")
    if not keyword:
        fails.append("no '- Keyword:' line (the phrase people would search)")
    elif keyword.lower() not in body[:100].lower():
        fails.append(f"keyword '{keyword}' is not in the first 100 characters")
    if "?" not in body:
        fails.append("no question in the caption (match the bubble's question)")
    if NO_CREDITS.search(caption):
        fails.append(f"caption names the song or a credit ('{NO_CREDITS.search(caption).group(0)}'): leave it out")
    shouty = re.findall(r"\b[A-Z]{4,}\b", body)
    if shouty:
        warns.append("uppercase words (fine only for acronyms): " + ", ".join(shouty))

    # ---------- video file ----------
    out = ROOT / (field(md, "output") or f"out/{vid}/{vid}-tiktok.mp4")
    cover = ROOT / (field(md, "cover") or f"out/{vid}/{vid}-cover.jpg")
    if not out.exists():
        fails.append(f"missing {out.relative_to(ROOT)} (render + master first)")
    else:
        probe = json.loads(subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height,pix_fmt:format=duration,size",
             "-of", "json", str(out)], capture_output=True, text=True).stdout)
        v = next((s for s in probe["streams"] if s["codec_type"] == "video"), {})
        a = next((s for s in probe["streams"] if s["codec_type"] == "audio"), None)
        dur = float(probe["format"]["duration"])
        size = int(probe["format"]["size"]) / 1e6
        if (v.get("width"), v.get("height")) != (1080, 1920):
            fails.append(f"video is {v.get('width')}x{v.get('height')}, not 1080x1920")
        if v.get("codec_name") != "h264" or v.get("pix_fmt") != "yuv420p":
            fails.append(f"video codec {v.get('codec_name')}/{v.get('pix_fmt')} (want h264/yuv420p)")
        if not a or a.get("codec_name") != "aac":
            fails.append("audio missing or not AAC")
        if dur > 180:
            fails.append(f"duration {dur:.1f}s is over 3:00 (YouTube Shorts limit)")
        elif dur < 60:
            warns.append(f"duration {dur:.1f}s (user prefers at least 60s, see Video format)")
    if not cover.exists():
        fails.append(f"missing {cover.relative_to(ROOT)} (scripts/render.py <id> --cover-only)")
    else:
        c = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=width,height", "-of", "json", str(cover)],
                                      capture_output=True, text=True).stdout)["streams"][0]
        if (c["width"], c["height"]) != (1080, 1440):
            fails.append(f"cover is {c['width']}x{c['height']}, TikTok wants 3:4 (1080x1440)")

    print(f"{vid}: {len(body)} chars + {len(tags)} hashtags {' '.join(tags)}")
    for w in warns:
        print("  warn:", w)
    for f in fails:
        print("  FAIL:", f)
    if fails:
        sys.exit(1)

    txt = out.parent / f"{vid}-caption.txt"
    txt.write_text(caption + "\n")
    (out.parent / f"{vid}-youtube-title.txt").write_text(yt_title + "\n")
    md = set_field(md, "caption", json.dumps(caption, ensure_ascii=False))
    if field(md, "status") in ("rendered", "ready"):
        md = re.sub(r"^status: .*$", "status: ready", md, count=1, flags=re.M)
    note.write_text(md)
    rel = lambda p: p.relative_to(ROOT)
    print(f"ready: {rel(out)} · {rel(cover)} · {rel(txt)} ({dur:.0f}s, {size:.1f} MB)")


if __name__ == "__main__":
    main()
