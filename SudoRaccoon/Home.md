# Sudo the Raccoon (Proof of Concept)

> **Open-Source Proof of Concept:** This project (**Sudo the Raccoon** / `@sudoraccoon`) was created as a 6-day Proof of Concept (Oct 11–17, 2026) to test an end-to-end automated short-video pipeline (Obsidian + Claude Code + Remotion + Gemini TTS + faster-whisper + Postiz), reaching **250,700+ views** (including a **104K+ view** breakout Reel on Instagram) and **+2,187 followers/subscribers** across 18 videos in 6 days. The `@sudoraccoon` profiles on [TikTok](https://www.tiktok.com/@sudoraccoon), [Instagram](https://www.instagram.com/sudoraccoon/), and [YouTube](https://www.youtube.com/@sudoraccoon) remain online as a live showcase, though no new videos are being uploaded to them. You can use this vault, component library, and script pipeline as a template for your own channel under your own name — see `src/brand/config.ts` and `.env.example`.

![[Channel stats#Account]]

**New here? → [[Guide]]** (how the pipeline works and how to customize it for your own channel).

## Videos
![[Videos.base#Ready to upload]]

![[Videos.base#Pipeline]]

![[Videos.base#Posted]]

![[Videos.base#Ideas]]

## Make a video
**One prompt:** "Make the next video" or "Make a video about <topic>". Claude runs the full pipeline below, and (if `POSTIZ_API_KEY` is configured) can upload it through Postiz to TikTok, Instagram and YouTube, or leave the finished package in `out/<id>/` for manual upload ([[Posting checklist]]).

Step by step:
1. Pick an idea from **Ideas** above (highest score first). Need fresh ones? Ask Claude for video ideas (skill `sudo-raccoon-ideas`). Each idea's `score` is its predicted performance out of 30 → [[Scoring]].
   Start it with `scripts/new_video.py <id> "Title"`.
2. Write the script in the note's `## Script` section → [[Video format]], [[Hook library]].
3. Voice + captions → [[Voice and captions]].
4. Build the scenes → [[Components]], [[Design system]], [[Raccoon assets]].
5. Check stills, render, master → [[Production workflow]].
6. Caption, hashtags, cover → [[Caption and hashtags]] (`scripts/package.py` → `ready`).
7. Publish: `scripts/publish.py` (Postiz) or manual upload → [[Posting checklist]]; `scripts/sync_channel.py` marks it posted and fills in the stats.

## Playbook
- [[Video format]] · [[Hook library]] · [[Design system]] · [[Components]]
- [[Scoring]] · [[Voice and captions]] · [[Caption and hashtags]] · [[Raccoon assets]] · [[Channel profile]] · [[Production workflow]] · [[Posting checklist]]
- Research: [[Competitors]] · [[Hashtags]] · [[Seeds]]
- [[Channel stats]] — channel metrics template (updated by `scripts/sync_channel.py`)
- [[Log]] — project changelog
