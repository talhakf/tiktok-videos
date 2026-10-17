---
id: free-learning-sites
title: "Free sites that teach you the terminal"
status: posted
format: tool-listicle
topic: learning
tools: [missing-semester, overthewire-bandit, explainshell, learngitbranching, build-your-own-x]
score: 27
voice: Autonoe
music: lofi-relax
duration: 54
composition: FreeLearningSites
output: out/free-learning-sites/free-learning-sites-tiktok.mp4
yt_likes: 11
ig_saves: 163
ig_shares: 26
ig_comments: 0
ig_likes: 92
ig_views: 5020
yt_views: 362
youtube_url: https://www.youtube.com/watch?v=1l6dMfqqI8k
instagram_url: https://www.instagram.com/reel/DeZgwB0CUet/
tiktok_url: https://www.tiktok.com/@sudoraccoon
scheduled: 2026-10-12 17:00
cover: out/free-learning-sites/free-learning-sites-cover.jpg
cover_ms: 4200
caption: "Learn the terminal for free with these 5 sites: no signup, nothing to pay. explainshell explains every flag of a command, OverTheWire Bandit is a Linux game you play over ssh, plus Learn Git Branching, MIT's Missing Semester and build-your-own-x. Which one are you starting tonight? 🦝 #terminal #linux #computerscience #coding"
created: 2026-10-10
posted: 2026-10-12 17:00
url: https://www.tiktok.com/@sudoraccoon/video/7695796530233543969
views: 448
likes: 13
saves: 8
comments: 1
shares: 0
---

# Free sites that teach you the terminal

## Promise
Five free sites Sudo dug out of the internet's trash that teach the terminal, git and how tools work: no signup, no credit card.

## Why now (evidence)
- @thecodingsloth's biggest videos are free-resource drops: "Build your own terrible version of popular technologies" **870.7K** (252× median), "MIT has free courses for you" **723.7K**, "This website MIGHT help your skill issues" 613.2K, "This repo is pretty cool" 435.1K — all with **9.4–9.7% saves** (coding.kitty7 averages ~1.5%).
- YouTube "free computer science courses" top-5 median **7.8M** (CS50 14.1M).
- Verified live (HTTP 200, 2026-10-10): [Missing Semester](https://missing.csail.mit.edu) (MIT, shell/git/vim; repo pushed 2026-10-08), [OverTheWire Bandit](https://overthewire.org/wargames/bandit/) (learn Linux by hacking levels over SSH), [explainshell](https://explainshell.com) (14.3K★), [Learn Git Branching](https://learngitbranching.js.org) (34.1K★), [build-your-own-x](https://github.com/codecrafters-io/build-your-own-x) (**552K★**). Backups: [cmdchallenge](https://cmdchallenge.com), [sadservers](https://sadservers.com), [tldr](https://tldr.sh) (63.9K★).
- Different from thecodingsloth: terminal-only picks, each shown doing one thing (explainshell breaking down a scary command, Bandit level 0 over ssh).
- Re-verified 2026-10-11 (fetched each site, all HTTP 200, all free and no account needed):
  - **explainshell.com**: "match command-line arguments to their help text" (repo idank/explainshell 14,280★). `explain?cmd=tar+-xzvf+archive.tar.gz` splits it into `-x` "Extract files from an archive", `-z` "Filter the archive through gzip", `-v` "Verbosely list files processed", `-f` "Use archive file or device ARCHIVE" (tar(1), Ubuntu 26.04 man pages).
  - **OverTheWire Bandit**: "aimed at absolute beginners", organised in levels; level 0 = `ssh bandit0@bandit.labs.overthewire.org -p 2220`, password `bandit0` (published on the level 0 page; logged in for real: `ls` → `readme`, which holds the level 1 password: "The password for the next level is stored in a file called readme"). Levels 0–33 exist (bandit34.html says "level 34 does not exist yet"). Rules: don't publish credentials of any level, so the video shows only the public level 0 login and never a readme's content.
  - **Learn Git Branching** (learngitbranching.js.org): "An interactive Git visualization tool to educate and challenge!", runs in the browser; repo pcottle/learnGitBranching 34,121★, MIT license.
  - **The Missing Semester of Your CS Education** (missing.csail.mit.edu, MIT; 2026 edition, lectures 12–23 Jan 2026): "there's one critical subject that's rarely covered … proficiency with their tools"; "master the command-line, use a powerful text editor, use fancy features of version control systems"; syllabus includes Introduction to the Shell, Command-line Environment, Version Control and Git; lecture videos recorded with MIT Open Learning, on YouTube.
  - **build-your-own-x** (github.com/codecrafters-io/build-your-own-x): 552,497★, "Master programming by recreating your favorite technologies from scratch"; sections include Git, Shell, Database, Docker, Operating System, Web Browser (links to tutorials).

## Hook options
- Listicle promise: "5 free sites that teach the terminal better than a course."
- Relatable pain: "Raccoon found a computer science degree in the trash. For free."

## Outline
1. Hook: 5 site cards fanned out + headline.
2. 1/5 explainshell: paste `tar -xzvf` → each flag explained (best demo, put early).
3. 2/5 OverTheWire Bandit: `ssh bandit0@bandit.labs.overthewire.org -p 2220` → a game where every level is a Linux lesson.
4. 3/5 Learn Git Branching: animated commit graph.
5. 4/5 MIT Missing Semester: the class MIT says CS students skip.
6. 5/5 build-your-own-x: 552K stars, build your own git, shell, database.
7. EndCard: save + comment "which one are you starting tonight?"

## Raccoon angle
Dumpster-diving for treasure: every site comes out of a trash can as a 'free find'. Strongest raccoon fit of the batch.

## Notes
Built 2026-10-11 without screenshots: every site page is rebuilt from library pieces (BrowserWindow, TextField, BuildList, GitGraph, Terminal) with the sites' real text. Header names had to stay short for `ToolHeader` (112 px, one line): "MIT" for Missing Semester, "Build your own" for build-your-own-x (full names in the grey line). Captions: whisper merged "in your browser. Four." (all at 29.98s); fixed by hand from the energy plot (browser 30.18s, Four 31.25s).

## Voice style
Warm, upbeat and quick, like sharing a great find with a friend. Short clear pause after each number.

## Script
<!-- source of truth for scripts/tts.py. Pronunciation: {display|spoken}, e.g. {fd|F D}, {--tree|dash dash tree}. Last line = CTA: follow + save + comment ([[Video format]] → Ending) -->
Five free sites that teach you the terminal. No signup, no credit card.
Sudo dug every one of them out of the internet's trash.
One. {explainshell|explain shell}. Paste a scary command like {tar -xzvf|tar, dash X Z V F}, and it explains every flag: extract, gzip, verbose, file.
Two. {OverTheWire Bandit|Over the Wire, Bandit}. A hacking game you play over {SSH|S S H}. Every level hides the password to the next one.
Three. Learn Git Branching. Type git commands and watch the commit tree grow, right in your browser.
Four. MIT's Missing Semester. The class on the shell, git and your editor that most courses skip, with free lectures.
Five. {build-your-own-x|build your own X}, with over half a million stars. Guides to build your own git, shell or database from scratch.
Save this before Sudo throws it back in the trash. Follow for more terminal tricks, and comment which one you're starting tonight.

## Beats
| Beat | Visual | Raccoon |
| --- | --- | --- |
| Hook | "5 free sites that teach you the terminal." on screen from frame 0, grey "No signup, no credit card." on "no"; `CardFan` list of the five sites (icon, name, URL, 1/5…5/5) | `peek-paws` over the list |
| Story | the five URLs pop out of the trash bin one by one (`FromTrash`) on "dug"; `StatBadge` "$0 · all five, no account" on "trash" | `trash-bin` (chips fly out of its flap) |
| 1/5 explainshell | `ToolHeader`; `BrowserWindow` explainshell.com built from library pieces: field types `tar -xzvf archive.tar.gz` on "paste", explain button presses; on "explains" the command splits into `tar -x z v f archive.tar.gz` and a `BuildList` card adds the real man-page lines on extract / gzip / verbose / file (active flag outlined blue); glass "Every flag, from the man page" | `pointing` |
| 2/5 Bandit | terminal: `ssh bandit0@bandit.labs.overthewire.org -p 2220` → "This is an OverTheWire game server." + password prompt; `ls` → `readme`; `cat readme` → 32 hidden dots (ring on "password"; never the real credential, per the OverTheWire rules); badge "Level 0 · user bandit0, password bandit0" → glass "readme holds the password for level 1" | `sneaking` in from the right on "hacking" |
| 3/5 Learn Git Branching | `BrowserWindow` learngitbranching.js.org: `GitGraph` C0–C1 (main, HEAD); a dark console types `git commit` → C2, `git checkout -b bugFix` → bugFix pill + HEAD, `git commit` → C3 on the bugFix lane; glass "Nothing to install" on "browser" | — |
| 4/5 MIT Missing Semester | header "MIT" / "The Missing Semester · missing.csail.mit.edu"; `BrowserWindow` with the real 2026 syllabus (1/12/26 … 1/20/26); blue rings on Introduction to the Shell → Version Control and Git → Development Environment and Tools on "shell" / "git" / "editor"; glass quote "one critical subject that's rarely covered" on "skip"; badge "free · lecture videos + notes" | `standing-front` on "skip" |
| 5/5 build-your-own-x | header "Build your own" / "build-your-own-x · github.com/codecrafters-io"; GitHub-like page: star badge counts to 552K on "over half a million", "Build your own <insert-technology-here>", 10 real section chips stagger in on "guides"; Git, Shell, Database turn blue as they're spoken | `gasp` on "million" (bottom-left) |
| Outro | `SaveOutro` "free sites" cheat sheet with the 5 URLs, bubble "Which one are you starting tonight?" | `waving-laugh` |
| End card | `EndCard` on "follow", comment on "comment" | avatar `closeup-face` |

## Post
<!-- written by Claude as the last build step, checked by scripts/package.py: see [[Caption and hashtags]] -->
```text
Learn the terminal for free with these 5 sites: no signup, nothing to pay. explainshell explains every flag of a command, OverTheWire Bandit is a Linux game you play over ssh, plus Learn Git Branching, MIT's Missing Semester and build-your-own-x. Which one are you starting tonight? 🦝 #terminal #linux #computerscience #coding
```
- Keyword: learn the terminal
- YouTube title: 5 free sites that teach you the terminal (no signup) #shorts
- Cover: TikTok and Instagram get the video frame at `cover_ms` (4.2s: headline + "No signup, no credit card.", the five-site list and Sudo peeking over it) because Postiz can't send a custom cover; designed covers stay in out/free-learning-sites/ for a manual swap
- Post at: 18:00–21:00

## Results & learnings
- **48h calibration (predicted 27/30):** TT 430 views / 8 saves (1.9%) · IG 4,303 views / 162 saves (3.8%) · YT 304 views. #2 on TikTok and highest save rate on Instagram (3.8%), confirming that curated free learning/repo lists with live demos are save-rate magnets.
