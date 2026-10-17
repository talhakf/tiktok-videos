---
id: dark-web
title: "How the dark web actually works"
status: posted
format: concept-explainer
topic: security
tools: [Tor, onion routing, .onion]
score: 26
voice: Autonoe
music: lofi-relax
duration: 87
composition: DarkWeb
output: out/dark-web/dark-web-tiktok.mp4
ig_saves: 15
ig_shares: 3
ig_comments: 1
ig_likes: 21
ig_views: 1453
yt_likes: 20
yt_views: 913
youtube_url: https://www.youtube.com/watch?v=VPcXbeg4a7g
instagram_url: https://www.instagram.com/reel/DekIRfZFANw/
tiktok_url: https://www.tiktok.com/@sudoraccoon
scheduled: 2026-10-16 20:00
cover: out/dark-web/dark-web-cover.jpg
cover_ms: 4400
caption: "How the dark web actually works: Tor routes your traffic through three relays (guard, middle, and exit) wrapped in three layers of encryption, so no single computer sees both your IP and the site. And .onion sites never use an exit relay. Did you know your email inbox is on the deep web? 🦝 #security #networking #computerscience #coding"
created: 2026-10-11
posted: 2026-10-16 20:00
url: https://www.tiktok.com/@sudoraccoon/video/7697328622582943009
views: 454
likes: 8
saves: 2
comments: 0
shares: 0
---

# How the dark web actually works

## Promise
Onion routing in 50 seconds: why three relays and three layers of encryption mean nobody in the middle knows both who you are and where you're going.

## Why now (evidence)
- YouTube "how the dark web works": top-5 median **5.8M**, max 7.7M, the biggest demand number we've measured; networkchuck "6 hours of dark web research in 30 minutes" 227K (12.8× median, 2.6% saves).
- Our diagram library has exactly the pieces: tunnel, layers, packets, nodes (`src/components/diagram/`).
- Facts to cite when building ([Tor Project: how Tor works](https://support.torproject.org/about/how-does-tor-work/)): a Tor circuit uses three relays (guard, middle, exit); the client wraps the data in three layers of encryption and each relay peels one, so the guard knows you but not the site and the exit knows the site but not you; .onion sites never leave the Tor network (no exit relay). "Dark web" = sites only reachable this way; most of the "deep web" is just logged-in pages (email, banking).

### Facts checked (2026-10-13)
Sources: Tor Project official documentation ([About Tor / How Tor Works](https://tb-manual.torproject.org/about/), [Onion Services](https://tb-manual.torproject.org/onion-services/), [Tor Project History](https://www.torproject.org/about/history/)) and U.S. Naval Research Laboratory Onion Routing archives ([onion-router.net](https://www.onion-router.net/)).
- **Origin (mid-1990s)**: Onion routing was developed starting in 1995 at the U.S. Naval Research Laboratory (NRL) by David Goldschlag, Michael G. Reed, and Paul Syverson to protect U.S. intelligence communications online against traffic analysis. In the early 2000s, Roger Dingledine and Nick Mathewson joined Paul Syverson to build Tor ("The Onion Router"), open-sourced in 2002; The Tor Project became a 501(c)(3) nonprofit in 2006. Today it is used every day by journalists, whistleblowers, activists, and people in censored countries.
- **Three-relay Tor circuit**: A standard Tor circuit routes traffic through three volunteer-operated relays:
  1. **Entry / Guard relay** (first hop)
  2. **Middle relay** (second hop)
  3. **Exit relay** (third hop)
- **Three layers of encryption (onion routing)**: Before sending a request, the Tor client wraps the message in three concentric layers of encryption using keys negotiated with each relay: innermost layer encrypted for the Exit relay, middle layer for the Middle relay, and outermost layer for the Guard relay.
- **Compartmentalized knowledge (who knows what)**: Each relay peels off only its own encryption layer to learn the next hop:
  - **Guard relay**: peels the outer layer; knows your real IP address and the Middle relay's IP, but cannot read the payload or see the destination website.
  - **Middle relay**: peels the middle layer; knows only the Guard relay (previous hop) and the Exit relay (next hop) — knows neither who you are nor where you are going.
  - **Exit relay**: peels the innermost layer and connects to the destination website; knows the destination site (and plaintext if not HTTPS), but does not know who sent the request (only sees the Middle relay).
  - **Result**: No single relay in the circuit ever knows both who you are (source IP) and what site you are visiting (destination).
- **Surface Web vs. Deep Web vs. Dark Web**:
  - **Surface web**: Publicly accessible web pages indexed by search engines (Google, Bing, etc.).
  - **Deep web**: Any web page not indexed by search engines or sitting behind a login/authentication wall — your email inbox, online banking, private cloud drive, medical portal, or company intranet (accounts for 90%+ of the everyday web people already use).
  - **Dark web**: A small subset of the deep web reachable only via overlay networks like Tor — specifically `.onion` addresses (Tor onion services, formerly "hidden services"), where traffic stays completely inside the Tor network (6-hop rendezvous circuit) without ever using an Exit relay, hiding both the user's and the server's IP addresses.

## Hook options
- Myth: "The dark web isn't a place. It's an onion."
- Curiosity: "Here's how the dark web hides who you are, in 3 layers."

## Outline
1. Hook: onion with three layers peeling, headline.
2. Normal web: your request → site, everyone in between sees both ends.
3. Tor: 3 relays, 3 layers (layers + tunnel diagram), each relay peels one.
4. Who knows what: guard knows you, exit knows the site, nobody knows both.
5. .onion: never leaves the network. Deep web ≠ dark web (your inbox is deep web).
6. EndCard: "did you know your email inbox is on the deep web?"

## Raccoon angle
Sudo passes a snack through three raccoon friends, each opening one wrapper; none of them knows the whole route.

## Notes
Explain the technology only; no where-to-buy, no links to onion sites. Say Tor is also used by journalists and people in censored countries (Tor Project).

## Voice style
Warm, curious and slightly conspiratorial, like a savvy tech friend explaining how secret tunnels actually work at 3 a.m. Brisk and clear on the three relays and encryption layers, playful on Sudo's midnight snack analogy, crisp on the deep web vs dark web myth.

## Script
<!-- source of truth for scripts/tts.py. Pronunciation: {display|spoken}, e.g. {fd|F D}, {--tree|dash dash tree}. Last line = CTA: follow + save + comment ([[Video format]] → Ending) -->
Here is how the dark web actually works, and why it is built like an onion.
On the normal web, when Sudo orders snacks at 3 a.m., his request goes straight to the site. Even with {HTTPS|H T T P S}, your provider sees both your {IP|I P} address and the site you visit.
In the nineties, the {U.S.|U S} Naval Research Lab built onion routing for intelligence communications, which became Tor. Tor picks three relays: guard, middle, and exit, and wraps your message in three layers of encryption: innermost for exit, middle for middle, outermost for guard.
Each relay peels only its own layer. The guard relay peels layer one: it knows your {IP|I P} and the middle relay, but not the site. The middle relay peels layer two: it knows only the guard and the exit, neither who you are nor where you are going. The exit relay peels layer three and reaches the site, without knowing who sent it. No single relay knows both who you are and what site you visit.
And don't mix up the deep web and dark web. The surface web is public pages on search engines. The deep web is anything behind a login, like your email inbox, banking, or cloud drive, over {90%|ninety percent} of the web you already use. The dark web is a tiny slice on Tor: {.onion|dot onion} sites that never use an exit relay, used daily by journalists, whistleblowers, and people in censored countries.
Save this breakdown for later. Follow for more tech explainers, and comment: did you know your email inbox is on the deep web?

## Beats
Built 2026-10-13 from the library; every beat anchored to spoken words via `makeCues(captions, fps)`. Voice: one Gemini TTS request (84.36s of speech, 261 display tokens, 252/262 heard words matched = 96.2%). Video 1:27 (86.9s).

| Beat | Visual | Raccoon |
| --- | --- | --- |
| Hook 0–5.2s | Headline "How the dark web works / 3 relays. 3 locked layers." + white card "Onion routing (Tor)" with 5 nodes (`Sudo → Guard → Middle → Exit → Site`), blue `Tunnel` "3 layers of encryption", lock `Badge`s on the 3 relays; mono note `guard · middle · exit · .onion` → swaps at "onion" to `IconNote` "Built like an onion: 3 locked layers" | `peek-paws` over the card |
| Normal web 5.2–16.0s | Headline "On the normal web / Your provider sees both ends."; `Sudo` (`198.51.100.7`) → `Provider` (`ISP / Wi-Fi`) → `Site` (`snacks.example`) with pizza packet hopping across; at "HTTPS" blue `Tunnel` draws on ("HTTPS encrypts content, not who talks to whom"); at "provider" `Provider` turns red with red `eye` badge; notes "3 a.m. snack order goes straight to the site" → "HTTPS locks the box, not the address label" → red "Sees your IP: 198.51.100.7" + "Sees the site: snacks.example" | `night-snack` at "snacks", `gasp` at "IP" |
| 1990s NRL origin 16.0–22.6s | Headline "1990s: Naval Research Lab / Built to hide traffic paths."; `DocsQuote` citing `torproject.org/about/history` ("Onion routing was developed in the mid-1990s at the U.S. Naval Research Laboratory to protect U.S. intelligence communications."), highlights "Onion routing", green verified tick "Became Tor (The Onion Router)" at "Tor"; note "Goal: hide metadata & traffic paths on the wire" | `cool-outfit` |
| 3 relays & 3 layers 22.6–34.1s | Headline "3 relays. 3 locked layers. / Wrapped inside out."; top row `Guard (Relay 1) → Middle (Relay 2) → Exit (Relay 3)` nodes lighting up; `LayerStack` building bottom-up: payload ("Snack request") → Layer 3 (innermost, Exit key) → Layer 2 (middle, Middle key) → Layer 1 (outermost, Guard key); notes "Sudo wraps the request in 3 locked layers" → "Innermost → Exit relay / Outermost → Guard relay" | `scheming` at "wraps" |
| Peeling & Who knows what 34.1–57.3s | Headline "Each relay peels 1 layer / Nobody knows both ends."; 5-node circuit at top (`Sudo → Guard → Middle → Exit → Site`) with `Packet`s (`3` → `2` → `1` → pizza) and key `Badge`s popping as each relay peels its layer; `DataTable` ("Hop / Peels / Knows You? / Knows Site?") with rows entering at Guard, Middle, Exit and blue focus ring gliding across cells; notes for Guard, Middle, Exit, and green "0 relays know both who you are & the site" | `pointing` (flipped) at "guard", `celebrate` at "single" |
| Surface vs Deep vs Dark 57.3–72.1s | Headline "Surface vs. Deep vs. Dark / 90%+ is the deep web."; 3-column `VsSplit` (`Surface` vs `Deep Web` vs `Dark Web`) with winner badge on `Deep Web` at "90%"; notes "Surface web = indexed by search engines" → "Deep web = 90%+ of the web you already use!" → "Dark web = tiny slice reachable via Tor" | `side-eye` at "deep" |
| `.onion` inside Tor 72.1–78.8s | Headline ".onion stays inside Tor / Never uses an exit relay."; `UrlBar` (`https://torproject...v3.onion`) with `.onion` marked and green lock; full-width `Tunnel` ("100% inside the Tor network — no Exit relay") enclosing `You ↔ Tor Circuit (no exit relay) ↔ .onion site`; notes "Traffic never leaves the Tor tunnel" → "Used daily by journalists, whistleblowers & citizens" | `peek-pillar` from the right edge at "journalists" |
| Save 78.8–80.0s | `SaveOutro` cheat-sheet card (`Guard relay`, `Middle relay`, `Exit relay`, `Deep web`, `Dark web`) + bubble "Did you know your inbox is deep web?" | `waving-laugh` |
| End 80.0–86.9s | `EndCard`: follow tap, save, comment "Did you know your email inbox is on the deep web?" | avatar |

## Post
<!-- written by Claude as the last build step, checked by scripts/package.py: see [[Caption and hashtags]] -->
```text
How the dark web actually works: Tor routes your traffic through three relays (guard, middle, and exit) wrapped in three layers of encryption, so no single computer sees both your IP and the site. And .onion sites never use an exit relay. Did you know your email inbox is on the deep web? 🦝 #security #networking #computerscience #coding
```
- Keyword: dark web
- YouTube title: How the dark web actually works (3 relays & 3 layers) #shorts
- Cover: TikTok and Instagram get the video frame at `cover_ms` (4.4s: hook headline, the 3-relay Onion routing card, Sudo peeking over the top, and "Built like an onion: 3 locked layers") because Postiz can't send a custom cover; designed covers (1080×1440 and 9:16) stay in out/dark-web/ for a manual swap
- Post at: 2026-10-16 20:00

## Results & learnings
-
