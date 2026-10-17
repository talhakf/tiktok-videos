# Sudo the Raccoon — Technical Short-Video Pipeline & Remotion Component Library (Proof of Concept)

> **Status: Completed Proof of Concept (Open Source)**
> This project (**Sudo the Raccoon** / `@sudoraccoon`) was built as a 6-day Proof of Concept (Oct 11–17, 2026) to test whether an AI-assisted, code-driven pipeline (**Obsidian + Claude Code + Remotion + Gemini TTS + faster-whisper + Postiz**) can autonomously producevertical 9:16 developer & terminal explainers that resonate with real viewers on TikTok, Instagram Reels, and YouTube Shorts.
>
> **The `@sudoraccoon` channels stay online as a live showcase** ([TikTok](https://www.tiktok.com/@sudoraccoon) · [Instagram](https://www.instagram.com/sudoraccoon/) · [YouTube](https://www.youtube.com/@sudoraccoon)), though no further videos are being uploaded to them. The entire codebase — including all **18 published PoC videos**, the **180+ Remotion Component Library**, the **Obsidian Vault & Playbook**, the **Python automation scripts**, and **Claude Code Skills** — is open-sourced here so you can inspect the results or run your own channel **under your own name and branding**.

---

## Proof of Concept Results (6 Days · 18 Videos)

Between **2026-10-11 and 2026-10-17**, 18 videos were produced and published across all three platforms using this pipeline:

| Platform | Live Channel | Videos | 6-Day Views | Follower / Sub Growth (6 Days) | Highlights |
| --- | --- | ---: | ---: | ---: | --- |
| **Instagram Reels** | [@sudoraccoon](https://www.instagram.com/sudoraccoon/) | 18 | **222,627** | **0 → 2,020** (+2,020) | **4,797 likes · 2,712+ saves** · `mac-terminal-secrets` (**104.2K views**, **2,210 likes**), `git-3` (**41.2K views**, **584 likes**), `curl-websites` (**19.4K views**, **962 saves / 5.0%**), `who-on-wifi` (**11.3K views**, **481 saves**) |
| **YouTube Shorts** | [@sudoraccoon](https://www.youtube.com/@sudoraccoon) | 18 | **14,566** | **+60** new subs | **302 likes** · Consistent 1.2K–1.4K Shorts feed reach (`linux-folders` **1,372**, `linux-mistakes` **1,307**, `network-commands` **1,307**, `wifi-hacking` **1,294**, `git-3` **1,280**) |
| **TikTok** | [@sudoraccoon](https://www.tiktok.com/@sudoraccoon) | 18 | **13,533** | **0 → 107** (+107) | **641 likes · 287 saves** (`linux-mistakes` **3,562 views / 89 saves**, `terminal-basics` **1,183 views**, `api-curl` **1,056 views**, `curl-websites` **5.3% save rate**) |
| **Total (6 Days)** | **All 3 Platforms** | **18** | **250,726** | **+2,187** | **5,740 likes · 2,999+ saves** · Breakout **104K+ view** Reel & up to **5.3% save rate** |

### Per-Video Breakdown (All 18 Published PoC Videos)

| Video ID | Topic / Hook | Instagram Views (Likes / Saves) | TikTok Views (Saves %) | YouTube Views | Key Takeaway |
| --- | --- | --- | --- | --- | --- |
| [`mac-terminal-secrets`](src/videos/mac-terminal-secrets/) | 5 Mac terminal commands Apple doesn't advertise | **104,227** (**2,210 likes**) | 311 (1.6%) | 356 | **#1 overall breakout hit (104.2K IG views)** — built-in macOS commands (`caffeinate`, `networkQuality`, `say`, `pbcopy`, `open .`) |
| [`git-3`](src/videos/git-3/) | Git 3.0 changes 3 things you type every day | **41,199** (**584 likes** / 282 saves / 159 shares) | 180 (3.6%) | **1,280** | **#2 overall reach** — Git deep-dives with side-by-side terminal proof explode on Reels & Shorts |
| [`curl-websites`](src/videos/curl-websites/) | 5 websites you can run with `curl` | **19,388** (**629 likes** / **962 saves · 5.0%**) | 586 (**5.3%**) | 32 | **Highest save rate across platforms** — zero-install `curl` tricks drive massive bookmarks |
| [`who-on-wifi`](src/videos/who-on-wifi/) | See every device on your Wi-Fi from the terminal | **11,274** (**277 likes** / **481 saves · 4.3%**) | 663 (3.3%) | 564 | Home network diagnostics consistently convert viewers to saves & follows |
| [`linux-folders`](src/videos/linux-folders/) | Every folder in Linux `/` explained | **6,785** (235 likes / 217 saves · 3.2%) | 633 (2.8%) | **1,372** | Visual folder-tree map + cheat sheet is a top evergreen format across all 3 platforms |
| [`network-commands`](src/videos/network-commands/) | 5 built-in networking commands | **5,398** (129 likes / 182 saves · 3.4%) | 899 (**3.8%**) | **1,307** | Built-in cross-OS commands outperform third-party installs |
| [`free-learning-sites`](src/videos/free-learning-sites/) | Free sites to learn CS, Linux & Git | **5,020** (92 likes / 163 saves · 3.2%) | 448 (1.8%) | 362 | Curated free-resource drops reliably drive high save rates |
| [`wifi-hacking`](src/videos/wifi-hacking/) | How Wi-Fi passwords actually get cracked | **3,582** (83 likes / 104 saves · 2.9%) | 507 (1.0%) | **1,294** | Strong cross-platform reach with GPU hash-rate math + defense steps |
| [`merge-conflicts`](src/videos/merge-conflicts/) | Git merge conflicts explained simply | **3,024** (+2,656) (115 likes / 50+ saves) | 993 (combined) | 927 | Visual 3-way merge diagram + live resolution in terminal |
| [`wifi-passwords`](src/videos/wifi-passwords/) | Show any saved Wi-Fi password with 1 command | **2,828** (46 likes / 56 saves) | 393 (1.5%) | 508 | First PoC video — Mac, Linux & Windows one-liners |
| [`linux-mistakes`](src/videos/linux-mistakes/) | Linux commands that can ruin your day | **2,795** (83 likes / 54 saves) | **3,562** (2.5% / 89 saves) | **1,307** | **#1 TikTok outlier** — wrong-way vs. right-way split terminal panes |
| [`email-plus`](src/videos/email-plus/) | The Gmail `+` trick that shows who sold your email | **2,611** (63 likes / 25 saves) | 94 (1.1%) | 732 | Privacy tricks perform notably better on Reels & Shorts than TikTok |
| [`slow-computer`](src/videos/slow-computer/) | Why is my computer slow? (Terminal check) | **2,538** (54 likes / 68 saves) | 575 (2.8%) | **1,221** | Practical troubleshooting cheat sheet performs evenly on all 3 platforms |
| [`terminal-basics`](src/videos/terminal-basics/) | Terminal basics in 60 seconds | **2,449** (72 likes / 53 saves) | **1,183** (2.3%) | 582 | Beginner-friendly command walkthroughs perform strongly on TikTok |
| [`api-curl`](src/videos/api-curl/) | What an API is, shown with one `curl` | **2,084** (42 likes / 28 saves) | **1,056** | 933 | Live GitHub REST API request + JSON tree inspection |
| [`phishing-links`](src/videos/phishing-links/) | Spot a fake link in 3 seconds | **1,714** (31 likes / 21 shares) | 171 | 173 | Security awareness drives shares over bookmarks |
| [`qr-bite`](src/videos/qr-bite/) | How QR codes still scan with a bite missing | **1,602** (31 likes / 16 saves) | 825 | 703 | Real Reed-Solomon error correction with a scannable bitten QR code |
| [`dark-web`](src/videos/dark-web/) | How Tor and `.onion` routing actually work | **1,453** (21 likes / 15 saves) | 454 | 913 | 3-hop onion encryption diagram + circuit visualization |

Full details and per-video notes live in [`SudoRaccoon/Channel stats.md`](SudoRaccoon/Channel%20stats.md), [`SudoRaccoon/Playbook/Scoring.md`](SudoRaccoon/Playbook/Scoring.md), and [`SudoRaccoon/Videos/`](SudoRaccoon/Videos/).

---

## What's Inside

| Path | Description |
| --- | --- |
| [`SudoRaccoon/`](SudoRaccoon/) | **Obsidian Vault** (single source of truth): [`Home.md`](SudoRaccoon/Home.md), [`Guide.md`](SudoRaccoon/Guide.md), [`Channel stats.md`](SudoRaccoon/Channel%20stats.md), [`Playbook/`](SudoRaccoon/Playbook/) (design system, 180+ component catalog, video formats, hook library, scoring rubric, workflow), and the 18 published PoC video notes in [`Videos/`](SudoRaccoon/Videos/). |
| [`src/components/`](src/components/) | **180+ Reusable Remotion Components** across 35+ categories (`windows/`, `diagram/`, `data/`, `text/`, `layouts/`, `motion/`, `charts/`, `ui/`, `dev/`, `social/`, plus 27 domain & metaphor packs: `bytes/`, `net/`, `arch/`, `cli/`, `web/`, `ai/`, `algo/`, `hw/`, `cloud/`, `dom/`, `parse/`, `math/`, `widgets/`, `story/`, `metaphor/`, `sec/`, `dist/`, `debug/`, `storage/`, `kernel/`, `media/`, `lang/`, `git/`, `api/`, `mobile/`, `metrics/`, `kinetic/`). |
| [`src/library/`](src/library/) | **38 Remotion Studio Showcases** previewing every component pack and the 104 custom line icons ([`src/icons/Icons.tsx`](src/icons/Icons.tsx)). |
| [`src/videos/`](src/videos/) | **18 Published Proof-of-Concept Videos** with full Remotion scenes and custom covers. |
| [`src/brand/config.ts`](src/brand/config.ts) | **Central Brand Configuration** — change your channel name, `@handle`, closing tagline, avatar, and terminal title in one place. |
| [`scripts/`](scripts/) | **Python & Node Automation Pipeline**: `new_video.py` (scaffold), `tts.py` (Gemini TTS + faster-whisper word-level caption alignment), `stills.mjs` (fast frame previews), `render.py` (render + `-14 LUFS` audio mastering + 3:4 & 9:16 covers), `package.py` (QC checks), `publish.py` / `postiz.py` (optional Postiz multi-platform upload), `research_ideas.py` & `hashtags.py` (keyless trend/competitor research). |
| [`public/`](public/) | Per-video voiceovers & word-timed captions (`public/<id>/`), 34 transparent raccoon stickers (`public/raccoon/`), UI sound effects (`public/sfx/`), and background music (`public/music/lofi-relax.mp3`). |
| [`.claude/skills/`](.claude/skills/) & [`.agents/skills/`](.agents/skills/) | **13 Claude Code Skills** including `remotion-explainer-library` (standalone component library + playbook skill with portable installer), `sudo-raccoon` (video pipeline skill), `sudo-raccoon-ideas` (research skill), plus Apple design, motion, and Remotion best-practice skills. |

---

## Quick Start

### 1. Clone & Run Setup
```bash
git clone https://github.com/talhakf/tiktok-videos.git
cd tiktok-videos
bash scripts/setup.sh
```
`scripts/setup.sh` installs missing system dependencies (`node`, `python3`, `ffmpeg`, `yt-dlp` via `pacman`, `brew`, or `apt`), runs `npm ci`, creates `.venv` with Python packages (`faster-whisper`, `requests`), links all Claude skills into `~/.claude/skills/`, and creates `.env` from `.env.example`.

### 2. Configure `.env`
Add your free-tier Gemini API key (from [Google AI Studio](https://aistudio.google.com)) to `.env`:
```dotenv
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Open Remotion Studio & Obsidian
- **Preview all 18 PoC videos & 38 Component Library showcases in Remotion Studio:**
  ```bash
  npm run dev
  ```
- **Open the Vault in Obsidian:**
  Open the [`SudoRaccoon/`](SudoRaccoon/) folder as a vault in [Obsidian](https://obsidian.md) and start at `Home.md` or `Guide.md`.

---

## Using This Project Under Your Own Name & Brand

This repository is published as a Proof of Concept. If you want to create and publish your own videos using this system, **please use your own channel name, handle, and branding**:

1. **Edit [`src/brand/config.ts`](src/brand/config.ts):**
   ```ts
   export const BRAND = {
     name: "Your Channel Name",
     handle: "@yourhandle",
     tagline: "Follow for more dev explainers.",
     avatar: "raccoon/closeup-face.png", // or your own mascot in public/
     terminalTitle: "dev@laptop: ~",
   } as const;
   ```
   Every `Cover`, `EndCard`, and `ProfilePicture` automatically uses `BRAND`.
2. **Update `.env`:**
   ```dotenv
   CHANNEL_HANDLE=yourhandle
   CHANNEL_NAME="Your Channel Name"
   ```
3. **Mascot Assets:**
   Replace or add your own mascot PNG stickers in `public/` (please check [`public/raccoon/CREDITS.md`](public/raccoon/CREDITS.md) before publishing any included stickers).

---

## Using the Component Library as a Standalone Claude Skill

The entire 180+ Remotion Component Library and Playbook are packaged as a portable skill in [`.agents/skills/remotion-explainer-library/`](.agents/skills/remotion-explainer-library/):

- **`SKILL.md`** — Architecture, Apple-light tokens, 1080×1920 safe-area grid, word-anchored timing (`makeCues`), and motion rules.
- **`references/COMPONENT_CATALOG.md`** — Complete documentation and prop signatures for all 180+ components and 104 icons.
- **`references/PLAYBOOK.md`** — Consolidated design system, video formats, hooks, voice markup (`{display|spoken}`), and caption rules.
- **Portable Installer (`scripts/install_library.sh`):** Copy the entire component library (`src/theme.ts`, `src/layout.ts`, `src/brand/`, `src/lib/`, `src/icons/`, `src/components/`, `src/library/`) into any other Remotion project:
  ```bash
  bash .agents/skills/remotion-explainer-library/scripts/install_library.sh /path/to/your-remotion-project
  ```

---

## Production Workflow (CLI)

```bash
# 1. Scaffold a new video (vault note + Remotion composition + Root.tsx registration)
.venv/bin/python scripts/new_video.py my-topic "5 terminal tricks you should know"

# 2. Write ## Script in SudoRaccoon/Videos/my-topic.md, then generate TTS + Whisper word captions
.venv/bin/python scripts/tts.py my-topic

# 3. Build scenes in src/videos/my-topic/ and verify still frames
node scripts/stills.mjs MyTopic 30 300 600 900

# 4. Render video, mix background music (-14 LUFS), and generate 3:4 + 9:16 covers -> out/my-topic/
.venv/bin/python scripts/render.py my-topic

# 5. Validate caption, hashtags, and output specs
.venv/bin/python scripts/package.py my-topic
```

---

## Included Claude Skills & Credits

This repository bundles **3 custom skills** created specifically for this project alongside **10 community skills** (tracked in [`skills-lock.json`](skills-lock.json)) discovered and installed via the [Skills CLI](https://github.com/vercel-labs/skills):

### Original Project Skills
| Skill | Path | Purpose |
| --- | --- | --- |
| **`remotion-explainer-library`** | [`.agents/skills/remotion-explainer-library/`](.agents/skills/remotion-explainer-library/) | Standalone 180+ Remotion Component Library, 104 line icons, Apple-light design system, word-timed caption engine, playbook & portable installer |
| **`sudo-raccoon`** | [`.claude/skills/sudo-raccoon/`](.claude/skills/sudo-raccoon/) | End-to-end 9:16 explainer production workflow (script → Gemini TTS + Whisper captions → Remotion scenes → render → QC) |
| **`sudo-raccoon-ideas`** | [`.claude/skills/sudo-raccoon-ideas/`](.claude/skills/sudo-raccoon-ideas/) | Keyless developer topic research across YouTube, Hacker News, GitHub Trending & Reddit |

### Third-Party Community Skills (Credits)
All third-party skills in [`.agents/skills/`](.agents/skills/) are the work of their respective authors and remain under their upstream licenses:

| Skill(s) | Author / Maintainer | Upstream Repository |
| --- | --- | --- |
| `animate`, `animation-vocabulary`, `apple-design`, `emil-design-eng`, `review-animations` | **Emil Kowalski** ([@emilkowalski](https://github.com/emilkowalski)) | [`emilkowalski/skills`](https://github.com/emilkowalski/skills) |
| `remotion-best-practices` | **Remotion** ([@remotion-dev](https://github.com/remotion-dev)) | [`remotion-dev/skills`](https://github.com/remotion-dev/skills) |
| `caption-animation`, `short-form-video` | **iart-ai** ([@iart-ai](https://github.com/iart-ai)) | [`iart-ai/tiktok-video-skills`](https://github.com/iart-ai/tiktok-video-skills) |
| `motion-art-direction` | **iart-ai** ([@iart-ai](https://github.com/iart-ai)) | [`iart-ai/motion-design-skills`](https://github.com/iart-ai/motion-design-skills) |
| `technical-video-script` | **Samuel Berthe** ([@samber](https://github.com/samber)) | [`samber/developer-relations-skills`](https://github.com/samber/developer-relations-skills) |

---

## License

- **Code, Remotion Component Library, Playbook & Automation Scripts:** [MIT License](LICENSE) © Talha Karanfil.
- **Third-Party Skills & Assets:** Community skills in `.agents/skills/` (listed in [`skills-lock.json`](skills-lock.json)) and external illustration assets documented in [`public/raccoon/CREDITS.md`](public/raccoon/CREDITS.md) and [`public/sfx/CREDITS.md`](public/sfx/CREDITS.md) remain under their respective upstream licenses.

