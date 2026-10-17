# Guide — how we make videos

The whole loop, for you and for any new Claude Code session. Details live in the Playbook pages linked below.

> **Using your own channel name & mascot:**
> This project ships with the original Proof of Concept branding (**Sudo the Raccoon**, `@sudoraccoon`) and 18 published example videos. To run your own channel under your own name:
> 1. Edit `src/brand/config.ts` (`name`, `handle`, `tagline`, `avatar`, `terminalTitle`).
> 2. Set `CHANNEL_HANDLE` and `CHANNEL_NAME` in `.env` (copied from `.env.example`).
> 3. Optionally replace the mascot stickers in `public/raccoon/` and update [[Channel profile]].

## The pieces
| Piece | What it is |
| --- | --- |
| **This vault** (`SudoRaccoon/`) | Source of truth: ideas, scripts, status, stats, design, research, decisions ([[Log]]). |
| **Claude Code** | Reads `CLAUDE.md` + the skills **sudo-raccoon** (make videos), **sudo-raccoon-ideas** (find ideas), and **remotion-explainer-library** (180+ Remotion components). |
| **The project folder** | Only what builds videos: Remotion code (`src/`), scripts (`scripts/`), voice/captions (`public/`), mascot images, renders (`out/`). |

## Start a session
```bash
claude
```
Claude reads `CLAUDE.md`, which points to this vault and the skills. You don't need to re-explain anything.

## The one prompt
Say: **"Make the next video."** or **"Make a video about <topic>."**
Claude picks the topic (the best-scored idea, or runs fresh research if the backlog is thin), verifies the facts, writes the script, voices it, builds and checks it, renders it, designs a separate cover image, writes the caption + hashtags, and puts everything in `out/<id>/` (and optionally publishes via Postiz if `POSTIZ_API_KEY` is configured).

## 1. Get ideas (optional)
Say: **"Find me new video ideas."**
Claude runs the research (competitor TikToks, YouTube, Hacker News, GitHub, Reddit/web), skips what you already have, scores ideas /30, and writes:
- `Research/Idea scan <date>.md` — what the data says + ranked table
- new notes in `Videos/` with `status: idea`

Open [[Home]] → **Ideas** table (sorted by score). Reject one? Tell Claude — it becomes `status: rejected`.

## 2. Make a video
Say: **"Let's make `<id>`."** (e.g. `git-3`)

| Step | Claude | You |
| --- | --- | --- |
| Start | `scripts/new_video.py` → note gets `status: scripting`, code skeleton created | — |
| Script | writes `## Script` in the note (hook on screen at frame 1, one idea, mascot joke) | read/edit it **in Obsidian**; say "script is good" |
| Voice | `scripts/tts.py <id>` → Gemini voice **Autonoe** + word-timed captions | — |
| Build | scenes with the shared components ([[Components]]), stickers from [[Raccoon assets]], checks still frames | optional live preview: `npm run dev` |
| Render | `scripts/render.py` → `out/<id>/` (video, master, cover) → `status: rendered` | — |
| Package | writes `## Post` (caption, 3–5 hashtags from [[Hashtags]] data), `scripts/package.py` checks it → `status: ready` | **watch once with sound** (Claude can't hear) |
| Post | `scripts/publish.py` (Postiz) or manual upload from `out/<id>/` ([[Posting checklist]]) | watch once with sound |
| After | `scripts/sync_channel.py` fills `posted`, `url`, stats → `status: posted`, [[Channel stats]] | — |

Status flow: `idea → scripting → voiced → building → rendered → ready → scheduled → posted` (+ `rejected`, `archived`).

## Useful things to say
- "Make the next video." / "Make a video about tmux."
- "Find me new video ideas." / "Refresh the idea scan."
- "Let's make git-3." / "Change the hook of git-3." / "Re-render git-3."
- "How is git-3 doing?"

## Rules that never change
Apple-light design · Gemini TTS Autonoe on the free tier · background music: "LoFi Relax" (Pixabay), quiet under the voice, never named or credited in the caption · no gradients/glow · no UPPERCASE · steps "1/5" · no AI images · verify every command/claim. Full detail: [[Design system]], [[Voice and captions]], [[Video format]].

## Where to look
[[Home]] · [[Production workflow]] (all commands) · [[Components]] · [[Hook library]] · [[Raccoon assets]] · [[Log]]
