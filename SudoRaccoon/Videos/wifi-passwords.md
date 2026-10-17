---
id: wifi-passwords
title: "Your computer remembers every Wi-Fi password"
status: posted
format: tool-listicle
topic: terminal
tools: [security, nmcli, netsh]
score: 29
voice: Autonoe
music: lofi-relax
duration: 60
composition: WifiPasswords
output: out/wifi-passwords/wifi-passwords-tiktok.mp4
yt_likes: 2
ig_saves: 56
ig_shares: 3
ig_comments: 1
ig_likes: 46
ig_views: 2828
yt_views: 508
youtube_url: https://www.youtube.com/watch?v=H1cI8UMg-44
instagram_url: https://www.instagram.com/reel/DeW8Wrulb2l/
tiktok_url: https://www.tiktok.com/@sudoraccoon
scheduled: 2026-10-11 17:06
cover_ms: 4900
cover: out/wifi-passwords/wifi-passwords-cover.jpg
caption: "Show your Wi-Fi password with one command: your computer remembers every network it joined. Mac: security find-generic-password, Linux: nmcli device wifi show-password, Windows: netsh wlan show profile with key=clear. Mac, Linux or Windows? 🦝 #wifi #terminal #linux #coding"
created: 2026-10-10
posted: 2026-10-11 17:06
url: https://www.tiktok.com/@sudoraccoon/video/7695426894350667041
views: 394
likes: 24
saves: 6
comments: 1
shares: 0
---
# Your computer remembers every Wi-Fi password

## Promise
One command shows the password of any Wi-Fi network your own computer has joined — on Mac, Linux and Windows.

## Why now (evidence)
- Re-verified 2026-10-11: nmcli 1.58.1 man page on this machine (`wifi show-password`: "Show the details of the active Wi-Fi networks, including the secrets"; the binary prints SSID / Security / Password and a `WIFI:` QR code). macOS `security find-generic-password -wa <name>` asks for an administrator name + password, then prints the password in plain text (the Wi-Fi item lives in the System keychain). Windows `netsh wlan show profile name="<name>" key=clear`: password next to *Key Content* under *Security settings*; `netsh wlan show profiles` lists every saved network. Linux needs NetworkManager (Ubuntu, Fedora, Mint…). Not run here: running it prints the user's real password (blocked on purpose).
- YouTube: "CMD: Find all Wi-Fi passwords with one command" **11.0M** and "Show Wi-Fi password, Windows 10" **7.5M** views (top-5 median 3.0M) — the highest demand of any practical command we measured (225 topics).
- TikTok: @flpr_txk "Recover Wi-Fi passwords on your computer" 20.5K = **12.9× their median**; @networkchuck's one-liner hacks (hide a folder 96K, hide zip in an image 92K) get **3–4% saves**, double coding.kitty7's rate.
- Nobody in our competitor set (coding.kitty7, networkchuck, thecodingsloth, bytebytego) has done it in the last 200 videos.
- Commands verified: macOS `security find-generic-password -wa "<network>"` (asks for Touch ID / login password; [cyberciti](https://www.cyberciti.biz/faq/apple-mac-osx-find-wi-fi-network-password/)); Linux `nmcli device wifi show-password` (man nmcli 1.58: "Show the details of the active Wi-Fi networks, including the secrets" — also prints a QR code); Windows `netsh wlan show profile name="<network>" key=clear` → *Key Content* ([Microsoft Learn netsh wlan](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/netsh-wlan)).

## Hook options
- Stakes: "Your computer remembers every Wi-Fi password. This one command shows them."
- Relatable pain: "Raccoon forgot the café Wi-Fi password. His laptop didn't."

## Outline
1. Hook (0–3s): terminal with a password revealed + headline.
2. Problem: friend asks for the Wi-Fi password, Raccoon's laptop is connected but he forgot it.
3. 1/3 Mac: `security find-generic-password -wa "Cafe"` → Touch ID prompt (glass callout: it asks first, it's your keychain) → password.
4. 2/3 Linux: `nmcli device wifi show-password` → password + QR code in the terminal (friend scans it).
5. 3/3 Windows: `netsh wlan show profile name="Cafe" key=clear` → focus ring on *Key Content*.
6. Bonus line: only networks you've joined, needs your password/admin; that's why you lock your laptop.
7. EndCard: save + follow + comment "Mac, Linux or Windows?"

## Raccoon angle
Masked bandit energy without crime: he only 'steals' his own forgotten passwords. Night raid at the café, laptop remembers what he forgot. Use the scheming pose for the reveal.

## Script
<!-- source of truth for scripts/tts.py. Pronunciation: {display|spoken}, e.g. {fd|F D}, {--tree|dash dash tree}. Last line = CTA: follow + save + comment ([[Video format]] → Ending) -->
Your computer remembers every Wi-Fi password it ever joined. One command shows your Wi-Fi password.
Sudo's friend wants the café Wi-Fi. Sudo is online, snacks in paw, and has no idea what it is.
One. Mac. Type {security find-generic-password -wa|security find generic password, dash W A} and the network name. It asks for your Mac password, then prints the Wi-Fi password.
Two. Linux. {nmcli device wifi show-password|N M C L I device wifi show password}. You get the password, plus a QR code your friend can just scan.
Three. Windows. {netsh wlan show profile|net S H, W LAN, show profile}, the network name, and {key=clear|key equals clear}. The password is next to Key Content.
It only works for networks your computer already joined. But anyone at your unlocked laptop can do it too, so lock it before you go get snacks.
Save this for the next café. Follow for more terminal tricks, and comment: Mac, Linux or Windows?

## Voice style
Friendly, quick and a little sly, like letting a friend in on a trick. Clear pauses between the three steps.

## Beats
| Beat | Visual | Raccoon |
| --- | --- | --- |
| Hook | "Your computer remembers / every Wi-Fi password." + terminal already showing `security find-generic-password -wa TrashCafe` → `snacks4ever` (ring on "password"); glass "Mac · Linux · Windows" on "one command" | `peek-paws` over the terminal |
| Problem | `ChatThread` with Bandit: "what's the café wifi password?" → "i'm on it right now" → "no idea what it is"; glass "TrashCafe · connected" | `night-snack` on "snacks in paw" |
| 1/3 Mac | `ToolHeader` Mac; command types with the voice, ring on the network name + "TrashCafe = the Wi-Fi name"; `SystemPrompt` "security wants to use the System keychain" (dots on "Mac password", Allow on "then"); `snacks4ever` prints (ring, ding); glass "It asks for your Mac password first" | `scheming` on "prints" |
| 2/3 Linux | `nmcli device wifi show-password` → SSID / Security / Password (ring); real `WIFI:` QR card builds in on "QR" (scans with zbarimg), ring on "scan"; glass "Your friend scans it and joins" | `duo-huddle` on "friend" |
| 3/3 Windows | Command Prompt (`C:\>`), `netsh wlan show profile name="TrashCafe" key=clear` → Security settings, ring on *Key Content : snacks4ever*; glass "netsh wlan show profiles = every saved network" | `pointing` |
| The catch | "Only networks it joined. / Anyone at your laptop, too."; laptop icon with Wi-Fi, red unlock badge on "unlocked" → green lock on "lock"; glass "Lock it before snacks: Ctrl+Cmd+Q on Mac · Win+L on Windows" | `sneaking` in from the right, leaves on "lock" |
| Outro | `SaveOutro`: cheat sheet (# mac / # linux / # windows + command each), bubble "Mac, Linux or Windows?" | `waving-laugh` |
| End card | `EndCard` on "follow", comment on "comment" | avatar `closeup-face` |

## Post
<!-- written by Claude as the last build step, checked by scripts/package.py: see [[Caption and hashtags]] -->
```text
Show your Wi-Fi password with one command: your computer remembers every network it joined. Mac: security find-generic-password, Linux: nmcli device wifi show-password, Windows: netsh wlan show profile with key=clear. Mac, Linux or Windows? 🦝 #wifi #terminal #linux #coding
```
- Keyword: wi-fi password
- YouTube title: Show any saved Wi-Fi password with one command (Mac, Linux, Windows) #shorts
- Cover: TikTok and Instagram get the video frame at `cover_ms` (4.9s: headline, terminal with the ringed password, Sudo, "Mac · Linux · Windows") because Postiz can't send a custom cover; designed covers stay in out/wifi-passwords/ for a manual swap
- Post at: 18:00–21:00

## Results & learnings
- **48h (2026-10-13):** TikTok 376 views / 23 likes / 6 saves (1.6%), Instagram 2,278 views / 31 likes / 56 saves (2.5%), YouTube 491 views (3,145 total). Cross-OS one-command cheat sheet gets strong saves (2.5% on IG, 1.6% on TT).
