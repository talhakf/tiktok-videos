---
name: remotion-explainer-library
description: Complete 180+ component Remotion library, 104 line icons, Apple-light design system, word-timed caption cue engine, and playbook for building vertical 9:16 technical/developer explainer videos (TikTok, Reels, YouTube Shorts). Use whenever building, designing, or animating scenes in Remotion for technical explainers, CLI/terminal demos, architecture diagrams, network flows, security/cryptography visuals, code diffs, data charts, or porting the library to a new Remotion project.
---

# Remotion Technical Explainer Component Library

A self-contained design system and 180+ component library for building vertical 9:16 technical, developer, and computer science explainer videos in Remotion 4 + React 19.

## 1. Architecture & Core Primitives

| File | Purpose |
| --- | --- |
| `src/theme.ts` | **Apple-light tokens & motion primitives:** palette `C` (`paper: #F5F5F7`, `ink: #1D1D1F`, `mute: #6E6E73`, `accent: #0071E3`, `green: #1D9E5E`, `red: #D93829`, `orange: #E68600`), typography (`sans` Inter 700, `mono` JetBrains Mono), surfaces (`GLASS`, `SHADOW_WINDOW`, `SHADOW_CARD`), and motion (`easeOut`, `easeInOut`, `appleSpring`, `prog`, `materialize`). |
| `src/layout.ts` | **1080×1920 Safe-Area Grid:** `TX = 90`, `TW = 900` (content column), `HEAD_Y = 210` (two-tone headline), `TY = 420`, `TH = 620` (main stage), `BAND = 1075` (callouts, stickers, keys), leaving the bottom 320px (`y >= 1600`) and right 120px (`x >= 960`) clear for captions and platform UI. |
| `src/lib/timing.tsx` | **Word-Anchored Timing:** `makeCues(captions, fps)` turns word-timed Whisper captions (`public/<id>/captions.json`) into frame cues (`cues.at("word", nth)`, `cues.last("follow")`); `<Win at={...} until={...}>` mounts children only during their active window; `<Sfx events={...} />` plays frame-accurate sound effects (`type`, `enter`, `ding`, `pop`, `whoosh`, `kaching`). |
| `src/brand/config.ts` | **Brand Configuration:** `BRAND.name`, `BRAND.handle`, `BRAND.tagline`, `BRAND.avatar`, `BRAND.terminalTitle` — customize once to rebrand `Cover`, `EndCard`, `ProfilePicture`, and `Terminal`. |
| `src/icons/Icons.tsx` | **104 Line Icons:** 2px rounded stroke icons (`<Icon name="lock" size={44} color={C.accent} />`) for diagrams, headers, callouts, and UI cards. |
| `src/library/Library.tsx` | **38 Remotion Studio Showcases:** live animated previews of every component pack under the `<Folder name="Library">` in Remotion Studio (`npm run dev`). |

## 2. Motion & Design Rules (Apple-Light + Emil Kowalski)

1. **Always animate from `useCurrentFrame()`** — CSS transitions/animations do not render in Remotion.
2. **Never scale from 0:** Use `materialize(p, 0.95, 8)` (opacity `0→1`, scale `0.95→1`, blur `8px→0px`).
3. **Curves:**
   - Enter / exit: `easeOut` (`cubic-bezier(0.23, 1, 0.32, 1)`)
   - On-screen movement / gliding: `easeInOut` (`cubic-bezier(0.77, 0, 0.175, 1)`)
   - Springs: `appleSpring(frame, fps, { response: 0.35, damping: 1.0 })` (use `damping: 0.8` only for thrown-in stickers or iMessage bubbles).
   - Never use `ease-in`.
4. **Visual Restraint:**
   - One focal point per beat (highlight with a hand-drawn blue `<Circle>` or frosted-glass `<Note>` / `<IconNote>`).
   - No gradients, no neon glow, no UPPERCASE text, no zero-padded step numbers (`"1/5"`, never `"01"`).
   - Keep a visual change every 2–4 seconds anchored to spoken words.

## 3. Component Packs (35+ Categories, 180+ Components)

Before hand-building any visual for a beat, check [`references/COMPONENT_CATALOG.md`](references/COMPONENT_CATALOG.md) for the exact component, import path, and props:

- **Core Stage (`src/components/`):** `Backdrop`, `Headline`, `ToolHeader`, `Terminal` (`termH`), `Circle`, `Arrow`, `Underline`, `Note`, `IconNote`, `TrashCan`, `Sticker`, `PeekOver`, `SaveOutro`, `Bubble`, `EndCard`, `Cover` (`CoverStill`), `Captions`
- **Windows (`src/components/windows/`):** `BrowserWindow`, `UrlBar`, `Phone`, `SystemPrompt`, `FinderWindow`, `EditorWindow`, `LogoCard`, `MailInbox`, `MailMessage`, `TmuxWindow`
- **Diagrams (`src/components/diagram/`):** `Node`, `Connector`, `Packet`, `Tunnel`, `GitGraph`, `FolderTree`, `StackLayers`
- **Data & Numbers (`src/components/data/`):** `StatCard`, `MetricChange`, `CompareBars`, `Clock`, `Countdown`, `BitRow`
- **Text & Reveal (`src/components/text/`):** `Annotate`, `LetterSplit`, `SecretReveal`, `Highlight`, `QrCode`
- **Layouts (`src/components/layouts/`):** `StackedPanes`, `VsSplit`, `BuildList`, `Verdict`, `OptionPills`, `StepDots`, `CardFan`, `ChipDrop`, `Vanish`, `Spotlight`, `ChatThread`, `Timeline`, `ToggleList`, `Machine`, `PortPanel`, `DataTable`, `Gauge`, `Waveform`, `GuessList`
- **Motion (`src/components/motion/`):** `CameraFrame`, `Crossfade`, `Enter`, `Stagger`, `Typewriter`, `WordSwap`, `Wipe`
- **Charts (`src/components/charts/`):** `LineChart`, `ColumnChart`, `Donut`, `StackedBar`, `Sparkline`, `PollBars`, `HeatmapGrid`
- **UI & Input (`src/components/ui/`):** `KeyCap`, `Shortcut`, `KeyRow`, `Menu`, `CommandPalette`, `ToastStack`, `AlertModal`, `FieldList`, `Spinner`, `Tabs`
- **Code & Dev (`src/components/dev/`):** `CodeBlock`, `DiffView`, `JsonTree`, `HttpExchange`, `LogStream`, `Pipeline`, `ResourceMeters`, `StackTrace`
- **Social & Story (`src/components/social/`):** `CommentCard`, `ChapterCard`, `CalloutBox`, `QuoteCard`, `ProsCons`, `ThoughtBubble`, `PunchWord`, `RankList`
- **27 Domain & Metaphor Packs (`src/components/<pack>/`):**
  - Low-level & Net: `bytes/` (`HexDump`, `MemoryCells`, `PacketHeader`, `AsciiTable`, `StructLayout`), `net/` (`SequenceDiagram`, `DnsLadder`, `IpBreakdown`, `FirewallRules`, `NatTable`), `arch/` (`SqlTable`, `JoinDiagram`, `BTreeIndex`, `CacheTier`, `QueueBuffer`, `LoadBalancer`)
  - CLI, Web & AI: `cli/` (`CmdAnatomy`, `PipeChain`, `PermissionBits`, `CronExpr`, `ProcessTree`), `web/` (`CertChain`, `JwtCard`, `CorsGate`, `CookieJar`, `DomTree`, `BoxModel`), `ai/` (`TokenStream`, `ContextBar`, `PromptChat`, `VectorSpace`, `NeuralLayers`, `TempSlider`)
  - Algorithms, Hardware & Cloud: `algo/` (`ArrayCells`, `BigOChart`, `GraphNet`, `StackFrames`, `HashBuckets`), `hw/` (`CpuCore`, `DiskBlocks`, `RamMap`, `UsbWire`, `BatteryCard`), `cloud/` (`ContainerBox`, `PodCluster`, `EnvVars`, `DockerfileCard`, `SecretVault`)
  - Browser, Parsing & Math: `dom/` (`CssCascade`, `FlexGridBox`, `EventLoop`, `NetworkWaterfall`, `StorageTable`), `parse/` (`RegexMatch`, `AstTree`, `StateMachine`, `DiffHunk`, `GlobFilter`), `math/` (`EquationCard`, `NumberLine`, `MatrixGrid`, `TruthTable`, `CoordinatePlot`)
  - Widgets, Story & Metaphors: `widgets/` (`CalendarSheet`, `SliderControl`, `ColorSwatches`, `NotificationBanner`, `FileCard`), `story/` (`MythFactCard`, `WarningSign`, `StepRecipe`, `ScoreBoard`, `ResourceCard`), `metaphor/` (`LockKey`, `Funnel`, `BalanceScale`, `Magnifier`, `ShieldWall`, `Stopwatch`)
  - Security, Distributed, Debug, Storage, Kernel & Media: `sec/` (`HashAvalanche`, `CipherWheel`, `AttackChain`, `TlsHandshake`, `VaultSafe`), `dist/` (`ConsistentRing`, `RaftTimeline`, `ShardBuckets`, `CircuitBreaker`, `RateBucket`), `debug/` (`BreakpointGutter`, `FlameGraph`, `MemoryHeap`, `WatchTable`, `GitBisect`), `storage/` (`InodeMap`, `LsmTree`, `WalLog`, `RaidArray`, `PageCache`), `kernel/` (`SyscallGate`, `SignalFlow`, `VirtualMemMap`, `RingBuffer`, `FileDescriptors`), `media/` (`ImageGrid`, `ColorCube`, `AudioFrames`, `KeyframeStrip`, `BezierEditor`)
  - Languages, Git, API, Mobile, Metrics & Kinetic: `lang/` (`BorrowChecker`, `GoroutineSched`, `AsyncAwaitTimeline`, `TypeLattice`, `VTableCard`), `git/` (`WorktreeThree`, `RebaseInteractive`, `CherryPickFlow`, `ReflogTimeline`, `SubmoduleTree`), `api/` (`GraphqlQuery`, `GrpcStream`, `WebhookRetry`, `OAuthFlow`, `PaginationCursor`), `mobile/` (`IosPermission`, `PushDrawer`, `GestureCanvas`, `AppSwitcher`, `BiometricPrompt`), `metrics/` (`LatencyHistogram`, `SloBurnGauge`, `TraceSpans`, `KpiQuad`, `UptimeRibbon`), `kinetic/` (`CounterRoll`, `SplitFlap`, `MarqueeBand`, `TextHighlightSweep`, `SpotlightStage`)

## 4. References & Portable Installer

- **Full Component Catalog (exact props & examples):** [`references/COMPONENT_CATALOG.md`](references/COMPONENT_CATALOG.md)
- **Playbook (Design System, Video Format, Hooks, Voice & Captions):** [`references/PLAYBOOK.md`](references/PLAYBOOK.md)
- **Copy Library to Another Remotion Project:**
  Run `bash .agents/skills/remotion-explainer-library/scripts/install_library.sh /path/to/target-remotion-project` to copy `src/theme.ts`, `src/layout.ts`, `src/brand/config.ts`, `src/lib/`, `src/icons/`, `src/components/`, and `src/library/` into any Remotion project.
