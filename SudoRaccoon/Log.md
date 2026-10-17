# Log

Dated changelog for the vault and video pipeline. Append a short entry when new videos or design decisions are added.

## Proof of Concept Release
- Open-sourced the **Sudo the Raccoon** Proof of Concept repository:
  - 18 published PoC videos in `src/videos/` and `SudoRaccoon/Videos/` (`wifi-passwords`, `phishing-links`, `mac-terminal-secrets`, `linux-folders`, `free-learning-sites`, `git-3`, `email-plus`, `slow-computer`, `who-on-wifi`, `network-commands`, `wifi-hacking`, `linux-mistakes`, `terminal-basics`, `merge-conflicts`, `curl-websites`, `api-curl`, `qr-bite`, `dark-web`).
  - Complete Remotion component library (`src/components/`, `src/library/`, `src/icons/Icons.tsx`) with 180+ reusable visual components and 38 Studio showcases (`Playbook/Components.md`).
  - Python production pipeline (`scripts/new_video.py`, `tts.py`, `render.py`, `package.py`, `publish.py`, `sync_channel.py`, `research_ideas.py`, `hashtags.py`).
  - Configurable brand settings in `src/brand/config.ts` and `.env.example` so anyone can adapt the project under their own channel name and handle.
