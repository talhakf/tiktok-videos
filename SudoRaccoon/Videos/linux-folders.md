---
id: linux-folders
title: "Every Linux folder explained"
status: posted
format: concept-explainer
topic: linux
tools: [ls, readlink, du, file, cat]
score: 27
voice: Autonoe
music: lofi-relax
duration: 58
composition: LinuxFolders
output: out/linux-folders/linux-folders-tiktok.mp4
yt_comments: 1
ig_saves: 217
ig_shares: 37
ig_comments: 0
ig_likes: 235
ig_views: 6785
yt_likes: 30
yt_views: 1372
youtube_url: https://www.youtube.com/watch?v=KNdnWBS2mW0
instagram_url: https://www.instagram.com/reel/DeY-F6midxw/
tiktok_url: https://www.tiktok.com/@sudoraccoon
scheduled: 2026-10-12 12:00
cover: out/linux-folders/linux-folders-cover.jpg
cover_ms: 2000
caption: "Linux file system explained: every folder in under a minute. /home is your stuff, /etc the settings, /bin the programs, /tmp is often wiped at reboot, /var holds logs, /dev turns hardware into files and /proc is live kernel info. Plus /dev/null. Which folder confused you? 🦝 #linux #linuxcommands #terminal #coding"
created: 2026-10-10
posted: 2026-10-12 12:00
url: https://www.tiktok.com/@sudoraccoon/video/7695719091423825184
views: 633
likes: 48
saves: 18
comments: 4
shares: 3
---

# Every Linux folder explained

## Promise
What /bin, /etc, /home, /tmp, /var, /dev and /proc are for — and why /dev/null is the best trash can ever made.

## Why now (evidence)
- YouTube "Linux File System/Structure Explained!" **5.1M**, "the Linux File System explained in 1,233 days" 2.7M; top-5 median **1.8M** — one of the highest-demand Linux topics we measured.
- coding.kitty7's all-time top 40 is mostly fundamentals explainers (TCP vs UDP 689K, IPv4 vs IPv6 688K, Arch btw 376K, Kernel 114K) — they have **not** done the folder layout.
- Verified on this machine: `/bin`, `/sbin`, `/lib` are symlinks to `/usr/...` on modern distros (usr merge); `/tmp` is a tmpfs here (RAM, wiped at reboot — say "on many distros"); `/proc` and `/sys` are virtual (size 0).
- Verified 2026-10-11 for the script (on this Arch-based machine, plus official docs):
  - FHS 3.0 ([refspecs.linuxfoundation.org](https://refspecs.linuxfoundation.org/FHS_3.0/fhs-3.0.html)): /bin "Essential command binaries", /etc "Host-specific system configuration", /home "User home directories", /tmp "Temporary files" (FHS *recommends* deleting it at boot, not required → script says "on many distros"), /var "Variable data", /var/log "Log files and directories", /dev "Device files", /usr/bin "Most user commands".
  - `readlink /bin` → `usr/bin` here; /bin, /sbin, /lib, /lib64 are symlinks (usr merge on Arch, Fedora, Debian 12+, Ubuntu → "most modern distros").
  - `findmnt /tmp` → tmpfs (RAM); `cat /tmp/snack` on a missing file prints `cat: /tmp/snack: No such file or directory`.
  - `du -sh /var/log` → 67M; `cat /etc/hostname` prints the machine name (a plain-text setting).
  - `file /dev/nvme0n1` → `block special (259/0)`: the SSD as a file. Kernel devices list: `1 char 3 = /dev/null Null device`.
  - /proc: kernel docs "an interface to internal data structures in the kernel"; `ls -l /proc/uptime` shows size 0, `df -h /proc` 0 bytes; /proc/uptime = "wall clock since boot, combined idle time of all cpus" (`12552.08 141838.75` = 3.5 h).
  - `echo snacks > /dev/null` succeeds and `cat /dev/null` prints nothing.

## Hook options
- Question: "What's actually in every Linux folder?"
- Contradiction: "/dev/null isn't a folder. It's a black hole."

## Outline
1. Hook: `ls /` with all folders + headline.
2. Quick tour, ~6s each, folder highlighted in the `ls /` output: /home (your stuff) · /etc (settings, text files) · /bin → /usr/bin (programs; symlink reveal) · /tmp (gone after reboot) · /var (logs that grow) · /dev (devices are files) · /proc (live info about running programs: `cat /proc/uptime`).
3. Payoff: /dev/null — `echo snacks > /dev/null` → gone. The trash can that's always empty.
4. EndCard: save the map + comment "which folder confused you?"

## Raccoon angle
Raccoon is a squatter touring a new house: /home is his bedroom, /tmp is where he leaves food (gone in the morning), /dev/null is the perfect trash can. Trash joke lands naturally.

## Voice style
Friendly, quick and playful, like a tour guide showing a new house. A short pause between the folders.

## Script
<!-- source of truth for scripts/tts.py. Pronunciation: {display|spoken}, e.g. {fd|F D}, {--tree|dash dash tree}. Last line = CTA: follow + save + comment ([[Video format]] → Ending) -->
Every folder in the Linux file system, explained in under a minute. Sudo just moved in, so let's tour the house.
{/home|Slash home} is the bedroom. Your files live here.
{/etc|Slash E T C} holds the settings, mostly plain text files you can read.
{/bin|Slash bin} has the programs, like {ls|L S}. On most modern distros, it's just a shortcut to {/usr/bin|slash user slash bin}.
{/tmp|Slash temp} is the kitchen counter. Sudo leaves snacks there, and on many distros, they're gone after a reboot.
{/var|Slash var} holds things that keep growing, like logs.
{/dev|Slash dev} turns your hardware into files. Even your disk is a file.
{/proc|Slash prock} isn't on the disk at all. The kernel makes it up live. {cat /proc/uptime|cat slash prock slash uptime} shows how long the computer has been on.
And the best one: {/dev/null|slash dev slash null}. Anything you send there is gone forever. The perfect trash can. Sudo has never found a single snack in it.
Save this map. Follow for more Linux tricks, and comment which folder confused you.

## Beats
Built 2026-10-11 from the library; all beats anchored to spoken words. Captions were aligned with whisper **without** the script prompt (the prompted run spread the first 20 s badly; same audio, no extra TTS request).

| Beat | Visual | Raccoon |
| --- | --- | --- |
| Hook 0–6.4s | `Headline` "Every Linux folder, / explained." + `Terminal` with real `ls /` (3×6 grid, usr-merge symlinks cyan) from frame 0; `Note` "7 folders · 1 trash can" | `PeekOver` peek-paws on the terminal |
| Tour (6.4–42.9s) | `ToolHeader` /home → /proc with 1/7…7/7; the `ls /` window glides up and keeps a blue `Circle` on the current folder; a second terminal per folder below | |
| 1/7 /home | `ls /home` → sudo; `Note` "~ = /home/sudo" | belly-up (bedroom) |
| 2/7 /etc | `cat /etc/hostname` → laptop (ring); `Note` "Settings are text files" | |
| 3/7 /bin | `readlink /bin` → usr/bin (ring), ls ring hops bin → usr; `Note` "/bin → /usr/bin, ls lives here" | scheming |
| 4/7 /tmp | `echo chips > /tmp/snack` · reboot · `cat /tmp/snack` → No such file; `Note` "On many distros: wiped at every boot" | night-snack |
| 5/7 /var | `du -sh /var/log` → 67M (ring); `Note` "Logs only get bigger" | |
| 6/7 /dev | `file /dev/nvme0n1` → block special (ring); `Note` "That's the SSD. As a file." | |
| 7/7 /proc | `ls -l /proc/uptime` (ring on size 0) → `cat /proc/uptime` (ring on seconds); `Note` "Seconds since boot ≈ 3.5 hours" | |
| Payoff /dev/null 42.9–51.6s | `Headline` "/dev/null. / The perfect trash can."; `echo snacks > /dev/null`, `cat /dev/null` → nothing; `Vanish` chip "snacks" into the hole; `Note` "Always empty"; `Reaction` "?" on "never" | trash-bin |
| Save 51.6s | `SaveOutro` "map of /" cheat sheet (8 rows) + bubble "Which folder confused you?" | waving-laugh |
| CTA 52.5s | `EndCard` follow → save → comment, question "Which folder confused you?" | closeup-face avatar |

## Post
<!-- written by Claude as the last build step, checked by scripts/package.py: see [[Caption and hashtags]] -->
```text
Linux file system explained: every folder in under a minute. /home is your stuff, /etc the settings, /bin the programs, /tmp is often wiped at reboot, /var holds logs, /dev turns hardware into files and /proc is live kernel info. Plus /dev/null. Which folder confused you? 🦝 #linux #linuxcommands #terminal #coding
```
- Keyword: linux file system explained
- YouTube title: Every Linux folder explained in under a minute (Linux file system) #shorts
- Cover: TikTok and Instagram get the video frame at `cover_ms` (2.0s: hook headline, the full `ls /` terminal, Sudo peeking over it) because Postiz can't send a custom cover; designed covers stay in out/linux-folders/ for a manual swap
- Post at: 18:00–21:00

## Results & learnings
- **48h calibration (predicted 27/30):** TT 575 views / 16 saves (2.8%) · IG 5,984 views / 217 saves (3.6%) · YT 1,118 views. Outperformed prediction (#1 on TikTok, #2 on IG & YT) — visual filesystem map + terminal proof per folder + screenshot-able cheat sheet is our strongest evergreen template.
