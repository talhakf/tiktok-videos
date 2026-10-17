# Production workflow

All commands run in `~/Projects/tiktok-videos`.

```bash
# 0. new video (vault note + composition skeleton registered in src/Root.tsx)
.venv/bin/python scripts/new_video.py git-undo "5 ways to undo anything in git"

# 1. write ## Script in SudoRaccoon/Videos/<id>.md, then voice + captions (1 free-tier request)
.venv/bin/python scripts/tts.py <id>

# 2. build scenes in src/videos/<id>/  (live preview)
npm run dev

# 3. check stills (fast; one bundle) -> out/<id>/stills/
node scripts/stills.mjs <CompositionId> 30 300 600 900

# 4. render + TikTok master + cover -> out/<id>/ (status: rendered)
.venv/bin/python scripts/render.py <id>            # --cover-only: just the cover
```

```bash
# 5. post package: hashtag data (weekly), then write ## Post in the note and check it
.venv/bin/python scripts/hashtags.py            # -> Research/Hashtags.md (skips if < 7 days old; --refresh)
.venv/bin/python scripts/package.py <id>        # checks caption, mp4, cover -> out/<id>/<id>-caption.txt, caption: property, status: ready
```

```bash
# 6. publish through Postiz right away: TikTok + Instagram Reel + YouTube Short (status: scheduled → posted)
.venv/bin/python scripts/publish.py <id>        # --slot (next Post at) · --at "2026-10-12 18:30" · --only tiktok,youtube · --dry-run
.venv/bin/python scripts/postiz.py check        # scheduled posts: errors → alert, published → posted (the sync runs it)
.venv/bin/python scripts/postiz.py fail <id> "reason"   # upload-failed alert by hand (note, Log, desktop notification)
```

Status after render: `rendered`; after package.py passes: `ready`; after publish.py: `scheduled` (failure → alert, `upload_error:`, back to `ready`, you upload by hand: [[Posting checklist]]); the next channel sync sets `posted`. Caption rules: [[Caption and hashtags]]. After posting: `scripts/sync_channel.py` sets `status: posted`, `posted`, `url` and the stats from the live channel (latest 5 videos; the `sudo-raccoon` skill runs it at the start of every session, or run it by hand) → [[Channel stats]].

Status flow: `idea → scripting → voiced → building → rendered → ready → scheduled → posted`.

## Output folder
One folder per video, `out/<id>/` (not in git):

| File | What |
| --- | --- |
| `<id>-tiktok.mp4` | the upload (1080×1920, H.264/AAC, -14 LUFS, faststart) |
| `<id>-cover.jpg` | the cover, its own 1080×1440 design (`<Name>Cover` still), upload in TikTok Studio |
| `<id>-caption.txt` | caption + hashtags, ready to paste (same as the note's `## Post`) |
| `<id>-render.mp4` | raw Remotion render before mastering |
| `stills/` | preview frames from `stills.mjs`, only while building; `render.py` deletes it after the final render |
