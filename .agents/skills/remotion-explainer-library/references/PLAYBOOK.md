# Design system — Apple light

Tokens: `src/theme.ts`. Sources: `apple-design` + Emil Kowalski's `emil-design-eng`, `animate`, `animation-vocabulary`, `review-animations` (project skills).

## Why E (2026-10-10)
The earlier cream + terracotta paper look read as "Claude Code". Six mockups of the same moment:

![[Assets/design/all-styles.png]]

A sticker zine · B notebook · C night shift · D clean studio · **E Apple light (chosen)** · F Apple dark.

- Page `#F5F5F7`, ink `#1D1D1F`, grey `#6E6E73`, one accent **system blue `#0071E3`**.
- Inter 700, tracking −0.045em on big type. Two-tone headlines (ink sentence + grey sentence).
- macOS terminal windows, frosted-glass callouts (`Note`), blue focus rings (`Circle`), iMessage bubble (`Bubble`).
- Raccoons are product shots: soft shadow, no outline, no tilt.
- Sound: one background track, "LoFi Relax" by Kulakovka ([Pixabay](https://pixabay.com/music/lofi-lofi-relax-570489/), Pixabay Content License: no attribution, commercial use OK; `public/music/lofi-relax.mp3`; never credited in captions), mixed by `scripts/render.py` about 15 dB under the voice in pauses and ducked to about 20 dB under while someone speaks; fade in 1s, out 2s. Per video: `music_level:` (e.g. -18 quieter, -11 louder) or `music: none`. Before 2026-10-10: LAKEY INSPIRED "Chill Day" at -11 ([[linux-mistakes]]); the user wanted it quieter and without credits.
- Never: gradients/glow, UPPERCASE, `01`-style numbers (use `1/5`), cream + terracotta (looked like Claude Code).

## Motion (Apple fluid interfaces + Emil Kowalski)
- Enter/exit `easeOut` = cubic-bezier(0.23, 1, 0.32, 1); on-screen moves `easeInOut` = cubic-bezier(0.77, 0, 0.175, 1). Never ease-in.
- `appleSpring` damping 1.0 by default; 0.8 (slight bounce) only for things thrown in (raccoons, bubble).
- `materialize`: opacity + scale 0.95→1 + blur 8→0. Never from scale 0.
- Blur bridges state swaps; the next tool enters from the right, the previous leaves left; the terminal glides instead of cutting.
- 40ms stagger on output lines; no idle bobbing; one focal point per beat.
- Durations: micro (key press) 4 frames; enters 7–12 frames; glides 12 frames.
- Shared elements: the terminal persists and glides between positions instead of cutting.
- Before rendering, review stills against the `review-animations` standards (justified motion, easing, no scale(0), origin, asymmetric press timing, cohesion).

## Profile picture
Bio, name and handle: [[Channel profile]].

![[Assets/brand/profile-picture.png|160]] ![[Assets/brand/profile-picture-light.png|160]]

- **Use:** `Assets/brand/profile-picture.png` (system blue background), 1080×1080; TikTok, Instagram and YouTube crop it to a circle; use the same file on all three. The light version disappears on white feeds, so it is only a spare.
- Same raccoon (`closeup-face`) as the `EndCard` avatar, so the profile and the end of every video match.
- Source: `src/brand/ProfilePicture.tsx` (Remotion stills `ProfilePicture` / `ProfilePictureLight`); re-render with `npx remotion still ProfilePicture SudoRaccoon/Assets/brand/profile-picture.png`.

---

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

---

# Hook library

| Pattern | Template | Raccoon example |
| --- | --- | --- |
| Listicle promise | "N ___ tools, explained by a raccoon." | 5 terminal tools, explained by a raccoon. |
| Contradiction | "___ doesn't ___. It ___." | Shazam doesn't listen to your music. It looks at it. |
| Relatable pain | "Raccoon ___ at 3am and ___." | Raccoon codes at 3 a.m. and deletes his snack list. Forever. |
| Negation | "Stop using ___." | Stop using rm. |
| Stakes | "This one command ___." | This one command deleted Raccoon's whole stash. |
| Question | "What actually happens when ___?" | What actually happens when you press enter on a URL? |

Rules: hook text on screen at frame 1 (most people watch muted); the best frame is frame 0; one open loop only, closed at the end.

---

# Voice and captions

- **Engine:** Gemini 3.8 Flash TTS, voice **Autonoe**, free-tier API key in `.env` (`GEMINI_API_KEY`). Optional backup key `GEMINI_API_KEY_2`: `scripts/tts.py` tries the keys in order and switches automatically when one fails (e.g. daily quota reached).
- **Free-tier daily limit** — one video ≈ one request; don't regenerate for design-only changes.
- `scripts/tts.py <id>` reads `## Script` (and optional `## Voice style`) from `SudoRaccoon/Videos/<id>.md`.
- Pronunciation markup: `{display|spoken}` — captions show `display`, the voice says `spoken`: `{fd|F D}`, `{ls|L S}`, `{btop|B top}`, `{--tree|dash dash tree}`. The **last** `|` splits, so a display may contain a pipe: `{history | grep|history pipe grep}`.
- Flubbed word in the audio? Cut it out of `public/<id>/voice.mp3` with ffmpeg (find the gap with an energy plot) and run `scripts/tts.py --realign <id>`: captions are rebuilt from the existing audio with no TTS request.
- Word timings: faster-whisper `small.en` on CPU, aligned back onto the script (captions always show the script text). Expect "N/M heard words matched" ≥ 95%.
- Whisper sometimes merges two words (one gets 0 ms and/or the same start as the next). `tts.py` spreads those out automatically; for an existing file run `scripts/tts.py --fix-captions <id>` (no TTS request).
- Voice samples: `scripts/tts.py --sample "text" Voice1 Voice2` → `out/voice-samples/`.
- Output: `public/<id>/voice.mp3` + `public/<id>/captions.json`.
- Voice choice: Autonoe picked over Laomedeia, Sulafat, Despina.

---

# Caption and hashtags

Every video ships with a `## Post` section in its note. Claude writes it as the last build step; `scripts/package.py <id>` checks it, copies the caption into the note's `caption:` property (so the [[Home]] tables show it), writes `out/<id>/<id>-caption.txt` and sets `status: ready`.

## Why it matters
TikTok search ranks a video by four things together: caption text, on-screen text, spoken words, and hashtags ([TikTok SEO 2026](https://ttcalculator.net/guides/growth/tiktok-seo-search-ranking/)). Our voice, captions and terminal already say the keywords, so the caption should repeat them in plain sentences.

## Caption
1. **First line = the search phrase + the hook**, inside the first 100 characters. Use the words a viewer would type: "git 3.0", "terminal tools", "undo git commit". Write it as a sentence.
2. **1–2 sentences of context** that name the tools/commands/changes shown. Write in a conversational tone, no keyword lists.
3. **End with the same question as the iMessage bubble** (this is our comment prompt).
4. 150–300 characters before the hashtags (longer captions give search more to work with; only ~150 show before "more").
5. Sentence case, at most one 🦝, no "explained by cats" wording, no hype ("insane", "you won't believe").

## Hashtags: 3–5, never more
TikTok has allowed at most 5 hashtags per post since mid-2025 ([Social Media Today](https://www.socialmediatoday.com/news/tiktok-implements-five-hashtag-limit-per-post/757857/)). 3–5 relevant tags beat stuffing.

| Slot | Pick | Examples |
| --- | --- | --- |
| 1 topic | the exact subject | `#git` `#tmux` `#vim` `#docker` |
| 1–2 niche | the community that searches for it | `#linux` `#terminal` `#linuxcommands` `#devtools` `#bash` |
| 1 broad | the big dev bucket | `#programming` or `#coding` |

- Choose from [[Hashtags]] (refresh with `scripts/hashtags.py`, every 7 days at most): prefer tags with lift ≥ 1.5× and ≥ 3 uses that fit the topic. Current strong fits: `#coding` (3.5×, 29 uses), `#terminal` (5.1×, 3), `#linuxcommands` (6.4×, 2), `#softwareengineer` (2.2×, 25), `#linux` (1.7×, 2 accounts). `#programming` is neutral (1.0×) but huge, so it's a fine broad slot.
- Lowercase only. No `#fyp`/`#viral` (no topic signal), no sponsor or event tags (`#hostinger`, `#defcon`), no `#cat`.
- Never a tag for something the video doesn't show.

## The rest of `## Post`
- **Keyword:** the search phrase (package.py checks it's in the first 100 characters).
- **YouTube title:** the hook as a search phrase, ≤ 100 characters (package.py checks), ending in `#shorts`; written to `out/<id>/<id>-youtube-title.txt`. The caption above is the YouTube description and the Instagram caption too: same text on all three platforms.
- **Cover:** not a video frame but its own design: the `<Name>Cover` still in the video's file (`src/components/Cover.tsx`), 1080×1440 because TikTok's uploaded covers are 3:4 ([RouteNote](https://routenote.com/blog/upload-tiktok-thumbnail/)). Headline = the hook (≤ 2 lines), the payoff visual, the raccoon, chips naming what's inside, everything important between y 180 and 1260. `scripts/render.py` writes `out/<id>/<id>-cover.jpg`; upload it in TikTok Studio (web) → Edit cover → Upload cover. Instagram Reels and YouTube Shorts want 9:16, so render.py also writes `<id>-cover-9x16.jpg` (the same cover on a 1080×1920 page); their profile grids crop it back to the 3:4 middle ([Hopper](https://www.hopperhq.com/blog/instagram-reel-size/)). YouTube lets only Partner Program channels upload custom Shorts thumbnails (since July 2026, [PPC Land](https://ppc.land/youtube-ends-2-year-wait-for-shorts-thumbnails-but-blocks-a-b-testing/)); until then pick a frame.
- **No pinned comment** (user decision 2026-10-11): we don't post or pin our own comment.
- **Post at:** we don't know our best time yet. Default 18:00–21:00 local and write the actual time into `posted`, so [[Log]] can compare later.

## Template
````markdown
## Post
```text
Git 3.0 is coming and it changes three things you type every day. ... Which change breaks your workflow? 🦝 #git #linux #terminal #programming
```
- Keyword: git 3.0
- YouTube title: Git 3.0 changes three things you type every day #shorts
- Cover: out/git-3/git-3-cover.jpg (own design, 1080×1440)
- Post at: 18:00–21:00
````

## Learn from results
`scripts/hashtags.py` also lists our posted videos' tags with views. After ~10 posts, compare our tags' views and update the picks above.

Skills evaluated 2026-10-10 (not installed; their useful parts are folded in here): `coreyhaines31/marketingskills@social` (75K installs, all-platform marketing, conflicts with our rules like trending sounds) and `kostja94/marketing-skills@tiktok-captions` (2.7K, short generic checklist).

## No song names or credits
Never name the background song or add any credit line (🎵, "music by", license notes) to the caption (user decision 2026-10-10, replaces the Chill Day credit line). `package.py` fails if it finds one.

---

# Raccoon assets

Files: `public/raccoon/` (shown here through the `Assets/raccoon` link). Originals: `reference/raccoon-originals/`. Credits / rights: `public/raccoon/CREDITS.md` (confirm usage rights before posting).

| | File | Size | Pose | Good for | Notes |
| --- | --- | --- | --- | --- | --- |
| ![[Assets/raccoon/peek-ledge.png\|90]] | `peek-ledge` | 250×184 | peeks over an edge, paws hang over | hook over the terminal; out of the trash can | small — keep ≤ 300 px wide |
| ![[Assets/raccoon/pointing.png\|90]] | `pointing` | 320×366 | standing, pointing with a pen | explaining a tool | full body |
| ![[Assets/raccoon/sneaking.png\|90]] | `sneaking` | 1400×1018 | lying low, creeping | searching (fd), sneaky tricks | straight right edge → `from="right"` at the screen edge |
| ![[Assets/raccoon/celebrate.png\|90]] | `celebrate` | 330×367 | arms up, green sunglasses | it works / it's back | straight bottom → pop out of something |
| ![[Assets/raccoon/waving-laugh.png\|90]] | `waving-laugh` | 471×469 | waving, laughing | outro, joke landing | straight bottom → `fadeBottom` |
| ![[Assets/raccoon/standing-front.png\|90]] | `standing-front` | 177×307 | standing, scruffy, unsure | problem / confusion | small; full body |
| ![[Assets/raccoon/closeup-sniff.png\|90]] | `closeup-sniff` | 736×676 | nose into the lens | big 'wait what' moment | straight left/right/bottom — full-bleed only |
| ![[Assets/raccoon/closeup-face.png\|90]] | `closeup-face` | 493×432 | calm face close-up | reaction | straight bottom/right — anchor to a screen corner |
| ![[Assets/raccoon/boop-camera.png\|90]] | `boop-camera` | 441×661 | walking into the lens | hook pattern interrupt | full body |
| ![[Assets/raccoon/cool-outfit.png\|90]] | `cool-outfit` | 235×500 | sunglasses, T-shirt, vest | 'he's ready' intro | small |
| ![[Assets/raccoon/scheming.png\|90]] | `scheming` | 200×194 | evil grin, rubbing paws | here's the trick | small, square crop |
| ![[Assets/raccoon/driving.png\|90]] | `driving` | 460×183 | behind a steering wheel | taking control | subject small; straight bottom |
| ![[Assets/raccoon/duo-bowl.png\|90]] | `duo-bowl` | 325×308 | two babies in a bowl | snacks, pairs | full |
| ![[Assets/raccoon/trash-bin.png\|90]] | `trash-bin` | 162×194 | peeks out of a park trash bin's flap | trash jokes, /dev/null, "found it in the trash" ([[free-learning-sites]], [[linux-folders]]) | **small, soft** — ≤ 260 px; straight bottom → stand it on the bottom edge or a ledge |
| ![[Assets/raccoon/peek-paws.png\|90]] | `peek-paws` | 416×307 | face + both paws over an edge, eyes to camera | hook over the terminal (bigger `peek-ledge`) | the straight line under the chin is the ledge: put it on the terminal's top edge, claws hang over |
| ![[Assets/raccoon/head-front.png\|90]] | `head-front` | 670×1020 | floating head, front, long whiskers | masked bandit close-up ([[phishing-links]], [[wifi-passwords]]) | no body: slide in from a screen corner or crop into a circle |
| ![[Assets/raccoon/side-eye.png\|90]] | `side-eye` | 961×720 | suspicious side glance | "wait, that link is fake", doubt, myths | straight bottom → `fadeBottom` or the bottom edge; big |
| ![[Assets/raccoon/peek-pillar.png\|90]] | `peek-pillar` | 189×368 | peeks around a pillar | peeking, "who's watching" ([[phishing-links]]) | small; pillar is a straight right edge → `from="right"` at the screen edge; colour warmed down from yellow |
| ![[Assets/raccoon/duo-stare.png\|90]] | `duo-stare` | 399×361 | two raccoons side by side, staring | "X vs Y" comparisons ([[merge-conflicts]]), pairs | straight left edge → anchor to the left screen edge |
| ![[Assets/raccoon/duo-huddle.png\|90]] | `duo-huddle` | 194×214 | two young raccoons huddled under a third | pairs, "the gang", follow CTA | small |
| ![[Assets/raccoon/gasp.png\|90]] | `gasp` | 673×921 | mouth wide open, paws together | big reveal, "what?!" (the password shows up) | straight bottom + left → bottom-left corner; big |
| ![[Assets/raccoon/oops.png\|90]] | `oops` | 620×853 | both paws over the mouth | oops, "you've been doing it wrong", myths | straight bottom → bottom edge |
| ![[Assets/raccoon/laughing.png\|90]] | `laughing` | 255×226 | laughing, fluffy | joke landing, outro | small; fuzzy fur edge |
| ![[Assets/raccoon/hands-up.png\|90]] | `hands-up` | 249×220 | standing, both paws up | "busted", surrender, "it works!" | small; straight bottom |
| ![[Assets/raccoon/wave-full.png\|90]] | `wave-full` | 284×307 | full body standing, waving, ringed tail visible | hello / outro, EndCard neighbour | small but clean, full body |
| ![[Assets/raccoon/night-snack.png\|90]] | `night-snack` | 633×601 | eating a chip, eyeshine glowing | 3am snack joke, night raids ([[curl-websites]]) | straight bottom → bottom edge |
| ![[Assets/raccoon/crepe.png\|90]] | `crepe` | 414×365 | eating a pancake off a plate | snack reward, "it works" | plate is part of the cut |
| ![[Assets/raccoon/bowl-grab.png\|90]] | `bowl-grab` | 364×551 | grabs food from a bowl | reaching, cherry-pick, "grab the password" | straight left edge → left screen edge; green bowls are loud: keep it small |
| ![[Assets/raccoon/belly-up.png\|90]] | `belly-up` | 426×234 | lying on its back, sprawled | sleeping / exhausted ([[mac-terminal-secrets]] caffeinate) | full outline, no straight edges |
| ![[Assets/raccoon/sleepy-flat.png\|90]] | `sleepy-flat` | 975×526 | lying flat, eyes half shut | tired, 3am, lazy imports | **dark leftover background in the top-left corner**: hide that corner behind a terminal or crop; straight top + left edges |
| ![[Assets/raccoon/ledge-lounge.png\|90]] | `ledge-lounge` | 592×433 | lounging over a ledge, one paw hanging | chill hook over the terminal | cool blue light (slightly corrected); body ends in a straight diagonal → keep it behind a ledge |
| ![[Assets/raccoon/paw-down.png\|90]] | `paw-down` | 372×526 | one paw reaching down from above | paw comes down from the top edge to tap / grab something | straight top → `from="top"` at the screen edge |
| ![[Assets/raccoon/paw-top.png\|90]] | `paw-top` | 223×405 | paw from above, long claws | typing / pointing at a line | small |
| ![[Assets/raccoon/baby-glove.png\|90]] | `baby-glove` | 396×400 | baby raccoon on a leather work glove | beginner videos ([[linux-folders]], [[terminal-basics]]) | the glove is a person's hand: crop to the head and paws when possible; straight bottom |

## Usage notes
These 34 stickers are the Proof of Concept mascot set. When building a new beat, pick the closest pose from this table (e.g. `oops` for a facepalm, `duo-stare` for two characters, `trash-bin` or the drawn `TrashCan` component for trash). To use your own mascot character, place transparent PNG stickers in `public/<your-mascot>/` and update `src/brand/config.ts`.
