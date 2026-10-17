---
id: slow-computer
title: "Why your computer is slow: 4 commands"
status: posted
format: tool-listicle
topic: terminal
tools: [uptime, top, df, du, sort]
score: 28
voice: Autonoe
music: lofi-relax
duration: 60
composition: SlowComputer
output: out/slow-computer/slow-computer-tiktok.mp4
yt_likes: 24
ig_saves: 17
ig_shares: 0
ig_comments: 2
ig_likes: 54
ig_views: 2538
yt_views: 1221
youtube_url: https://www.youtube.com/watch?v=F-vGCcW20Ew
instagram_url: https://www.instagram.com/reel/DecFKp9kitV/
tiktok_url: https://www.tiktok.com/@sudoraccoon
scheduled: 2026-10-13 17:00
cover: out/slow-computer/slow-computer-cover.jpg
caption: "Why is your computer slow? 4 built-in terminal commands tell you. uptime shows how long since your last restart, top -o cpu finds the app eating your CPU, df -h shows how full your disk is and du -sh | sort -h finds your biggest folder. What was eating yours? 🦝 #macos #terminal #linuxcommands #coding"
cover_ms: 6000
created: 2026-10-11
posted: 2026-10-13 17:00
url: https://www.tiktok.com/@sudoraccoon/video/7696167651399175457
views: 575
likes: 31
saves: 16
comments: 1
shares: 0
---

# Why your computer is slow: 4 commands

## Promise
Four built-in commands that tell you exactly why your computer is slow: what's hogging the CPU, how full the disk is, and which folder is the hoarder.

## Why now (evidence)
- @flpr_txk "System info and monitoring for Sys Admins" **235K, 102× median, 3.8% saves**; "Linux basic commands" 92K (40×). Cheat-sheet command videos are their whole outlier list.
- YouTube "why is my computer slow terminal" top-5 median **362K** (max 5.8M); "find what is taking up storage mac terminal" 330K; "cmd command to make pc faster / boost pc" are top autocompletes.
- Commands (all preinstalled on macOS and Linux): `uptime` (how long since restart + load average), `top -o cpu` on macOS / `top` then `P` on Linux (biggest CPU users), `df -h` (disk free, human sizes), `du -sh ~/* | sort -h` (folder sizes, biggest last). Check on the Mac that `sort -h` and `top -o cpu` behave as shown before building; optional upgrade `btop` (brew/apt).
- Fits the "no fake speed-up hacks" angle: the audience comment data says viewers search "cmd command to speed up PC", which are mostly myths (research scan, "speed-pc-myth").

## Hook options
- Contradiction: "Your computer isn't old. Something is eating it."
- Listicle promise: "4 commands that tell you why your computer is slow."
- Story: "Sudo's friend's laptop sounded like a jet engine at 3am."

## Outline
1. Hook: fan icon spinning, `top` output with one process at 98% ringed.
2. 1/4 `uptime`: up 41 days → restart it (the real #1 fix).
3. 2/4 `top -o cpu`: the process eating your CPU (quit it).
4. 3/4 `df -h`: disk 97% full → everything slows down.
5. 4/4 `du -sh ~/* | sort -h`: the folder hoarding 80 GB (Downloads).
6. EndCard: "what was eating yours?"

## Raccoon angle
Trash panda as the hoarder: the biggest folder is `~/Sudo's snacks` (or Downloads full of snack receipts). 3am jet-engine fan joke.

## Notes
Use made-up but realistic numbers. Don't promise speed-ups from cache cleaners; the point is finding the cause.

### Facts checked (2026-10-12)
- `uptime`: current time, time since boot, users, load average over the last 1, 5 and 15 minutes. macOS format from the uptime(1) man page example: `11:23AM  up  3:01, 8 users, load averages: 21.09, 15.43, 12.79` (on screen: `3:07AM  up 41 days,  3:12, 1 user, load averages: 9.84, 8.71, 7.02`). Linux checked locally (`load average:` wording).
- `top -o cpu`: macOS top's default sort key is **pid**; `-o cpu` orders by CPU, descending (top(1), [ss64 mac/top](https://ss64.com/mac/top.html)). Linux procps top sorts by %CPU by default and rejects `-o cpu` ("unrecognized field name 'cpu'", tested locally) → header line "Linux: just top". `q` quits top. top cuts its lines at the window width, so the narrow view on screen is real; `Google Chrome He` = a renderer (tab) process cut to 16 characters.
- `df -h ~`: free space of the file system that holds the given file (df(1)); `-h` = Ki/Mi/Gi suffixes. macOS prints the inode columns by default ("This option is now the default to conform to SUSv3. Use -I to suppress"), so the line is ~85 columns: shown at 16 px with a 2× camera zoom. `~` picks the data volume (`/System/Volumes/Data`); plain `df -h /` would show the small sealed system volume.
- `du -sh ~/* | sort -h`: `-s` one total per argument, `-h` K/M/G suffixes (du(1)); macOS sort has `-h, --human-numeric-sort` made for `df`/`du -h` output (sort(1) in the current Xcode man pages; ss64's mac sort page is outdated and misses it). Tested on Linux locally. Caveat: without Full Disk Access, macOS du prints "Operation not permitted" lines (stderr) for some protected folders in `~/Library`; the sorted list still prints. Not shown.
- Apple's "If your Mac runs slowly" (support.apple.com) lists the same causes: restart, low free storage, an app using a lot of CPU in Activity Monitor.
- Load > core count = more work queued than cores to run it (the usual rule of thumb; Linux also counts processes waiting on disk).

## Voice style
<!-- optional Gemini delivery direction; empty = default -->

## Script
<!-- source of truth for scripts/tts.py. Pronunciation: {display|spoken}, e.g. {fd|F D}, {--tree|dash dash tree}. Last line = CTA: follow + save + comment ([[Video format]] → Ending) -->
Why is your computer so slow? These four commands tell you exactly why, and they're already installed.
Sudo's laptop sounded like a jet engine at 3 a.m. Just a single tab was open: a snack recipe.
One. Uptime. Up 41 days? Restart it. It's still the number one fix. The last three numbers are the load. Higher than your number of cores means it's overworked.
Two. {top -o cpu|top dash O C P U}. Every app, sorted by CPU. That snack recipe tab? 98 percent. Quit it.
Three. {df -h ~|D F dash H}. Disk free. At 97 percent full, your computer has no room left to breathe, and everything slows down.
Four. {du -sh ~/* | sort -h|D U dash S H, pipe sort dash H}. Every folder in your home, biggest last. Sudo's biggest? Downloads. 80 gigs of snack receipts.
Save this for the next time your fan takes off. Follow for more terminal tricks, and comment what was eating yours.

## Beats
| Beat | Visual | Raccoon |
| --- | --- | --- |
| Hook 0–7.5s | Headline "Computer slow? / 4 commands show why." + the whole `top -o cpu` screen from frame 0, blue ring on the culprit row (`Google Chrome He 98.7`); glass notes "uptime · top · df · du" at "four", "Already installed." at "already" | `peek-paws` over the terminal |
| Story 7.5–13.9s | Headline "Sudo's laptop, 3 a.m.: / a jet engine." + activity card: 8 cores glide to 91–99% (red), mem 15.1/16 GiB; note "1 tab open: a snack recipe" | `night-snack` at "3" |
| 1/4 uptime 13.9–23.7s | `uptime` → `3:07AM  up 41 days, … load averages: 9.84, 8.71, 7.02`; camera zooms 2× onto "up 41 days" (ring), pans to the load averages at "load" (ring); notes "41 days without a restart" → "Restart it. Still the #1 fix." → "Load over the last 1 · 5 · 15 minutes" → "9.84 on 8 cores = overworked" | `belly-up` at "days" |
| 2/4 top -o cpu 23.7–32.5s | `top -o cpu` types, top's screen takes over; ring on the %CPU column + "Biggest CPU user on top"; at "that" the camera zooms 1.5× onto the top row (ring), notes "The snack recipe tab: 98.7% CPU" → "Quit that app. q leaves top." | `side-eye` at "that" |
| 3/4 df -h ~ 32.5–41.2s | `df -h ~` with the real macOS columns at 16 px; camera zooms 2× onto Size…Capacity at "disk"; ring Used/Avail, then the red 97%; note "df = disk free. 441 GB used, 14 GB left" → red gauge "97 % full" | `oops` at "breathe" |
| 4/4 du -sh ~/* \| sort -h 41.2–52s | the command types while it's spoken, six folders print smallest → biggest; note "Every folder in ~ biggest last"; ring on `80G /Users/sudo/Downloads` at "Downloads"; note "80 GB of snack receipts" | `trash-bin` at "Sudo's" |
| Save 52–53.7s | SaveOutro cheat sheet (the 4 commands) + bubble "What was eating yours?" | `waving-laugh` |
| End 53.7–59.8s | EndCard: follow tap, save, comment "What was eating yours?" | avatar |

## Post
<!-- written by Claude as the last build step, checked by scripts/package.py: see [[Caption and hashtags]] -->
```text
Why is your computer slow? 4 built-in terminal commands tell you. uptime shows how long since your last restart, top -o cpu finds the app eating your CPU, df -h shows how full your disk is and du -sh | sort -h finds your biggest folder. What was eating yours? 🦝 #macos #terminal #linuxcommands #coding
```
- Keyword: computer slow
- YouTube title: Why is your computer slow? 4 terminal commands that tell you #shorts
- Cover: TikTok and Instagram get the video frame at `cover_ms` (6.0s: hook headline, the `top -o cpu` screen with the 98.7% row ringed, Sudo peeking, "uptime · top · df · du" + "Already installed.") because Postiz can't send a custom cover; designed covers stay in out/slow-computer/ for a manual swap
- Post at: 2026-10-13 17:00

## Results & learnings
- **48h calibration (predicted 28/30):** TT 574 · IG 2,533 · YT 1,221 views (TT 2.8% · IG 2.7% saves). On target: cross-platform terminal diagnostics + cheat sheet drives strong saves and YT reach.
