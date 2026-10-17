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
