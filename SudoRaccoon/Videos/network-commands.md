---
id: network-commands
title: "5 network commands IT people use"
status: posted
format: tool-listicle
topic: networking
tools: [ping, ipconfig getifaddr, traceroute, nslookup, lsof]
score: 27
voice: Autonoe
music: lofi-relax
duration: 115
composition: NetworkCommands
output: out/network-commands/network-commands-tiktok.mp4
ig_saves: 182
ig_shares: 18
ig_comments: 1
ig_likes: 129
ig_views: 5398
yt_likes: 36
yt_views: 1307
youtube_url: https://www.youtube.com/watch?v=wefdVa6b_1g
instagram_url: https://www.instagram.com/reel/DeeHpIOAXQX/
tiktok_url: https://www.tiktok.com/@sudoraccoon
scheduled: 2026-10-14 12:00
cover: out/network-commands/network-commands-cover.jpg
cover_ms: 4800
caption: "5 network commands IT people type when the internet is broken. ping -c 4 1.1.1.1, ipconfig getifaddr en0 (ip addr on Linux), nslookup, traceroute (tracert on Windows) and lsof -nP -i :3000 for a busy port. Sudo's snack app? It was DNS. Which one didn't you know? 🦝 #networking #terminal #linuxcommands #coding"
created: 2026-10-11
posted: 2026-10-14 12:00
url: https://www.tiktok.com/@sudoraccoon/video/7696461593986551073
views: 899
likes: 51
saves: 34
comments: 1
shares: 6
---

# 5 network commands IT people use

## Promise
The five commands IT people type first when "the internet is broken": is it you, your Wi-Fi, the route, the DNS, or an app?

## Why now (evidence)
- @flpr_txk "Network commands" cheat sheet **482K, 209× median, 4.9% saves** (their biggest video); YouTube "network commands cheat sheet" top-5 median **2.1M** (max 4.4M); "ping command explained" 614K.
- coding.kitty7 explains network *concepts* (TCP/UDP 689K, DNS 308K, DHCP) but not the commands, so the practical version is open.
- Commands (preinstalled on macOS; Linux in brackets): `ping -c 4 1.1.1.1` (are you online at all), `ipconfig getifaddr en0` (your local IP) [`ip addr`], `traceroute google.com` (every hop on the way), `nslookup example.com` (which IP a name points to; DNS), `lsof -nP -iTCP -sTCP:LISTEN` (which apps listen on which ports). Check each on macOS before building (`traceroute` and `dig` are not installed on this Linux box).
- Avoid overlap: `curl ifconfig.me` is in [[curl-websites]], `networkQuality` is in [[mac-terminal-secrets]].

### Facts checked (2026-10-13)
Sources: Apple's man pages as shipped with Xcode ([ping(8)](https://keith.github.io/xcode-man-pages/ping.8.html), [ipconfig(8)](https://keith.github.io/xcode-man-pages/ipconfig.8.html), [traceroute(8)](https://keith.github.io/xcode-man-pages/traceroute.8.html), [nslookup(1)](https://keith.github.io/xcode-man-pages/nslookup.1.html), [lsof(8)](https://keith.github.io/xcode-man-pages/lsof.8.html)); Linux ones run locally on this box.
- `ping -c 4 1.1.1.1`: `-c count` = "Stop after sending (and receiving) count ECHO_RESPONSE packets. If this option is not specified, ping will operate until interrupted." macOS (BSD) output: `PING 1.1.1.1 (1.1.1.1): 56 data bytes`, `64 bytes from 1.1.1.1: icmp_seq=0 ttl=57 time=12.3 ms` (macOS counts icmp_seq from 0, Linux from 1), summary `4 packets transmitted, 4 packets received, 0.0% packet loss` + `round-trip min/avg/max/stddev`. No answer → `Request timeout for icmp_seq 0`. Linux: same command (tested locally: 4 replies, ~11 ms). Windows: plain `ping` sends 4 by default, count flag is `-n` (`-c` means something else there) → on screen "Windows: ping -n 4".
- `ipconfig getifaddr en0` (macOS only): "Prints to standard output the IP address for the first network service associated with the given interface. The output will be empty if no service is currently configured or active on the interface." en0 = Wi-Fi on MacBooks (on Macs with an Ethernet port en0 can be Ethernet → note on screen "en0 = Wi-Fi on most MacBooks"). 169.254.x.x = self-assigned (link-local) address macOS gives itself when no DHCP answer comes back. Linux: `ip addr` (tested; Arch's `hostname` has no `-I`, so not shown). Windows: `ipconfig`.
- `nslookup example.com`: preinstalled on macOS (BIND 9 nslookup, non-interactive mode when a name is given) and on Windows; on Linux it comes with bind/dnsutils (not on this box). Output: `Server:` + `Address: <dns>#53`, `Non-authoritative answer:`, `Name:`/`Address:` pairs. example.com today resolves to 104.20.23.154 and 172.66.147.243 (checked locally 2026-10-13). DNS server unreachable → `;; connection timed out; no servers could be reached`. Ping to an IP works while names fail = DNS; fix = restart the router or set another DNS server (1.1.1.1).
- `traceroute google.com`: UDP probes with growing TTL, "Three probes … are sent at each ttl setting and a line is printed showing the ttl, address of the gateway and round trip time of each probe … If there is no response within a 5 sec. timeout interval … a "*" is printed for that probe." Max hops = net.inet.ip.ttl = 64 on macOS → header `traceroute to google.com (142.250.185.78), 64 hops max, 52 byte packets`. Hop 1 on a home network = the router (local tracepath: hop 1 = 192.168.178.1, 0.3 ms; some later hops "no reply"). Windows: `tracert`. Not installed on this Linux box (tracepath is). Fake hops use documentation IP ranges (203.0.113.x, 198.51.100.x) and the CGNAT range 100.64.x.
- `lsof -nP -i :3000`: `-i [46][protocol][@hostname|hostaddr][:service|port]` selects network files by port; `-n` "inhibits the conversion of network numbers to host names", `-P` "inhibits the conversion of port numbers to port names" — needed: /etc/services names port 3000 `hbci`, so without `-P` lsof prints `*:hbci` instead of `*:3000` (checked in /etc/services locally). Columns `COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME` (local test), NAME `TCP *:3000 (LISTEN)`. Then `kill <PID>`. Node's real error for a taken port: `Error: listen EADDRINUSE: address already in use :::3000`. Linux: same lsof. Windows: `netstat -ano` (`-o` = owning PID).

## Hook options
- Listicle promise: "5 commands IT people type when the internet is broken."
- Contradiction: "Restarting the router is not troubleshooting."
- Curiosity: "Find out who's really to blame for your slow internet."

## Outline
1. Hook: the path laptop → router → internet → server with a question mark; Sudo peeks.
2. Story: 3 a.m., Sudo's snack delivery app won't load. Who's to blame?
3. 1/5 `ping -c 4 1.1.1.1`: replies + ms → you're online (no reply = it's on your side). Sudo: replies.
4. 2/5 `ipconfig getifaddr en0`: 192.168.x = router let you in; nothing / 169.254 = Wi-Fi problem. Sudo: fine.
5. 3/5 `nslookup example.com`: name → IP; Sudo's times out → it's DNS ("it's always DNS"), fix: restart router / DNS 1.1.1.1 → snacks load.
6. 4/5 `traceroute google.com`: hop 1 = router; jump at hop 1 = Wi-Fi, jump later + stays high = provider; `* * *` = no answer.
7. 5/5 `lsof -nP -i :3000`: port 3000 already in use → which app + PID → `kill`.
8. Save card with all five + EndCard: "which one didn't you know?"
(Order changed from the idea: nslookup before traceroute, because `traceroute google.com` itself needs DNS, so the DNS story ends at 3/5.)

## Raccoon angle
Sudo plays network detective at 3am: his snack delivery app won't load; it's DNS. "It's always DNS" is the IT in-joke.

## Notes
Mask real IPs. Keep it to the most common commands; this is a save-this cheat sheet, end on one card with all five.

## Voice style
Friendly, quick and a little sly, like an IT friend solving a mystery at 3 a.m. Clear and steady on the commands, short pauses between the five steps, deadpan on "It's always DNS" and the snack jokes.

## Script
<!-- source of truth for scripts/tts.py. Pronunciation: {display|spoken}, e.g. {fd|F D}, {--tree|dash dash tree}. Last line = CTA: follow + save + comment ([[Video format]] → Ending) -->
Five network commands {IT|I T} people type when the internet is broken, before anyone touches the router.
3 a.m. Sudo's snack delivery app won't load. Time to find out who's to blame.
One. {ping -c 4 1.1.1.1|ping, dash C 4, one dot one dot one dot one}. It knocks on a server four times. Replies, with a time in milliseconds? You're online. No replies? The problem is on your side. Sudo got replies, so the internet is there.
Two. {ipconfig getifaddr en0|I P config, get if adder, E N zero}. Your Mac's address on the Wi-Fi. {192.168|192 dot 168} something? The router let you in. Nothing, or {169.254|169 dot 254}? Your Wi-Fi is the problem. On Linux, {ip addr|I P adder}. On Windows, just {ipconfig|I P config}. Sudo had an address, so the Wi-Fi is fine.
Three. {nslookup example.com|N S lookup, example dot com}. It asks DNS, the internet's phone book, which IP address belongs to a name. Sudo's answer: connection timed out. Ping works, but names don't? That's DNS. It's always DNS. Restart the router, or switch your DNS to {1.1.1.1|one dot one dot one dot one}, and the snacks load.
Four. {traceroute google.com|trace route, google dot com}. Every stop your data makes on the way, with the time to each one. Hop one is your router. Times jump right there? Blame the Wi-Fi. They jump later and stay high? That's your provider. Stars only mean a stop didn't answer. On Windows, it's {tracert|trace R T}.
Five. {lsof -nP -i :3000|L S O F, dash N P, dash I, colon 3000}. Port 3000 already in use? This shows which app is sitting on it, and its process ID. Type kill and that number, and the port is free. On Windows, {netstat -ano|net stat, dash A N O}.
Save this for the next time the internet breaks. Follow for more terminal tricks, and comment which one you didn't know.


## Beats
Built 2026-10-13 from the library; every beat anchored to spoken words. Voice: one Gemini request (112.3 s of speech, 254/283 heard words matched — the misses are the spelled-out commands like "one dot one dot one dot one" and whisper's "pseudo" for Sudo; a plain re-transcription confirmed the full script is spoken, nothing dropped). Video 1:55 (114.8 s).

| Beat | Visual | Raccoon |
| --- | --- | --- |
| Hook 0–5.7s | Headline "Internet broken? / 5 commands IT people type first." + white card "Who's to blame?" with 5 suspects (you · Wi-Fi · DNS · route · app, blue "?" badges) from frame 0; mono note "ping · ipconfig · nslookup · traceroute · lsof"; at "touches": "Restart the router? Not yet." | `peek-paws` over the card |
| Story 5.7–11.8s | Headline "3 a.m. Snacks won't load." (+ "Who's to blame?" at "blame"); phone with a snack delivery app: spinner → red wifiOff + "Can't reach the server." at "won't" | `night-snack`, "?" reaction at "blame" |
| 1/5 ping 11.8–29s | `ping -c 4 1.1.1.1` types while spoken, replies print one per second (macOS format), stats; ring on the `time=` column at "milliseconds"; notes "Replies with ms? You're online." → "No replies? It's on your side." → "Sudo: 4 replies. The internet is there." (ring on the stats line) | `pointing` at "knocks" |
| 2/5 ipconfig 29–50.4s | `ipconfig getifaddr en0` → `192.168.1.23` (ring); Mac → router diagram: arrow with the address turns blue, router badge ✓ → ✗ at "nothing" → ✓ at "had"; notes "en0 = Wi-Fi on most MacBooks" → "192.168.x.x? The router let you in." → "Empty, or 169.254.x.x? Wi-Fi problem." → "Linux: ip addr / Windows: ipconfig" → "Sudo has an address. The Wi-Fi is fine." | `pointing` (flipped) at "had" |
| 3/5 nslookup 50.4–71.7s | `nslookup example.com` with the real answer (104.20.23.154, 172.66.147.243), rings on both Address lines; notes "DNS = the internet's phone book" → "Name in, IP address out."; at "Sudo's answer" the window swaps to Sudo's run: `;; connection timed out; no servers could be reached` (red, ring), then `ping -c 1 1.1.1.1` answers (ring) + notes "ping 1.1.1.1 works" / "example.com doesn't"; PunchWord "It's always DNS."; notes "Restart the router" / "or set DNS to 1.1.1.1" | `gasp` at "timed", `night-snack` again at "snacks" |
| 4/5 traceroute 71.7–89.7s | `traceroute google.com` (header "64 hops max, 52 byte packets"), 6 hops print (hop 3 `* * *`), camera glides to 1.2×; rings hop 1 → hops 4–6 → `* * *`; notes "Hop 1 = your router" → "Slow at hop 1? Blame the Wi-Fi." → "Slow from later on? Your provider." → "* * * = no answer. Usually fine." → "Windows: tracert" | `sneaking` from the right edge at "every" |
| 5/5 lsof 89.7–106.6s | `npm run dev` → `Error: listen EADDRINUSE: address already in use :::3000` (ring at "port"), `lsof -nP -i :3000` types while spoken; camera 1.6–1.8× pans: ring `*:3000 (LISTEN)` at "shows", ring `node 4127` at "process"; `kill 4127` at "kill"; notes "Port 3000 already in use" → "node is sitting on :3000" → "4127 = its process ID (PID)" → "kill 4127: port 3000 is free" → "Windows: netstat -ano" | `scheming` at "kill" |
| Save 106.6–109.8s | SaveOutro cheat sheet with all five commands + "Windows: ping · ipconfig · tracert · netstat -ano", bubble "Which one didn't you know?" | `waving-laugh` |
| End 109.8–114.8s | EndCard: follow tap, save, comment "Which one didn't you know?" | avatar |

## Post
<!-- written by Claude as the last build step, checked by scripts/package.py: see [[Caption and hashtags]] -->
```text
5 network commands IT people type when the internet is broken. ping -c 4 1.1.1.1, ipconfig getifaddr en0 (ip addr on Linux), nslookup, traceroute (tracert on Windows) and lsof -nP -i :3000 for a busy port. Sudo's snack app? It was DNS. Which one didn't you know? 🦝 #networking #terminal #linuxcommands #coding
```
- Keyword: network commands
- YouTube title: 5 network commands IT people type when the internet is broken #shorts
- Cover: TikTok and Instagram get the video frame at `cover_ms` (4.8s: hook headline, the "Who's to blame?" suspects card, Sudo peeking, the five command names + "Restart the router? Not yet.") because Postiz can't send a custom cover; designed covers (cheat-sheet terminal) stay in out/network-commands/ for a manual swap
- Post at: 2026-10-14 12:00

## Results & learnings
- **48h calibration (predicted 27/30):** TT 898 · IG 5,373 · YT 1,307 views (TT 3.8% · IG 3.4% saves). Under-scored (acts like 29): 3.8% TT saves & 1.3K YT views; built-in networking cheat sheets excel.
