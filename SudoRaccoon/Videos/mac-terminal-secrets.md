---
id: mac-terminal-secrets
title: 5 Mac terminal commands Apple doesn't advertise
status: posted
format: tool-listicle
topic: terminal
tools:
  - caffeinate
  - networkQuality
  - say
  - pbcopy
  - open
score: 27
voice: Autonoe
music: lofi-relax
duration: 55
composition: MacTerminalSecrets
output: out/mac-terminal-secrets/mac-terminal-secrets-tiktok.mp4
ig_comments: 12
ig_likes: 2210
ig_views: 104227
instagram_url: https://www.instagram.com/reel/DeXXB7Agox-
yt_likes: 7
yt_views: 356
youtube_url: https://www.youtube.com/shorts/C8ALYo1ICvc
scheduled: 2026-10-11 21:00
cover: out/mac-terminal-secrets/mac-terminal-secrets-cover.jpg
cover_ms: 4500
caption: "5 Mac terminal commands Apple doesn't advertise, and they're already on your Mac. caffeinate keeps it awake, networkQuality runs a speed test, say talks out loud, pbcopy puts any output on your clipboard and open . shows the folder in Finder. Which one didn't you know? 🦝 #macos #terminal #coding #programming"
created: 2026-10-10
posted: 2026-10-11 21:00
url: https://www.tiktok.com/@sudoraccoon/video/7695487180113759521
views: 311
likes: 20
saves: 5
comments: 0
shares: 0
---

# 5 Mac terminal commands Apple doesn't advertise

## Promise
Five commands already on every Mac: keep it awake, test your internet, make it talk, copy output to the clipboard, open Finder right here.

## Why now (evidence)
- NetworkChuck "50 macOS Tips and Tricks Using Terminal" **1.0M**; "hidden mac terminal commands" top-5 median 657K; "mac terminal" autocomplete includes *caffeinate*, *history*, *shortcut*, *commands cheat sheet*; "terminal command to keep mac awake" is a top web completion.
- Fits our look exactly: every beat is a real macOS terminal, no install needed (built in) → anyone with a Mac can try it right away.
- Facts, verified 2026-10-11 against Apple's man pages (Xcode man pages mirror, keith.github.io/xcode-man-pages; this machine is Linux, so nothing was run on a Mac):
  - `caffeinate` ([caffeinate(8)](https://keith.github.io/xcode-man-pages/caffeinate.8.html)): with no arguments it holds an assertion that prevents idle sleep until the process ends (so Ctrl+C lets the Mac sleep again); `-d` prevents the display from sleeping; `-t` = timeout in seconds; `-i`/`-s`/`-m`/`-u`/`-w` also exist. We say "won't doze off" (idle sleep), not "won't sleep when you close the lid".
  - `networkQuality` ([networkQuality(8)](https://keith.github.io/xcode-man-pages/networkQuality.8.html)): measures capacity (upload/download) and responsiveness in round trips per minute (RPM); `-v` verbose, `-s` sequential, `-c` JSON. Introduced in macOS 12 Monterey ([den.dev](https://den.dev/blog/speed-test-macos-networkquality/)). Default summary format shown in the video (`==== SUMMARY ====`, `Uplink capacity`, `Downlink capacity`, `Responsiveness: High (… RPM)`, `Idle Latency`) from real outputs ([den.dev](https://den.dev/blog/speed-test-macos-networkquality/), [krypted](https://krypted.com/?p=52629)); the numbers in the video are made up. Lives at `/usr/bin/networkQuality`.
  - `say` ([say(1)](https://keith.github.io/xcode-man-pages/say.1.html)): text to speech through the sound output (or `-o` to a file, `-v` voice, `-r` rate).
  - `pbcopy` / `pbpaste` ([pbcopy(1)](https://keith.github.io/xcode-man-pages/pbcopy.1.html)): pbcopy puts standard input on the pasteboard (prints nothing); pbpaste writes the pasteboard to standard output.
  - `open` ([open(1)](https://keith.github.io/xcode-man-pages/open.1.html)): opens a file, directory or URL as if double-clicked; a directory opens in Finder, so `open .` = the current folder; `-R` reveals a file in Finder, `-a` picks the app.
  - The hook terminal's `which caffeinate networkQuality say pbcopy open` prints `/usr/bin/…` for each (zsh `which` takes several names): all five ship with macOS.

## Hook options
- Listicle: "5 Mac commands Apple doesn't advertise."
- Relatable pain: "Raccoon's Mac fell asleep mid-download. At 3 a.m. Again."

## Outline
1. Hook: terminal + headline + 1/5 already typing.
2. 1/5 `caffeinate` — Mac stays awake all night (Raccoon's whole personality).
3. 2/5 `networkQuality` — speed test without a website.
4. 3/5 `say "trash night"` — the Mac talks (caption shows the words).
5. 4/5 `ls | pbcopy` — output straight to the clipboard.
6. 5/5 `open .` — Finder opens right where you are.
7. EndCard: comment "which one did you not know?"

## Raccoon angle
caffeinate = Raccoon at 3am; say = Raccoon makes the Mac order snacks; open . = finds his stash folder.

## Voice style
Friendly, quick and a little sly, like showing a friend hidden tricks. Clear short pauses between the five commands.

## Script
<!-- source of truth for scripts/tts.py. Pronunciation: {display|spoken}, e.g. {fd|F D}, {--tree|dash dash tree}. Last line = CTA: follow + save + comment ([[Video format]] → Ending) -->
Five Mac terminal commands Apple doesn't advertise, and they're already on your Mac.
Sudo's Mac fell asleep in the middle of a download. At 3 a.m. Again.
One. Caffeinate. While it runs, your Mac won't doze off. Add {-d|dash D} to keep the screen on too. Press {Ctrl+C|control C}, and it can sleep again.
Two. {networkQuality|network quality}. A speed test with no website: download, upload, and how responsive your connection feels.
Three. Say. Type say "trash night", and your Mac reads it out loud.
Four. {pbcopy|P B copy}. Pipe any output into it, and it lands on your clipboard. {pbpaste|P B paste} prints it back.
Five. {open .|open dot}. Finder opens right in the folder you're in. Sudo's snack stash, found.
Save this for your next late night. Follow for more terminal tricks, and comment which one you didn't know.

## Beats
| Beat | Visual | Raccoon |
| --- | --- | --- |
| Hook 0–5.6s | Headline "5 Mac terminal commands / Apple doesn't advertise." + terminal `which caffeinate networkQuality say pbcopy open` → five `/usr/bin/…` lines from frame 0; ring on the five lines + glass note "Built in. Nothing to install." at "already" | `peek-paws` over the terminal |
| Story 5.6–10.4s | Headline "Sudo's Mac fell asleep / mid-download. At 3 a.m."; Downloads window with progress bar stuck at 63%, window goes black with a moon at "asleep"; note "3:07 am · stuck at 63%" | `belly-up` at "again" |
| 1/5 caffeinate 10.4–19.4s | ToolHeader; `caffeinate -d` types and keeps running; note "Mac stays awake while it runs" → ring on `-d` + "-d keeps the screen on too"; ctrl + c keys press → `^C`, prompt back, note "Stops it. Sleep is back on." | `night-snack` (3am) |
| 2/5 networkQuality 19.4–26.8s | `networkQuality` → SUMMARY output; gauge glides to 312 Mbps download; rings walk download → upload → responsiveness; note "RPM = round trips per minute. Higher is better." | — |
| 3/5 say 26.8–33s | note "Text to speech, built in"; `say "trash night"` types; glass waveform pill moves while the Mac "talks"; note "Your Mac: “trash night”" | `trash-bin` rises behind the waveform at "trash" |
| 4/5 pbcopy 33–40.4s | `ls ~/stash \| pbcopy` (ring on `\| pbcopy`, no output); note "On the clipboard. Paste anywhere."; `pbpaste` prints acorns.txt, chips.txt, pizza-crust.txt, snacks (ring) | `bowl-grab` from the right edge at "clipboard" |
| 5/5 open . 40.4–47.9s | prompt `~/stash $`, `open .` (ring); Finder window "stash" opens, the snacks folder gets selected at "snack" | `celebrate` at "found" |
| Save 47.9–49.7s | SaveOutro cheat sheet (5 commands) + bubble "Which one didn't you know?" | `waving-laugh` |
| End 49.7–55.3s | EndCard: follow tap, save, comment "Which one didn't you know?" | avatar |

## Post
<!-- written by Claude as the last build step, checked by scripts/package.py: see [[Caption and hashtags]] -->
```text
5 Mac terminal commands Apple doesn't advertise, and they're already on your Mac. caffeinate keeps it awake, networkQuality runs a speed test, say talks out loud, pbcopy puts any output on your clipboard and open . shows the folder in Finder. Which one didn't you know? 🦝 #macos #terminal #coding #programming
```
- Keyword: mac terminal commands
- YouTube title: 5 Mac terminal commands Apple doesn't advertise #shorts
- Cover: TikTok and Instagram get the video frame at `cover_ms` (4.5s: hook headline, the `which` terminal with all five in /usr/bin, Sudo peeking, "Built in. Nothing to install.") because Postiz can't send a custom cover; designed covers stay in out/mac-terminal-secrets/ for a manual swap
- Post at: 18:00–21:00

## Results & learnings
- **46h (2026-10-13):** TikTok 280 views / 18 likes / 4 saves (1.4%), YouTube 268 views / 7 likes.
- **6d (2026-10-17):** **Instagram breakout hit — 104,227 views, 2,210 likes, 12 comments** ([watch](https://www.instagram.com/reel/DeXXB7Agox-)). Built-in macOS terminal commands (`caffeinate`, `networkQuality`, `say`, `pbcopy`, `open .`) with zero-install friction became the #1 video of the entire Proof of Concept.
