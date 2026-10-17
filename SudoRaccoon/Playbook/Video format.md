# Video format

Built from the `short-form-video` + `technical-video-script` skills.

## Tool listicle (best performer for this niche)
1. **Hook (0–3s)** — title on screen from frame 1 ("5 terminal tools. Explained by a raccoon.") + the payoff already visible. No fade-up.
2. **Problem (3–12s)** — Sudo has a relatable problem (3am, grey terminal, deleted snacks). Show, don't tell.
3. **N tools, ~10–15s each** — header `name` + repo + `n/N`; old way (grey) → new way (color) in the same terminal; one focus ring / glass callout per beat.
4. **Outro** — "Save this" card with the one-line install, iMessage bubble asking a question (comment bait), channel handle (`BRAND.handle`).

**Cheat-sheet variant**: built-in commands instead of installs, one problem per command, ending on one screenshot-able card with all N commands. → [[network-commands]], [[slow-computer]].

## Concept explainer
Hook = the surprising claim ("What actually happens when you run curl?"). One idea per beat, motion shows cause → effect, end on a line that loops into the hook. → [[api-curl]], [[qr-bite]], [[dark-web]].

## Quiz
1. Hook: "3 questions. Sudo got 0. Can you get 3?"
2. Per question ~12s: question as a terminal prompt, 3 options as glass pills, 3-2-1 countdown, reveal with a focus ring + one-line why.
3. Outro: "Comment your score" bubble.

## News explainer
Something changed or is about to (release, breaking change): hook on what changes for the viewer, show before/after in the terminal, end with "what you should do". Always verify against the official source and state dates precisely ("coming", not "out"). → [[git-3]].

## Mascot: Sudo
In the Proof of Concept, the raccoon is called **Sudo** (channel: Sudo the Raccoon, `@sudoraccoon`, configurable in `src/brand/config.ts`). Joke: a raccoon with root access, so it gets into everything (trash cans, snack drawers, your laptop).
- In scripts, call the mascot by name ("Sudo's friend wants the café Wi-Fi"). Write plain `Sudo`; if Gemini pronounces it oddly, use `{Sudo|Soo-doo}`.
- Terminal windows show `sudo@laptop: ~` (configurable via `BRAND.terminalTitle` in `src/brand/config.ts`).
- Root/sudo jokes fit (`sudo make me a sandwich`, "permission denied" for snacks), but keep one running joke per video.

## Series
A numbered series gives viewers a reason to follow: e.g. the security & Wi-Fi set ([[phishing-links]], [[wifi-passwords]], [[who-on-wifi]], [[wifi-hacking]]). Put "1/4" style numbering in the hook text and caption (never "01").

## Ending: call to action (every video)
The script's **last line** asks for all three: follow, save, comment. Example: "Save this for your next setup. Follow for more terminal tricks, and comment which tool Sudo missed."
- On screen: the `EndCard` component ([[Components]]): mascot avatar with the TikTok follow badge, a fingertip taps it and the plus turns into a checkmark, then Save and Comment fill in, with the comment question under them. Instagram viewers read the same badge.
- Anchor it to the voice: `at` = `last("follow")`, `save` = the "save" after it (if any), `comment` = `last("comment")` or "tell". It covers the outro and holds ~2.5s after the last word.
- The question matches the iMessage bubble and the caption's question.

## Rules
- One idea per video; **at least 60s, longer is fine** (up to **3:00**, YouTube Shorts limit). Reach the length with real content (a 5th item, a bonus tip, a caveat, an example), never with padded pauses.
- Say the search phrase out loud in the first sentence and show it in the hook text ("show your Wi-Fi password"): TikTok search indexes speech, on-screen text and the caption.
- A visual change every 2–4s (typing, focus ring, mascot sticker, glass note, header swap).
- A running joke per video (snacks, trash, 3am).
- Practical > abstract: installable tools, built-in command cheat sheets, and clear "X vs Y" / "how X works" fundamentals perform best.
- Free-resource lists (sites/repos) drive the highest save rates ([[free-learning-sites]]).
