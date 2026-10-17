---
id: who-on-wifi
title: "See who is on your Wi-Fi"
status: posted
format: tool-listicle
topic: networking
tools: [arp, ip neigh, nmap, router admin page]
score: 28
voice: Autonoe
music: lofi-relax
duration: 62
composition: WhoOnWifi
output: out/who-on-wifi/who-on-wifi-tiktok.mp4
ig_comments: 1
ig_likes: 277
ig_views: 11274
ig_saves: 481
yt_comments: 1
yt_likes: 23
yt_views: 564
youtube_url: https://www.youtube.com/watch?v=V7q96aaTLKA
instagram_url: https://www.instagram.com/reel/DecZ2WGjVN5/
tiktok_url: https://www.tiktok.com/@sudoraccoon
scheduled: 2026-10-13 20:00
cover: out/who-on-wifi/who-on-wifi-cover.jpg
cover_ms: 4000
caption: "See who is on your Wi-Fi in three steps. arp -a (ip neigh on Linux) lists the devices your computer saw lately, sudo nmap -sn 192.168.1.0/24 finds everyone who answers, and your router page names them all. Only scan your own network. How many devices did you find? 🦝 #wifi #networking #terminal #coding"
created: 2026-10-11
posted: 2026-10-13 20:00
url: https://www.tiktok.com/@sudoraccoon/video/7696213904854158624
views: 663
likes: 39
saves: 22
comments: 1
shares: 4
---

# See who is on your Wi-Fi

## Promise
Three ways to list every device on your own Wi-Fi from the terminal, and what to do when one of them is a stranger (spoiler: it's Sudo).

## Why now (evidence)
- YouTube "see who is on my wifi": top-5 median **1.1M**, max 2.2M.
- Direct sequel to our first video [[wifi-passwords]] (same audience, same search family; "terminal command for wifi password" is a top autocomplete, research scan).
- Network one-liners are the biggest outliers in the niche: @flpr_txk "Network commands" **482K, 209× median, 4.9% saves**; networkchuck "change the IP your traffic appears to come from" 185K (10.5×).
- Facts checked 2026-10-11: `arp -a` prints the IP + MAC addresses your computer has recently talked to (its ARP cache), so it can miss quiet devices; Linux equivalent `ip neigh`. A ping scan `nmap -sn 192.168.1.0/24` asks every address and lists who answers (brew/apt install nmap; only on your own network). The router's admin page (often 192.168.1.1 or 192.168.0.1) has the complete "connected devices" list. iOS 14+, Android 10+ and Windows 10+ use a random private MAC per network, so a phone can show up with a random-looking address (second hex digit 2, 6, A or E). Kicking someone out = change the Wi-Fi password (WPA2/WPA3). Sources: [arp(8)](https://man.serenityos.org/man1/arp.html), [MAC randomization](https://whatsmydns.me/blog/what-is-mac-address-randomization), [nmap host discovery](https://nmap.org/book/man-host-discovery.html). Recheck flags on macOS when building.
- Rechecked 2026-10-12 while building: `ip neigh` run locally (format `192.168.178.1 dev enp4s0 lladdr cc:ce:… REACHABLE`; `arp` itself isn't even installed on this Linux box, net-tools is deprecated, so Linux = `ip neigh`). macOS `arp -a` prints `? (ip) at mac on en0 ifscope [ethernet]` with leading zeros dropped per byte ([arp(8) macOS](https://keith.github.io/xcode-man-pages/arp.8.html)). [nmap host discovery](https://nmap.org/book/man-host-discovery.html): `-sn` = "no port scan", prints the hosts that answered; unprivileged it only tries TCP connect to 80/443, but "when a privileged user tries to scan targets on a local ethernet network, ARP requests are used", which is why the video says it needs sudo (and why MAC lines appear). Vendor names in the fake output are the real entries of nmap's `nmap-mac-prefixes` for the first three bytes (001A4F AVM GmbH, 5CAD76 Shenzhen TCL New Technology, D43B04 Intel Corporate); the private MAC `7a:…` isn't in it → `(Unknown)`. Private Wi-Fi addresses: iOS 14+ / Android 10+ use a per-network random MAC by default (locally administered bit → 2nd hex digit 2, 6, a or e); the video names only iPhones and Androids (Windows has "random hardware addresses" as a setting, so it's left out).

## Hook options
- Curiosity: "Someone else is on your Wi-Fi. Here's how to find them."
- Story: "Sudo's friend's internet was slow. The reason had a mask."
- Listicle promise: "3 ways to see every device on your Wi-Fi."

## Outline
1. Hook: device list in a terminal, one row named `sudos-laptop` ringed in blue.
2. 1/3 `arp -a`: devices your computer has seen (fast, but can miss quiet ones).
3. 2/3 `nmap -sn 192.168.1.0/24`: knocks on every door, lists everyone who answers.
4. 3/3 router page 192.168.1.1 → connected devices (the complete list).
5. Random-looking MAC? Probably a phone with private Wi-Fi address, not a hacker.
6. Stranger found → change the Wi-Fi password. Sudo gets kicked out.
7. EndCard: "how many devices did you find?"

## Raccoon angle
Sudo is the freeloader: his laptop is the unknown device. Final beat: password changed, Sudo stares at a 'no internet' dinosaur with his snacks.

## Notes
Show a fake home network (192.168.1.x, made-up MACs). Say "only scan your own network" once. Don't claim arp shows everything.

## Voice style
Friendly, quick and a little sly, like a detective letting a friend in on a trick. Short clear pauses between the three steps; deadpan on the Sudo jokes.

## Script
<!-- source of truth for scripts/tts.py. Pronunciation: {display|spoken}, e.g. {fd|F D}, {--tree|dash dash tree}. Last line = CTA: follow + save + comment ([[Video format]] → Ending) -->
Someone is on your Wi-Fi. Here's how to see who is on it, in three steps.
Bandit's internet got slow at 3 a.m. Sudo says it wasn't him.
One. {arp -a|arp, dash A}. It lists the devices your computer talked to lately, each with an IP and a MAC address. On Linux, {ip neigh|I P neigh}. Fast, but quiet devices can hide.
Two. {sudo nmap -sn|sudo N map, dash S N}, plus your network. It knocks on all 256 addresses and lists everyone who answers. Yes, it needs sudo. Sudo approves. Only scan your own network.
Three. Your router's page, often {192.168.1.1|192 dot 168 dot 1 dot 1}. Connected devices is the full list, with names.
A random-looking MAC address? Relax, it's probably a phone. iPhones and Androids use a private address for every network.
But {sudos-laptop|Sudo's laptop}? Change the Wi-Fi password, and he's out. Sudo is offline. With snacks.
Save this for your next slow evening. Follow for more terminal tricks, and comment: how many devices did you find?

## Beats
Built 2026-10-12 from the library; every beat anchored to spoken words. Voice: one Gemini request (68.1 s raw, 163/170 heard words matched); pauses were tightened from the existing audio (30 silences ≥ 0.25 s cut from the middle down to 0.28 s, 0.45 s before each section; `out/who-on-wifi/tighten.py`, original kept as `out/who-on-wifi/voice-orig.mp3`), then `tts.py --realign` → 59.6 s of speech, no second TTS request.

| Beat | Visual | Raccoon |
| --- | --- | --- |
| Hook 0–4.9s | `Headline` "Someone is on your Wi-Fi. / Here's how to see who." + router-style `DataTable` (bandits-macbook, living-room-tv, iPhone, **sudos-laptop** in red with the blue focus ring) from frame 0; `Note` "arp · nmap · router page" on "three steps" | `PeekOver` peek-paws on the table, between the IP and MAC labels |
| Story 4.9–9.1s | `ChatThread` Bandit: "why is my wifi so slow at 3am" → "wasn't me"; `Gauge` drops 240 → 3 Mbps (red) on "slow" | scheming on "wasn't" |
| 1/3 arp -a | `ToolHeader` arp -a (Mac · Windows · Linux: ip neigh); macOS `arp -a` → 3 real-format lines (`? (192.168.1.1) at 0:1a:4f:41:8e:2 on en0 ifscope [ethernet]`), ring on the IPs, then the MACs; second terminal `linux: ~` types `ip neigh` (real format, REACHABLE / STALE) on "Linux"; `Note` "Only devices it saw lately" | sneaking in from the right on "hide" |
| 2/3 nmap -sn | `sudo nmap -sn 192.168.1.0/24` types with the voice; hosts print one by one over "knocks on all 256 addresses" (real nmap layout, vendors from nmap-mac-prefixes, the private MAC = `(Unknown)` in yellow, the scanning Mac last with no MAC line); ring on the new host .42 (arp missed it) on "everyone", on "(5 hosts up)" on "answers", on `sudo` on "needs sudo"; `Note` brew/apt install → "With sudo it uses ARP and shows MAC addresses" → shield "Only scan your own network" | celebrate on "Sudo approves" |
| 3/3 router page | `BrowserWindow` types 192.168.1.1 with the voice, loads "Connected devices · 4 online" `DataTable`; ring on the names column on "names"; `Note` "Not it? Try 192.168.0.1 / Login: on the router's label" | |
| Random MAC | `Headline` "Random-looking MAC? / Probably a phone."; table focus glides to the iPhone's `7a:1f:…`; `Note` "2nd digit 2, 6, a or e = private address" | |
| Busted | `Headline` "sudos-laptop? / Change the password."; focus glides to the sudos-laptop row (turns red); `Note` "Wi-Fi settings → new password (WPA2 or WPA3)"; on "out" the table blurs to 3 rows, "3 online" | hands-up (busted) |
| Offline | `Headline` "Sudo is offline. / With snacks."; wifiOff icon draws on | night-snack |
| Save 54.4s | `SaveOutro` cheat sheet: `arp -a` (linux: ip neigh), `sudo nmap -sn 192.168.1.0/24`, `192.168.1.1 → connected devices`; bubble "How many devices did you find?" | waving-laugh |
| CTA 56.0s | `EndCard` follow → save → comment, question "How many devices did you find?" | closeup-face avatar |

## Post
<!-- written by Claude as the last build step, checked by scripts/package.py: see [[Caption and hashtags]] -->
```text
See who is on your Wi-Fi in three steps. arp -a (ip neigh on Linux) lists the devices your computer saw lately, sudo nmap -sn 192.168.1.0/24 finds everyone who answers, and your router page names them all. Only scan your own network. How many devices did you find? 🦝 #wifi #networking #terminal #coding
```
- Keyword: see who is on your wi-fi
- YouTube title: See who is on your Wi-Fi: arp, nmap and your router page #shorts
- Cover: TikTok and Instagram get the video frame at `cover_ms` (hook headline, the device list with sudos-laptop ringed, Sudo peeking) because Postiz can't send a custom cover; designed covers stay in out/who-on-wifi/ for a manual swap
- Post at: 2026-10-13 20:00

## Results & learnings
- **48h calibration (predicted 28/30):** TT 653 · IG 11,191 · YT 564 views (TT 3.4% · IG 4.3% saves). Outperformed: 11.2K IG views and 4.3% IG / 3.4% TT saves — home network scanning is a top pillar.
