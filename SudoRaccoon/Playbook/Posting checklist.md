# Posting checklist

**Claude uploads every finished video itself** (decided 2026-10-11, replaces the hand upload of 2026-10-10): `scripts/publish.py <id>` sends it through [Postiz](https://platform.postiz.com) (official APIs, channels connected there: TikTok Business, Instagram, YouTube) and publishes it **right away** on all three (decided 2026-10-11; a later slot only on request: `--slot`, `--at`) → `status: scheduled` until Postiz reports it live, then `posted`. Same mp4 and caption everywhere.

## Automatic (normal case)
No pinned comment (user decision 2026-10-11).
- [ ] Watch it once **with sound** (Claude can't hear). Something off → delete it on the platforms, tell Claude (fix + republish).
- Covers: TikTok and Instagram use the video frame at `cover_ms` (Postiz can't send a custom cover image); YouTube Shorts pick a frame themselves. The designed covers stay in `out/<id>/` for hand uploads.
- The session sync checks Postiz: published → `status: posted` with `tiktok_url`, `instagram_url`, `youtube_url`; then the TikTok sync adds `url` and stats.

## When the upload fails: you get notified
Any failure (Postiz refuses, a platform reports an error, a post is deleted or still not out 2 h after its time, Claude couldn't run the upload, a key is missing) raises the alert (`scripts/postiz.py fail`): critical desktop notification "Upload failed: <id>", a push notification from Claude when it happened in a session, an `upload_error:` line in the note, back to `status: ready` (Home → **Ready to upload**), and an "upload failed" entry in [[Log]]. Then upload by hand with the list below (if some channels already went live, the error says which; only do the rest).

## By hand (fallback)

- [ ] Watch `out/<id>/<id>-tiktok.mp4` once **with sound** (Claude can't hear: voice, music level, sfx, clipped words)

**TikTok** (first, it's the one the sync tracks)
- [ ] Upload `<id>-tiktok.mp4` in TikTok Studio (web) or the app
- [ ] Caption: paste `<id>-caption.txt`. Small edits are fine; the sync still finds the video
- [ ] Cover: Edit cover → Upload cover → `<id>-cover.jpg` (3:4)

**Instagram Reels**
- [ ] Upload the same `<id>-tiktok.mp4` as a Reel (no TikTok watermark, it's our own file)
- [ ] Caption: same `<id>-caption.txt`
- [ ] Cover: Edit cover → add from camera roll → `<id>-cover-9x16.jpg`; the profile grid shows its 3:4 middle

**YouTube Shorts**
- [ ] Upload the same mp4 in YouTube Studio or the app (≤ 3 min vertical = Short)
- [ ] Title: `<id>-youtube-title.txt`; description: `<id>-caption.txt`
- [ ] Thumbnail: `<id>-cover-9x16.jpg` if the upload button is there (Partner Program channels only), else pick a frame with the hook
- [ ] Audience: "No, it's not made for kids"

**After**
- [ ] Raccoon image rights OK (`public/raccoon/CREDITS.md`)
- [ ] Obsidian updates itself: at the start of the next Claude session (or say "I posted it") `scripts/sync_channel.py` finds the video on TikTok @sudoraccoon and sets the note to `status: posted` with `posted`, `url` and the stats → [[Channel stats]]. It matches by url, then caption, then the only `ready` video of the same length. If it can't match, it says so and Claude links it by hand. YouTube is matched by title; Instagram per-Reel numbers only for Reels Postiz published (followers always).
- [ ] ~48 h later: ask Claude for a learning; it reads the synced stats and writes one line in the note

Claude already checked: hook readable muted at frame 1, nothing important in the bottom 320 px / right 120 px, 3–5 hashtags, question in caption matches the bubble, YouTube title ≤ 100 chars, 1080×1920 H.264/AAC, -14 LUFS, covers 1080×1440 and 1080×1920.
