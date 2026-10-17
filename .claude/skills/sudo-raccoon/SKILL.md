---
name: sudo-raccoon
description: Make, edit, plan or track short vertical 9:16 dev/terminal explainer videos with a mascot in Remotion (Proof of Concept: "Sudo the Raccoon" / @sudoraccoon, customizable via src/brand/config.ts and .env) with an Obsidian vault for planning. Use whenever the user wants a new TikTok/Reels/Shorts video, a video idea or script, to change or re-render an existing video, to add mascot stickers, to get a caption/hashtags/cover package, or to run the end-to-end video pipeline.
---

# Sudo the Raccoon — Video Production Pipeline

Open-source Proof of Concept pipeline for short (**at least 60s, max 3:00**) 9:16 technical/developer explainers: a mascot has a relatable problem → tools/concepts shown working in a live macOS terminal or diagram → "Save this" card + a question + animated `EndCard`. Everything is code (Remotion + React), voiced by Gemini TTS with faster-whisper word-level alignment, and planned in the Obsidian vault `SudoRaccoon/`.

## Customizing for your own channel
- **Visual branding** (handle, channel name, closing tagline, avatar, default terminal title): edit `src/brand/config.ts`.
- **Scripts & sync** (`CHANNEL_HANDLE`, `CHANNEL_NAME`, `GEMINI_API_KEY`, optional `POSTIZ_API_KEY`): configure `.env` (copy from `.env.example`).
- **Mascot stickers**: `public/raccoon/*.png` (catalog in `SudoRaccoon/Playbook/Raccoon assets.md`).

## Where things are
| What | Path |
| --- | --- |
| Project root | Remotion 4, Node, `.venv` Python |
| Brand config | `src/brand/config.ts` (`BRAND.name`, `BRAND.handle`, `BRAND.tagline`, `BRAND.avatar`, `BRAND.terminalTitle`) |
| Obsidian vault (planning, scripts, stats) | `SudoRaccoon/` — `Home.md`, `Videos/<id>.md`, `Playbook/`, `Research/`, `Templates/Video.md`, `Videos.base` |
| Design + motion spec | vault `Playbook/Design system.md`; tokens `src/theme.ts` |
| Shared component library | **180+ components across 35+ categories** in `src/components/` + `src/icons/Icons.tsx` (104 line icons) + `src/lib/timing.tsx` (`Win`, `Sfx`, `makeCues`, `durationFromCaptions`) + `src/layout.ts` (grid). Full catalog: `Playbook/Components.md` and the `remotion-explainer-library` skill. Previews in Remotion Studio folder **Library** (38 compositions). Always build beats from the library; if a beat needs something new, add it to the library instead of hardcoding in the video file |
| Example PoC videos | 18 published videos in `src/videos/<id>/` and `SudoRaccoon/Videos/<id>.md` |
| Mascot stickers | `public/raccoon/*.png` — catalog with sizes/uses: vault `Playbook/Raccoon assets.md` |
| Voice + captions | `public/<id>/voice.mp3`, `public/<id>/captions.json` |
| Outputs | one folder per video `out/<id>/`: `<id>-tiktok.mp4` (mastered -14 LUFS upload file), `<id>-cover.jpg` (1080×1440, TikTok), `<id>-cover-9x16.jpg` (Instagram, YouTube), `<id>-caption.txt`, `<id>-youtube-title.txt`, `<id>-render.mp4` (raw) |
| Cover | `src/components/Cover.tsx` (`Cover` layout + `CoverStill`); every video file registers `<Name>Cover` next to its composition |
| Caption + hashtag rules / data | vault `Playbook/Caption and hashtags.md`, `Research/Hashtags.md` (`scripts/hashtags.py`) |

**The vault is the source of truth.** Read `SudoRaccoon/Home.md`, `Guide.md`, and the relevant `Playbook/` pages (`Video format`, `Hook library`, `Components`, `Design system`, `Voice and captions`, `Caption and hashtags`, `Production workflow`, `Posting checklist`) before building.

## End-to-End Workflow
1. **Idea → note.** `.venv/bin/python scripts/new_video.py <id> "<Title>"` creates/updates `SudoRaccoon/Videos/<id>.md`, a composition skeleton `src/videos/<id>/<Name>.tsx`, placeholder audio/captions, and registers it in `src/Root.tsx`. Ideas live as notes with `status: idea`.
2. **Script** in the note's `## Script` section (source of truth). Follow `Playbook/Video format.md` + `Hook library.md`; hook text on screen at frame 1; one idea; running mascot joke; **last line is the call to action** (follow + save + comment). Pronunciation markup `{display|spoken}`: `{fd|F D}`, `{ls|L S}`, `{--tree|dash dash tree}`. Optional `## Voice style` = Gemini delivery direction.
3. **Voice.** `.venv/bin/python scripts/tts.py <id>` → Gemini TTS (voice **Autonoe**) + faster-whisper word timing aligned to the script. Expect "≥95% heard words matched". Sets `status: voiced`.
4. **Build** scenes (`status: building`). Anchor every animation to a spoken word: `makeCues(captions, fps).at("word", nth)` (words normalised to lowercase `a-z0-9'-`; "3 a.m." → `3`, `am`). Live preview: `npm run dev`.
5. **Verify with stills** (fast, one bundle): `node scripts/stills.mjs <CompositionId> f1 f2 …` → `out/<id>/stills/`. Check: hook readable at frame ~30, focus rings on the right text, mascot edges, nothing important in bottom 320px / right 120px, captions not covered.
6. **Cover + render + master.** Design the cover in the video file (`<Name>Cover`, a separate 1080×1440 image): `Cover` layout with a two-tone headline (the hook, ≤ 2 lines), the payoff visual (terminal/diagram), the mascot, and chips naming what's inside; keep it between y 180 and 1260. Then:
   ```bash
   .venv/bin/python scripts/render.py <id>      # out/<id>/: <id>-render.mp4, <id>-tiktok.mp4 (-14 LUFS, faststart), <id>-cover.jpg, <id>-cover-9x16.jpg
   ```
   Sets `status: rendered`, `duration`, `output`, `cover`. `--cover-only` re-renders just the cover. Remind the user to watch once with sound.
7. **Post package.** Write the note's `## Post` per `Playbook/Caption and hashtags.md`: caption (search keyword + hook in the first 100 chars, 150–300 chars, names what's shown, ends with the bubble's question), 3–5 lowercase hashtags, `- Keyword:`, `- YouTube title:` (≤ 100 chars, ends `#shorts`), `- Post at:`. Then run `.venv/bin/python scripts/package.py <id>` → writes `out/<id>/<id>-caption.txt` and sets `status: ready`.
8. **Publish (optional).** If `POSTIZ_API_KEY` is configured in `.env`, `.venv/bin/python scripts/publish.py <id>` uploads the mp4 to Postiz and creates posts for TikTok, Instagram Reels, and YouTube Shorts (`--slot`, `--at "YYYY-MM-DD HH:MM"`, `--only tiktok,youtube`, `--dry-run`). Otherwise, upload manually from `out/<id>/` using `Playbook/Posting checklist.md`.
9. **Sync stats (optional).** `.venv/bin/python scripts/sync_channel.py` pulls live channel numbers for `CHANNEL_HANDLE` into `SudoRaccoon/Channel stats.md` and updates posted video notes.

Status flow: `idea → scripting → voiced → building → rendered → ready → scheduled → posted` (also `rejected`, `archived`).

## Hard rules
- **Every video ends with `EndCard`** (follow badge plus → check, save, comment), anchored to the spoken CTA line.
- **Design = "Apple light"**: page `#F5F5F7`, ink `#1D1D1F`, grey `#6E6E73`, one accent system blue `#0071E3`; Inter 700 with tight tracking; two-tone headlines; macOS terminal windows; frosted-glass callouts; blue focus rings; iMessage bubble; mascot stickers as product shots (soft shadow, no outline, no tilt).
- **Background music**: `music: lofi-relax` ("LoFi Relax" by Kulakovka, Pixabay Content License, `public/music/lofi-relax.mp3`), mixed by `scripts/render.py` ~15 dB under the voice in pauses and ducked to ~20 dB under during speech. Never put the song name or credits in the caption.
- **Never**: gradients/glow, UPPERCASE text, zero-padded numbers ("01" → use "1/5"), cream + terracotta look, hand-drawn/sticker-zine styling, AI-generated images.
- **Motion**: `easeOut` cubic-bezier(0.23,1,0.32,1) for enter/exit, `easeInOut` cubic-bezier(0.77,0,0.175,1) for moves, never ease-in; `appleSpring` damping 1.0 (0.8 only for thrown-in stickers/bubble); `materialize` (opacity + 0.95→1 scale + blur) — never scale(0); blur bridges swaps; 40ms stagger; no idle bobbing; one focal point per beat.
- **Voice**: Gemini TTS (`GEMINI_API_KEY` in `.env`, optional backup `GEMINI_API_KEY_2`). Free tier has a daily request limit — one request per video; never regenerate voice for design-only changes.
- **Content**: verify every technical claim (commands, flags, package names, RFCs/man pages) before scripting.

## Mascot placement tricks
- Peek over an edge: `<Sticker from="below" shadow={false}>` inside an `overflow: hidden` box whose bottom is the edge (`peek-ledge` over a terminal or trash can).
- Straight-cut bottom: pop it out of something (clip at the rim) or `fadeBottom={70}`. Straight-cut side: align with the screen edge + `from="right"`.
- Small images (`peek-ledge`, `standing-front`, `scheming`, `cool-outfit`): keep near native width (≤ 1.2×). Use 4–7 stickers per video, not all.

## Gotchas
- Remotion: animate with `useCurrentFrame()` only; CSS transitions don't render. Fonts via `@remotion/google-fonts`.
- `new_video.py` registers the composition inside `<Folder name="TikTok">` in `src/Root.tsx`.
- `stills.mjs` frames must be < composition duration (placeholder captions = ~2s).
- `render.py` reads the vault note when it starts and writes it back when it ends: don't edit that note while a render runs.
- `Terminal` draws its window frame before `enterAt` (only the body fades in), and its body loses ~148 px to title bar + padding: wrap later terminals in a `materialize` div and size windows as `rows * 1.38 * fontSize + 148`.
- faster-whisper's PyAV decoding breaks — `tts.py` decodes with ffmpeg itself; keep that.
- Terminal coordinates: `colX(i) = TX + 28 + i*0.6*fontSize`, `lineY(i) = TY + 82 + i*1.38*fontSize`; recompute circles if output scrolls.
- A clipped sticker's drop shadow shows as a faint box → `shadow={false}` when clipping.

## Related project skills (`.claude/skills/` & `.agents/skills/`)
`remotion-explainer-library`, `sudo-raccoon-ideas`, `remotion-best-practices`, `caption-animation`, `short-form-video`, `technical-video-script`, `motion-art-direction`, `apple-design`, `emil-design-eng`, `animate`, `animation-vocabulary`, `review-animations`.
