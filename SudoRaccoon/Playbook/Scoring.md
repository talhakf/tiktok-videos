# Scoring

Every video note has a `score:` property: **how well we expect the video to perform, out of 30**. It is set when the idea is written (skill `sudo-raccoon-ideas`), shown as **Predicted /30** in the Videos base (Ideas view sorted by it, Posted view next to the real views), and checked against the real numbers once a video is 48 hours old.

## The six criteria (0–5 each)
| Criterion | 5 means | 1 means |
| --- | --- | --- |
| Proven demand | competitor outlier ≥3× their median, or YouTube top results ≥500K views, or HN ≥300 points | nobody searches or watches it |
| Save value | a command, install or cheat sheet people keep (resource lists hit 9–10% saves for @thecodingsloth) | fun fact, nothing to keep |
| Demo-ability | shows naturally in our terminal/diagram components, 10–15s per beat | needs footage we can't make |
| Raccoon fit | the running joke writes itself (trash, snacks, 3am, masked bandit, night raids) | the raccoon is decoration |
| Novelty | not in our catalog, not done by a competitor in the last 30 days | already done to death |
| Timeliness / evergreen | released or debated this month, or evergreen with steady search demand | stale news |

## What the total means
| Score | Prediction | What to do |
| --- | --- | --- |
| 27–30 | should beat the channel median clearly | make next |
| 24–26 | solid, around the channel median or above | make when the top picks are done |
| 20–23 | test or filler | only with a good reason (format test, timely) |
| < 20 | likely to under-perform | don't make; keep as `rejected` with the reason |

## Calibration (fill in at 48h)
The score is a guess until results come back. When a video is ~48h old, add a row here from its synced numbers, and adjust the rubric when a pattern shows up (e.g. if timely news keeps beating evergreen at the same score, weight timeliness more).

| Video | Score | Views 48h | Saves % | Verdict |
| --- | --- | --- | --- | --- |
| [[wifi-passwords]] | 29 | TT 376 · IG 2,278 · YT 491 | TT 1.6% · IG 2.5% | On target: cross-OS command cheat sheet drives strong saves |
| [[phishing-links]] | 28 | TT 157 · IG 1,375 · YT 141 | TT 0.6% · IG 0.5% (1.5% shares) | Over-scored: non-terminal security gets shares, fewer views/saves than dev/Linux topics |
| [[mac-terminal-secrets]] | 27 | TT 311 · IG 104,227 · YT 356 | TT 1.6% · IG 2,210 likes | #1 overall breakout hit (104.2K IG views): built-in macOS terminal commands with zero install friction explode on Reels |
| [[linux-folders]] | 27 | TT 633 · IG 6,785 · YT 1,372 | TT 2.8% · IG 3.6% | Under-scored (acts like 29): Linux visual map + cheat sheet is a top evergreen format across all 3 platforms |
| [[free-learning-sites]] | 27 | TT 448 · IG 5,020 · YT 362 | TT 1.9% · IG 3.8% | Under-scored (acts like 28–29): strong IG save rate (3.8%); free resource drops reliably drive bookmarks |
| [[git-3]] | 27 | TT 180 · IG 41,199 · YT 1,280 | TT 3.6% · IG 0.9% (159 shares) | #2 overall reach (41.2K IG, 1.28K YT) and 3.6% TT saves; Git deep-dives with side-by-side terminal proof explode on IG/YT |
| [[email-plus]] | 27 | TT 94 · IG 2,606 · YT 732 | TT 1.1% · IG 1.4% | Over-scored on TT, solid on IG/YT: non-terminal privacy tips do better on Reels/Shorts than TikTok |
| [[slow-computer]] | 28 | TT 574 · IG 2,533 · YT 1,221 | TT 2.8% · IG 2.7% | On target: cross-platform terminal diagnostics + cheat sheet drives strong saves and YT reach |
| [[who-on-wifi]] | 28 | TT 653 · IG 11,191 · YT 564 | TT 3.4% · IG 4.3% | Outperformed: 11.2K IG views and 4.3% IG / 3.4% TT saves — home network scanning is a top pillar |
| [[network-commands]] | 27 | TT 898 · IG 5,373 · YT 1,307 | TT 3.8% · IG 3.4% | Under-scored (acts like 29): 3.8% TT saves & 1.3K YT views; built-in networking cheat sheets excel |
| [[wifi-hacking]] | 27 | TT 507 · IG 3,559 · YT 1,294 | TT 1.0% · IG 2.9% | On target: strong reach across all three platforms (1.3K YT, 3.6K IG), higher saves on IG than TT |
| [[linux-mistakes]] | 26 | TT 3,422 · IG 2,788 · YT 1,306 | TT 2.5% · IG 1.9% | Massive outlier on TikTok (#1 TT video at 3,422 views / 85 saves): wrong-way vs right-way Linux panes |
| [[terminal-basics]] | 26 | TT 1,178 · IG 2,433 · YT 579 | TT 2.2% · IG 2.2% | Under-scored (acts like 28): #2 on TikTok (1,178 views / 26 saves); beginner command cheat sheets convert |
| [[merge-conflicts]] | 26 | TT 567 · IG 2,636 · YT 924 | TT 0.4% · IG 1.9% | Solid reach across all three (2.6K IG, 924 YT); Git explainers consistently perform on IG & YT |
| [[curl-websites]] | 26 | TT 585 · IG 19,147 · YT 32 | TT 5.3% · IG 5.0% | Huge save-rate outlier (5.3% TT / 5.0% IG saves, 19.1K IG views / 962 saves): zero-install curl tricks |

Benchmarks for the saves column: @coding.kitty7 averages ~1.5%, @networkchuck's one-liner hacks 3–4%, @thecodingsloth's resource lists 9–10%.
