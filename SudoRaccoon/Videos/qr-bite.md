---
id: qr-bite
title: "Sudo bit a QR code and it still scans"
status: posted
format: concept-explainer
topic: how-tech-works
tools: [qrencode, QR error correction]
score: 26
voice: Autonoe
music: lofi-relax
duration: 89
composition: QrBite
output: out/qr-bite/qr-bite-tiktok.mp4
ig_saves: 16
ig_shares: 2
ig_comments: 1
ig_likes: 31
ig_views: 1602
yt_comments: 1
yt_likes: 10
yt_views: 703
youtube_url: https://www.youtube.com/watch?v=XNSm2daBe1c
instagram_url: https://www.instagram.com/reel/DejzmVSAZdi/
tiktok_url: https://www.tiktok.com/@sudoraccoon
scheduled: 2026-10-16 17:00
cover: out/qr-bite/qr-bite-cover.jpg
cover_ms: 4600
caption: "How QR codes work when a corner is missing: Sudo bit 13% out of this Level H QR code and it still scans. Keep the 3 finder squares intact and Reed–Solomon math rebuilds up to 30% of the grid, or run qrencode -l H -t ansiutf8 in your terminal. Did the bitten QR code scan for you? 🦝 #qrcode #terminal #linux #coding"
created: 2026-10-11
posted: 2026-10-16 17:00
url: https://www.tiktok.com/@sudoraccoon/video/7697281592691035425
views: 825
likes: 15
saves: 6
comments: 2
shares: 0
---

# Sudo bit a QR code and it still scans

## Promise
Why a QR code still works with a chunk bitten out: up to 30% of it is backup, and you can make one in the terminal.

## Why now (evidence)
- YouTube "how qr codes work": top-5 median **1.4M**, max 9.7M; "qr code scam" 314K (pairs with [[phishing-links]]).
- Was a 23 in research scan (low save value); raised because the demand number is now measured and our library has a real scannable QR component (`text/` real QR), so the bite can be literally true on screen.
- Facts to verify when building: QR error-correction levels L/M/Q/H restore about 7/15/25/30% of the codewords (Reed–Solomon); `qrencode -l H -t ansiutf8 "text"` prints a level-H code in the terminal ([qrencode](https://fukuchi.org/works/qrencode/)); the three big squares are finder patterns. Test that the bitten frame really scans with a phone (ask the user) or with `zbarimg`.

### Facts checked (2026-10-13)
Sources: ISO/IEC 18004 (QR Code bar code symbology specification, invented by Masahiro Hara at Denso Wave, 1994), `qrencode(1)` man page (libqrencode 4.1.1 by Kentaro Fukuchi, [fukuchi.org/works/qrencode](https://fukuchi.org/works/qrencode/)), `zbarimg(1)` (`0.23.93`), and Node `qrcode` library (`src/components/text/QrCode.tsx`), all verified locally on this box:
- **Four Reed–Solomon error correction levels over $\text{GF}(2^8)$** (ISO/IEC 18004):
  - Level **L** (Low): restores ~**7%** of codewords (`-l L`, default in `qrencode`).
  - Level **M** (Medium): restores ~**15%** of codewords (`-l M`).
  - Level **Q** (Quartile): restores ~**25%** of codewords (`-l Q`).
  - Level **H** (High): restores ~**30%** of codewords (`-l H`).
- **Anatomy of a QR code** (ISO/IEC 18004):
  - **Finder patterns**: three identical **7×7** squares (7×7 dark outer ring, 5×5 light ring, 3×3 dark center, plus a 1-module light separator) placed in the **top-left, top-right, and bottom-left** corners — never the bottom-right. Having three corners instead of four lets the scanner detect the symbol's position, scale, and orientation/tilt angle from any rotation.
  - **Timing patterns**: alternating dark/light modules along row 6 and column 6 connecting the three finder patterns to establish module coordinates.
  - **Alignment patterns**: 5×5 squares (in Version 2+, e.g. centered at `(26, 26)` in Version 4's 33×33 grid) to correct perspective distortion.
  - **Data + Reed–Solomon ECC**: the remaining modules store the encoded payload bits interleaved with Reed–Solomon error-correction codewords (the same family of algebraic block codes used on NASA's Voyager deep-space probes).
- **Verified bitten QR code on screen**:
  - Encoding `"https://tiktok.com/@sudoraccoon"` at Level **H** produces a Version 4-H QR code (**33×33 = 1,089 modules**, 36 data bytes + 64 ECC bytes interleaved across 4 Reed–Solomon blocks).
  - Taking a scalloped 3-tooth bite out of the **bottom-right corner** (removing **145 of 1,089 modules = 13.3%**, away from all three 7×7 finder patterns) was tested directly against `zbarimg 0.23.93` on the rendered 1080×1920 video frames and 1080×1440 cover image, decoding cleanly as `QR-Code:https://tiktok.com/@sudoraccoon`.
- **Terminal command**: `qrencode -l H -t ansiutf8 "snacks"` tested locally with `qrencode 4.1.1`: `-l H` selects high error correction (30%), `-t ansiutf8` prints the Version 1-H (21×21) symbol in the terminal using ANSI background colors and UTF-8 half-block characters (`▀`, `▄`, `█`). Both the terminal block QR and the companion card in frame 2180 decode as `QR-Code:snacks` under `zbarimg`.

## Hook options
- Curiosity: "Sudo bit this QR code. Scan it."
- Contradiction: "You can destroy 30% of a QR code and it still works."

## Outline
1. Hook: QR code, raccoon bite out of a corner, "scan it" (it works).
2. The three finder squares tell the camera where the code is.
3. Up to 30% is backup data (error correction level H) → the bite gets rebuilt.
4. Make your own: `qrencode -l H -t ansiutf8 "snacks"`.
5. Safety beat: anyone can make one, check the link before you open it (→ [[phishing-links]]).
6. EndCard: "did it scan for you?"

## Raccoon angle
The joke is the premise: Sudo thought it was a cracker. Comment bait: viewers will try to scan the bitten code.

## Notes
Keep the bite away from the finder patterns or the code fails; test the actual rendered frame.

## Voice style
Upbeat, curious, and slightly mischievous, like a friend showing off a magic trick that actually works. Pause briefly after "Point your camera at it — it still scans" so viewers register the dare, stay crisp and clear on the four error-correction levels and the terminal command, and deliver the 3 a.m. pixel-cracker joke with deadpan warmth.

## Script
<!-- source of truth for scripts/tts.py. Pronunciation: {display|spoken}, e.g. {fd|F D}, {--tree|dash dash tree}. Last line = CTA: follow + save + comment ([[Video format]] → Ending) -->
Sudo bit a chunk out of this {QR|Q R} code. Point your camera at it — it still scans.
At 3 a.m., Sudo thought this black-and-white square was a pixel cracker and took a bite out of the bottom-right corner. Over {13%|thirteen percent} of the grid is gone. So why didn't it break?
First, look at the three big squares in the corners. Those are finder patterns. Having three corners instead of four tells your phone camera which way is up, even if the code is tilted. Never cover those three corners.
Second, the rest of the grid holds your actual text or link, plus Reed–Solomon error correction — the exact same math NASA used on space probes so messages survive static in deep space.
Every {QR|Q R} code has four backup levels. Level L restores about {7%|seven percent} of missing squares, M restores {15%|fifteen percent}, Q restores {25%|twenty-five percent}, and Level H packs so much backup math into the grid that up to {30%|thirty percent} of the code can be scratched, covered by a logo in the middle, or bitten off by a raccoon, and your phone still reconstructs every single byte.
To make one yourself, run {qrencode|Q R encode} {-l H|dash L H} {-t ansiutf8|dash T ansi U T F 8} "snacks" and it prints a Level H {QR|Q R} code right in your terminal.
Because anyone can generate a {QR|Q R} code in one second, always read the {URL|U R L} preview your phone shows before you tap it. Save this command, follow for more terminal tricks, and comment if the bitten {QR|Q R} code scanned for you.

## Beats
Built 2026-10-13 from the library; every beat anchored to spoken words. Voice: one Gemini request (86.18 s of speech, 247 script words, 235/253 heard words matched = 92.9%). Video 1:29 (88.7 s). Verified with `zbarimg 0.23.93` on the rendered video frames and cover that both the bitten `https://tiktok.com/@sudoraccoon` QR code and the terminal `"snacks"` QR code scan cleanly.

| Beat | Visual | Raccoon |
| --- | --- | --- |
| Hook 0–5.7s | Headline "Sudo bit this QR code. / Scan it — it still works." + real 33×33 Level-H QR card (`https://tiktok.com/@sudoraccoon`) with a 3-tooth scalloped bite in the bottom-right corner (145/1,089 modules = 13.3% removed) from frame 0; Callout "13.3% bitten off by Sudo" at "chunk"; Note "Point your phone camera at it →" swapping to green "Still scans: tiktok.com/@sudoraccoon" at "scans" | `night-snack` |
| Story 5.7–16.3s | Headline "3 a.m. A pixel cracker? / Why didn't the link break?"; intact QR card gets chomped in the bottom-right corner at "bite" with a blue focus ring around the missing corner at "corner"; ThoughtBubble "3 a.m. pixel cracker!"; Notes "145 of 1,089 modules gone (13.3%)" → "Why does your camera still read it?" | `night-snack` + "?" Reaction at "break" |
| 1/2 Finder patterns 16.3–28.1s | Headline "1/2 Finder patterns / Never cover the 3 corners."; the three 7×7 corner squares highlight in system blue with check badges at "finder"; Callout "3 finder squares (7×7 modules)" → green Callout "No 4th square! Safe to bite" at "three"; QR card tilts 14° and back at "tilted"; Notes "3 corners tell the camera which way is up" → "Scans upside down or tilted at any angle" → red "Cover a finder corner → scan fails" | `pointing` (flipped) at "finder" |
| 2/2 Reed–Solomon 28.1–41.1s | Headline "2/2 Reed–Solomon math / Backup bytes in the grid."; QR grid splits into ink data modules + green Reed–Solomon backup modules at "Reed–Solomon", then reconstructs the 145 bitten modules in green at "survive"; right column cards "Data modules: 36 data bytes", "Reed–Solomon backup: +64 backup bytes", and "NASA Voyager: Survives deep-space static" at "NASA" | — |
| 4 backup levels 41.1–64.1s | Headline "4 backup levels: L, M, Q, H / Up to 30% backup data."; DataTable with rows L (~7%, `-l L`), M (~15%, `-l M`), Q (~25%, `-l Q`), and H (~30%, `-l H`, highlighted) with gliding focus ring; 3 cards ("Scratched", "Center logo", "Raccoon bite" — all `✓ scans`) enter at "scratched", "logo", "bitten"; Notes "64 of 100 bytes are backup math" → "Rebuilds every single byte" | `celebrate` at "bitten" |
| Terminal qrencode 64.1–74.7s | Headline "Make one in the terminal / Run qrencode with -l H."; Terminal types `qrencode -l H -t ansiutf8 "snacks"`, focus ring on `-l H`, prints scannable 21×21 Level-H block QR alongside a sweep-rendered `QrCode` card (`"snacks" (Level H)`); Notes "-l H = 30% backup · -t ansiutf8 = terminal blocks" → green 'Scans right off the terminal → "snacks"' | — |
| Security preview 74.7–80.9s | Headline "Anyone can print a QR. / Read the URL preview."; PhoneFrame with viewfinder + iOS Camera NotificationBanner ('Open "tiktok.com" in Safari') sliding down at "preview"; safe green UrlBar (`https://tiktok.com/@sudoraccoon`) vs danger red UrlBar (`https://login-tiktok.ru/free`); Note "Check the domain before you tap" | `side-eye` at "always" |
| Save + EndCard 80.9–88.7s | SaveOutro cheat sheet (`qrencode -l H -t ansiutf8`, `Level L / M / Q / H`, `3 corner squares`, `Camera URL banner`) + bubble "Did the bitten QR code scan for you?"; EndCard at "follow" | `waving-laugh` → avatar |

## Post
<!-- written by Claude as the last build step, checked by scripts/package.py: see [[Caption and hashtags]] -->
```text
How QR codes work when a corner is missing: Sudo bit 13% out of this Level H QR code and it still scans. Keep the 3 finder squares intact and Reed–Solomon math rebuilds up to 30% of the grid, or run qrencode -l H -t ansiutf8 in your terminal. Did the bitten QR code scan for you? 🦝 #qrcode #terminal #linux #coding
```
- Keyword: how qr codes work
- YouTube title: Sudo bit a QR code and it still scans — how QR codes work #shorts
- Cover: TikTok and Instagram get the video frame at `cover_ms` (4.6s: hook headline, the bitten 33×33 Level-H QR code verified to scan with `zbarimg`, the "13.3% bitten off by Sudo" callout, Sudo eating a chip, and the green "Still scans: tiktok.com/@sudoraccoon" note); designed covers (1080×1440 and 9:16) are in `out/qr-bite/qr-bite-cover.jpg` and `out/qr-bite/qr-bite-cover-9x16.jpg`
- Post at: 2026-10-16 17:00

## Results & learnings
-
