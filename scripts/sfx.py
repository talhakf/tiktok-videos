"""Synthesize sound effects in code (no downloads, no licensing questions).

Usage: .venv/bin/python scripts/sfx.py kaching     -> public/sfx/kaching.wav

kaching: cash-register "ka-ching" for the follow tap in the EndCard. "ka" = two short mechanical clicks
(band-limited noise + a low thunk), "ching" = an inharmonic bell struck twice, plus a few coin pings.
"""

import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
rng = np.random.default_rng(7)


def env(n: int, tau: float, attack: float = 0.002) -> np.ndarray:
    t = np.arange(n) / SR
    a = np.minimum(1.0, t / attack)
    return a * np.exp(-t / tau)


def place(buf: np.ndarray, sig: np.ndarray, at: float, gain: float = 1.0) -> None:
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    buf[i:j] += gain * sig[: j - i]


def click(dur: float = 0.03) -> np.ndarray:
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    # crude band-pass: difference of two moving averages keeps ~1.5–6 kHz
    hi = np.convolve(noise, np.ones(4) / 4, mode="same")
    lo = np.convolve(noise, np.ones(24) / 24, mode="same")
    snap = (hi - lo) * env(n, 0.006, 0.0005)
    t = np.arange(n) / SR
    thunk = np.sin(2 * np.pi * 170 * t) * env(n, 0.012, 0.001)
    return snap * 0.9 + thunk * 0.5


def bell(f0: float, dur: float = 1.1) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for ratio, amp, tau in [(1.0, 1.0, 0.36), (1.506, 0.55, 0.26), (2.0, 0.45, 0.22), (2.74, 0.3, 0.16), (3.76, 0.18, 0.11), (5.4, 0.1, 0.07)]:
        detune = 1 + rng.uniform(-0.002, 0.002)
        out += amp * np.sin(2 * np.pi * f0 * ratio * detune * t + rng.uniform(0, 6.28)) * env(n, tau, 0.001)
    tail = int(0.25 * SR)
    out[-tail:] *= np.linspace(1, 0, tail) ** 2  # ring out to silence, no click at the end
    return out


def ping(f: float) -> np.ndarray:
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * env(n, 0.03, 0.0008)


def kaching() -> np.ndarray:
    buf = np.zeros(int(1.3 * SR))
    place(buf, click(), 0.0, 0.8)  # "ka"
    place(buf, click(), 0.05, 0.6)
    place(buf, bell(2093), 0.10, 0.75)  # "ching" (C7)
    place(buf, bell(2637), 0.17, 0.45)  # second strike (E7) for the sparkle
    for k in range(6):  # coins
        place(buf, ping(rng.uniform(4200, 7200)), 0.14 + k * rng.uniform(0.025, 0.05), 0.12)
    return buf


def write(path: Path, x: np.ndarray) -> None:
    x = x / np.max(np.abs(x)) * 10 ** (-1 / 20)  # peak -1 dBFS
    fade = int(0.05 * SR)
    x[-fade:] *= np.linspace(1, 0, fade)
    pcm = (np.repeat(x[:, None], 2, axis=1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("wrote", path.relative_to(ROOT))


SOUNDS = {"kaching": kaching}

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in SOUNDS:
        sys.exit(__doc__)
    write(ROOT / "public" / "sfx" / f"{sys.argv[1]}.wav", SOUNDS[sys.argv[1]]())
