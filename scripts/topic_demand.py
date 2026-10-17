"""Measure YouTube demand for many candidate topics at once (used by deep idea scans).

Usage: .venv/bin/python scripts/topic_demand.py <topics.txt> [--out SudoRaccoon/Research/Signals/<date> demand.md]

<topics.txt>: one topic per line as `id<TAB>search query` (or just a query). For each query it takes the
top 15 YouTube results (yt-dlp, keyless, 8 in parallel) and reports the median of the top 5 (robust demand)
and the max (ceiling). Some queries pull unrelated videos, so check the top-video column before trusting it.
"""

import datetime as dt
import json
import statistics
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def search(query: str) -> list[dict]:
    try:
        out = subprocess.run(["yt-dlp", "--flat-playlist", "--playlist-end", "15", "-j", "--no-warnings", f"ytsearch15:{query}"],
                             capture_output=True, text=True, timeout=120).stdout
    except subprocess.TimeoutExpired:
        return []
    rows = []
    for line in out.splitlines():
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            pass
    return sorted(rows, key=lambda r: -(r.get("view_count") or 0))


def fmt(n) -> str:
    n = int(n)
    return f"{n / 1e6:.1f}M" if n >= 1e6 else f"{n / 1e3:.1f}K" if n >= 1e4 else str(n)


def main() -> None:
    src = Path(sys.argv[1])
    out = Path(sys.argv[sys.argv.index("--out") + 1]) if "--out" in sys.argv else \
        ROOT / "SudoRaccoon/Research/Signals" / f"{dt.date.today().isoformat()} demand.md"
    topics = []
    for line in src.read_text().splitlines():
        if line.strip() and not line.startswith("#"):
            tid, _, q = line.partition("\t")
            topics.append((tid.strip(), (q or tid).strip()))
    with ThreadPoolExecutor(8) as ex:
        results = list(ex.map(lambda t: (t, search(t[1])), topics))
    rows = []
    for (tid, q), res in results:
        views = [r.get("view_count") or 0 for r in res]
        if views:
            rows.append((statistics.median(views[:5]), tid, q, views[0], res[0]))
    lines = [f"# Topic demand {dt.date.today().isoformat()}", "",
             f"`scripts/topic_demand.py {src.name}`: YouTube top 15 per query, sorted by the median of the top 5.", "",
             "| topic | query | median top 5 | max | top video |", "| --- | --- | --- | --- | --- |"]
    for med, tid, q, mx, top in sorted(rows, key=lambda r: -r[0]):
        title = (top.get("title") or "").replace("|", "/")[:60]
        lines.append(f"| {tid} | {q} | {fmt(med)} | {fmt(mx)} | [{title}]({top.get('url')}) |")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines) + "\n")
    print(f"wrote {out} ({len(rows)} topics)")


if __name__ == "__main__":
    main()
