# Sudo the Raccoon — Short-Form Technical Video Pipeline (Proof of Concept)

Open-source Proof of Concept for automated 9:16 developer & terminal explainer videos (TikTok, Instagram Reels, YouTube Shorts), built with **Remotion 4**, **React 19**, **Gemini TTS + faster-whisper**, and an **Obsidian Vault** (`SudoRaccoon/`) as the single source of truth.

## Customizing Branding (Use Under Your Own Name)
- **Visual branding** (channel name, `@handle`, closing tagline, avatar, default terminal window title): edit [`src/brand/config.ts`](src/brand/config.ts).
- **Environment & channel sync** (`GEMINI_API_KEY`, optional `GEMINI_API_KEY_2`, optional `POSTIZ_API_KEY`, `CHANNEL_HANDLE`, `CHANNEL_NAME`): configure `.env` (copy from `.env.example`). Never commit or print `.env`.
- **Mascot stickers**: `public/raccoon/*.png` (catalog in `SudoRaccoon/Playbook/Raccoon assets.md`).

## Source of Truth & Skills
- **Obsidian Vault (`SudoRaccoon/`):** Start with `SudoRaccoon/Home.md`, `SudoRaccoon/Guide.md`, and `SudoRaccoon/Playbook/`. Every video's script, beat table, caption, and status lives in `SudoRaccoon/Videos/<id>.md`.
- **Claude Skills (`.claude/skills/` & `.agents/skills/`, linked into `~/.claude/skills/` by `scripts/setup.sh`):**
  - `sudo-raccoon` — end-to-end video creation workflow (script → TTS voice → Remotion build → stills verification → render & -14 LUFS master → post package → optional Postiz publish).
  - `remotion-explainer-library` — complete reference and portable installer for the **180+ Remotion component library** across 35+ categories, 104 line icons, Apple-light design tokens (`src/theme.ts`), layout grid (`src/layout.ts`), and word-timed caption cues (`src/lib/timing.tsx`).
  - `sudo-raccoon-ideas` — keyless multi-source idea & trend research (`scripts/research_ideas.py`, `scripts/hashtags.py`, `/30` scoring rubric).
  - Motion & design skills: `apple-design`, `emil-design-eng`, `animate`, `animation-vocabulary`, `review-animations`, `motion-art-direction`, `caption-animation`, `short-form-video`, `technical-video-script`, `remotion-best-practices`.

## Production Scripts (`scripts/`)
See `SudoRaccoon/Playbook/Production workflow.md` for full usage:
- `scripts/setup.sh` — installs Node/Python dependencies, creates `.venv`, links Claude skills into `~/.claude/skills/`, and initializes `.env` from `.env.example`.
- `scripts/new_video.py <id> "<Title>"` — scaffolds `SudoRaccoon/Videos/<id>.md`, `src/videos/<id>/<Name>.tsx`, placeholder audio/captions in `public/<id>/`, and registers the composition in `src/Root.tsx`.
- `scripts/tts.py <id>` — reads `## Script` from the vault note, generates voice via Gemini TTS (`Autonoe`), and aligns word-level timestamps with `faster-whisper`.
- `scripts/stills.mjs <CompositionId> <f1> <f2> ...` — renders fast still frames to `out/<id>/stills/` for visual QA.
- `scripts/render.py <id>` — renders video, mixes background music (`public/music/lofi-relax.mp3`, ducked under speech) to `-14 LUFS` (`out/<id>/<id>-tiktok.mp4`), and renders 3:4 + 9:16 covers.
- `scripts/package.py <id>` — validates caption, hashtags, YouTube title, video, and cover specs (`status: ready`).
- `scripts/publish.py <id>` / `scripts/postiz.py` — optional automated publishing to TikTok, Instagram Reels, and YouTube Shorts via Postiz (`POSTIZ_API_KEY`).
- `scripts/sync_channel.py` / `scripts/platform_stats.py` — optional channel analytics sync for `CHANNEL_HANDLE` into `SudoRaccoon/Channel stats.md`.

## Core Design & Content Rules
- **Duration:** At least 60s, up to 3:00 (YouTube Shorts ceiling).
- **Design ("Apple light"):** Page `#F5F5F7`, ink `#1D1D1F`, grey `#6E6E73`, system blue `#0071E3`; Inter 700 tight tracking; two-tone headlines; macOS terminal windows; frosted-glass callouts; blue focus rings; iMessage bubble; no gradients/glow, no UPPERCASE, step counters `"1/5"` (never `"01"`), no AI-generated images.
- **Audio:** Gemini TTS free tier (`GEMINI_API_KEY`); background music `"LoFi Relax"` (`public/music/lofi-relax.mp3`) mixed quietly under speech; never name or credit the song in captions. You cannot hear audio — always remind the user to watch rendered videos once with sound.
- **Accuracy:** Verify every command, flag, and technical claim against official documentation or local execution before scripting.
