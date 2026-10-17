# Components

The shared library every video is built from. All of it lives in `src/` and uses the tokens in `src/theme.ts` (see [[Design system]]).

**Preview everything in Remotion Studio** (`npm run dev`) → folder **Library** (38 compositions total):
- `LibIcons`: every icon (104 icons).
- `LibWindows`, `LibDiagrams`, `LibData`, `LibLayouts`: each component animating, with its name above it.
- `LibMotion`, `LibCharts`, `LibUI`, `LibDev`, `LibSocial`: the general-purpose groups (batch 3, 2026-10-11).
- `LibMore`: batch 2 (2026-10-11): `TmuxWindow`, `ChatThread`, `Waveform`, `Machine`, `GuessList`, `DataTable`, `ToggleList`, `Gauge`, `Timeline`, `PortPanel`.
- **Batch 4–6 (2026-10-14 — 27 new domain & metaphor showcases, 138 new components):**
  - Low-level, Net, DB & CLI: `LibBytes`, `LibNet`, `LibArch`, `LibCLI`, `LibWeb`
  - AI, Algorithms, Hardware, Cloud & Browser: `LibAI`, `LibAlgo`, `LibHardware`, `LibCloud`, `LibDom`
  - Parsing, Math, Widgets, Story & Metaphors: `LibParse`, `LibMath`, `LibWidgets`, `LibStory`, `LibMetaphor`
  - Security, Distributed, Debug, Storage, Kernel & Media: `LibSec`, `LibDist`, `LibDebug`, `LibStorage`, `LibKernel`, `LibMedia`
  - Languages, Git/CI, APIs, Mobile, Metrics & Kinetic: `LibLang`, `LibGit`, `LibApi`, `LibMobile`, `LibMetrics`, `LibKinetic`

Stills: `node scripts/stills.mjs LibDiagrams 119 239` → `out/stills/`.

## Conventions
- **Timing:** every component takes `at` (the frame it enters, from a cue: `T.word`) and usually `until` (the frame it leaves). Extra moments are frame props too (`typeAt`, `pressAt`, `reveal: {index, at}`, `highlight: {…, at}[]`).
- **Position:** `x, y` in page px on the 1080×1920 canvas. Grid in `src/layout.ts`:
  - `TX` 90, `TW` 900: the content column.
  - `HEAD_Y` 210: headline.
  - `TY` 420, `TH` 620: main stage.
  - `BAND` 1075: raccoons, notes and keys.
  - `PANE_1`/`PANE_2`/`PANE_BAND`: two stacked panes.
  - Captions sit at 1340.
- **Exception:** `Node` and `Database` are placed by their **centre**; everything else by its top-left.
- **Motion:** enter with `materialize`, never from scale 0, never ease-in. Section changes get a whoosh (`Sfx`).

## Foundation
| Piece | File | Use |
| --- | --- | --- |
| `Win` | `lib/timing.tsx` | show a beat only inside `[from, to)` |
| `durationFromCaptions(captions, fps, tailMs)` | `lib/timing.tsx` | composition length (last word + end card) |
| `Sfx` | `lib/timing.tsx` | `<Sfx name="whoosh" at={[T.t1, T.t2]} />`: whoosh, mouse-click, switch, ding, kaching at house levels |
| `makeCues(captions, fps).at("word", n)` | `lib/cues.ts` | frame where a word is spoken (lowercase, keeps `a-z 0-9 ' -`) |
| `Headline` | `components/Headline.tsx` | two-tone title (ink + grey line, grey can come later at `bAt`); `at <= 0` = on screen from frame 1 (hook) |
| `Backdrop`, `Captions`, `Cover`/`CoverStill`, `EndCard` | `components/` | page, word captions, 1080×1440 cover, closing CTA (follow, save, comment) |

## Raccoons and callouts (`components/Doodles.tsx`, `PeekOver.tsx`, `SaveOutro.tsx`)
| Component | Use | Key props |
| --- | --- | --- |
| `Sticker` | raccoon product shot | `src, at, until, x, y, w, flip, from: pop / below / right / top, shadow, fadeBottom` |
| `PeekOver` | raccoon rising over an edge (terminal top, can rim, window) | `src, at, until, x, edgeY, w, h, overhang` (render after the window) |
| `Note` / `IconNote` | frosted-glass callout (optional inline `icon` & `tint`) | `at, until, x, y, origin, font: sans / mono, size, icon, tint` |
| `Circle` | blue focus ring | `at, until, x, y, w, h` (from `termRing` / `paneRing`) |
| `KeyCap` | one keyboard key, pressed at `press` | `label, at, press, x, y` |
| `Bubble` | iMessage bubble: blue (asks the viewer), `incoming` grey, `mine` blue tail right | `at, until, x, y, size` |
| `TrashCan` | grey can (lid top `y + 19`, centre `x + 93`) | `at, x, y` |
| `SaveOutro` | the outro: "Save this" + cheat-sheet terminal + waving raccoon + question bubble | `at, lines` (`cheatLines([["rm -rI", "asks first"]])`), `question, sub, h` |
| `SaveHeader` | bookmark + "Save this" alone | `at, x, y, label` |

## Terminal (`components/Terminal.tsx`)
| Piece | Use |
| --- | --- |
| `TermLines` | the typing engine without the window (`blocks, fontSize, bodyH, prompt, cursor`), for custom terminal bodies |
| `Terminal` | macOS terminal that types commands and prints output; smooth scroll. `blocks: {at, cmd?, out?, typeFrames?, outDelay?}[]`, `at`, `until`, `enterAt`, `title`, `prompt` (`">>> "`, `"C:\\> "` or a node), `children` (custom TUI) |
| `termH(rows, fontSize)` | exact pixel height (`Math.ceil(rows * fontSize * 1.38 + 150)`) so every video doesn't re-declare `termH` |
| `dim / red / green / yellow / file / dir` | colored output segments; a `Seg` can have `bg` (+ `square` for QR cells) |
| `termRing(tx, ty, fontSize, line, col, cols, rows)` | focus-ring box around characters (count the 4-column prompt `PROMPT_COLS`); `termColX`, `termLineY` for raw coordinates |
| `ToolHeader` | big tool name (`string` or `React.ReactNode`) + optional `icon` + repo + `n/N`, iOS-push swaps (`tools: {from, name, icon?, repo, n, of}[]`, `until`) |

## Icons (`icons/Icons.tsx`)
`<Icon name="lock" size={64} color={C.ink} draw={prog(frame, T.lock, 14)} />`: 104 hand-drawn line icons on a 24 grid. `draw` 0→1 draws them on.

No brand logos: name tools and OSes in text, or put an official logo file in `public/logos/` and use `LogoCard src`.

The groups (sheet: `LibIcons`):

| Group | Icons |
| --- | --- |
| Security | lock, unlock, key, shield, shieldCheck, fingerprint, mask, eye, eyeOff, bug |
| Network | wifi, wifiOff, globe, cloud, server, database, modem, router, switch, plug |
| Devices & Hardware | laptop, phone, keyboard, disk, chip, cpu, ram, usb, battery, batteryLow, terminal, window, panes, code, cursor |
| Files & Media | folder, file, fileCode, link, clipboard, trash, box, tape, download, upload, qr, archive, image, film, play, pause, scissors |
| Git & Architecture | branch, commit, merge, layers, sitemap |
| Parsing & Math | hash, binary, quote, regex, filter, sliders, scale |
| Status & Actions | check, cross, checkCircle, crossCircle, warning, info, question, plus, minus, arrowRight, arrowDown, trendUp, trendDown, refresh, bolt, sparkle, flame, wrench, magnet, star, bookmark, speech, heart, bell, mail, search, user, users |
| Time and misc | clock, hourglass, calendar, moon, sun, zzz, coffee, house, door, speaker, waveform, pizza |

## Windows and UI (`components/windows/`)
| Component | Use | Key props |
| --- | --- | --- |
| `MacWindow` | light macOS window; base for the others | `x, y, w, h, title, at, until, toolbar, dark, children` |
| `BrowserWindow` | Safari-like window; page = `children` or a screenshot `src` in `public/` | `url, typeAt, loadAt, loadDur, scroll / zoom {to, at, dur}, private, secure` (set `loadAt` after typing ends) |
| `UrlBar` | URL pill; phishing quiz options | `url, x, y, w, size, parts, state: neutral / safe / danger, stateAt, mark {t, at}` |
| `Pointer` | macOS arrow cursor gliding and clicking | `path: {x, y, at, dur?}[], clicks: number[]` |
| `PhoneFrame` + `NotificationBanner` | unbranded phone (use `w` 480–560 when it's the focus) + iOS glass banner | `w, time, dark, children`; banner `app, title, body, icon, at` |
| `SystemPrompt` | macOS "Terminal wants to use your keychain" dialog | `title, message, icon, password, typeAt, cancel, confirm, pressAt, press` |
| `FinderWindow` | Finder icon grid with blue folders | `items: {name, kind: folder / file, at?}[], select: {name, at}[], sidebar` |
| `EditorWindow` | dark code editor (vim, merge conflicts) | `lines, bands: {from, to, color, label, at}[], cursor: {line, col, at}[], status` (lines 1-based, as in the gutter) |
| `TmuxWindow` | tmux in a terminal: panes split on cue (old pane shrinks, new grows in), green active border, green status bar, detach / attach | `panes: {id, blocks, split: {of, dir: right / down, at}}[], focus: {pane, at}[], session, windows, detachAt, attachAt, right` |
| `LogoCard` | big tool/product wordmark card | `name, sub, icon` or `src, glass, size` |
| `MailInbox` + `MailMessage` (`Mail.tsx`) | email inbox: new mail drops in at the top and pushes the rest down, +tag chips, row focus, tag ring; open mail with From/To/Subject and a tinted pill + ring on part of the To address (preview in `LibWeb`) | see `InboxRow` / `MailMark` types in the file |

## Diagrams (`components/diagram/`)
| Component | Use | Key props |
| --- | --- | --- |
| `Node` | diagram box / pill / circle with icon + label (**centre** x, y) | `label, sub, icon, shape, glass, at, state, states: {at, state}[]` (idle, active, dim, error, ok); `anchors(node)` → edges and corners for arrows |
| `Database` | cylinder, same states | `x, y, w, h, label, sub, at, states` |
| `Arrow` | connector that draws on | `from, to, kind: straight / elbow / curve, route: hv / vh / hvh / vhv, bend, dashed, both, label, active` |
| `Packet` | dot or labelled chip riding a path | `path` (`arrowPath(...)`), `at, dur, label, icon, trail, loop, every, reverse` |
| `Tunnel` | VPN tunnel band behind a path (render before the nodes) | `path, at, width, label, lock` |
| `Badge` | icon circle popping onto a node corner | `x, y, icon, tone, at, changes: {at, icon, tone}[]` (eye → eyeOff) |
| `GitGraph` | commit graph (merge, rebase replay, reset) | `commits: {id, lane, label, at, parents}[], branches, head: {commit, at}[], moves (rebase), drop (reset)`; `HEAD` stays uppercase (git's name) |
| `FolderTree` | Linux / ~/.ssh tree with descriptions | `items: {path, desc, file, collapsed}[], highlight: {path, at}[]` |
| `LayerStack` | VM vs container layers, built bottom-up | `layers: {label or label[], icon, at, tone}[], brackets, title` |
| `Machine` | function box: input chip drops in, box works (blue), output prints with scrambling characters; `oneWayAt` = crossed-out arrow back (hashes) | `input, label, output, inAt, outAt, inputLabel, outputLabel, oneWayAt, outSize`; `scrambleText()` for any scramble-in text |
| `PortPanel` | one computer as numbered doors (port, app, green dot); request chips knock (check on open, cross + "connection refused" on closed); `clashes` = "address already in use" | `ports: {port, app, openAt, closeAt}[], knocks: {port, at, label}[], clashes: {port, at, app}[], host, sub` (keep app names short) |
| `CellGrid` / `Pipe` | queue cells filling; tube with blocks sliding in | `rows, cols, fills: {index, at}[]` / `items: {label, at, out?}[]` |

Arrow, Packet and Tunnel each draw a full-canvas SVG layer, so they stack in the order you render them.

## Data (`components/data/`)
| Component | Use | Key props |
| --- | --- | --- |
| `NumberTicker` | count up, or odometer `roll` (inline without x, y) | `to, from, at, dur, roll, decimals, prefix, suffix, unit` |
| `MetricChange` | hook metric "125 ms → 15 ms": the old value is struck through, the new one rolls in | `before, after, at, changeAt, label, unit, good, icon` |
| `BarCompare` | horizontal bars (password crack time by length) | `rows: {label, value, display, highlight}[], log, at, stagger` |
| `ProgressBar` | labelled fill bar | `keys: {at, value}[], label, percent, w` |
| `Countdown` | 3-2-1 ring, then a check | `at, x, y, seconds, size` |
| `Clock` | UTC clock that ticks; `jumpTo` rolls the digits (2038 → 1901) | `start, at, jumpTo {at, value, color}, format, label` |
| `DataTable` | white table card, rows enter one by one, cells tinted bad / warn / good / accent, a blue focus box glides cell to cell or row to row | `header, rows: Cell[][], widths, monoCols, focus: {at, row, col?, cols?}[], align` |
| `Gauge` | half-circle dial (speed test, load, strength): needle + blue arc glide to each value, number counts along | `keys: {at, value, color}[], max, ticks, unit, label, size` |
| `Waveform` | voice bars that move only inside `speak` windows, flat dots otherwise; `pill` = glass + speaker icon | `speak: [from, to][], bars, h, pill` |
| `BinaryRow` | 32 bit cells that flip, sign bit marked | `value, steps: {at, value}[], bits, signed` |

## Text (`components/text/`)
| Component | Use | Key props |
| --- | --- | --- |
| `Annotate` | URL / command with labelled brackets (scheme · subdomain · domain · path) | `text, segments: {from, to, label, at}[], focus {index, at}` |
| `LetterSplit` | word splits into chunks with meanings (g/re/p); `zoom` loupe exposes a look-alike glyph (paypa**1**) | `chunks: {t, meaning}[], splitAt, zoom {index, at, label}` (loupe needs room above) |
| `SecretText` | •••••• → the real text, char by char | `text, at, revealAt, scramble, field, label` |
| `Marker` | highlight / strike / underline drawing on (one line, inline) | `kind, at, dur, color` |
| `GuessList` | password-guess reel: guesses roll and speed up, wrong ones get a red cross, locks on the hit with a green check; header counter (`countTo` 14,344,391) | `words, hit, rate, accel, title, countTo, countLabel, rows` |
| `QrCode` | real, scannable QR card (verified with `zbarimg`) | `text, at, mode: rows / sweep, size, label`; `qrTerminalRows(text)` = the same QR as `Terminal` output (scans in the render) |

## Lists and layouts (`components/layouts/`)
| Component | Use | Key props |
| --- | --- | --- |
| `StackedPanes` / `Pane` / `paneRing` | "3:07 am" terminal on top, "instead" below, top dims | `at, insteadAt, dimAt, top / bottom: {title, blocks, children, prompt}` |
| `VsSplit` | 2–3 column "X vs Y" with winner tick and verdicts | `columns: {label, icon, lines, body}[], at, winner {index, at}, verdicts` |
| `BuildList` | cheat-sheet rows building one by one; `card` = iOS-settings card | `rows: {at, cmd, text, mark, doneAt}[], tone: light / dark, card` |
| `Verdict` | myth (red cross) / fact (green check) stamp | `kind, label, at, x, y, size` (0.6 = corner badge) |
| `OptionPills` | quiz answers a/b/c with pick + reveal (pair with `Countdown`) | `options, at, pick {index, at}, reveal {index, at}` |
| `StepDots` | numbered progress squares (1/5 → 3/5) | `n, steps: number[], label` |
| `CardFan` | hand of cards for a hook, dealt into a list | `cards: {title, sub, icon}[], at, dealAt` (short titles) |
| `ChipDrop` / `FromTrash` | chips glide into the `TrashCan` / pop out of it into a list | `items, at, drop, canX, canY` |
| `Vanish` | chip sucked into `/dev/null` | `at, suck, x, y, holeX, holeY, text, label` |
| `StatBadge` | glass pill: icon + value + label ("552K stars"), optional count-up | `icon, value or count {to}, label, at` |
| `KeyCombo` | ctrl + r, cmd + space, esc : q | `keys, at, press, sep` |
| `ChatThread` | iMessage conversation: grey / blue bubbles, "…" typing bubble before a message, contact header, "Read 3:07 am" | `messages: {at, text, me, typing}[], contact, readAt, size` (text breaks only at `\n`) |
| `Timeline` | axis draws on, events drop on as dots with alternating labels, blue playhead glides between values with its value in a pill | `min, max, events: {value, label, sub, at, side}[], playhead: {at, value, label}[], ticks` (leave ~200 px above and below) |
| `ToggleList` / `Switch` | iOS Settings card with switches that flip on cue | `rows: {label, sub, icon, on, flips: number[]}[], title` |
| `Spotlight` | dims the page except a rounded hole that glides | `regions: {x, y, w, h, at}[], ring` |

Rows in `BuildList` and `OptionPills` have fixed heights, so long text is cut with "…". `VsSplit` clips content taller than `h`.

## Motion and text effects (`components/motion/`)
Preview `LibMotion`. Wrappers take any children. Placement: `x, y` = a box at that page point; `inline` = inside text or a row; neither = a full-canvas layer, so page-positioned children (Terminal, Note) keep their x, y.

| Component | Use | Key props |
| --- | --- | --- |
| `Camera` | zooms / pans the whole stage to a rect on cue ("zoom into this terminal line": a key = `termRing(...)`); `FULL_FRAME` zooms back out. Keep headline and captions outside it | `keys: {at, x, y, w, h, dur}[], dur` (16), `pad` (40) |
| `Swap` | one item at a time in the same place: the old one blurs out, the new one materializes; next enters from the right | `items: {at, node}[], from: right / below / none, until, x, y, w, align` |
| `Enter` | materialize anything at `at`, leave at `until` | `at, until, from: right / left / below / above / none, dist, dur, x, y, inline, origin` |
| `Stagger` | `Enter` on each child, `gap` frames apart (1.2 = 40 ms), as a column, row or page layers | `at, gap, until, direction: column / row / layer, space, from` |
| `Typewriter` | big text typing behind a blue caret; backspaces and retypes ("rm -rf" → "trash") | `text, at, speed, deleteAt, retype, retypeAt, retypeColor, font: sans / mono, size, caret: blink / typing / none` |
| `WordSwap` | inline word rolling through words ("fast → simple → free"); the measured slot width glides so the line slides along | `words: {at, t}[]` (`at` <= 0 = from frame 1), `dur, color, align, until` |
| `Wipe` | reveal with a hard mask edge (left / right / top / bottom, or a circle from a point) | `at, dur, kind, cx, cy, until, x, y, bleed` |
| `TextIn` | sentence materializing word by word (80 ms) or letter by letter (40 ms) | `text, at, by: word / char, gap, colors: {wordIndex: color}, size, w, align` |
| `Move` | shared-element glide: something on screen travels / scales on cue instead of cutting | `keys: {at, x, y, scale, dur}[]` (offsets), `origin` |
| `Shake` | iOS wrong-password shake, once per cue | `at` (number or number[]), `amp, dur` |

`theme.ts` exports `fontsReady()`: await it (with `delayRender`) before measuring text.

## Charts (`components/charts/`)
Preview `LibCharts`. Shared helpers in `charts/chart.ts` (greys, 4 blue steps, `niceScale`, `seeded`).

| Component | Use | Key props |
| --- | --- | --- |
| `LineChart` | trend over time ("startup time", "stars over time"): lines draw on left to right, tip dot + value counting, one series blue, rest grey; `marker` drops a dot + value pill on a point | `series: {label, values, highlight, display}[], xLabels, unit, yLabel, min, max, ticks, drawAt, dur, marker: {at, x, series, label, side}, endW` (x is by index; ≤ 3 series) |
| `ColumnChart` | vertical columns grow from the baseline, staggered, value counts up on each cap; one column blue (from the start or on cue) | `columns: {label, value, display, highlight, at}[], unit, decimals, max, stagger, focus: {index, at}, colW` |
| `Donut` | shares of a whole: ring sweeps in, count-up in the hole, legend with %; the blue slice can pull out | `slices: {label, value, highlight, display}[], size, thickness, center: {value, display, label, unit}, pullAt, pull, legend: right / below / none` |
| `StackedBar` | "where your disk went": one 100% bar fills left to right, % inside wide parts, legend with values | `parts: {label, value, highlight, display}[], title, total, unit, h, dur` |
| `Sparkline` | tiny trend inside a card, pill or table cell (inline without x, y) | `values, w, h, color, stroke, dot, min, max` |
| `PollResult` | "73% got this wrong": bars fill to their share, % counts up, then right = green check, `wrong` = red cross (no answer → top option blue) | `options: {label, value, correct, wrong}[], question, votes, fillAt, markAt, rowH` |
| `ContributionGrid` | weeks × days activity grid (unbranded), fills in 5 blue steps; a streak gets an outline + pill | `weeks, days, values` or `seed, cell, streak: {from, to, at, label}, dayLabels, legend` (18 weeks with labels fit 900 px) |

## App UI (`components/ui/`)
Preview `LibUI`. `ui/shared.tsx` draws ⌘ ⇧ ⌥ ⌃ ↩ ⌫ as SVG (`Glyph`, `Shortcut`), so shortcuts never depend on fonts; write shortcuts lowercase (`"⌘⇧n"`).

| Component | Use | Key props |
| --- | --- | --- |
| `Keyboard` | whole Mac keyboard; keys light blue and press on cue (cmd + shift + 4); lowercase labels or symbols | `press: {key, at, hold}[], highlight: {keys, at, until}[], w` (900 ≈ 380 tall), `fnRow, legend: words / symbol`; key names via `keyId` |
| `ContextMenu` | right-click / dropdown menu: shortcuts, separators, blue hover row glides, chosen row blinks, menu closes | `items: ({label, shortcut, icon, danger, disabled, checked} \| "-")[], hover: {item, at}[], chooseAt, w` |
| `CommandPalette` | Spotlight / command palette: types a query, results filter with the match in bold, top result blue, enter closes | `items: {label, sub, icon}[], query, typeAt, fpc, rows, showAll, select: {index, at}[], enterAt` |
| `Toasts` / `Toast` | macOS notifications sliding in top right, stacking | `toasts: {at, until, app, title, body, icon, tint}[], x, y, w` |
| `Snackbar` | dark pill: "Copied to clipboard" | `text, at, until, x` (centre), `y, icon` |
| `AlertDialog` | "Delete …?" alert, `mac` or `ios`; a button presses on cue, then it closes; destructive = red | `title, message, icon, buttons: {label, kind: default / cancel / destructive}[], press, pressAt, variant, dim` (keychain prompt → `SystemPrompt`) |
| `TextField` | labelled input that types (or dots when masked), focus ring, error (red + message + shake) / ok (green check) | `label, value, placeholder, typeAt, mask, monoValue, icon, focusAt, states: {at, kind, message}[]` |
| `Button` | presses (0.97 + darker), spinner while loading, green done state | `label, kind: primary / secondary / destructive, pressAt, loadAt, loadingLabel, doneAt, doneLabel` |
| `Spinner` / `Skeleton` | macOS spinner (inline without x, y) / grey loading bars that resolve into text | spinner `size, color, at`; skeleton `rows: {w, text, size, mono}[], avatar, resolveAt, card` |
| `SegmentedControl` / `Tabs` | iOS segmented control with a gliding pill / text tabs with a gliding blue underline | `segments` / `tabs`, `initial, select: {index, at}[], w` |

## Dev cards (`components/dev/`)
Preview `LibDev`. Common props: `filename` (tab), `right` (grey text on the tab), `at`, `until`. Highlighter in `dev/syntax.ts` (bash, js, ts, python, json, yaml; one line at a time).

| Component | Use | Key props |
| --- | --- | --- |
| `CodeBlock` | the code card: light or `dark`, syntax colours, line numbers; lines stagger in or type; a tinted band glides between highlighted lines, the rest dims | `code, lang, size, startLine, reveal: {from, to, at}[], type: {from, to, at, cps}[], highlight: {lines, at, until, tone, label}[], dimOthers`; `codeLineY` / `codeColX` to place a `Circle` / `Callout` (≈ 45 columns at 28 px, no wrapping) |
| `DiffView` | unified diff: "-" red, "+" green, "@@" strip, old/new numbers; `applyAt` plays old → new (removed lines strike and collapse, added grow in) | `lines` (diff text), `lang, stagger, numbers, applyAt, settleAt` |
| `JsonTree` | collapsible JSON: chevrons turn, children slide in, collapsed nodes read `{…} 3 keys`, a path highlighted | `data, open: paths[], expand: {path, at, open}[], focus: {path, at, until, tone}[]` (paths `"user.roles.0"`) |
| `HttpExchange` | request card (method, path, headers, body) → dot on the wire → response (status pill, headers, body) + latency | `request: {method, path, headers, body}, response: {status, reason, headers, body}, sendAt, respondAt, latency`; 2xx green, 3xx blue, 4xx/5xx red |
| `LogStream` | live log: time, lowercase level chip (info grey, warn amber, error red), new lines push up | `lines: {at, time, level, text}[], h, focus: {index, at, until, tone}[], dark` (≈ 40 characters at 24 px) |
| `Pipeline` | CI steps as a column or row: pending → running (blue arc) → pass / fail / skip | `steps: {label, sub, startAt, endAt, result, duration}[], dir: column / row` |
| `ResourceMeters` | htop-like CPU cores + mem/swap bars gliding on keys; amber past `warn`, red past `bad` | `cores: Meter[], coreCols, rows: Meter[]` (`{label, keys: {at, value}[], max, display, unit}`), `warn, bad` |
| `StackTrace` | error name in red + message, stack frames (library frames faded), a band picks one | `error, message, frames: {fn, file, line, col, lib}[], format: js / python, focus: {index, at, until, tone}[]` |

## Social and explainer (`components/social/`)
Preview `LibSocial`.

| Component | Use | Key props |
| --- | --- | --- |
| `CommentReply` | "replying to a viewer's comment" hook card (unbranded): avatar initial, handle, comment, hearts; docks into a corner at `dockAt` | `handle, text, likes, meta, label, size, dockAt, dock {x, y, scale}` (scale ≥ 0.6 keeps text ≥ 26 px) |
| `ChapterCard` | section title "1/5" + name + grey line; enters from the right, leaves left; `full` = page-grey sheet over the beat | `title, n, of, sub, full, x, y, size` (chain with `until` = next `at`; render after the beat it covers) |
| `Callout` | glass label with a blue leader line to a point: dot lands, line draws, label materializes | `x, y` (label), `x2, y2` (target), `text, kind: straight / elbow, route, side, font, size` (render after the target) |
| `DocsQuote` | "the official docs say": site + URL, quoted passage, one phrase marked blue, green "verified" | `site, url, quote, highlight, highlightAt, verifiedAt` (quote the real wording; highlight fits one line) |
| `ProsCons` | green checks vs red crosses, items enter one by one | `pros / cons: {text, at}[], titles, layout: columns / stack` (columns: ≤ 18 characters per item) |
| `Checklist` | scorecard: criteria pass (green) or fail (red) on cue, "n/N" counts passes | `items: {text, sub, result: pass / fail, resultAt}[], title, score` |
| `ThoughtBubble` | the raccoon's thought: glass or grey bubble with three dots trailing to the thinker | `x, y, w, tx, ty` (thinker), `text, tone: glass / grey, align, size` (breaks only at `\n`) |
| `PunchWord` | one huge word slams in (scale 1.32 → 1 + blur, no bounce), optional grey second line | `text, b, y, size, color, align` |
| `Reaction` | small white disc "?" / "!" / "+1" popping beside a raccoon with one ripple; `float` drifts up | `x, y` (centre), `glyph, size, color, float, ripple` |
| `Ranking` | ranked rows 1, 2, 3…: cards slide in, reorders glide (the mover lifts over), blue highlight | `items: {id, label, sub, icon, at}[], orders: {at, ids}[], highlight: {id, at}[], rowH` |

## Bytes and low-level internals (`components/bytes/`)
Preview `LibBytes`.

| Component | Use | Key props |
| --- | --- | --- |
| `HexDump` | `hexdump -C` / `xxd` card with synchronized hex + ASCII highlights and magic-byte badges | `bytes, cols, startOffset, highlights: {from, to, at, until, label, tone}[], headerBadge, dark` |
| `ByteMap` | file anatomy & polyglot byte-layout map (JPEG+ZIP polyglots, magic headers, directional readers) | `totalSize, sections: {label, sub, magic, range, share, tone, icon, readDir}[], focus` |
| `InodeMap` | directory entry → inode metadata → disk data blocks (`rm` unlinks pointer, `shred` zeroes blocks) | `filename, inode, size, blocks, unlinkAt, fdProc, shredAt` |
| `ChmodCalc` | interactive Linux permissions calculator (`-rwxr-xr-x` ↔ `755` octal + `Owner/Group/Others` matrix) | `mode, isDir, steps: {at, mode, label, danger}[]` |
| `FloatLayout` | IEEE-754 floating-point binary fraction, 64-bit `sign|exp|mantissa` chop line, and `0.1 + 0.2` reveal | `label, binaryRibbon, repeatChunk, chopAt, sumAt, storedA, storedB, result` |
| `AvalancheGrid` | SHA-256 hash avalanche comparator (`"snacks"` vs `"snackS"` → 50% bits flipped) | `algo, inputA, inputB, hashA, hashB, diffAt, bitsFlipped, totalBits` |
| `LzTokens` | LZ77 lossless compression visualizer (repeated strings morph into `[← back, copy]` pointer chips) | `tokens, compressAt, beforeBytes, afterBytes, title` |

## Networking, protocols and security (`components/net/`)
Preview `LibNet`.

| Component | Use | Key props |
| --- | --- | --- |
| `SequenceDiagram` | 2–3 actor protocol handshake & timeline (`TCP SYN/ACK`, `TLS 1.3`, `OAuth`, dropped packets) | `actors, messages: {from, to, label, sub, at, dur, tone, dashed, lost}[], brackets` |
| `PacketInspector` | Wireshark / `tcpdump` capture table + bottom protocol layer dissection pane | `packets, select: {index, at}[], layers: {title, detail, highlight, tone, icon, at}[]` |
| `JwtCard` | JWT `Header.Payload.Signature` splitter, JSON decoder, and tamper `401 Signature mismatch` verifier | `token, headerJson, payloadJson, signatureLabel, decodeAt, tamper: {at, payloadJson, note}` |
| `NatTable` | router NAT translation (`192.168.1.x → public IP`) or Pi-hole DNS sinkhole (`0.0.0.0 · blocked`) | `title, mode: nat / sinkhole, entries: {left, right, sub, status, at}[]` |
| `CryptoBox` | public/private keypair encryption, digital signing, and passkey origin anti-phishing check | `mode: encrypt / sign, publicLabel, privateLabel, input, transformed, actionAt, verifyAt, originCheck` |
| `UsbPinout` | USB 4-wire cross-section (`VCC`, `D-`, `D+`, `GND`), BadUSB HID keystroke injection, data-blocker shield | `deviceClaim, injectAt, blockDataAt` |

## Databases, architecture and CS (`components/arch/`)
Preview `LibArch`.

| Component | Use | Key props |
| --- | --- | --- |
| `BTree` | 3-level B-Tree database index traversal (`Root → Internal → Leaf → row pointer`) | `root, branches, leaves, searchKey, hopsLabel` |
| `SqlInjectionCard` | live SQL query builder showing `' OR 1=1 --` comment bypass vs parameterized `$1` safe query | `input, typeAt, fpc, explainAt, paramAt` |
| `CacheFlow` | Redis RAM (`0.2 ms`) vs Disk DB (`185 ms`) cache miss, cache hit, and live TTL countdown bar | `cacheLabel, cacheLatency, dbLabel, dbLatency, missAt, hitAt, ttl` |
| `LoadBalancer` | reverse proxy / load balancer distributing requests across backend servers with failover | `proxyLabel, proxySub, servers: {label, sub, crashAt, recoverAt}[], requests, algorithm` |
| `BigOChart` | dedicated `O(1)` vs `O(log n)` vs `O(n)` vs `O(n log n)` vs `O(n²)` complexity chart & op counter | `drawAt, dur, highlight, nValue: {from, to, at, dur}` |

## CLI, shell, Linux and Git internals (`components/cli/`)
Preview `LibCLI`.

| Component | Use | Key props |
| --- | --- | --- |
| `CronCard` | 5-field crontab expression breakdown (`minute`, `hour`, `day`, `month`, `weekday`) + schedule banner | `expr, command, meaning, warn, focusField, steps` |
| `ShellExpand` | Bash/Zsh brace expansion (`cp app.conf{,.bak}`) fanning out into expanded argument tokens | `before, highlightSpan, expandAt, after, sub` |
| `StreamPipes` | Linux file descriptors (`0 stdin`, `1 stdout`, `2 stderr`) and `>` / `2>&1` / `| tee` redirection | `command, operator, stdoutTarget, stderrTarget, flowAt, redirectAt` |
| `GitAreas` | 3-column Git areas (`Working tree` · `Staging index` · `.git repo`) with file moves (`git rm --cached`) | `files: {name, col, status, at, moves}[], actionBanner` |
| `TuiPicker` | interactive `fzf` / `zoxide zi` / `lazygit` terminal fuzzy finder with split diff preview | `title, prompt, query, typeAt, fpc, items, preview` |
| `BatteryTank` | laptop battery status-bar `100%` claim vs real `fullChargeWh / designWh` degraded capacity reveal | `reportedPct, designWh, fullChargeWh, cycles, revealAt` |

## Web, GitHub, Markdown and media (`components/web/`)
Preview `LibWeb` (also previews `MailInbox` and `MailMessage`).

| Component | Use | Key props |
| --- | --- | --- |
| `RepoCard` / `RepoList` | unbranded GitHub repository card (stars, language, license, topics, preview items) & stacked list | `owner, name, desc, stars, lang, license, topics, items` / `repos` |
| `MarkdownCard` | raw GitHub Markdown → rendered preview (`>[!WARNING]`, collapsible `<details>`, `<kbd>`, diff) | `raw, renderAt, kind: alert / details / kbd / diff, alertTone, title, body, openAt, keys` |
| `FfmpegTimeline` | video/audio stream trim timeline (`-ss`, `-to` handles, `-an` audio mute, output size reduction) | `inputName, inputSize, duration, trim, muteAudioAt, output` |
| `ResourceCard` | interactive web tool / CyberChef recipe / security lab step-by-step showcase card | `url, title, category, badge, steps: {label, code, result, ok, at}[]` |

## AI, LLMs and neural networks (`components/ai/`)
Preview `LibAI`.

| Component | Use | Key props |
| --- | --- | --- |
| `TokenizerCard` | subword BPE tokenizer splitting prompts into pastel token chips + vocab IDs + context meter | `prompt, tokens: {text, id, color}[], splitAt, idsAt, contextUsed, contextMax, dark` |
| `StreamingChat` | LLM prompt bubble, collapsible `"Thought for 1.4s"` reasoning trace, token streaming + `tok/s` pill | `prompt, thoughts, thinkAt, thinkDuration, responseTokens, streamAt, tokPerSec` |
| `VectorSpace` | 2D embedding space plotting semantic clusters, query vector arrow, and cosine similarity pills | `points: {label, x, y, cluster, at}[], queryAt, similarities` |
| `NeuralNet` | multi-layer neural network (`Input → Hidden → Output`) with forward-pass pulses & softmax bars | `layers: {label, nodes}[], pulseAt, probabilities, winnerIndex` |
| `SamplingCard` | next-token softmax distribution reshaping with `temperature` (`0.0` greedy vs `1.0` creative) | `promptPrefix, candidates: {token, prob}[], tempFrom, tempTo, tempAt, pickAt, pickedIndex` |

## Algorithms and data structures (`components/algo/`)
Preview `LibAlgo`.

| Component | Use | Key props |
| --- | --- | --- |
| `SortingBars` | animated array sorting & binary-search bar/tile visualizer with gliding swaps & pivot highlights | `values, steps: {at, values, compare, swap, sorted, pivot, low, high, note}[], mode: bars / tiles` |
| `GraphTraversal` | BFS / DFS / Dijkstra graph pathfinding with visited wave, shortest-path highlight & frontier queue | `nodes, edges, visitOrder, pathOrder, mode: bfs / dfs / dijkstra` |
| `HashMapCard` | hash table bucket visualizer (`hash(k) % 6`) showing $O(1)$ lookups and collision chaining | `entries: {key, value, bucket, at}[], lookup: {key, bucket, at}` |
| `StackQueue` | animated `Stack (LIFO)` or `Queue (FIFO)` container with `push`/`pop` ops & `top`/`head`/`tail` pointers | `mode: stack / queue, initial, ops: {at, kind: push / pop, label}[]` |
| `LinkedList` | pointer-based singly linked list (`[val \| next] ──► NULL`) with `slow`/`fast` pointers & node insertion | `values, highlight: {index, at, label}[], insert: {afterIndex, label, at}` |

## Hardware, CPU, memory and OS (`components/hw/`)
Preview `LibHardware`.

| Component | Use | Key props |
| --- | --- | --- |
| `CpuPipeline` | 5-stage CPU instruction pipeline (`Fetch → Decode → Execute → Memory → Write`) + 64-bit registers | `steps: {at, inst, stage, regs, note}[], initialRegs` |
| `MemoryLayout` | virtual memory space (`Stack ↓`, free gap, `Heap ↑`, `.data/.bss`, `.text`) + stack/buffer overflow cue | `pushStackAt, allocHeapAt, overflowAt` |
| `CacheHierarchy` | 5-tier latency & capacity pyramid (`L1 1ns` → `L2 4ns` → `L3 12ns` → `RAM 80ns` → `NVMe 50,000ns`) | `tiers, activeTier: {index, at, note}[]` |
| `ProcessScheduler` | single-core concurrency (time-slicing) vs multi-core parallelism timeline with sweeping playhead | `cores, slices: {core, proc, from, to, tone, at}[], playheadAt, playheadDur` |
| `LogicGates` | IEEE SVG logic gate (`AND`, `OR`, `XOR`, `NAND`, `NOT`) with live wires and cycling Truth Table | `gate, cycleAt, stepFrames` |

## Containers, cloud, Kubernetes and DevOps (`components/cloud/`)
Preview `LibCloud`.

| Component | Use | Key props |
| --- | --- | --- |
| `DockerLayers` | `Dockerfile` stacked layer cache visualizer (`CACHED · 0.0s` vs `invalidateFrom` downstream rebuild) | `layers, cacheHitAt, invalidateFrom: {index, at}` |
| `K8sCluster` | Kubernetes Ingress/Service + Pod grid animating `CrashLoopBackOff`, self-healing, and autoscaling | `serviceName, pods: {name, version, at, crashAt, healAt}[]` |
| `EnvCard` | `.env` environment variables card with secret masking (`••••••••`), reveal, and git leak warning | `env, vars: {key, value, secret, revealAt, leakAt}[], leakBannerAt` |
| `UptimeBar` | 45-bar service heartbeat monitor (`99.98%`) with cascading bars and incident callouts | `service, uptimePct, status, incidents: {index, label, at, kind}[]` |
| `BackoffTimeline` | exponential backoff retry timeline (`1s, 2s, 4s, 8s, 16s`) with arc hops and `200 OK` / `429` outcome | `attempts, outcome: ok / rate_limited, startAt` |

## Frontend, browser engine, DOM and CSS (`components/dom/`)
Preview `LibDom`.

| Component | Use | Key props |
| --- | --- | --- |
| `EventLoop` | JS Event Loop (`Call stack`, `Microtask queue`, `Task queue`, `Console output`) gliding chips across steps | `steps: {at, stack, micro, macro, logs, note}[]` |
| `BoxModel` | concentric CSS Box Model (`margin`, `border`, `padding`, `content`) + `content-box` ↔ `border-box` morph | `width, height, padding, border, margin, borderBoxAt` |
| `FlexPlayground` | live CSS Flexbox container where child items smoothly glide on `justify-content` / `align-items` cues | `items, states: {at, justify, align, gap, rule}[]` |
| `WaterfallChart` | Browser DevTools Network Waterfall (`DNS`, `TCP/TLS`, `Wait TTFB`, `Download` phases + `Load` line) | `requests, maxMs, loadMarkerMs, focus` |
| `StorageTable` | Browser DevTools Storage Inspector (`Cookies` / `LocalStorage` / `SessionStorage`) with security flags | `kind, origin, rows, focus` |

## Regex, compilers, AST and parsing (`components/parse/`)
Preview `LibParse`.

| Component | Use | Key props |
| --- | --- | --- |
| `RegexCard` | Regex101-style pattern matcher with color-coded `/pattern/flags`, match spans, `$1..$3` groups & legend | `pattern, flags, parts, testString, matches, groups, focusPart` |
| `LexerTokens` | compiler lexer slicing source code at `tokenizeAt` into typed token cards (`KEYWORD`, `IDENT`, `OP`) | `code, tokens, tokenizeAt` |
| `AstView` | Abstract Syntax Tree diagram animating bottom-up expression evaluation (`2 * 5 → 10`, `40 + 10 → 50`) | `nodes, rootId, evalAt, stepDur` |
| `StateMachine` | Finite State Machine (FSM) with top input character tape, state transitions, and `Accepted` / `Rejected` | `states, transitions, input, stepAt, fpc` |
| `SemverCard` | Semantic Versioning (`MAJOR.MINOR.PATCH`) splitter and `^` vs `~` candidate version evaluator | `version, splitAt, rangeMode: caret / tilde / both, candidates` |

## Math, numbers, encodings and color (`components/math/`)
Preview `LibMath`.

| Component | Use | Key props |
| --- | --- | --- |
| `BaseConverter` | synchronized 4-base converter (`Decimal`, `Binary` with `2⁷..2⁰` powers, `Hexadecimal`, `Octal`) | `values: {at, num, label}[]` |
| `BitwiseCard` | 8-bit bitwise operator (`AND`, `OR`, `XOR`, `NOT`, `SHL`, `SHR`) evaluating column-by-column | `op, a, b, shift, evalAt` |
| `UnicodeCard` | character/emoji → Unicode code point (`U+1F99D`) → UTF-8 1-to-4 byte hex & binary breakdown | `items: {char, name, codePoint, utf8Hex, bytes, at}[]` |
| `ColorHexCard` | `#RRGGBB` hex color → RGB decimal channels (`0..255`) + base-16 nibble math & live swatch | `hex, name, steps: {at, hex, name}[]` |
| `FormulaCard` | annotated CS/math formula with SVG leader lines to variable pills and solved result at `solveAt` | `title, terms: {sym, label, value, color, at}[], solveAt, substitution, result` |

## Desktop, mobile and modern app widgets (`components/widgets/`)
Preview `LibWidgets`.

| Component | Use | Key props |
| --- | --- | --- |
| `PermissionPrompt` | macOS / iOS privacy dialog (`"app" would like to access your Microphone / Camera / Network`) | `app, permission, variant: mac / ios, explanation, detail, choice: deny / allow, pressAt` |
| `ActivityMonitor` | macOS Activity Monitor window with CPU/Memory tabs, runaway hog selection, and `⊗ Quit process` kill | `processes, selectHogAt, killAt, activeTab` |
| `AudioTrackCard` | audio waveform scrubhead player with live voiceover vs background music auto-ducking dB meters | `title, sub, playAt, playDur, lufs, ducking, dark` |
| `CalendarGrid` | Apple-style monthly calendar grid with animated day marks (cron runs, streaks, backups, releases) | `month, subtitle, daysInMonth, startDay, marks: {day, kind, label, at}[]` |
| `SliderCard` | interactive Apple-style parameter sliders gliding across keyframes with tabular readouts | `title, sliders: {label, unit, min, max, keys: {at, value}[], color, icon}[]` |

## Storytelling, hooks, quizzes and gamification (`components/story/`)
Preview `LibStory`.

| Component | Use | Key props |
| --- | --- | --- |
| `Flashcard` | 3D `perspective: 1400px` flip card (`frontTitle/Code` flips 180° at `flipAt` to `backTitle/Code`) | `frontTitle, frontSub, frontCode, backTitle, backSub, backCode, flipAt, tone, dark` |
| `TierList` | `S / A / B / C / F` 5-row tier board where tool/command chips pop and glide into their tier slots | `title, items: {label, tier, at, mono, icon}[]` |
| `MythFactCard` | high-impact Myth vs Reality card (strikes through myth with red stamp & expands verified fact below) | `myth, mythSub, fact, factSub, proofCode, revealAt` |
| `Scoreboard` | head-to-head multi-round benchmark scoreboard tallying live score (`1 – 3`) as rounds reveal | `leftName, rightName, rounds: {metric, leftVal, rightVal, winner, at}[]` |
| `BentoGrid` | 2-column Apple-style Bento summary board for high-save summary beats and covers | `cells: {title, sub, code, stat, icon, span: 1 / 2, highlight, dark, at}[]` |

## Diagrams and visual metaphors pack 2 (`components/metaphor/`)
Preview `LibMetaphor`.

| Component | Use | Key props |
| --- | --- | --- |
| `VaultSafe` | physical safe / padlock / frosted shutter protecting a secret (`lockAt`, `unlockAt`, `denyAt` shake) | `secretLabel, secretValue, ownerLabel, modeLabel, lockAt, unlockAt, denyAt` |
| `BeforeAfterSlider` | split-curtain comparison card sweeping a vertical divider handle across `beforeNode` and `afterNode` | `beforeNode, afterNode, initialSplit, targetSplit, sweepAt, settleAt` |
| `FunnelStages` | multi-stage filter funnel (`find \| grep \| awk`, firewall, SQL `WHERE`) narrowing to final count | `title, stages: {label, cmd, count, pct, at, highlight}[]` |
| `RadarChart` | 5- or 6-axis spider/radar polygon chart comparing 1 or 2 series across multi-dimensional trade-offs | `axes, series: {label, values, highlight, at}[]` |
| `VennDiagram` | 2-circle Venn diagram lighting up the exact SVG vesica piscis overlap lens at `overlapAt` | `leftTitle, leftItems, rightTitle, rightItems, centerTitle, centerItems, overlapAt` |

## Cybersecurity, red/blue team and exploits (`components/sec/`)
Preview `LibSec`.

| Component | Use | Key props |
| --- | --- | --- |
| `FirewallRules` | ordered `ufw` / `iptables` / WAF rule table stepping an incoming packet down to `matchIndex` | `rules: {priority, action, proto, port, src, note}[], packet: {label, matchIndex, at}` |
| `XSSPlayground` | Cross-Site Scripting raw DOM execution in red vs HTML entity escaping + `CSP` neutralization in green | `payload, unsafeAt, sanitizeAt` |
| `PasswordCracker` | brute-force guess ticker cracking weak MD5/SHA-256 passwords vs Argon2id passphrases holding strong | `entries: {label, mask, hashAlgo, guessesPerSec, timeToCrack, crackedAt, safe}[]` |
| `CorsCard` | browser CORS & preflight `OPTIONS` blocker (`No Access-Control-Allow-Origin`) vs green allowed header | `origin, apiOrigin, endpoint, blockAt, allowAt` |
| `CertChain` | TLS X.509 Chain of Trust (`Root CA → Intermediate CA → Leaf`) with signature verify & `tamperAt` | `certs, verifyAt, tamperAt, tamperReason` |

## Distributed systems and consensus (`components/dist/`)
Preview `LibDist`.

| Component | Use | Key props |
| --- | --- | --- |
| `RaftConsensus` | 5-node Raft cluster pentagon with heartbeats, leader crash (`failAt`), election votes, and WAL log | `failAt, electAt, promoteAt` |
| `CapTriangle` | CAP Theorem triangle (`Consistency`, `Availability`, `Partition tolerance`) + partition cut animation | `partitionAt, highlightMode: CP / AP` |
| `ConsistentHashRing` | `0°..360°` consistent hash ring showing `S4` insertion remapping only ~25% of keys instead of 100% | `addNodeAt` |
| `MessageQueue` | Kafka / RabbitMQ partitioned log streams (`Partition 0..2`) with Producers & Consumer Group offsets | `produceAt, consumeAt` |
| `CircuitBreaker` | microservice Circuit Breaker state machine (`Closed → Open → Half-Open → Closed`) + switch blade | `tripAt, probeAt, recoverAt` |

## Testing, debugging, profiling and observability (`components/debug/`)
Preview `LibDebug`.

| Component | Use | Key props |
| --- | --- | --- |
| `FlameGraph` | CPU profiling flame graph highlighting the wide bottleneck stack frame (`"78% of CPU time"`) | `frames: {level, start, width, fn, selfMs, hotspot}[], hotspotAt, totalMs` |
| `TestRunnerCard` | `vitest` / `jest` / `pytest` runner with pass/fail rows, `- Expected / + Received` diff, and `fixAt` | `suiteFile, tests, fixAt, dark` |
| `StackTraceCard` | minified crash (`bundle.min.js:1:48291`) de-minifying via source maps into clean TypeScript code | `errorName, errorMessage, minifiedTrace, cleanFrames, snippet, sourceMapAt` |
| `BreakpointStepper` | IDE step debugger with red breakpoint dot, gliding yellow execution line, and live `Locals / Watch` | `filename, codeLines, breakpointLine, steps: {at, line, locals, note}[]` |
| `MemoryProfiler` | healthy saw-tooth GC heap curve vs runaway memory leak curve (`leakAt`) with retained object pill | `leakAt, maxGb, leakCallout` |

## Databases and storage engines pack 2 (`components/storage/`)
Preview `LibStorage`.

| Component | Use | Key props |
| --- | --- | --- |
| `AcidTransactions` | SQL `BEGIN → UPDATE → CRASH → ROLLBACK` atomic balance restoration vs `COMMIT` | `crashAt, rollbackAt, commitAt` |
| `JoinVisualizer` | SQL `INNER JOIN` / `LEFT JOIN` / `FULL JOIN` foreign-key connector table with `NULL` padding highlight | `switchAt, fullJoinAt` |
| `MvccTimeline` | Postgres MVCC tuple version chain (`xmin`, `xmax`) showing readers never block writers | `writeAt, readAt, commitAt` |
| `LsmTree` | NoSQL LSM-Tree (`MemTable + WAL → SSTable L0 → L1 → L2` compaction + Bloom filter) | `writeAt, flushAt, compactAt` |
| `RaidArray` | 4-drive `RAID 0 / 1 / 5 / 10` stripe/mirror/parity visualizer with drive failure & parity rebuild | `mode: RAID 0 / RAID 1 / RAID 5 / RAID 10, failAt, rebuildAt` |

## Operating systems, Linux kernel and concurrency (`components/kernel/`)
Preview `LibKernel`.

| Component | Use | Key props |
| --- | --- | --- |
| `SyscallBoundary` | User Space (`Ring 3`) ↔ Kernel Space (`Ring 0`) `syscall` trap (`read(fd, buf, 4096)`) & `sysret` | `trapAt, kernelAt, returnAt` |
| `DeadlockGraph` | `Thread A` / `Thread B` circular mutex wait deadlock (`deadlockAt`) resolved by lock ordering (`fixAt`) | `deadlockAt, fixAt` |
| `PageTableMap` | Virtual Memory → MMU/TLB Page Table → Physical RAM frames + `#PF` Page Fault swap-in (`faultAt`) | `faultAt, swapInAt` |
| `EpollLoop` | C10K thread-per-connection (`10,000 threads · 80 GiB`) vs `epoll / kqueue` `O(active)` event loop | `compareAt` |
| `SignalHandler` | POSIX `SIGINT (2)` and `SIGTERM (15)` graceful `trap` cleanup vs `SIGKILL (9)` kernel-level reap | `sigintAt, sigtermAt, sigkillAt` |

## Graphics, shaders, video and audio engineering (`components/media/`)
Preview `LibMedia`.

| Component | Use | Key props |
| --- | --- | --- |
| `PixelGridZoom` | Raster (`24×24` bitmap pixel stairs + `[R,G,B]`) vs Vector (`SVG` cubic Bézier handles) `8×` zoom | `zoomAt` |
| `FrameRateCompare` | `24 / 30 / 60 / 120 fps` motion tracks + `16.67 ms` VSync frame-time budget bar (`jankAt` spike) | `jankAt` |
| `KeyframeCurve` | `linear` vs `cubic-bezier(0.22, 1, 0.36, 1)` 2D easing graph + robotic vs natural comparison pucks | `sweepAt` |
| `VideoCodecFrames` | video GOP (`I-frame 420 KB` → `P/B-frames 6 KB`) + `dropIframeAt` motion-vector datamoshing | `dropIframeAt` |
| `AudioSamplerCard` | continuous analog wave → `44.1 kHz · 16-bit PCM` sample stems & quantized digital stair-steps | `sampleAt, quantizeAt` |

## Programming languages, type systems and memory safety (`components/lang/`)
Preview `LibLang`.

| Component | Use | Key props |
| --- | --- | --- |
| `BorrowChecker` | Rust ownership move (`let s2 = s1`), shared borrows (`&s`), and mutable borrow conflict (`error[E0502]`) | `moveAt, borrowAt, mutConflictAt` |
| `GarbageCollector` | Mark-and-Sweep GC traversing `Stack Roots → Heap Graph` (`markAt`) and freeing dead islands (`sweepAt`) | `markAt, sweepAt` |
| `TypeLattice` | TypeScript union narrowing (`string \| number \| null` → `string`) through control-flow type guards | `guard1At, guard2At` |
| `ClosureScope` | outer stack frame popping at `returnAt` while inner function retains live heap `Closure { count }` | `returnAt, call1At, call2At` |
| `VTableDispatch` | dynamic dispatch fat pointer (`data_ptr` + `vptr → vtable`) vs monomorphized static dispatch | `dispatchAt, compareAt` |

## Git and CI/CD workflows pack 2 (`components/git/`)
Preview `LibGit`.

| Component | Use | Key props |
| --- | --- | --- |
| `RebaseVsMerge` | `git merge main` (branch diamond + merge commit `M`) vs `git rebase main` (linear replay `F1', F2'`) | `mode: compare / merge / rebase, actionAt` |
| `GitBisectTrack` | `git bisect` binary search halving 16–32 commits (`good` green, `bad` red) to pin the culprit commit | `totalCommits, steps: {index, verdict, at}[]` |
| `ConflictResolver` | 3-way merge conflict editor (`<<<<<<< HEAD` / `>>>>>>> feat`) with `Accept Current / Incoming / Both` | `resolveAt, choice: current / incoming / both` |
| `CiPipelineCard` | GitHub Actions multi-stage DAG (`Build & Lint → Parallel Matrix → Deploy Prod`) with fail/pass states | `stages, failJobId, failAt, fixAt` |
| `ReflogTimeline` | `git reset --hard` orphaned commits rescued via `.git/logs/HEAD` (`git reflog` + `checkout HEAD@{1}`) | `resetAt, reflogAt, restoreAt` |

## API architecture, GraphQL, gRPC and webhooks (`components/api/`)
Preview `LibApi`.

| Component | Use | Key props |
| --- | --- | --- |
| `RestVsGraphql` | 3 sequential REST round-trips with over-fetched fields vs 1 exact GraphQL query (`1.2 KB`) | `restAt, gqlAt` |
| `WebhookFlow` | noisy repeated HTTP polling (`200 pending` × 5) vs event-driven Webhook push (`POST + HMAC`) | `pollAt, pushAt` |
| `GrpcProtobufCard` | verbose JSON (`45 B`) compacting into `.proto` field-tag binary wire bytes (`10 B · 78% smaller`) | `encodeAt` |
| `RateLimiterBucket` | Token Bucket API rate limiter draining tokens on requests (`200 OK`) and rejecting bursts (`429`) | `capacity, refillRate, requests: {at, label}[]` |
| `PaginationCompare` | `OFFSET 100000` (`420 ms` full scan) vs Keyset Cursor pagination (`WHERE id > last_id · 0.3 ms`) | `compareAt` |

## Mobile, iOS/Android and cross-platform UI (`components/mobile/`)
Preview `LibMobile`.

| Component | Use | Key props |
| --- | --- | --- |
| `PushNotificationStack` | iOS/macOS stacked push notification banners springing down from the top with depth | `items: {app, time, title, body, icon, tone, at}[]` |
| `BottomSheetModal` | slide-up Bottom Sheet with grabber pill, detail rows, and Passkey biometric verification ring | `title, subtitle, rows, confirmAt, confirmLabel, dark` |
| `SwipeActionList` | mobile list rows where `swipeRow` slides left to reveal `Delete` / `Block` / `Archive` action tray | `items, swipeRow: {index, at, pressAt, actionLabel, tone}` |
| `SegmentedTabs` | sliding pill Segmented Control cross-fading card views (`title, body, code, stat`) on `switches` | `tabs, switches: {index, at}[]` |
| `BatterySettingsCard` | 24-hour battery activity bars + per-app drain breakdown flagging suspicious background apps | `apps: {name, pct, sub, icon, suspicious}[], highlightAt` |

## Finance, SaaS metrics, benchmarks and charts pack 2 (`components/metrics/`)
Preview `LibMetrics`.

| Component | Use | Key props |
| --- | --- | --- |
| `CandlestickChart` | OHLC financial / latency candlestick chart with `eventCallout` pinpointing a spike or flash crash | `candles, eventCallout: {index, label, sub, at, tone}, invertColors, dark` |
| `CohortHeatmap` | 2D retention / latency / activity heatmap matrix with `highlightCell` callout | `rowLabels, colLabels, values, palette: blue / green / red, highlightCell` |
| `SankeyFlow` | proportional Sankey flow-split diagram (`source` splitting via cubic-Bézier ribbons into `targets`) | `source: {label, total}, targets: {label, value, share, tone}[], focusIndex` |
| `GaugeSpeedometer` | 240° Lighthouse / P99 radial arc gauge (`0..100`) with threshold bands and `FCP/LCP/TBT/CLS` pills | `value, fromValue, sweepAt, metrics` |
| `WaterfallBreakdown` | cumulative bridge / waterfall chart (`Base + ΔA - ΔB = Final Total`) for bundle size, cost, or latency | `steps: {label, delta, unit, isTotal}[], positiveIsGood` |

## Kinetic typography, callouts and micro-animations (`components/kinetic/`)
Preview `LibKinetic`.

| Component | Use | Key props |
| --- | --- | --- |
| `SlotMachineText` | vertical rolling word-wheel headline card (`prefix` + bordered spinning slot window + `suffix`) | `prefix, words: {text, at, tone, sub, icon}[], suffix, label` |
| `SpotlightCode` | code focus & dim-mask inspector gliding a bright spotlight window across line ranges + note badge | `filename, code, lang, focus: {fromLine, toLine, at, note, tone}[]` |
| `SplitFlapBoard` | mechanical airport / cipher split-flap character tiles cycling and locking left-to-right | `target, flipAt, sub, dark` |
| `CalloutLoupe` | magnified command/URL loupe projecting trapezoidal rays from an inline range to a giant zoom card | `sourceText, highlightRange, zoomText, title, bullets, zoomAt` |
| `StepProgressBar` | horizontal/vertical multi-step process tracker filling bars and morphing `done / active / error` icons | `steps: {label, sub, at, status}[], direction: horizontal / vertical` |

## Which piece for which beat
| Beat | Reach for |
| --- | --- |
| Hook with a number | `MetricChange`, `NumberTicker` + `Headline` |
| The relatable problem (someone asks) | `ChatThread` (alone or in a `PhoneFrame`) |
| How something is computed / one-way | `Machine` (hash, encode, compile) |
| Attacks, guessing | `GuessList`, `BarCompare`, `DataTable` (crack-time grid) |
| Ports, localhost, "already in use" | `PortPanel`, `DataTable` |
| Dates, history, "in 2038" | `Timeline`, `Clock` |
| Speed / level | `Gauge`, `ProgressBar` |
| A tool talks (`say`) | `Waveform` |
| Settings to change | `ToggleList`, `BuildList card` |
| tmux, splits, sessions | `TmuxWindow` + `KeyCombo` |
| "X vs Y" | `VsSplit`, `GitGraph` ×2, `duo-stare` raccoon |
| Old way → better way | `StackedPanes` + `Circle` |
| How data moves | `Node` + `Arrow` + `Packet` (+ `Badge`, `Tunnel`) |
| Websites / phishing | `BrowserWindow`, `UrlBar`, `Annotate`, `LetterSplit` zoom, `Verdict` |
| Quiz | `OptionPills` + `Countdown` + `Verdict` |
| Save-able list | `BuildList card`, `SaveOutro` |
| Security reveal | `SecretText`, `SystemPrompt`, `QrCode`, `PhoneFrame` |
| "Look here" | `Circle`, `Spotlight`, `Pointer`, `Marker` |
| Delete / gone | `ChipDrop`, `Vanish`, `TrashCan`, `trash-bin` raccoon |
| Zoom into a detail | `Camera` (+ `Circle`) |
| Rename / replace a word or command | `Typewriter` delete + retype, `WordSwap` |
| Trend over time / before vs after | `LineChart`, `Sparkline`, `MetricChange` |
| Compare a few tools | `ColumnChart`, `BarCompare` |
| Shares of a whole | `Donut`, `StackedBar` |
| "Most people get this wrong" | `PollResult` |
| Habits, streaks, activity | `ContributionGrid` |
| Keyboard shortcuts | `Keyboard`, `KeyCombo`, `ContextMenu` (menu shortcuts) |
| Searching / opening an app | `CommandPalette` |
| "Are you sure?", logins, notifications | `AlertDialog`, `TextField` + `Button`, `Toasts`, `Snackbar` |
| Code, configs, "the bug is here" | `CodeBlock`, `DiffView`, `StackTrace` |
| APIs, logs, CI, "it ate my RAM" | `HttpExchange`, `JsonTree`, `LogStream`, `Pipeline`, `ResourceMeters` |
| Answering a viewer's question | `CommentReply` (docks), then `Headline` |
| List video section changes | `ChapterCard full` or `ToolHeader` |
| Point at part of a screenshot / terminal | `Callout` |
| "The docs say" / proving a claim | `DocsQuote` |
| Judging one thing | `ProsCons`, `Checklist` |
| Raccoon wonders / punchline | `ThoughtBubble`, `Reaction`, `PunchWord` |
| "Best X ranked" | `Ranking` |

## Raccoon tricks
- **Peek over an edge:** use `PeekOver`.
- **Straight-cut bottom edge:** hide it inside something (trash can) or use `fadeBottom={70}`.
- **Straight-cut side or top edge:** align it with the screen edge and use `from="right"` / `from="top"` (`paw-down`).

## Sound effects
`public/sfx/`:
- `whoosh`: section changes.
- `mouse-click`: typed commands.
- `switch`: key presses.
- `ding`: it works.
- `kaching`: the follow tap; built into `EndCard`.

Use `Sfx` for all of them. `kaching` is synthesized in code by `scripts/sfx.py kaching`, so there are no licensing questions; add new sounds there the same way.

New videos import from the library. A full example video built from the library is in git history (`git show eb97c76:src/videos/<id>/…`).
