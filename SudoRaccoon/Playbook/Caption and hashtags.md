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
