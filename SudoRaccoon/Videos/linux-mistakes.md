---
id: linux-mistakes
title: "5 Linux commands you're using wrong"
status: posted
format: myth-vs-fact
topic: linux
tools: [rm, chmod, kill, sudo, history]
score: 26
voice: Autonoe
music: lofi-relax
duration: 90
composition: LinuxMistakes
output: out/linux-mistakes/linux-mistakes-tiktok.mp4
ig_saves: 54
ig_shares: 7
ig_comments: 0
ig_likes: 83
ig_views: 2795
yt_comments: 1
yt_likes: 27
yt_views: 1307
youtube_url: https://www.youtube.com/watch?v=MLSrjlqWMUE
instagram_url: https://www.instagram.com/reel/Dee-lXOgU40/
tiktok_url: https://www.tiktok.com/@sudoraccoon
scheduled: 2026-10-14 20:00
caption: "5 Linux commands you're using wrong, and what to type instead: rm -rI asks before it deletes a folder, chmod u+x instead of chmod 777, plain kill before kill -9, sudo !! reruns your last command as root and Ctrl+R searches your history. Which command burned you? 🦝 #linux #linuxcommands #terminal #coding"
cover: out/linux-mistakes/linux-mistakes-cover.jpg
cover_ms: 2800
created: 2026-10-10
posted: 2026-10-14 20:00
url: https://www.tiktok.com/@sudoraccoon/video/7696585906140007712
views: 3562
likes: 173
saves: 89
comments: 2
shares: 13
---
# 5 Linux commands you're using wrong

## Promise
Five commands almost everyone runs the risky or clumsy way, and the better habit for each.

## Why now (evidence)
- YouTube "linux commands you should know": Fireship "100+ Linux Things" 3.5M, freeCodeCamp 2.9M, NetworkChuck "60 Linux Commands" 2.6M.
- Our best video so far is the Linux basics one, [[linux-folders]] (TikTok 552 views / 13 saves, Instagram 5.9K views / 215 saves): Linux fundamentals work for this channel.
- Myth-vs-fact framing ("you're doing it wrong") is a proven hook pattern ([[Hook library]] — Negation).

## Hook options
- "You're using `rm` wrong. So was Raccoon."
- "Stop typing `chmod 777`."

## Outline
1. `rm -rf` → `rm -rI` (GNU and BSD/macOS rm: `-I` prompts once before a recursive delete or more than 3 files; the last of `-f/-i/-I` wins).
2. `chmod 777` → `chmod u+x` (777 = every user can write; `u+x` = only you can run it).
3. `kill -9` first → plain `kill` (sends TERM, the process can clean up; KILL can't be caught, per signal(7)). Bash reports `Terminated` vs `Killed`.
4. Retyping a command with sudo → `sudo !!` (bash/zsh history expansion, `!!` = previous command; not in fish).
5. `history | grep` → Ctrl+R (reverse-i-search in bash/zsh readline).

Dropped `cat file | grep x` (weak payoff) for Ctrl+R (more people don't know it).

Verified 2026-10-10 on GNU coreutils 9.11 / bash 5.3: `rm -rI` prompt text `rm: remove 1 argument recursively?`, `ls -ld` after `chmod 777` / `700`, `./snack.sh: Permission denied`, `mkdir: cannot create directory '/opt/snacks': Permission denied`, job messages `[1]+  Terminated` / `[1]+  Killed`, `!!` in `man bash`. `sudo !!` itself was not run (sandbox).

### Facts checked (2026-10-13, rebuild for the 60 s+ format)
Run in a throwaway folder (`out/linux-mistakes/scratch`) on GNU coreutils 9.11, util-linux kill, bash 5.3.15:
- `rm -I` (rm(1)): "prompt once before removing more than three files, or when removing recursively". `echo n | rm -rI snacks` → `rm: remove 1 argument recursively?`, folder kept; `rm -I a b c d` → `rm: remove 4 arguments?`; `rm -I a b c` (3 files) deletes without asking. Any answer not starting with y keeps the files. rm has no trash/undo (it unlinks).
- `chmod`: new file with umask 0022 → `-rw-r--r--`, `./snack.sh` → `bash: ./snack.sh: Permission denied`; `chmod 777` → `-rwxrwxrwx` (owner, group and others can read, write, execute); `chmod u+x` → `-rwxr--r--` and the script runs. "u" = the user who owns it (chmod(1)).
- `kill`: kill(1) (util-linux): "If no signal is specified, the TERM signal is sent … a process may install a handler for the TERM signal in order to perform clean-up steps … the latter signal [KILL] cannot be caught, and so does not give the target process the opportunity to perform any clean-up". bash `help kill`: "SIGTERM is assumed". Tested: a script with `trap … TERM` prints `saving snacks.db... bye` on plain `kill` (job then shows `Done`); `kill -9 %1` → `[1]+  Killed`. So the script does **not** claim bash always prints "Terminated" (a program that cleans up and exits shows `Done`).
- `!!` (man bash, HISTORY EXPANSION): "Refer to the previous entry. This is a synonym for '!-1'". Tested in interactive bash: `!!` echoes the expanded line (`echo touch /etc/snacks`) and runs it. `touch /etc/snacks` as a user → `touch: cannot touch '/etc/snacks': Permission denied`. zsh has the same `!!` (BANG_HIST is on by default; with `hist_verify`, e.g. Oh My Zsh, it shows the line first and Enter runs it). fish: not claimed.
- Ctrl+R (man bash, readline `reverse-search-history (C-r)`: "an incremental search"). Tested in a pty: bash shows ``(reverse-i-search)`ssh': echo ssh sudo@snack-server``; pressing Ctrl+R again steps to older matches, Enter runs the line.

## Raccoon angle
3am mistakes; Sudo's snack folder gets chmod 777'd and every other raccoon eats from it.

## Voice style
Friendly, quick and a little cheeky, like a friend who caught you doing it wrong and shows you the fix. Clear short pauses between the five items; deadpan on the snack jokes.

## Script
<!-- source of truth for scripts/tts.py. Pronunciation: {display|spoken}. Last line = CTA: follow + save + comment ([[Video format]] → Ending) -->
You're using these five Linux commands wrong. Sudo was too, at 3 a.m.
Last night, he deleted his entire snack folder with a single command. Let's fix his habits.
One. {rm -rf|R M dash R F}. No undo, no trash can. Gone forever. Type {rm -rI|R M dash R capital I} instead. It asks you once before it deletes a folder, or more than three files. Say no, and the snacks survive.
Two. {chmod 777|C H mod seven seven seven}. It fixes permission denied by letting every user on the machine read, change and run your file. Every raccoon in the neighborhood just moved in. If your script only needs to run, use {chmod u+x|C H mod U plus X}. You can run it, and nobody else can change it.
Three. {kill -9|kill dash nine}. It ends a program instantly. The program can't catch it, so nothing gets saved. Plain kill asks it to stop first, so it can save and clean up. Keep {-9|dash nine} for when it ignores you.
Four. Forgot sudo? Don't retype the whole command. Type {sudo !!|sudo bang bang}. Bang bang means your last command, so this runs it again as root. Works in bash and {zsh|Z shell}.
Five. {history | grep|history pipe grep}. Just press {Ctrl+R|control R} and start typing. Your last matching command shows up as you type. Press it again for older matches, and Enter runs it.
Save this for your next 3 a.m. session. Follow for more Linux tricks, and comment the command that burned you.

## Beats
Built 2026-10-13 from the library (rebuild of the 2026-10-10 version for the 60 s+ format); every beat anchored to spoken words. Voice: one Gemini request, 249/249 heard words matched, last word at 86.9 s, video 89.5 s.

| Beat | Visual | Raccoon |
| --- | --- | --- |
| Hook 0–4.9s | `Headline` "5 Linux commands / you're using wrong." + "3:07 am" `Terminal` with all five habits from frame 0; red cross `Mark`s stagger in on "wrong"; glass note "Sudo did all five. At 3 a.m." | `PeekOver` peek-paws on the terminal |
| Story 4.9–10.7s | `Headline` "Sudo, 3 a.m.: / snack folder gone."; `rm -rf snacks/`, `ls snacks` → No such file (ring); notes "1 command. 0 snacks." → "Let's fix his habits." | `oops` at "deleted" |
| 1/5 rm 10.7–25.8s | `ToolHeader` rm -rf → rm -rI (the I drawn in JetBrains Mono so it can't read as l); top pane `rm -rf` + No such file, note "No undo. No trash can."; "instead" pane `rm -rI snacks/` → `rm: remove 1 argument recursively?` (ring) + typed `n`, `ls snacks` → files still there (ring); note "Asks once: a folder, or more than 3 files" | `celebrate` at "survive" |
| 2/5 chmod 25.8–44.7s | `ToolHeader` chmod 777 → chmod u+x; top pane `./snack.sh` Permission denied (ring) → `chmod 777` → `ls -l` `-rwxrwxrwx` (ring); `Annotate` "rwx rwx rwx" you / group / everyone (red, focus on "read"); note "Every raccoon in the neighborhood moved in."; "instead" `chmod u+x` → `-rwxr--r--` (ring rwx, then r--r--) → `./snack.sh` → snacks: safe | `duo-bowl` at "raccoon" |
| 3/5 kill 44.7–58.9s | `ToolHeader` kill -9 → kill; top `kill -9 4821` → `[1]+ Killed`; `DocsQuote` kill(1) (man7.org) "cannot be caught" marked on "catch", verified "no clean-up, nothing saved"; "instead" `kill 4822` → `saving snacks.db... bye` (ring) + `[1]+ Done`; note "kill -9 only when it ignores you" | `side-eye` at "ignores" |
| 4/5 sudo !! 58.9–70.3s | `ToolHeader` retyping → sudo !!; top: `touch /etc/snacks` Permission denied, slow retype `sudo touch /etc/snacks`, note "Typing it all again…"; "instead": `sudo !!` → bash echoes `sudo touch /etc/snacks` (ring `!!`, then the echo); notes "!! = your last command" → "Works in bash and zsh" | `driving` at "root" |
| 5/5 ctrl + r 70.3–81.9s | `ToolHeader` history \| grep → ctrl + r; top `history \| grep ssh` (3 lines, incl. itself); "instead": bash's `(reverse-i-search)`ssh': ssh sudo@snack-server` typed on "typing" (ring), older match `ssh -p 2222 sudo@trash-can` on "again", enter runs it → password prompt; `KeyCombo` ctrl + r (twice), then enter | `sneaking` from the right edge |
| Save 81.9–84.2s | `SaveOutro` cheat sheet (5 fixes) + bubble "Which command burned you?" | `waving-laugh` |
| CTA 84.2–89.5s | `EndCard` follow → comment, "Which command burned you?", "Follow for more Linux tricks." | closeup-face avatar |

## Post
<!-- written by Claude as the last build step, checked by scripts/package.py: see [[Caption and hashtags]] -->
```text
5 Linux commands you're using wrong, and what to type instead: rm -rI asks before it deletes a folder, chmod u+x instead of chmod 777, plain kill before kill -9, sudo !! reruns your last command as root and Ctrl+R searches your history. Which command burned you? 🦝 #linux #linuxcommands #terminal #coding
```
- Keyword: linux commands
- YouTube title: 5 Linux commands you're using wrong (and what to type instead) #shorts
- Cover: TikTok and Instagram get the video frame at `cover_ms` (2.8s: hook headline, the "3:07 am" terminal with all five habits crossed out in red, Sudo peeking over it) because Postiz can't send a custom cover; designed covers stay in out/linux-mistakes/ for a manual swap
- Post at: 2026-10-14 20:00

## Results & learnings
- **48h calibration (predicted 26/30):** TT 3,422 · IG 2,788 · YT 1,306 views (TT 2.5% · IG 1.9% saves). Massive outlier on TikTok (#1 TT video at 3,422 views / 85 saves): wrong-way vs right-way Linux panes.
