# Voice and captions

- **Engine:** Gemini 3.8 Flash TTS, voice **Autonoe**, free-tier API key in `.env` (`GEMINI_API_KEY`). Optional backup key `GEMINI_API_KEY_2`: `scripts/tts.py` tries the keys in order and switches automatically when one fails (e.g. daily quota reached).
- **Free-tier daily limit** — one video ≈ one request; don't regenerate for design-only changes.
- `scripts/tts.py <id>` reads `## Script` (and optional `## Voice style`) from `SudoRaccoon/Videos/<id>.md`.
- Pronunciation markup: `{display|spoken}` — captions show `display`, the voice says `spoken`: `{fd|F D}`, `{ls|L S}`, `{btop|B top}`, `{--tree|dash dash tree}`. The **last** `|` splits, so a display may contain a pipe: `{history | grep|history pipe grep}`.
- Flubbed word in the audio? Cut it out of `public/<id>/voice.mp3` with ffmpeg (find the gap with an energy plot) and run `scripts/tts.py --realign <id>`: captions are rebuilt from the existing audio with no TTS request.
- Word timings: faster-whisper `small.en` on CPU, aligned back onto the script (captions always show the script text). Expect "N/M heard words matched" ≥ 95%.
- Whisper sometimes merges two words (one gets 0 ms and/or the same start as the next). `tts.py` spreads those out automatically; for an existing file run `scripts/tts.py --fix-captions <id>` (no TTS request).
- Voice samples: `scripts/tts.py --sample "text" Voice1 Voice2` → `out/voice-samples/`.
- Output: `public/<id>/voice.mp3` + `public/<id>/captions.json`.
- Voice choice: Autonoe picked over Laomedeia, Sulafat, Despina.
