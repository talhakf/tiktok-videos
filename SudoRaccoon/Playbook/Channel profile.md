# Channel profile

Profile template and original Proof of Concept branding (**Sudo the Raccoon** / `@sudoraccoon`).

> **Customizing for your own channel:**
> To use your own channel name, handle, and avatar across all videos and scripts:
> 1. Edit `src/brand/config.ts` (`BRAND.name`, `BRAND.handle`, `BRAND.tagline`, `BRAND.avatar`, `BRAND.terminalTitle`).
> 2. Set `CHANNEL_HANDLE` and `CHANNEL_NAME` in `.env`.
> 3. Re-render your profile picture if needed: `npx remotion still ProfilePicture SudoRaccoon/Assets/brand/profile-picture.png`.

| Field | Proof of Concept Value |
| --- | --- |
| Name | Sudo the Raccoon |
| Handle | @sudoraccoon (TikTok, Instagram, YouTube) |
| Picture | ![[Assets/brand/profile-picture.png\|120]] `Assets/brand/profile-picture.png` (see [[Design system]] → Profile picture) |
| Config | `src/brand/config.ts` + `.env` (`CHANNEL_HANDLE`, `CHANNEL_NAME`) |

## Bio: TikTok and Instagram (≤ 150 characters)
```text
Sudo, a raccoon with root access 🦝
Dev tools and how tech works: terminal, git, Docker, the internet.
Short, practical, straight from the trash can.
```

## YouTube: channel description
```text
Sudo is a raccoon with root access. It explains dev tools and how tech works: terminal commands, git, Docker, SSH and what happens behind a URL. Short, practical, straight from the trash can.
```

## Branding principles
- **Character-first:** viewers follow a character with a personality and running jokes more readily than an abstract topic label, and it works naturally in scripts ("Sudo wants…").
- **Scope:** practical dev tools *and* how tech works (terminal, git, networking, security, web internals).
- **Consistency:** `EndCard` and `Cover` automatically read `BRAND.handle`, `BRAND.tagline`, and `BRAND.avatar` from `src/brand/config.ts`.
