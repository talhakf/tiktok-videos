"""Voiceover + word-level captions with Gemini TTS (the project's only TTS).

Usage:
  .venv/bin/python scripts/tts.py <video-id> [voice]
  .venv/bin/python scripts/tts.py --sample "Some text" Voice1 Voice2 ...   # -> out/voice-samples/
  .venv/bin/python scripts/tts.py --fix-captions <video-id>   # repair timings in an existing captions.json (no TTS)
  .venv/bin/python scripts/tts.py --realign <video-id>        # captions again from the existing voice.mp3 + script (no TTS),
                                                              # e.g. after cutting a flubbed word out of the audio

Reads the `## Script` (and optional `## Voice style`) section of the Obsidian note
SudoRaccoon/Videos/<id>.md and writes public/<id>/voice.mp3 and public/<id>/captions.json (Remotion Caption shape, leading space per word).

Gemini TTS returns no timestamps, so the audio is transcribed with faster-whisper and the recognised
words are aligned back onto the script: captions always show the script's own text.

Pronunciation markup: {display|spoken} shows `display` in captions but speaks `spoken`,
e.g. {fd|F D} or {--tree|dash dash tree}; the display may contain "|" (the last one splits). Trailing punctuation after the braces is kept.

Needs GEMINI_API_KEY in the environment or in .env at the project root (free-tier key is fine).
Optional backup keys GEMINI_API_KEY_2, _3, ... are tried in order when a key fails (e.g. daily limit used up).
"""

import base64
import difflib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODEL = "gemini-3.8-flash-tts"
DEFAULT_VOICE = "Autonoe"
DEFAULT_STYLE = (
    "An upbeat, warm science communicator narrating a short TikTok explainer. "
    "Brisk and clear, friendly and a little playful on the jokes, confident on the facts. "
    "Keep the energy up; short natural pauses between sentences, no long gaps."
)
# the last "|" splits display from spoken, so a display may contain a pipe: {history | grep|history pipe grep}
TOKEN = re.compile(r"\{([^}]*)\|([^}|]*)\}(\S*)|(\S+)")


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower())


def api_keys() -> list[str]:
    """GEMINI_API_KEY, then GEMINI_API_KEY_2, ... (environment first, else .env)."""
    env = {}
    if (ROOT / ".env").exists():
        for line in (ROOT / ".env").read_text().splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    keys = []
    for i in range(1, 10):
        name = "GEMINI_API_KEY" if i == 1 else f"GEMINI_API_KEY_{i}"
        key = os.environ.get(name) or env.get(name)
        if key and key not in keys:
            keys.append(key)
    if not keys:
        sys.exit("GEMINI_API_KEY missing: put GEMINI_API_KEY=... in .env (see README)")
    return keys


def synthesize(text: str, voice: str, style: str, wav_path: Path) -> None:
    keys = api_keys()
    for n, key in enumerate(keys, 1):
        try:
            audio = synthesize_with(key, text, voice, style)
            break
        except Exception as e:
            # daily free-tier limit used up (429) or key rejected: try the next key
            code = getattr(e, "code", None) or getattr(e, "status_code", None) or type(e).__name__
            status = getattr(e, "status", None) or getattr(e, "message", str(e))[:120]
            print(f"key {n}/{len(keys)} failed: {code} {status}")
            if n == len(keys):
                raise
    wav_path.parent.mkdir(parents=True, exist_ok=True)
    wav_path.write_bytes(audio)


def synthesize_with(key: str, text: str, voice: str, style: str) -> bytes:
    from google import genai

    client = genai.Client(api_key=key)
    client.interactions.sdk_configuration.retry_config = None
    interaction = client.interactions.create(
        model=MODEL,
        input=[
            {
                "type": "user_input",
                "content": [
                    {"type": "text", "text": text, "annotations": [{"type": "speech_metadata", "style": style}]}
                ],
            }
        ],
        response_format={"type": "audio"},
        generation_config={"speech_config": [{"voice": voice}]},
    )
    return base64.b64decode(interaction.output_audio.data)


def parse(text: str):
    """-> (display tokens, spoken words, token index of each spoken word)"""
    display, spoken, owner = [], [], []
    for m in TOKEN.finditer(text):
        if m.group(4) is not None:
            disp, say = m.group(4), m.group(4)
        else:
            disp, say = m.group(1) + m.group(3), m.group(2) + m.group(3)
        display.append(disp)
        for w in say.split():
            spoken.append(w)
            owner.append(len(display) - 1)
    return display, spoken, owner


def transcribe(wav: Path, prompt: str):
    from faster_whisper import WhisperModel

    import numpy as np

    # decode with ffmpeg ourselves (faster-whisper's PyAV path breaks on newer PyAV releases)
    pcm = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(wav), "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
        check=True,
        capture_output=True,
    ).stdout
    audio = np.frombuffer(pcm, dtype=np.float32)
    model = WhisperModel("small.en", device="cpu", compute_type="int8")
    # Do not pass initial_prompt=prompt[:800]: Whisper treats the first 30s window as a continuation of the prompt and collapses early timestamps.
    segments, _ = model.transcribe(audio, word_timestamps=True, condition_on_previous_text=False, vad_filter=False)
    return [(w.word.strip(), w.start * 1000, w.end * 1000) for s in segments for w in s.words]


def align(heard, spoken):
    """Map each spoken (script) word to [startMs, endMs] using the recognised words."""
    a = [norm(w) for w, _, _ in heard]
    b = [norm(w) for w in spoken]
    times = [None] * len(spoken)
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                times[j1 + k] = [heard[i1 + k][1], heard[i1 + k][2]]
        elif op == "replace":
            # e.g. "eza" heard as "Isa", "3 a.m." heard as "3am": share the heard span by length
            s, e = heard[i1][1], heard[i2 - 1][2]
            lens = [max(1, len(x)) for x in b[j1:j2]]
            total, acc = sum(lens), 0
            for k, ln in enumerate(lens):
                times[j1 + k] = [s + (e - s) * acc / total, s + (e - s) * (acc + ln) / total]
                acc += ln
    # words whisper missed entirely: squeeze them between their neighbours
    for j, t in enumerate(times):
        if t is None:
            prev = next((times[k][1] for k in range(j - 1, -1, -1) if times[k]), 0)
            nxt = next((times[k][0] for k in range(j + 1, len(times)) if times[k]), prev + 200)
            times[j] = [prev, max(prev, min(nxt, prev + 200))]
    return times


def note_section(md: str, heading: str) -> str:
    m = re.search(rf"^## {re.escape(heading)}[ \t]*\n(.*?)(?=^## |\Z)", md, flags=re.S | re.M)
    if not m:
        return ""
    return re.sub(r"<!--.*?-->", "", m.group(1), flags=re.S).strip()


def load_script(video_id: str) -> tuple[str, str]:
    note = ROOT / "SudoRaccoon" / "Videos" / f"{video_id}.md"
    if not note.exists():
        sys.exit(f"no vault note: {note} (create it with scripts/new_video.py)")
    md = note.read_text()
    text = note_section(md, "Script")
    if not text:
        sys.exit(f"## Script in {note.name} is empty")
    return text, note_section(md, "Voice style") or DEFAULT_STYLE


def make_video_voice(video_id: str, voice: str) -> None:
    text, style = load_script(video_id)
    display, spoken, owner = parse(text)

    out_dir = ROOT / "public" / video_id
    wav = out_dir / "voice.wav"
    print(f"synthesizing with {MODEL} / {voice} ...")
    synthesize(" ".join(spoken), voice, style, wav)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-c:a", "libmp3lame", "-q:a", "2", str(out_dir / "voice.mp3")],
        check=True,
    )

    write_captions(video_id, wav, display, spoken, owner)
    wav.unlink()


def realign(video_id: str) -> None:
    text, _ = load_script(video_id)
    write_captions(video_id, ROOT / "public" / video_id / "voice.mp3", *parse(text))


def write_captions(video_id: str, audio: Path, display, spoken, owner) -> None:
    out_dir = ROOT / "public" / video_id
    print("aligning words ...")
    heard = transcribe(audio, " ".join(spoken))
    word_times = align(heard, spoken)

    tok: dict[int, list[float]] = {}
    for j, (s, e) in enumerate(word_times):
        t = tok.setdefault(owner[j], [s, e])
        t[0], t[1] = min(t[0], s), max(t[1], e)
    captions = []
    for i, disp in enumerate(display):
        s, e = round(tok[i][0]), round(tok[i][1])
        captions.append({"text": " " + disp, "startMs": s, "endMs": e, "timestampMs": (s + e) // 2, "confidence": None})

    fix_timing(captions)
    exact = sum(1 for w in heard if norm(w[0]) in {norm(x) for x in spoken})
    (out_dir / "captions.json").write_text(json.dumps(captions, indent=1))
    print(f"{len(captions)} words, {exact}/{len(heard)} heard words matched the script, ends at {captions[-1]['endMs'] / 1000:.2f}s")


def fix_timing(captions: list[dict]) -> int:
    """Whisper sometimes merges two words: one gets zero length and/or the same start as its neighbour.
    Equal starts break the caption renderer (and a 0 ms word never lights up), so share the time out:
    a zero-length word takes half of the next word's span if they start together, else up to 250 ms
    of the gap after it. Returns how many words were changed."""
    fixed = 0
    for i, c in enumerate(captions):
        nxt = captions[i + 1] if i + 1 < len(captions) else None
        if c["endMs"] > c["startMs"] and not (nxt and nxt["startMs"] <= c["startMs"]):
            continue
        if nxt and nxt["startMs"] <= c["startMs"]:
            mid = (c["startMs"] + nxt["endMs"]) // 2
            c["endMs"], nxt["startMs"] = mid, mid
            nxt["timestampMs"] = (nxt["startMs"] + nxt["endMs"]) // 2
        else:
            limit = nxt["startMs"] if nxt else c["startMs"] + 250
            c["endMs"] = min(c["startMs"] + 250, max(limit, c["startMs"] + 1))
        c["timestampMs"] = (c["startMs"] + c["endMs"]) // 2
        fixed += 1
    return fixed


def fix_captions_file(video_id: str) -> None:
    path = ROOT / "public" / video_id / "captions.json"
    captions = json.loads(path.read_text())
    n = fix_timing(captions)
    path.write_text(json.dumps(captions, indent=1))
    print(f"{path.relative_to(ROOT)}: fixed {n} word timings")


def make_samples(text: str, voices: list[str]) -> None:
    for v in voices:
        wav = ROOT / "out" / "voice-samples" / f"gemini-{v}.wav"
        synthesize(text, v, DEFAULT_STYLE, wav)
        print("wrote", wav)


if __name__ == "__main__":
    if sys.argv[1] == "--fix-captions":
        fix_captions_file(sys.argv[2])
    elif sys.argv[1] == "--realign":
        realign(sys.argv[2])
    elif sys.argv[1] == "--sample":
        make_samples(sys.argv[2], sys.argv[3:])
    else:
        make_video_voice(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else DEFAULT_VOICE)
