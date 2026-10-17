---
id: terminal-basics
title: "The 8 terminal commands that do 90% of the work"
status: posted
format: tool-listicle
topic: terminal
tools: [pwd, ls, cd, mkdir, touch, cp, mv, rm]
score: 26
voice: Autonoe
music: lofi-relax
duration: 124
composition: TerminalBasics
output: out/terminal-basics/terminal-basics-tiktok.mp4
ig_saves: 53
ig_shares: 7
ig_comments: 1
ig_likes: 72
ig_views: 2449
yt_likes: 25
yt_views: 582
youtube_url: https://www.youtube.com/watch?v=npvLRS3e-Ao
instagram_url: https://www.instagram.com/reel/DegsdqCjrCx/
tiktok_url: https://www.tiktok.com/@sudoraccoon
scheduled: 2026-10-15 12:00
cover: out/terminal-basics/terminal-basics-cover.jpg
cover_ms: 3200
caption: "The 8 terminal commands that do almost everything you do every day: pwd, ls -la, cd (cd .. and cd ~), mkdir -p, touch, cp -r, mv and rm -i. Sudo just moved into a new trash can, and rm skips the Trash for good. Which command did you learn way too late? 🦝 #terminal #linuxcommands #linux #coding"
created: 2026-10-11
posted: 2026-10-15 12:00
url: https://www.tiktok.com/@sudoraccoon/video/7696832600991616289
views: 1183
likes: 66
saves: 27
comments: 0
shares: 2
---

# The 8 terminal commands that do 90% of the work

## Promise
The eight commands you actually type every day, in one screenshot-able cheat sheet, for people who just opened a terminal for the first time.

## Why now (evidence)
- YouTube "terminal commands every programmer should know" top-5 median **2.9M**, "linux basic commands for beginners" **2.1M**, "what is linux" 2.1M (research scan, research scan).
- @flpr_txk "Linux basic commands" 92K (40× median); their cheat sheets are their best videos.
- Beginner entry point for the channel: every later video assumes people know `cd` and `ls`.
- All eight are POSIX/coreutils and preinstalled on macOS and Linux. Careful claims: `rm` has no trash (deleted for real); "90%" is a framing, say "most of the time" in the voice.

### Facts checked (2026-10-13)
Sources: POSIX.1-2024 / Single UNIX Specification, Apple man pages ([pwd(1)](https://keith.github.io/xcode-man-pages/pwd.1.html), [ls(1)](https://keith.github.io/xcode-man-pages/ls.1.html), [mkdir(1)](https://keith.github.io/xcode-man-pages/mkdir.1.html), [touch(1)](https://keith.github.io/xcode-man-pages/touch.1.html), [cp(1)](https://keith.github.io/xcode-man-pages/cp.1.html), [mv(1)](https://keith.github.io/xcode-man-pages/mv.1.html), [rm(1)](https://keith.github.io/xcode-man-pages/rm.1.html)), GNU coreutils 9.x man pages, and `bash` builtin `help cd`, all verified locally in a scratch directory on 2026-10-13.
- `pwd` (print name of current/working directory; both a shell builtin and `/bin/pwd`): prints the full pathname of the current working directory (e.g. `/Users/sudo` on macOS, `/home/sudo` on Linux). `-L` uses logical `$PWD` with symlinks; `-P` resolves symlinks.
- `ls` (list directory contents): lists files and folders in the current directory sorted alphabetically by default, hiding entries starting with `.`. `ls -la` combines `-l` (long listing: permissions, links, owner, group, size in bytes, modification timestamp, name) and `-a` (do not ignore entries starting with `.`, including `.`, `..`, and dotfiles like `.zshrc` or `.secret-stash`). Verified locally: `ls` hid `.secret-stash`, `ls -la` listed `.`, `..`, `.secret-stash`, `snacks.txt`, and `trash-can`.
- `cd` (change the shell working directory; shell builtin): `cd <dir>` steps into `dir`; `cd ..` moves one level up to the parent directory; `cd` with no arguments or `cd ~` jumps to `$HOME`; `cd -` switches back to `$OLDPWD`.
- `mkdir` (make directories): `mkdir trash-can` creates the directory `trash-can` if it does not exist. `-p` (`--parents`) creates intermediate parent directories as needed without error if they already exist.
- `touch` (change file access and modification times): updates access and modification timestamps of each file to the current time; a file argument that does not exist is created as an empty (0-byte) file unless `-c` is supplied. Verified locally: `touch snacks.txt` created a 0-byte `-rw-r--r--` file.
- `cp` (copy files and directories): `cp snacks.txt backup.txt` copies `SOURCE` to `DEST`. By default `cp` skips directories (`cp: -r not specified; omitting directory`); `-r` / `-R` copies directories recursively (`cp -r trash-can backup-can`, verified locally).
- `mv` (move / rename files): `mv source dest` either moves `source` into an existing directory (`mv snacks.txt trash-can/`) or renames `source` to `dest` (`mv backup.txt pizza.txt`), atomically on the same filesystem, working on both files and directories without `-r`.
- `rm` (remove directory entries): unlinks files directly from the filesystem — it does **not** move files to the macOS Trash (`~/.Trash`) or Linux/Windows Recycle Bin. By default it does not remove directories (`-r` removes directories and their contents recursively; `rmdir` removes only empty directories). `rm -i` prompts before every removal (`remove snacks.txt?` on macOS BSD `rm`; `rm: remove regular empty file 'snacks.txt'?` on GNU `rm`, verified locally: answering `n` kept the file).

## Hook options
- Listicle promise: "8 commands. That's most of the terminal."
- Contradiction: "You don't need to memorize 100 commands."

## Outline
1. Hook: empty terminal, blinking cursor, "8 commands" headline.
2. Where am I / what's here: `pwd`, `ls`.
3. Move: `cd folder`, `cd ..`.
4. Make: `mkdir`, `touch`.
5. Copy / move / rename: `cp`, `mv`.
6. Delete: `rm` (no trash! Sudo can't dig it back out).
7. Cheat-sheet card with all 8 → EndCard: "which command did you learn way too late?"

## Raccoon angle
Sudo moves into a new trash can: `mkdir trash-can`, `touch snacks.txt`, `mv` the snacks, and the `rm` beat is Sudo's horror (no recycle bin to raid).

## Notes
Keep it fast (3 commands per ~12s). Cheat-sheet variant from [[Video format]].

## Voice style
Upbeat, warm, and encouraging, like a friendly developer showing a beginner around the terminal for the first time. Brisk and clear on each command name, playful on Sudo's trash-can and snack examples, and a little dramatic on the `rm` warning ("even Sudo can't dig it back out").

## Script
<!-- source of truth for scripts/tts.py. Pronunciation: {display|spoken}, e.g. {fd|F D}, {--tree|dash dash tree}. Last line = CTA: follow + save + comment ([[Video format]] → Ending) -->
You don't need a hundred terminal commands. These eight do almost everything you do every day.
Sudo just opened a terminal for the first time, and he's moving into a brand new trash can.
One. {pwd|P W D}, print working directory. It tells you which folder you're standing in right now, like {/Users/sudo|slash Users slash sudo}.
Two. {ls|L S}, list. It shows the files and folders around you. Add {-la|dash L A}, so {ls -la|L S, dash L A}, and you also see file sizes, dates, and hidden files that start with a dot, like {.zshrc|dot Z S H R C}.
Three. {cd|C D}, change directory. Type {cd Desktop|C D Desktop} to step inside a folder, {cd ..|C D dot dot} to step one level back out, or just {cd ~|C D tilde} to jump straight home from anywhere.
Four. {mkdir|make dir}, make directory. {mkdir trash-can|make dir, trash can} creates a fresh folder right where you are. Add {-p|dash P} to build nested folders in one go.
Five. touch. {touch snacks.txt|touch, snacks dot T X T} drops a brand new empty file on the spot.
Six. {cp|C P}, copy. Give it the file you have and the new name you want, like {cp snacks.txt backup.txt|C P, snacks dot T X T, backup dot T X T}. Copying a whole folder? Add {-r|dash R}.
Seven. {mv|M V}, move. It does two jobs: {mv snacks.txt trash-can/|M V, snacks dot T X T, trash can} moves a file into a folder, and {mv backup.txt pizza.txt|M V, backup dot T X T, pizza dot T X T} in the same place renames it.
Eight. {rm|R M}, remove. Careful with this one: {rm pizza.txt|R M, pizza dot T X T} does not use the Trash or Recycle Bin. It deletes the file for good, and even Sudo can't dig it back out. Add {-i|dash I}, {rm -i|R M, dash I}, so it asks you before anything disappears.
Save this cheat sheet for your first week in the terminal. Follow for more terminal tricks, and comment: which command did you learn way too late?

## Beats
Built 2026-10-13 from the library; every beat anchored to spoken words. Voice: one Gemini request (121.6 s of speech, 255 display words, 268/295 heard words matched). Video 2:04 (124.1 s).

| Beat | Visual | Raccoon |
| --- | --- | --- |
| Hook 0–6.2s | Headline "100 terminal commands? / These 8 do most of it." + cheat-sheet terminal with the 5 everyday groups from frame 0; mono note "pwd · ls · cd · mkdir · touch · cp · mv · rm"; at "these": "Built into macOS & Linux." | `peek-paws` over the terminal |
| Story 6.2–11.8s | Headline "First day in the terminal. / Moving into a new trash can."; empty terminal with blinking cursor; `TrashCan` + note "Home sweet trash can." | `baby-glove` |
| 1/8 pwd 11.8–21.1s | `pwd` → `/Users/sudo` (ring at "/Users/sudo"); `FolderTree` (`/` → `/Users` → `/Users/sudo` highlighted at "standing"); note "Shows the exact folder you're standing in." | `pointing` at "/Users/sudo" |
| 2/8 ls 21.1–36.3s | `ls` → `Desktop Downloads notes.txt`, then `ls -la` with sizes, dates, and `.zshrc` in green; focus rings on sizes → dates → `.zshrc` row; notes "Files and folders in this directory" → "-l = sizes & dates / -a = show everything" → "Starts with a dot (.zshrc) = hidden file" | `peek-pillar` from the right edge at "hidden" |
| 3/8 cd 36.3–50.5s | `cd Desktop` → `cd ..` (ring) → `cd ~` (ring); `FolderTree` with highlight gliding `~` → `~/Desktop` → `~`; notes "cd Desktop → step in" → "cd .. → one level up" → "cd ~ → straight home" | `pointing` (flipped) at "inside" |
| 4/8 mkdir 50.5–62.3s | `mkdir trash-can`, then `mkdir -p trash-can/snacks` (ring on `mkdir -p`); `FinderWindow` where `trash-can` and `snacks` folders pop in and highlight on cue; note "-p builds nested folders in one go" | `celebrate` at "fresh" |
| 5/8 touch 62.3–68.8s | `touch snacks.txt` → `snacks.txt 0 bytes (empty)` (ring); `FinderWindow` where `snacks.txt` appears and highlights; note "Instant empty file on the spot" | `scheming` at "touch snacks.txt" |
| 6/8 cp 68.8–81.6s | `cp snacks.txt backup.txt` and `cp -r trash-can backups` (ring on `cp -r`); `FinderWindow` where `backup.txt` and `backups` pop in; notes "cp snacks.txt backup.txt" → "Whole folder? Add -r" | `duo-bowl` at "cp snacks.txt backup.txt" |
| 7/8 mv 81.6–96.5s | `mv snacks.txt trash-can/` (ring on `trash-can/`) and `mv backup.txt pizza.txt` (ring on `pizza.txt`); two `Node` + `Arrow` diagrams ("move" into `trash-can/` and "rename" to `pizza.txt`); notes "Job 1: move into a folder" → "Job 2: rename in the same place" | `crepe` at "renames" |
| 8/8 rm 96.5–114.8s | `rm pizza.txt` → `gone forever (skips Trash)` (ring) + `Vanish` sucking `pizza.txt` into "no Trash · gone forever"; then `rm -i notes.txt` → `remove notes.txt? n` (ring); notes "No Trash or Recycle Bin." → "Even Sudo can't dig it back out." → "rm -i asks you before deleting" | `gasp` at "Trash", `hands-up` at "rm -i" |
| Save 114.8–117.8s | `SaveOutro` cheat-sheet terminal with all 8 commands + bubble "Which one did you learn too late?" | `waving-laugh` |
| End 117.8–124.1s | `EndCard`: follow tap, save, comment "Which command did you learn way too late?" | avatar |

## Post
<!-- written by Claude as the last build step, checked by scripts/package.py: see [[Caption and hashtags]] -->
```text
The 8 terminal commands that do almost everything you do every day: pwd, ls -la, cd (cd .. and cd ~), mkdir -p, touch, cp -r, mv and rm -i. Sudo just moved into a new trash can, and rm skips the Trash for good. Which command did you learn way too late? 🦝 #terminal #linuxcommands #linux #coding
```
- Keyword: terminal commands
- YouTube title: The 8 terminal commands that do 90% of the work #shorts
- Cover: TikTok and Instagram get the video frame at `cover_ms` (3.2s: hook headline, cheat-sheet terminal, Sudo peeking, the eight command names + "Built into macOS & Linux.") because Postiz can't send a custom cover; designed covers (cheat-sheet terminal) stay in out/terminal-basics/ for a manual swap
- Post at: 2026-10-15 12:00

## Results & learnings
- **48h calibration (predicted 26/30):** TT 1,178 · IG 2,433 · YT 579 views (TT 2.2% · IG 2.2% saves). Under-scored (acts like 28): #2 on TikTok (1,178 views / 26 saves); beginner command cheat sheets convert.
