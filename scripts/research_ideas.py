"""Collect performance signals for new video ideas and save them to the vault.

Usage: .venv/bin/python scripts/research_ideas.py [--days 30] [--quick] [--history 200]

Inputs (vault, source of truth):
  SudoRaccoon/Research/Competitors.md   "## TikTok" list of @handles to benchmark
  SudoRaccoon/Research/Seeds.md         "## YouTube", "## Hacker News", "## GitHub topics" lists
  SudoRaccoon/Videos/*.md               what we already made / planned (for de-duplication)
Output:
  SudoRaccoon/Research/Signals/<date>.md   raw ranked signals with numbers + links

Sources (all keyless): TikTok profiles via yt-dlp, YouTube search via yt-dlp, Hacker News (Algolia API),
GitHub search API. Reddit and general web trends are added afterwards by the agent with WebSearch.
"""

import datetime as dt
import json
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VAULT = ROOT / "SudoRaccoon"
UA = "Mozilla/5.0 (X11; Linux x86_64) sudo-raccoon-research/1.0"
DAYS = int(sys.argv[sys.argv.index("--days") + 1]) if "--days" in sys.argv else 30
QUICK = "--quick" in sys.argv
HISTORY = int(sys.argv[sys.argv.index("--history") + 1]) if "--history" in sys.argv else 0  # deep scan: all-time outliers
TODAY = dt.date.today()


def md_list(path: Path, heading: str) -> list[str]:
    if not path.exists():
        return []
    m = re.search(rf"^## {re.escape(heading)}\s*\n(.*?)(?=^## |\Z)", path.read_text(), flags=re.S | re.M)
    if not m:
        return []
    return [re.sub(r"^[-*]\s+", "", l).split(" — ")[0].strip() for l in m.group(1).splitlines() if re.match(r"^[-*]\s+\S", l)]


def get_json(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def ytdlp_flat(target: str, limit: int) -> list[dict]:
    try:
        out = subprocess.run(
            ["yt-dlp", "--flat-playlist", "--playlist-end", str(limit), "-j", "--no-warnings", target],
            capture_output=True, text=True, timeout=180,
        ).stdout
    except subprocess.TimeoutExpired:
        return []
    rows = []
    for line in out.splitlines():
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            pass
    return rows


def fmt(n) -> str:
    if n is None:
        return "?"
    n = int(n)
    return f"{n / 1e6:.1f}M" if n >= 1e6 else f"{n / 1e3:.1f}K" if n >= 1e4 else str(n)


def existing_videos() -> list[dict]:
    vids = []
    for p in sorted((VAULT / "Videos").glob("*.md")):
        t = p.read_text()
        get = lambda k: (re.search(rf"^{k}:\s*(.*)$", t, flags=re.M) or [None, ""])[1].strip().strip('"')
        vids.append({"id": p.stem, "title": get("title"), "status": get("status"), "tools": get("tools")})
    return vids


def main() -> None:
    lines = [f"# Signals {TODAY.isoformat()}", "",
             f"Raw signals from `scripts/research_ideas.py` (last {DAYS} days where the source supports it). "
             "Synthesis lives in the matching **Idea scan** note.", ""]

    vids = existing_videos()
    lines += ["## Already in the vault", "", "| id | title | status | tools |", "| --- | --- | --- | --- |"]
    lines += [f"| [[{v['id']}]] | {v['title']} | {v['status']} | {v['tools']} |" for v in vids]
    lines.append("")

    # --- TikTok competitors ---------------------------------------------------------------
    handles = md_list(VAULT / "Research/Competitors.md", "TikTok")
    lines += ["## TikTok competitors", ""]
    for h in handles:
        h = h.lstrip("@")
        rows = ytdlp_flat(f"https://www.tiktok.com/@{h}", HISTORY or (15 if QUICK else 40))
        if not rows:
            lines += [f"### @{h}", "", "_no data (profile private, renamed, or extractor blocked)_", ""]
            continue
        views = [r.get("view_count") or 0 for r in rows]
        med = sorted(views)[len(views) // 2]
        lines += [f"### @{h} — {len(rows)} recent videos, median {fmt(med)} views", "",
                  "| views | ×median | like% | saves% | comments | title | link |", "| --- | --- | --- | --- | --- | --- | --- |"]
        for r in sorted(rows, key=lambda r: r.get("view_count") or 0, reverse=True)[:25 if HISTORY else 12]:
            v, lk, sv = r.get("view_count") or 0, r.get("like_count") or 0, r.get("save_count") or 0
            title = re.sub(r"\s+", " ", (r.get("title") or r.get("description") or ""))[:90].replace("|", "/")
            lines.append(f"| {fmt(v)} | {v / med:.1f} | {100 * lk / v:.1f} | {100 * sv / v:.1f} | {fmt(r.get('comment_count'))} | {title} | [▶]({r.get('url') or r.get('webpage_url')}) |"
                         if v and med else f"| {fmt(v)} | ? | ? | ? | ? | {title} | |")
        lines.append("")

    # --- YouTube demand -------------------------------------------------------------------
    lines += ["## YouTube search demand", "", "Top results per query (views = proven interest in the topic).", ""]
    for q in md_list(VAULT / "Research/Seeds.md", "YouTube")[: 4 if QUICK else 12]:
        rows = ytdlp_flat(f"ytsearch10:{q}", 10)
        if not rows:
            continue
        lines += [f"### {q}", "", "| views | title | channel |", "| --- | --- | --- |"]
        for r in sorted(rows, key=lambda r: r.get("view_count") or 0, reverse=True)[:6]:
            title = (r.get("title") or "")[:90].replace("|", "/")
            lines.append(f"| {fmt(r.get('view_count'))} | [{title}]({r.get('url')}) | {r.get('channel') or r.get('uploader') or ''} |")
        lines.append("")

    # --- Hacker News ----------------------------------------------------------------------
    since = int(time.time()) - DAYS * 86400
    lines += ["## Hacker News (last %d days)" % DAYS, "", "| points | comments | title | link |", "| --- | --- | --- | --- |"]
    seen = set()
    hn_rows = []
    for q in md_list(VAULT / "Research/Seeds.md", "Hacker News")[: 4 if QUICK else 10]:
        url = ("https://hn.algolia.com/api/v1/search?" + urllib.parse.urlencode(
            {"query": q, "tags": "story", "numericFilters": f"created_at_i>{since},points>40", "hitsPerPage": 15}))
        try:
            for h in get_json(url).get("hits", []):
                if h["objectID"] in seen:
                    continue
                seen.add(h["objectID"])
                hn_rows.append(h)
        except Exception as e:  # keep going on any source failure
            lines.append(f"| — | — | _query '{q}' failed: {e}_ | |")
    for h in sorted(hn_rows, key=lambda h: h.get("points") or 0, reverse=True)[:25]:
        link = h.get("url") or f"https://news.ycombinator.com/item?id={h['objectID']}"
        lines.append(f"| {h.get('points')} | {h.get('num_comments')} | {h.get('title', '').replace('|', '/')} | [hn](https://news.ycombinator.com/item?id={h['objectID']}) · [link]({link}) |")
    lines.append("")

    # --- GitHub -------------------------------------------------------------------------------
    lines += ["## GitHub — rising repos", "", "| stars | repo | created | description |", "| --- | --- | --- | --- |"]
    created = (TODAY - dt.timedelta(days=max(DAYS, 90))).isoformat()
    gh = {}
    for topic in md_list(VAULT / "Research/Seeds.md", "GitHub topics")[: 3 if QUICK else 8]:
        url = ("https://api.github.com/search/repositories?" + urllib.parse.urlencode(
            {"q": f"topic:{topic} created:>{created}", "sort": "stars", "order": "desc", "per_page": 10}))
        try:
            for r in get_json(url).get("items", []):
                gh[r["full_name"]] = r
        except Exception as e:
            lines.append(f"| — | _topic '{topic}' failed: {e}_ | | |")
        time.sleep(1.5)  # unauthenticated search API: 10 requests/minute
    for r in sorted(gh.values(), key=lambda r: r["stargazers_count"], reverse=True)[:25]:
        desc = (r.get("description") or "")[:100].replace("|", "/")
        lines.append(f"| {fmt(r['stargazers_count'])} | [{r['full_name']}]({r['html_url']}) | {r['created_at'][:10]} | {desc} |")
    lines.append("")

    out = VAULT / "Research" / "Signals" / f"{TODAY.isoformat()}.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines) + "\n")
    print(f"wrote {out.relative_to(ROOT)} ({len(lines)} lines)")


if __name__ == "__main__":
    main()
