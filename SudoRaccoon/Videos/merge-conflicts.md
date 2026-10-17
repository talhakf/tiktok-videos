---
id: merge-conflicts
title: "Fix a git merge conflict without panicking"
status: posted
format: concept-explainer
topic: git
tools: [git]
score: 26
voice: Autonoe
music: lofi-relax
duration: 99
composition: MergeConflicts
output: out/merge-conflicts/merge-conflicts-tiktok.mp4
yt_likes: 9
yt_views: 927
youtube_url: https://www.youtube.com/shorts/pnzrCymmqGA
ig_saves: 50
ig_shares: 7
ig_comments: 0
ig_likes: 58
ig_views: 3024
instagram_url: https://www.instagram.com/reel/DehO5KeAFTi/
tiktok_url: https://www.tiktok.com/@sudoraccoon
scheduled: 2026-10-15 17:00
cover: out/merge-conflicts/merge-conflicts-cover.jpg
cover_ms: 5500
caption: "How to fix a git merge conflict without panicking: between <<<<<<< and ======= is your current branch, and between ======= and >>>>>>> is the incoming branch. Delete the markers, run git add and git commit, or git merge --abort to undo it. Do you fix conflicts in your editor or the terminal? 🦝 #git #terminal #softwareengineer #coding"
created: 2026-10-10
posted: 2026-10-15 17:01
url: https://www.tiktok.com/@sudoraccoon/video/7697075345056386337
views: 567
likes: 17
saves: 2
comments: 1
shares: 0
---

# Fix a git merge conflict without panicking

## Promise
What the <<<<<<< ======= >>>>>>> lines mean and the three commands that get you out.

## Why now (evidence)
- The most-liked *request* in 4,173 competitor comments we read: "Kitty please explain merge conflict" (**130 likes**), plus "7 years as a professional dev and I still struggle".
- Autocomplete: "git how to resolve merge conflicts" is the 2nd YouTube completion for "git how to"; YouTube top-5 median 251K (smaller long-form demand, but a real pain).
- coding.kitty7 never answered the request (not in their 200 videos). Git is our best topic so far ([[git-3]]).

## Hook options
- Relatable pain: "Raccoon ran git merge and his file grew arrows."
- Question: "What do these arrows in your code mean?"

## Outline
1. Hook: conflict markers on screen.
2. Why: two branches changed the same line.
3. Read the markers: ours (HEAD) between <<<<<<< and =======, theirs until >>>>>>> (focus rings).
4. Fix: edit the file → `git add file` → `git commit` (or `git merge --abort` to back out). Verify every output on git 2.55.
5. Tip: `git config --global merge.conflictstyle zdiff3` shows the original too (verify).
6. EndCard: comment "editor or terminal?"

### Facts checked (2026-10-13)
Verified locally in a throwaway repo on `git version 2.55.0`:
- Two branches (`main` and `bandit`) starting from commit `993929a` (`1. apples` / `2. crackers` / `3. grapes` in `snacks.txt`). `bandit` changes line 2 to `2. pizza` (`f550390`); `main` changes line 2 to `2. tuna` (`398faef`).
- Running `git merge bandit` on `main` exits 1 and prints:
  ```
  Auto-merging snacks.txt
  CONFLICT (content): Merge conflict in snacks.txt
  Automatic merge failed; fix conflicts and then commit the result.
  ```
- Default conflict markers written to `snacks.txt` (`merge.conflictstyle = merge`, 7-character markers):
  ```
  1. apples
  <<<<<<< HEAD
  2. tuna
  =======
  2. pizza
  >>>>>>> bandit
  3. grapes
  ```
  Between `<<<<<<< HEAD` and `=======` is the current branch (`main` / `HEAD`); between `=======` and `>>>>>>> bandit` is the incoming branch being merged (`bandit`). `git status -s` shows `UU snacks.txt`.
- Resolving in 3 steps: (1) edit `snacks.txt` to the desired lines (`2. tuna + pizza`) and delete the `<<<<<<< HEAD`, `=======`, and `>>>>>>> bandit` lines; (2) `git add snacks.txt` stages the resolution; (3) `git commit` creates the merge commit (`[main 549255e] Merge branch 'bandit'`) with both parents (`398faef` and `f550390`).
- Escape hatch: `git merge --abort` aborts the merge cleanly and restores `snacks.txt` to `main`'s pre-merge content (`1. apples` / `2. tuna` / `3. grapes`).
- Bonus setting: `git config --global merge.conflictstyle zdiff3` adds a `||||||| 993929a` base section between `HEAD` and `=======` showing what the line looked like in the common ancestor before either branch changed it:
  ```
  1. apples
  <<<<<<< HEAD
  2. tuna
  ||||||| 993929a
  2. crackers
  =======
  2. pizza
  >>>>>>> bandit
  3. grapes
  ```

## Raccoon angle
Two raccoons edited the same snack list line: "tuna" vs "pizza"; git refuses to pick and asks you.

## Voice style
Calm, friendly and reassuring, like a senior dev friend talking you off the ledge when your file fills with arrows. Brisk and clear on the three steps, playful on Sudo and Bandit's snack dispute.

## Script
<!-- source of truth for scripts/tts.py. Pronunciation: {display|spoken}, e.g. {fd|F D}, {--tree|dash dash tree}. Last line = CTA: follow + save + comment ([[Video format]] → Ending) -->
Here is how to fix a git merge conflict without panicking, and what those weird arrows in your file actually mean.
Sudo and his friend Bandit are sharing a snack list in {snacks.txt|snacks dot text}. On the main branch, Sudo changes line two to tuna. On another branch, Bandit changes the exact same line to pizza. When Sudo runs git merge bandit, git refuses to guess whose snack wins. Instead, it stops and writes both versions into the file.
Here is how to read the markers. Everything between the seven left arrows, {HEAD|head}, and the seven equals signs is your change on your current branch. Everything between the equals signs and the seven right arrows is their incoming change from the branch you are merging in.
Fixing it takes three steps.
One. Open the file, keep the line you want, or combine both snacks, and delete all three marker lines. No arrows, no equals signs left behind.
Two. Run git add {snacks.txt|snacks dot text}. That tells git you resolved the conflict in that file.
Three. Run git commit to finish the merge.
Panicked and want out? Run git merge {--abort|dash dash abort}, and git puts everything back the way it was before you started.
And one bonus setting: run git config {--global|dash dash global} {merge.conflictstyle|merge dot conflict style} {zdiff3|Z diff 3}. It adds a middle section with seven vertical bars showing what the line looked like originally, before either of you touched it.
Save this for your next merge conflict. Follow for more git tricks, and comment if you fix conflicts in your editor or the terminal.

## Beats
Built 2026-10-13 from the library; every beat anchored to spoken words. Voice: one Gemini request (96.5 s of speech, 254 display words, 258/265 heard words matched). Video 1:39 (99.0 s).

| Beat | Visual | Raccoon |
| --- | --- | --- |
| Hook 0–7.5s | `Headline` "Git merge conflict? / Fix it without panicking." + `EditorWindow` (`snacks.txt`) showing `<<<<<<< HEAD`, `=======`, `>>>>>>> bandit` with tinted `HEAD (yours)` / `bandit (theirs)` bands from frame 0; mono note `<<<<<<< HEAD · ======= · >>>>>>>`; at "weird"/"arrows" three `Circle` rings highlight the marker lines + `IconNote` "What do these weird arrows actually mean?" | `peek-paws` over the editor |
| Story: two branches 7.5–20.3s | `Headline` "Two branches, same line. / tuna vs pizza in snacks.txt"; `GitGraph` (`993929a · crackers` splits into `398faef · 2. tuna` on `main` and `f550390 · 2. pizza` on `bandit`); base `CodeBlock` swaps to side-by-side `main · Sudo` and `bandit · Bandit` code cards highlighting line 2; notes "Sudo + Bandit share snacks.txt" → "Both edited line 2: tuna vs pizza" | `duo-stare` at left edge |
| Story: git merge 20.3–28.7s | `Headline` "git merge bandit / Git refuses to guess."; `Terminal` types `git merge bandit` → real git 2.55 output `Auto-merging snacks.txt` / `CONFLICT (content): Merge conflict in snacks.txt` (ring) / `Automatic merge failed; fix conflicts and then commit the result.` (ring); notes "Git won't guess whose snack wins." → "Stops and writes both versions into snacks.txt" | `gasp` at "refuses" |
| Read the markers 28.7–45.6s | `Headline` "How to read the markers / Yours on top, theirs below."; `EditorWindow` lights up bands on cue: blue `yours · HEAD (main)`, yellow `divider`, green `theirs · bandit`; focus rings step from `<<<<<<< HEAD` → `=======` → lines 2–3 → `>>>>>>> bandit` → lines 5–6; notes explain top = your change (current branch), bottom = their change (incoming branch) | `pointing` at "your" |
| 1/3 edit snacks.txt 45.6–57.3s | `Headline` "Fix it in 3 steps." then `ToolHeader` `1/3 edit snacks.txt`; `DiffView` (`snacks.txt`) shows the 5 conflict lines in red, strikes and collapses them on "delete" into `+2. tuna + pizza`, and settles into the clean 3-line file on "No arrows"; notes "Keep the line you want, or combine both snacks" → "Delete all 3 marker lines" → "No arrows or equals signs left behind" | `duo-bowl` at "combine" |
| 2/3 & 3/3 git add + commit 57.3–67.6s | `ToolHeader` `2/3 git add` → `3/3 git commit`; `Terminal` runs `git add snacks.txt`, `git status -s` → `M  snacks.txt` (ring), then `git commit` → `[main 549255e] Merge branch 'bandit'` (ring); `GitGraph` below draws the merge commit `549255e · merged` joining both branches and glides `main` + `HEAD` onto it | `celebrate` at "finish" |
| Escape hatch: --abort 67.6–75.0s | `Headline` "Panicked and want out? / --abort undoes the merge."; `Terminal` runs `git merge --abort` (ring), then `cat snacks.txt` → `2. tuna` (ring); notes "Aborts the merge immediately" → "Back to how it was before you started" | `hands-up` at "panicked" |
| Bonus: zdiff3 75.0–90.1s | `Headline` "Bonus: turn on zdiff3 / See the original line too."; `Terminal` types `git config --global merge.conflictstyle zdiff3`; `EditorWindow` (`snacks.txt · zdiff3`) reveals the middle `||||||| 993929a` / `2. crackers` section with an `original (crackers)` band and focus ring; `IconNote` "||||||| = what line 2 looked like before either edit" | `scheming` at "zdiff3" |
| Save 90.1–92.3s | `SaveOutro` cheat sheet (`<<<<<<< to =======`, `======= to >>>>>>>`, `git add + commit`, `git merge --abort`, `...conflictstyle zdiff3`) + bubble "Editor or terminal?" | `waving-laugh` |
| End 92.3–99.0s | `EndCard` follow tap, save, comment "Do you fix conflicts in your editor or the terminal?" | `closeup-face` avatar |

## Post
<!-- written by Claude as the last build step, checked by scripts/package.py: see [[Caption and hashtags]] -->
```text
How to fix a git merge conflict without panicking: between <<<<<<< and ======= is your current branch, and between ======= and >>>>>>> is the incoming branch. Delete the markers, run git add and git commit, or git merge --abort to undo it. Do you fix conflicts in your editor or the terminal? 🦝 #git #terminal #softwareengineer #coding
```
- Keyword: git merge conflict
- YouTube title: How to fix a git merge conflict without panicking #shorts
- Cover: TikTok and Instagram get the video frame at `cover_ms` (5.5s: hook headline, snacks.txt conflict editor with all three marker lines ringed, Sudo peeking over the window, and the question callout) because Postiz can't send a custom cover; designed covers stay in out/merge-conflicts/ for a manual swap
- Post at: 2026-10-15 17:00

## Results & learnings
- **48h calibration (predicted 26/30):** TT 567 · IG 2,636 · YT 924 views (TT 0.4% · IG 1.9% saves). Solid reach across all three (2.6K IG, 924 YT); Git explainers consistently perform on IG & YT.
