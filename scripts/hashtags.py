"""Rank hashtags by how the competitors' videos that use them perform, and save the table to the vault.

Usage: .venv/bin/python scripts/hashtags.py [--refresh] [--per-account 60]

Input:  SudoRaccoon/Research/Competitors.md   "## TikTok" list of @handles
        SudoRaccoon/Videos/*.md               our posted videos (hashtags from ## Post + views)
Output: SudoRaccoon/Research/Hashtags.md      ranked table (skipped if < 7 days old, unless --refresh)

Lift = median over a hashtag's videos of (video views / that account's median views), so big and small
accounts compare fairly. 1.0× = typical for the account; > 1 = videos with this tag beat the account's norm.
TikTok tag pages can't be read keyless (yt-dlp "No working app info"), so competitor captions are the source.
"""

import datetime as dt
import json
import re
import statistics
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VAULT = ROOT / "SudoRaccoon"
OUT = VAULT / "Research" / "Hashtags.md"
PER = int(sys.argv[sys.argv.index("--per-account") + 1]) if "--per-account" in sys.argv else 60
TAG = re.compile(r"#([A-Za-z0-9_]+)")


def handles() -> list[str]:
    md = (VAULT / "Research" / "Competitors.md").read_text()
    m = re.search(r"^## TikTok\s*\n(.*?)(?=^## |\Z)", md, flags=re.S | re.M)
    return re.findall(r"^[-*]\s+@([\w.]+)", m.group(1), flags=re.M) if m else []


def videos(handle: str) -> list[dict]:
    try:
        out = subprocess.run(
            ["yt-dlp", "--flat-playlist", "--playlist-end", str(PER), "-j", "--no-warnings", f"https://www.tiktok.com/@{handle}"],
            capture_output=True, text=True, timeout=240,
        ).stdout
    except subprocess.TimeoutExpired:
        return []
    rows = []
    for line in out.splitlines():
        try:
            r = json.loads(line)
        except json.JSONDecodeError:
            continue
        rows.append({"views": r.get("view_count") or 0, "text": r.get("description") or r.get("title") or "", "url": r.get("url")})
    return rows


def ours() -> list[tuple[str, list[str], int]]:
    """(id, hashtags, views) for our posted videos."""
    res = []
    for p in sorted((VAULT / "Videos").glob("*.md")):
        md = p.read_text()
        if not re.search(r"^status: posted$", md, flags=re.M):
            continue
        views = re.search(r"^views:\s*(\d+)", md, flags=re.M)
        post = re.search(r"^## Post\s*\n(.*?)(?=^## |\Z)", md, flags=re.S | re.M)
        tags = [t.lower() for t in TAG.findall(post.group(1))] if post else []
        res.append((p.stem, sorted(set(tags)), int(views.group(1)) if views else 0))
    return res


def main() -> None:
    if OUT.exists() and "--refresh" not in sys.argv:
        m = re.search(r"^updated: (\d{4}-\d{2}-\d{2})", OUT.read_text(), flags=re.M)
        if m and (dt.date.today() - dt.date.fromisoformat(m.group(1))).days < 7:
            print(f"{OUT.relative_to(ROOT)} is fresh ({m.group(1)}); use --refresh to rebuild")
            return

    lifts: dict[str, list[float]] = defaultdict(list)
    views: dict[str, list[int]] = defaultdict(list)
    accounts: dict[str, set[str]] = defaultdict(set)
    summary = []
    for h in handles():
        rows = [r for r in videos(h) if r["views"]]
        if not rows:
            summary.append(f"- @{h}: no data")
            continue
        med = statistics.median(r["views"] for r in rows)
        tagged = 0
        for r in rows:
            tags = {t.lower() for t in TAG.findall(r["text"])}
            tagged += bool(tags)
            for t in tags:
                lifts[t].append(r["views"] / med)
                views[t].append(r["views"])
                accounts[t].add(h)
        summary.append(f"- @{h}: {len(rows)} videos, median {med:,.0f} views, {tagged} with hashtags")

    ranked = sorted(
        ((t, statistics.median(l), len(l), len(accounts[t]), statistics.median(views[t])) for t, l in lifts.items() if len(l) >= 2),
        key=lambda x: (x[1] * min(x[2], 10) ** 0.5, x[2]),
        reverse=True,
    )

    lines = [
        "---",
        f"updated: {dt.date.today().isoformat()}",
        "---",
        "# Hashtags",
        "",
        "Built by `scripts/hashtags.py` from competitor captions ([[Competitors]]). How to use it: [[Caption and hashtags]].",
        "**Lift** = median of (video views ÷ that account's median views) for videos using the tag: 1.0× is normal for the account, above 1 beats it. "
        "Tags used fewer than 2 times are left out. Read lift together with **uses**; a 3× tag seen on 2 videos is a hint, not proof.",
        "",
        "## Sources",
        *summary,
        "",
        "## Ranked",
        "",
        "| tag | lift | uses | accounts | median views |",
        "| --- | --- | --- | --- | --- |",
    ]
    for t, lift, n, na, mv in ranked[:60]:
        lines.append(f"| #{t} | {lift:.2f}× | {n} | {na} | {mv:,.0f} |")

    mine = ours()
    lines += ["", "## Our posted videos", ""]
    if mine:
        lines += ["| video | views | hashtags |", "| --- | --- | --- |"]
        lines += [f"| [[{vid}]] | {v:,} | {' '.join('#' + t for t in tags)} |" for vid, tags, v in mine]
    else:
        lines.append("None posted yet. Once there are ~10, compare our own tags here.")

    OUT.write_text("\n".join(lines) + "\n")
    print(f"wrote {OUT.relative_to(ROOT)}: {len(ranked)} tags from {len(summary)} accounts")


if __name__ == "__main__":
    main()
