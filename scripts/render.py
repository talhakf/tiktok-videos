"""Render a video, master it for TikTok and render its cover, all into out/<id>/.

Usage: .venv/bin/python scripts/render.py <id> [--cover-only]

Reads `composition:` from SudoRaccoon/Videos/<id>.md (the cover is the <Composition>Cover still). Writes:
  out/<id>/<id>-render.mp4    Remotion render (h264, crf 16)
  out/<id>/<id>-tiktok.mp4    TikTok master (-14 LUFS, faststart): upload this
  out/<id>/<id>-cover.jpg     1080×1440 cover: upload in TikTok Studio → Edit cover → Upload cover
  out/<id>/<id>-cover-9x16.jpg the same cover on a 1080×1920 page (Instagram Reels, YouTube Shorts); the profile grids
                              crop it back to the 3:4 middle, so nothing important is lost
and sets status: rendered, duration, output, cover on the note. A full render deletes out/<id>/stills/
(the preview frames from stills.mjs are only for checking the build).

Background music: the note's `music:` names a track in public/music/ (`lofi-relax` = "LoFi Relax" by Kulakovka,
Pixabay Content License, the default since 2026-10-10; `chill-day` = LAKEY INSPIRED "Chill Day", older videos only;
empty or `none` = no music). Never credited in the caption (user decision). The master loops it under the voice:
MUSIC_GAP dB below the voice in pauses, ducked ~5 dB more while someone speaks (≈ 20 dB under it), 1s fade-in, 2s fade-out.
`music_level:` on the note overrides MUSIC_GAP (e.g. -18 = quieter, -11 = louder, the old default).
"""

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MUSIC_GAP = -15  # music level in the pauses, dB relative to the voice; under speech the ducking adds ~-5 dB (≈ -20)
# (was -11 with Chill Day; the user wanted it quieter, 2026-10-10)


def lufs(path: Path) -> float:
    err = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-map", "0:a", "-af", "ebur128", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", err)[-1])


def duration(path: Path) -> float:
    return float(json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(path)],
                                           capture_output=True, text=True).stdout)["format"]["duration"])


def master_audio(md: str, raw: Path) -> tuple[list[str], list[str]]:
    """Extra ffmpeg inputs + audio args for the master: voice/sfx alone, or with the note's background music."""
    name = (re.search(r"^music:[ \t]*(\S*)", md, flags=re.M) or [None, ""])[1].strip('"')
    norm = "loudnorm=I=-14:TP=-1.5:LRA=11"
    if not name or name == "none":
        return [], ["-af", norm]
    track = ROOT / "public" / "music" / f"{name}.mp3"
    if not track.exists():
        sys.exit(f"music: {name} but {track.relative_to(ROOT)} is missing")
    level = re.search(r"^music_level:[ \t]*(-?[\d.]+)", md, flags=re.M)
    gap = float(level.group(1)) if level else MUSIC_GAP
    gain = lufs(raw) + gap - lufs(track)
    dur = duration(raw)
    graph = (
        "[0:a]asplit=2[voice][key];"
        f"[1:a]atrim=0:{dur:.3f},volume={gain:.2f}dB,afade=t=in:d=1,afade=t=out:st={max(dur - 2, 0):.3f}:d=2[bed];"
        "[bed][key]sidechaincompress=threshold=0.03:ratio=3:attack=15:release=350[duck];"
        f"[voice][duck]amix=inputs=2:duration=first:normalize=0,{norm}[a]"
    )
    print(f"music: {name} at {gap:+.0f} dB under the voice (gain {gain:+.1f} dB)")
    return ["-stream_loop", "-1", "-i", str(track)], ["-filter_complex", graph, "-map", "0:v", "-map", "[a]"]


def set_field(md: str, name: str, value: str) -> str:
    """Set a frontmatter field, adding it after `output:` if missing."""
    if re.search(rf"^{name}:", md, flags=re.M):
        return re.sub(rf"^{name}:.*$", lambda _: f"{name}: {value}", md, count=1, flags=re.M)
    return re.sub(r"^(output:.*)$", lambda m: f"{m.group(1)}\n{name}: {value}", md, count=1, flags=re.M)


def run(cmd: list[str]) -> None:
    print("$", " ".join(cmd[:4]), "…")
    subprocess.run(cmd, cwd=ROOT, check=True)


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        sys.exit(__doc__)
    vid = args[0]
    note = ROOT / "SudoRaccoon" / "Videos" / f"{vid}.md"
    md = note.read_text()
    comp = (re.search(r"^composition:\s*(\S+)", md, flags=re.M) or sys.exit(f"no composition: in {note.name}")).group(1)
    out = ROOT / "out" / vid
    out.mkdir(parents=True, exist_ok=True)
    raw, master, cover = out / f"{vid}-render.mp4", out / f"{vid}-tiktok.mp4", out / f"{vid}-cover.jpg"

    if "--cover-only" not in sys.argv:
        run(["npx", "remotion", "render", comp, str(raw), "--codec=h264", "--crf=16", "--audio-bitrate=192k"])
        extra_in, audio = master_audio(md, raw)
        run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(raw), *extra_in, "-c:v", "libx264", "-preset", "slow", "-crf", "20",
             "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart",
             *audio, "-ar", "48000", "-c:a", "aac", "-b:a", "192k", str(master)])
    run(["npx", "remotion", "still", f"{comp}Cover", str(cover), "--image-format=jpeg", "--jpeg-quality=92"])
    # Instagram and YouTube want 9:16 covers: pad 240px of page colour above and below the 3:4 cover
    run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(cover), "-vf", "pad=1080:1920:0:240:color=0xF5F5F7",
         "-q:v", "2", str(out / f"{vid}-cover-9x16.jpg")])

    rel = lambda p: str(p.relative_to(ROOT))
    md = set_field(md, "cover", rel(cover))
    if master.exists():
        dur = duration(master)
        md = set_field(md, "output", rel(master))
        md = set_field(md, "duration", str(round(dur)))
    if "--cover-only" not in sys.argv:
        md = re.sub(r"^status: .*$", "status: rendered", md, count=1, flags=re.M)
        shutil.rmtree(out / "stills", ignore_errors=True)
    note.write_text(md)
    print(f"done: {rel(master)} · {rel(cover)}")


if __name__ == "__main__":
    main()
