---
id: wifi-hacking
title: "How hackers crack Wi-Fi (and the setting that stops them)"
status: posted
format: concept-explainer
topic: security
tools: [WPA2, WPA3, WPS, passphrase]
score: 27
voice: Autonoe
music: lofi-relax
duration: 130
composition: WifiHacking
output: out/wifi-hacking/wifi-hacking-tiktok.mp4
yt_comments: 1
ig_saves: 104
ig_shares: 8
ig_comments: 0
ig_likes: 83
ig_views: 3582
yt_likes: 23
yt_views: 1294
youtube_url: https://www.youtube.com/watch?v=VmMa3YP495M
instagram_url: https://www.instagram.com/reel/Deeqdgsj-PQ/
tiktok_url: https://www.tiktok.com/@sudoraccoon/video/7696538679128509729
scheduled: 2026-10-14 17:00
cover: out/wifi-hacking/wifi-hacking-cover.jpg
cover_ms: 1000
caption: "How hackers crack Wi-Fi: they record the handshake when your phone joins, then guess offline at millions of tries per second. The WPS PIN is an even faster way in. Four settings stop it: a long passphrase, WPA3 (or WPA2 with AES), WPS off and firmware updates. Is WPS still on at your place? 🦝 #wifi #cybersecurity #networking #security"
created: 2026-10-11
posted: 2026-10-14 17:00
url: https://www.tiktok.com/@sudoraccoon/video/7696538679128509729
views: 507
likes: 16
saves: 5
comments: 0
shares: 0
---

# How hackers crack Wi-Fi (and the setting that stops them)

## Promise
How a Wi-Fi password actually gets cracked (capture once, guess offline) and the four router settings that stop it (long passphrase, WPA3 or WPA2-AES, WPS off, firmware updates).

## Why now (evidence)
- YouTube "how hackers hack wifi explained": top-5 median **4.1M**, max 4.3M; "see who is on my wifi" 1.1M ([[who-on-wifi]]).
- Third episode of the Wi-Fi family after [[wifi-passwords]] and [[who-on-wifi]]; security series fit (applies offline dictionary/brute-force guessing to Wi-Fi handshakes).
- Facts (well documented; cite when building): WPA2-Personal: an attacker nearby records the 4-way handshake when a device joins, then guesses passwords offline against it, so short or dictionary passwords fall and long random passphrases don't ([Wi-Fi Alliance WPA3](https://www.wi-fi.org/discover-wi-fi/security)); WPA3-Personal (SAE) stops offline dictionary guessing; the WPS PIN can be brute-forced (CERT [VU#723755](https://www.kb.cert.org/vuls/id/723755), 2011) → turn WPS off; change the router's default admin password. Defensive only: no attack commands on screen.
- Not a repeat: [[wifi-passwords]] = read *your own* saved password with one command, [[who-on-wifi]] = list the devices on your network. This one = how an outsider gets the password (handshake capture → offline guessing, WPS PIN) and the four router settings that stop it. No terminal, no commands, no tool names on screen or in the voice.
- Facts re-checked 2026-10-13 (each line of the script):
  - **Handshake on join:** "the 4-way handshake … is executed when a client wants to join a protected Wi-Fi network, and is used to confirm that both the client and access point possess the correct credentials (e.g. the pre-shared password)" ([krackattacks.com](https://www.krackattacks.com/), Vanhoef 2017). The passphrase itself is never sent: both sides derive the key from it (PMK = PBKDF2-HMAC-SHA1(passphrase, SSID, 4096 iterations); IEEE 802.11i), and the handshake carries a MIC that proves knowledge of it → anyone in range can record it and test guesses against it offline; the router never sees the guesses (no lockout). Since 2018 the PMKID variant needs no joining client at all on some routers (Steube, hashcat forum) — not in the script, kept simple.
  - **"Kick your phone off"** = forged deauthentication frames; WPA3 networks "require use of Protected Management Frames (PMF)" which protect management frames from forging ([Wi-Fi Alliance security](https://www.wi-fi.org/discover-wi-fi/security)).
  - **Speed:** one RTX 4090, hashcat 6.2.6 benchmark, mode 22000 WPA-PBKDF2-PMKID+EAPOL: **2,533.3 kH/s** ≈ 2.5 million guesses/s ([Chick3nman benchmark gist](https://gist.github.com/Chick3nman/32e662a5bb63bc4f51b847bb422222fd)). Our math at 2.53 M/s: leaked list of 14,344,391 (the RockYou wordlist size) = 5.7 s → "six seconds"; 8 lowercase letters (WPA minimum is 8) 26⁸ = 2.1×10¹¹ = 23 h → "about a day"; 5 random words from a 7,776-word diceware list 7776⁵ = 2.8×10¹⁹ = ~355,000 years → "over 300,000 years". One card, worst case for the attacker's luck ignored (average is half) — shown on screen as "1 gaming GPU".
  - **WPS PIN:** 8 digits, the 8th is a checksum, and the router confirms each half separately (EAP-NACK after M4 / M6), so "at most 10⁴ + 10³ (=11.000) attempts"; with no lock-down "less than four hours (at 1.3 seconds per attempt)"; users "advised to disable WPS" ([Viehböck, Brute forcing Wi-Fi Protected Setup, 2011](https://sviehb.files.wordpress.com/2011/12/viehboeck_wps.pdf); [CERT VU#723755](https://www.kb.cert.org/vuls/id/723755): the attacker can "retrieve the password for the wireless network" → its length doesn't matter). The PIN is usually on the router label.
  - **WPA3-Personal:** SAE gives "more resilient, password-based authentication even when users choose passwords that fall short of typical complexity recommendations … stronger protections for users against password guessing attempts" ([Wi-Fi Alliance press release, 2018-06-25](https://www.wi-fi.org/news-events/newsroom/wi-fi-alliance-introduces-wi-fi-certified-wpa3-security)); SAE/Dragonfly resists offline dictionary attacks, each guess needs a live exchange with the router (RFC 7664). Caveat: Dragonblood (2019) found side-channel bugs in early implementations, fixed by updates ([wpa3.mathyvanhoef.com](https://wpa3.mathyvanhoef.com/)) — one more reason for firmware updates. WPA2/WPA3 transition mode is fine for old devices (they still use WPA2, so the long passphrase still matters).
  - **WPA2-AES, not TKIP/WEP:** Apple's router guide: WPA3 Personal → WPA2/WPA3 Transitional → WPA2 Personal (AES); anything with TKIP and all WEP modes are not secure ([Apple: Recommended settings for Wi-Fi routers](https://support.apple.com/en-us/102766)). NSA's home network sheet: WPA3 (or WPA2/WPA3 transition), passphrase of at least 20 characters, keep firmware updated ([NSA CSI, Feb 2023](https://media.defense.gov/2023/Feb/22/2003165170/-1/-1/0/CSI_BEST_PRACTICES_FOR_SECURING_YOUR_HOME_NETWORK.PDF)).
  - **Firmware / KRACK:** 2017, weakness in WPA2's 4-way handshake; "users must update affected products as soon as security updates become available"; it did not reveal the Wi-Fi password ([krackattacks.com](https://www.krackattacks.com/)).

## Hook options
- Curiosity: "Your Wi-Fi password can be cracked without ever touching your router."
- Contradiction: "Hackers don't guess your Wi-Fi password at your door. They take it home."

## Outline
1. Hook: "How hackers crack Wi-Fi. / They take it home." + phone ⇄ router diagram, a recording chip already flying to Sudo's laptop.
2. Sudo outside your window (laptop, chips).
3. Phone joins → 4-way handshake (4 packets), "password never sent, proof is" → recorded. Kick-off trick: phone drops, rejoins.
4. Offline at home: guesses vs the recording (no lockout, no alarm), 2.5 M guesses/s on one GPU; crack-time bars: leaked list 6 s, 8 lowercase ~1 day, 5 random words 300,000+ years.
5. Second door: WPS PIN on the sticker → two halves + checksum → 11,000 guesses, < 4 h, router hands over the password.
6. Fix 1/4 long passphrase, 2/4 WPA3 (else WPA2-AES, never TKIP/WEP), 3/4 WPS off, 4/4 firmware (KRACK 2017).
7. Sudo gives up → trash. "Cracking Wi-Fi that isn't yours is a crime."
8. Save card (router settings checklist) + EndCard: "Is WPS still on at your place?"

## Raccoon angle
Sudo is the bandit outside your window with a laptop and chips; the fix scene shows him giving up and going back to the trash.

## Notes
Keep it defensive (YouTube/TikTok rules on hacking tutorials): concept diagram + settings, never aircrack/hashcat commands. Crack times from a cited source or shown as relative bars.

## Voice style
Calm, clear and a little sly, like a friend explaining how a heist works and then how to stop it. Brisk, confident on the facts; short clear pauses between sections, no long gaps; deadpan on the Sudo jokes. Read W P A, W P S, A E S and T K I P as letters.

## Script
<!-- source of truth for scripts/tts.py. Pronunciation: {display|spoken}, e.g. {fd|F D}, {--tree|dash dash tree}. Last line = CTA: follow + save + comment ([[Video format]] → Ending) -->
This is how hackers crack Wi-Fi passwords. They don't guess at your router. They record one thing, and take it home.
Tonight, Sudo is outside your window. Laptop, chips, bad intentions.
Every time your phone joins your Wi-Fi, it does a four-way handshake with the router. Your password never goes through the air. But proof of it does.
Anyone nearby can record that handshake. Nobody joining? They kick your phone off for a second, and it joins again.
Now the guessing happens at home, offline. Every guess is checked against the recording, not your router. No lockout. No alarm.
One gaming graphics card checks about two and a half million guesses per second.
Every password in a leaked list of 14 million? Six seconds. Eight lowercase letters? About a day. Five random words? Over 300,000 years.
There's a second door: {WPS|W P S}. Its eight-digit PIN is often printed right on your router's sticker.
The router checks that PIN in two halves, and the last digit is just a checksum. So it's not 100 million guesses. It's 11,000.
With no lockout, that's under four hours. Then the router hands over your Wi-Fi password, no matter how long it is.
So, four settings that stop all of this.
One. A long passphrase. Five random words, or at least 20 characters.
Two. {WPA3|W P A 3}. Its new handshake makes recordings useless: every single guess has to ask your router, live. And it blocks the kick-off trick. Older devices need {WPA2|W P A 2}? Use mixed mode, or {WPA2|W P A 2} with {AES|A E S}. Never {TKIP|T K I P}, never {WEP|wep}.
Three. Turn {WPS|W P S} off.
Four. Update your router's firmware. In 2017, an attack called {KRACK|crack} found a hole in {WPA2|W P A 2} itself, and the fix was an update.
Sudo checks your network again. {WPA3|W P A 3}, {WPS|W P S} off. He goes back to the trash.
And cracking Wi-Fi that isn't yours is a crime. Even for raccoons.
Save this for the next time you open your router settings. Follow for more security tricks, and comment: is {WPS|W P S} still on at your place?


## Beats
Built 2026-10-13 from the library only (no new library files); every beat anchored to spoken words. Voice: one Gemini request, 127.7 s of speech, 316/341 heard words matched (92.7%: the misses are the letter-spelled acronyms W P A / W P S / A E S / T K I P, which Whisper hears as one word, plus numbers; timings checked word by word and correct). Video 130.3 s. Raccoons: peek-paws, night-snack, sneaking, scheming, oops, trash-bin, side-eye (+ waving-laugh outro, closeup-face EndCard).

| Beat | Visual | Raccoon |
| --- | --- | --- |
| Hook 0–6.7s "This is how hackers crack Wi-Fi passwords" | `Headline` "How hackers crack Wi-Fi. / They take it home." from frame 0; `Node` phone ⇄ router with a "handshake" `Arrow` and looping `Packet`, dashed drop to a "Home · offline, no router" node; red cross `Badge` on the router on "don't guess"; "recording" chip rides down to Home on "record", Home turns blue on "home" | `peek-paws` over the Home node (from frame 0) |
| Sudo 6.7–12.1s "Tonight, Sudo is outside your window" | `Headline` "Sudo is outside your window. / Laptop, chips, bad intentions."; moon icon draws on | `night-snack` |
| Handshake 12.1–26.6s "Every time your phone joins" | `Headline` "Your phone joins your Wi-Fi. / A 4-way handshake."; phone ⇄ router, 4 packets alternate on "four-way handshake"; `Note` "Password: ~~sent~~ never sent" → "Proof you know it: in the air" (blue); then "Anyone nearby can record it. / Nobody joining? Kick, rejoin.": "Sudo's laptop · just listening" node receives a "copy" chip on "record"; phone dims on "kick", link label "dropped", rejoins on "again" + second copy | `sneaking` from the right on "anyone" |
| Offline 26.6–41.1s "the guessing happens at home, offline" | `Headline` "Guessing happens offline. / No lockout. No alarm."; `GuessList` "guesses vs the recording" (no hit, counter to 10 million); dimmed router node "sees nothing" + eyeOff `Badge` on "lockout"; `Note` "1 gaming GPU ≈ 2.5 million / s" on "gaming" | |
| Crack times 41.1–51.6s "Every password in a leaked list" | `Headline` "How long until it's cracked? / One gaming graphics card."; log `BarCompare` leaked list 6 seconds / 8 lowercase about a day / 5 random words 300,000+ years (blue), each bar on its spoken number; `Note` with the assumptions (14 million list, 7,776-word list) | |
| WPS 51.6–68.7s "There's a second door: WPS" | `Headline` "Second door: WPS. / An 8-digit PIN on the sticker."; 8 digit tiles (made-up PIN 12345670, valid checksum) split into two halves on "halves" (blue / indigo labels "checked alone"), last tile greys + "checksum"; 100,000,000 struck in red → 11,000 on "11,000" with "= 10,000 + 1,000"; `Note` clock "No lockout: under 4 hours" | `scheming` on "halves" |
| Hands over 68.7–72.7s | `Headline` "Then the router hands over / your Wi-Fi password."; router node turns red, red "Wi-Fi password" chip rides to Sudo's laptop; "length doesn't matter here" | |
| 4 settings 72.7s | `Headline` "4 settings / that stop all of this." | |
| 1/4 passphrase 75.7s | `ToolHeader` passphrase 1/4; 5 word chips (raccoon velvet toaster orbit pickle) under "Wi-Fi password"; `Note` "5 random words or 20+ characters"; `Verdict` "300,000+ years" | |
| 2/4 WPA3 81.0s | `ToolHeader` WPA3 2/4; phone ⇄ router "WPA3 handshake" (blue), router blue + packets on "live"; `Note` "Recording: useless / Every guess: asks your router, live / Kick-off trick: blocked"; `BuildList` card WPA3 ✓, WPA2/WPA3 mixed ✓, WPA2 with AES ✓, TKIP, WEP ✗ on their words | |
| 3/4 WPS off 99.3s | `ToolHeader` WPS off 3/4; `ToggleList` "Wireless · WPS" flips off on "turn" (switch sfx); `Note` "No PIN = no second door" | `oops` |
| 4/4 firmware 101.9s | `ToolHeader` firmware 4/4; "Firmware update" node turns green on "fix"; "2017: KRACK / a hole in WPA2 itself"; `Verdict` "fixed by an update" | |
| Give up 111.2s | `Headline` "WPA3. WPS off. / Sudo goes back to the trash."; toggles WPA3 on, WPS off | `trash-bin` on "trash" |
| Crime 117.3s | `Headline` "Not your Wi-Fi? / Cracking it is a crime."; shield icon | `side-eye` on "raccoons" |
| Save 121.1s | `SaveOutro` "router settings" card: Wi-Fi password 5 random words / 20+, Security WPA3 (or WPA2-AES), WPS off, Firmware update, never TKIP/WEP; bubble "Is WPS still on at your place?" | `waving-laugh` |
| CTA 123.7s | `EndCard` follow → save → comment, "Follow for more security tricks.", question "Is WPS still on at your place?" | `closeup-face` avatar |

## Post
<!-- written by Claude as the last build step, checked by scripts/package.py: see [[Caption and hashtags]] -->
```text
How hackers crack Wi-Fi: they record the handshake when your phone joins, then guess offline at millions of tries per second. The WPS PIN is an even faster way in. Four settings stop it: a long passphrase, WPA3 (or WPA2 with AES), WPS off and firmware updates. Is WPS still on at your place? 🦝 #wifi #cybersecurity #networking #security
```
- Keyword: how hackers crack wi-fi
- YouTube title: How hackers crack Wi-Fi, and the 4 router settings that stop them #shorts
- Cover: out/wifi-hacking/wifi-hacking-cover.jpg (own design, 1080×1440: "Hackers crack Wi-Fi. / 4 settings stop them.", router settings card WPA3 on / WPS off / firmware updates on, "5 random words: 300,000+ years", side-eye Sudo, chips WPA3 · WPS off · long passphrase). TikTok and Instagram get the video frame at `cover_ms` (1.0 s: hook headline, phone ⇄ router diagram, Sudo peeking over Home) because Postiz can't send a custom cover
- Hashtags: #wifi (topic, like [[wifi-passwords]]), #cybersecurity + #networking (niche; #networking 2.37× in [[Hashtags]]), #security (broad). No #coding: the video shows no code.
- Post at: 2026-10-14 17:00


## Results & learnings
- **48h calibration (predicted 27/30):** TT 507 · IG 3,559 · YT 1,294 views (TT 1.0% · IG 2.9% saves). On target: strong reach across all three platforms (1.3K YT, 3.6K IG), higher saves on IG than TT.
