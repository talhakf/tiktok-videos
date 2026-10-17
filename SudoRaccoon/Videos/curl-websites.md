---
id: curl-websites
title: "Websites that work in your terminal"
status: posted
format: tool-listicle
topic: terminal
tools: [curl, wttr.in, cheat.sh, qrenco.de, parrot.live, ifconfig.me]
score: 26
voice: Autonoe
music: lofi-relax
duration: 103
composition: CurlWebsites
output: out/curl-websites/curl-websites-tiktok.mp4
ig_saves: 962
ig_shares: 127
ig_comments: 4
ig_likes: 629
ig_views: 19388
yt_views: 32
youtube_url: https://www.youtube.com/watch?v=Sc3NIJD5vUY
instagram_url: https://www.instagram.com/reel/DehjZV0E6kH/
tiktok_url: https://www.tiktok.com/@sudoraccoon
scheduled: 2026-10-15 20:00
cover: out/curl-websites/curl-websites-cover.jpg
cover_ms: 3400
caption: "5 websites that work right in your terminal with curl. curl wttr.in/London for live weather, curl cheat.sh/tar for cheat sheets, curl qrenco.de/snacks for a scannable QR code, curl ifconfig.me for your public IP, and curl parrot.live. Which one did you try first? 🦝 #curl #terminal #linuxcommands #coding"
created: 2026-10-10
posted: 2026-10-15 20:00
url: https://www.tiktok.com/@sudoraccoon/video/7696956441353096480
views: 586
likes: 43
saves: 31
comments: 2
shares: 2
---

# Websites that work in your terminal

## Promise
Five websites you can open with curl: weather, cheat sheets, QR codes, your public IP and a dancing parrot.

## Why now (evidence)
- NetworkChuck "2 cool (web) things to do in Linux" 407K; YouTube Shorts "CMD hacks / Terminal hacks" 1.4M; @thecodingsloth "Upgrade your terminal with this" 129K (37× median, 3.6% saves).
- All five verified working from this machine on 2026-10-10: `curl wttr.in/London`, `curl cheat.sh/tar`, `curl qrenco.de/hello`, `curl ifconfig.me`, `curl parrot.live`. Repos maintained: [wttr.in](https://github.com/chubin/wttr.in) 30.6K★, [cheat.sh](https://github.com/chubin/cheat.sh) 41.8K★ (both pushed Sep 2026).
- Zero competitor overlap; no install needed (curl ships with macOS, Linux and Windows 10+), so every viewer can try it right away → saves + comments.

### Facts checked (2026-10-13)
All five services tested locally on 2026-10-13 (`curl` 8.x); upstream repos and documentation verified:
- **`curl` preinstalled**: ships on macOS, Linux distros, and Windows 10 build 17063+ (`C:\Windows\System32\curl.exe`). In Windows PowerShell 5.1, `curl` aliases `Invoke-WebRequest`, so `curl.exe` (or Command Prompt / PowerShell 7) runs the real binary.
- **`curl wttr.in/London`** ([chubin/wttr.in](https://github.com/chubin/wttr.in), Igor Chubin): detects `curl` via `User-Agent` and returns ANSI-colored ASCII weather report (`Weather report: London`, 5-line ASCII weather icon + condition `Sunny`, temp `+19(14) °C`, wind `→ 20 km/h`, visibility `10 km`, precipitation `0.0 mm`, followed by the 3-day Morning/Noon/Evening/Night table). Query options verified locally: `?0` returns only current weather (`wttr.in/London?0`), `?1` returns today's table (`wttr.in/London?1`), `?format=3` returns one-line summary (`London: ☀️  +19°C`), `?T` disables ANSI colors. Omitting the city geolocates the caller's IP — always pass `/London` on screen.
- **`curl cheat.sh/tar`** ([chubin/cheat.sh](https://github.com/chubin/cheat.sh), Igor Chubin): community-driven cheat sheets aggregating `cheat`, `tldr`, and StackOverflow answers for CLI commands and programming languages. Tested locally: `curl -s cheat.sh/tar` returns comment lines (`# To extract an uncompressed archive:`, `# To extract a .tgz or .tar.gz archive:`, `# To create a .tgz or .tar.gz archive:`) paired with commands (`tar -xvf /path/to/foo.tar`, `tar -xzvf /path/to/foo.tgz`, `tar -czvf /path/to/foo.tgz /path/to/foo/`). Programming queries work with `/<lang>/<query>` using `+` for spaces: `curl -s cheat.sh/python/reverse+a+list` returns `reversed(array)` and `list(reversed(array))`.
- **`curl qrenco.de/snacks`** ([chubin/qrenco.de](https://github.com/chubin/qrenco.de), powered by `qrencode` ANSI/UTF-8 block output): encodes the URL path string into a terminal QR code using Unicode half-blocks (`▀`, `▄`, `█`). Tested locally: `curl -s qrenco.de/snacks` returns a 15-line UTF-8 block QR code. On screen we render the QR with `qrTerminalRows("snacks")` / `QrCode` so viewers can scan it directly off the video.
- **`curl ifconfig.me`** ([ifconfig.me](https://ifconfig.me)): when queried by `curl` (`User-Agent: curl/...`), returns the caller's public IPv4/IPv6 address in plain text (`X.X.X.X`). On screen we use RFC 5737 `TEST-NET-3` documentation addresses (`203.0.113.42` and `198.51.100.7` for VPN) and never print or store the machine's real IP.
- **`curl parrot.live`** ([hugomd/parrot.live](https://github.com/hugomd/parrot.live), Hugoate): streams an infinite loop of 10 18-line ANSI-colored ASCII frames of Cult of the Party Parrot using terminal clear escapes (`\x1b[2J\x1b[H`) until interrupted with `SIGINT` (`Ctrl+C`). Captured all 10 18-line ASCII frames locally with `curl -s --max-time 2 parrot.live`.

## Hook options
- Contradiction: "You don't need a browser to use these websites."
- Listicle promise: "5 websites that work in your terminal."

## Outline
1. Hook: parrot dancing in a terminal + headline (motion from frame 1).
2. 1/5 `curl wttr.in/<city>` weather for tonight's raid (always pass a city: without one it shows your own location).
3. 2/5 `curl cheat.sh/tar` instant cheat sheet.
4. 3/5 `curl qrenco.de/<text>` QR code in the terminal.
5. 4/5 `curl ifconfig.me` your public IP (blur the real one; use a placeholder).
6. 5/5 `curl parrot.live` — Ctrl+C to escape.
7. EndCard: comment "which one did you try?"

## Raccoon angle
Planning a night raid from the terminal: weather check, cheat sheet for the lock, QR for the gang, parrot to celebrate.

## Notes
Privacy: wttr.in without a city and ifconfig.me reveal the recording machine's location/IP — use a city name and a fake IP in the mock terminal.

## Voice style
Friendly, brisk, and slightly conspiratorial, like a developer sharing late-night terminal secrets at 3 a.m. Clear and steady on each curl command, playful on the midnight snack raid and party parrot beats.

## Script
<!-- source of truth for scripts/tts.py. Pronunciation: {display|spoken}, e.g. {fd|F D}, {--tree|dash dash tree}. Last line = CTA: follow + save + comment ([[Video format]] → Ending) -->
Five websites that work right in your terminal. No browser needed, and nothing to install, because curl already comes on Mac, Linux, and Windows.
3 a.m. Sudo is planning a midnight snack raid and refuses to open a heavy browser with forty tabs.
One. {curl wttr.in/London|curl, W T T R dot in, slash London}. It prints a live weather report with ASCII art, temperature, wind, and rain right in your terminal. Put any city name after the slash, or add {?0|question mark zero} for just today's weather. Leave the city off and it guesses your location from your IP address.
Two. {curl cheat.sh/tar|curl, cheat dot S H, slash tar}. Forget clicking through ten blog posts for one terminal flag. This gives you community cheat sheets with working examples, zero ads, and zero popups. You can even ask coding questions, like {curl cheat.sh/python/reverse+a+list|curl, cheat dot S H, slash python, slash reverse plus a list}.
Three. {curl qrenco.de/snacks|curl, Q R enco dot D E, slash snacks}. Anything you put after the slash turns into a real, scannable QR code made of terminal blocks. Sudo sends the snack raid map to the whole gang, and yes, you can scan the one on screen right now.
Four. {curl ifconfig.me|curl, I F config dot me}. One line back: your public IP address, the one every website sees when you connect. Run it before and after turning on your VPN to make sure it's actually working.
Five. {curl parrot.live|curl, parrot dot live}. When the raid succeeds, this streams an animated, colorful party parrot in your terminal forever, until you press {Ctrl+C|control C}.
Save this for your next late-night terminal session. Follow for more terminal tricks, and comment which one you tried first.

## Beats
Built 2026-10-13 from the library; every beat anchored to spoken words via `makeCues(captions, fps)`. Voice: one Gemini request (100.58s of speech, 246/265 heard words matched). Video 1:43 (103.1s).

| Beat | Visual | Raccoon |
| --- | --- | --- |
| Hook 0–9.2s | Headline "5 websites that work / in your terminal." + terminal showing `curl wttr.in/London?0` ASCII sun and weather report from frame 0; mono note `wttr.in · cheat.sh · qrenco.de · ifconfig.me · parrot.live`; notes "No browser needed." → "Nothing to install — curl is built in." → "Mac · Linux · Windows (curl.exe)" | `peek-paws` over the terminal |
| Story 9.2–16.1s | Headline "3 a.m. Midnight snack raid. / 40 browser tabs? No thanks." + `BrowserWindow` with 8 cramped tabs, cookie banner, and 1.8 GB memory ad; `Verdict` stamp "40 tabs" + note "Heavy browser at 3 a.m.? Sudo stays in the terminal." | `night-snack` |
| 1/5 wttr.in 16.1–34.9s | `curl wttr.in/London` types and prints colored ASCII sun + Sunny / +19(14) °C / → 20 km/h / 10 km / 0.0 mm; focus rings on the ASCII sun → weather metrics → `/London` → `?0` on `curl wttr.in/London?0`; notes on `/London`, `?0` / `?format=3`, and IP geolocation warning | `pointing` at "ASCII" |
| 2/5 cheat.sh 34.9–54.9s | `curl cheat.sh/tar` prints community `tar` examples (ring on `tar -xzvf /path/to/foo.tgz`), then swaps at "ask" to `curl cheat.sh/python/reverse+a+list` (ring on `list(reversed(array))`); notes "Skip 10 blog posts" → "Community cheat sheets" → "Zero ads · zero popups" → "Ask coding questions" | `scheming` at "examples" |
| 3/5 qrenco.de 54.9–71.5s | `curl qrenco.de/snacks` prints `qrTerminalRows("snacks")` block QR inside the terminal + high-contrast scannable `QrCode` sweep card beside it (ringed at "scan"); notes on terminal blocks, sharing URLs/Wi-Fi, and scanning live | `duo-huddle` at "gang" |
| 4/5 ifconfig.me 71.5–84.9s | `curl ifconfig.me` prints RFC 5737 IP `203.0.113.42` (ring), then `curl ifconfig.me # VPN on` prints `198.51.100.7` (ring); `you` → `websites` diagram with `Tunnel` ("VPN tunnel") and arrow chip updating from `203.0.113.42` to `198.51.100.7` | `peek-pillar` from right edge |
| 5/5 parrot.live 84.9–95.2s | `curl parrot.live` streams 6 real 18-line ASCII frames from `parrot.live` cycling through rainbow terminal colors (`useCurrentFrame()`), then `KeyCombo` `ctrl + c` presses at "Ctrl+C" and stops the stream with `^C ~ $` | `celebrate` at "succeeds" |
| Save 95.2–97.9s | `SaveOutro` cheat-sheet terminal with all 5 `curl` commands + `Mac · Linux · Windows (curl.exe)` + bubble "Which one did you try first?" | `waving-laugh` |
| End 97.9–103.1s | `EndCard`: follow badge tap, Save, Comment "Which one did you try first?" | avatar |

## Post
<!-- written by Claude as the last build step, checked by scripts/package.py: see [[Caption and hashtags]] -->
```text
5 websites that work right in your terminal with curl. curl wttr.in/London for live weather, curl cheat.sh/tar for cheat sheets, curl qrenco.de/snacks for a scannable QR code, curl ifconfig.me for your public IP, and curl parrot.live. Which one did you try first? 🦝 #curl #terminal #linuxcommands #coding
```
- Keyword: websites that work right in your terminal
- YouTube title: 5 websites that work in your terminal (no browser needed) #shorts
- Cover: out/curl-websites/curl-websites-cover.jpg (own design, 1080×1440); cover_ms 3400 (3.4s: hook headline, wttr.in/London?0 terminal with focus ring, Sudo peeking, all 5 site names + "No browser needed.")
- Post at: 2026-10-15 20:00

## Results & learnings
- **48h calibration (predicted 26/30):** TT 585 · IG 19,147 · YT 32 views (TT 5.3% · IG 5.0% saves). Huge save-rate outlier (5.3% TT / 5.0% IG saves, 19.1K IG views / 962 saves): zero-install curl tricks.
