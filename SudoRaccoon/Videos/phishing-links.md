---
id: phishing-links
title: "Spot a fake link in 3 seconds"
status: posted
format: myth-vs-fact
topic: security
tools: [url anatomy, padlock]
score: 28
voice: Autonoe
music: lofi-relax
duration: 59
composition: PhishingLinks
output: out/phishing-links/phishing-links-tiktok.mp4
yt_likes: 6
ig_saves: 7
ig_shares: 21
ig_comments: 0
ig_likes: 31
ig_views: 1714
yt_views: 173
youtube_url: https://www.youtube.com/watch?v=c2NziwU4N9Q
instagram_url: https://www.instagram.com/reel/DeXMtt8DAje/
tiktok_url: https://www.tiktok.com/@sudoraccoon
scheduled: 2026-10-11 19:30
cover: out/phishing-links/phishing-links-cover.jpg
cover_ms: 1000
caption: "Spot a fake link in 3 seconds: find the first single slash and read the name right before .com. That's the real owner. Sudo shows 3 phishing tricks (the brand in front, the brand after the slash, look-alike letters) and why the padlock doesn't mean safe. Did you get it in 3 seconds? 🦝 #phishing #security #cybersecurity #quiz"
created: 2026-10-10
posted: 2026-10-11 19:30
url: https://www.tiktok.com/@sudoraccoon/video/7695463993376247072
views: 171
likes: 9
saves: 1
comments: 0
shares: 1
---

# Spot a fake link in 3 seconds

## Promise
The one place in a link that tells you who really owns it — so paypal.com.secure-login.xyz never fools you again.

## Why now (evidence)
- YouTube "how to spot a phishing link" top-5 median **859K** ("Phishing attacks are SCARY easy to do" 3.6M, "5 Ways To Spot A Fake Website" 1.1M); "phishing" 824K.
- Google autocomplete: "how do hackers get your password", "…get into your email", "…get your information" are top completions.
- The trick is documented by registries and security vendors: the real domain is the name right before the ending (.com, .nl …); scammers put the brand in the subdomain or path ([SIDN — how to spot a fake URL](https://sidn.nl/en/cybersecurity/how-to-spot-a-fake-url), [Intezer URL analysis](https://intezer.com/blog/url-analysis-phishing-part-1)).
- Broadest audience of any idea (not only devs) while staying "how tech works"; no competitor in our set has done it.

## Facts (verified 2026-10-11)
- **The owner is the name right before the ending, before the first single slash.** SIDN (.nl registry): "look at everything between the https:// and the first / in the address … The actual domain is always the last part of that string" ([SIDN](https://sidn.nl/en/cybersecurity/how-to-spot-a-fake-url)). Checked with Python `urllib.parse.urlsplit`: `paypal.com.secure-login.xyz/signin` → host `paypal.com.secure-login.xyz` (registrable domain `secure-login.xyz`); `secure-login.xyz/paypal.com` → host `secure-login.xyz`, `/paypal.com` is the path; `www.paypal.com/signin` → `www.paypal.com`. Bonus: `paypal.com@secure-login.xyz/` → host `secure-login.xyz`, so the rule still holds.
- **Subdomains are made up by the owner; any page path can be named anything**: SIDN lists the brand in front of the real domain and "genuine-sounding" folder names as the two classic tricks.
- **Look-alike letters**: SIDN: "a zero where the letter 'o' should be", extra letters (abnambro.nl). `1` vs `l` and `rn` vs `m` shown on screen.
- **Padlock ≠ safe**: FBI IC3 PSA (2019-06-10): "Do not trust a website just because it has a lock icon or 'https' in the browser address bar" ([IC3](https://www.ic3.gov/PSA/2019/PSA190610)). Chrome replaced the lock with the "tune" icon in Chrome 117 (Sept 2023) because people read it as "trustworthy" (only 11% understood it in Google's 2021 study; [9to5Google](https://9to5google.com/2023/05/02/chrome-https-lock-icon/)).
- **Free padlock**: Let's Encrypt: "Anyone who owns a domain name can use Let's Encrypt to obtain a trusted certificate at zero cost" ([letsencrypt.org/about](https://letsencrypt.org/about/)).
- **The real PayPal sign-in** is `https://www.paypal.com/signin` (HTTP 200 on 2026-10-11).
- **Domains on screen**: `secure-login.xyz` is not registered (NXDOMAIN via dns.google, 2026-10-11), so we point at nobody; `paypa1.com` is registered through MarkMonitor (a brand-protection registrar, so most likely a defensive registration; owner not checked), shown only as a spelling, never as a scam site. No logos.

## Hook options
- Quiz: "One of these links is PayPal. Which one?"
- Stakes: "This link says PayPal three times. It isn't PayPal."

## Outline
1. Hook: 3 links on screen, viewer guesses (2s pause = rewatch).
2. Anatomy: scheme · subdomain · **domain** · path; focus ring on the part before the first single slash, read right to left.
3. Trick 1: brand in the subdomain (`paypal.com.secure-login.xyz`).
4. Trick 2: brand in the path (`secure-login.xyz/paypal.com`).
5. Trick 3: look-alike letters (`paypa1.com`, `rn` vs `m`).
6. Reveal the hook answer. Rule: find the dot before the first slash, read the word left of it.
7. EndCard: save + comment "did you get it?"

## Raccoon angle
The masked bandit explains his cousins' tricks: he can tell a real trash can from a fake one by the label in the right place.

## Notes
Use made-up or reserved domains for the fake links (e.g. `.example`, or clearly fake ones we don't link to); never show a live phishing site. Don't use real brand logos.

## Voice style
Friendly, quick and a little sly, like letting a friend in on a scam trick. Count down "Three. Two. One." slowly, about one second per number. Clear short pauses between the three tricks.

## Script
<!-- source of truth for scripts/tts.py. Pronunciation: {display|spoken}, e.g. {fd|F D}, {--tree|dash dash tree}. Last line = CTA: follow + save + comment ([[Video format]] → Ending) -->
Spot a fake link in three seconds. Only one of these is really PayPal. Three. Two. One.
Sudo is a masked bandit, so he knows every trick in the book. Here's the rule.
Find the first single slash after {https|H T T P S}. The name right before the ending, like {.com|dot com}, is who really owns the link. The owner can make up anything in front of it.
Trick one: PayPal at the front. This link belongs to {secure-login.xyz|secure login dot X Y Z}. Not PayPal.
Trick two: PayPal after the slash. That's just a page name, and anyone can name a page PayPal.
Trick three: look-alike letters. That's a {1|one}, not an {l|L}. And {rn|R N} side by side looks like an {m|M}.
Bonus myth: the padlock means it's safe. Nope. It only means the connection is encrypted, and scammers get one for free.
So the real PayPal was the third one. Save this for the next weird text. Follow for more, and comment if you got it in three seconds.

## Beats
| Beat | Visual | Raccoon |
| --- | --- | --- |
| Hook 0–8s "Spot a fake link in three seconds" | `Headline` from frame 0 + 4 `OptionPills` links (a–d), `Countdown` ring on "Three. Two. One." | `side-eye` (from frame 0) |
| Sudo 8–13s "masked bandit" | `Headline` + mask icon, Notes "1 rule / 3 tricks / 1 myth" on "rule" | `head-front` from the right edge |
| Rule 13–23s "first single slash" | `Annotate` https://www.paypal.com/signin: ring on the slash, Note "not the // in https://", brackets ending → owner (blue, focus) → made up | `pointing` |
| 1/3 23–30s "PayPal at the front" | `ToolHeader` "In front" + `Annotate` paypal.com.secure-login.xyz/signin, owner in red, `Verdict` "not paypal" | `sneaking` from the right |
| 2/3 30–37s "after the slash" | `ToolHeader` "After the /" + `Annotate` secure-login.xyz/paypal.com (owner red, "just a page"), Note "/paypal /bank /login" | `scheming` |
| 3/3 37–43s "look-alike letters" | `ToolHeader` "Look-alikes" + `LetterSplit` paypa1.com loupe on the 1, then rn ≈ m, Note "Zoom in before you tap" | `peek-pillar` at the right edge |
| Myth 43–50s "the padlock" | `Headline` "Bonus myth: the padlock = safe." + `UrlBar` turning green, ring on the lock, big lock icon, `Verdict` myth, Notes "encrypted, not honest" / "free" | `oops` |
| Reveal 50–52s "the third one" | `OptionPills` reveal c + `Verdict` "real one" | – |
| Save + CTA 52–59s | `SaveOutro` cheat sheet + bubble "Did you get it in 3 seconds?", `EndCard` | `waving-laugh` |

## Post
<!-- written by Claude as the last build step, checked by scripts/package.py: see [[Caption and hashtags]] -->
```text
Spot a fake link in 3 seconds: find the first single slash and read the name right before .com. That's the real owner. Sudo shows 3 phishing tricks (the brand in front, the brand after the slash, look-alike letters) and why the padlock doesn't mean safe. Did you get it in 3 seconds? 🦝 #phishing #security #cybersecurity #quiz
```
- Keyword: spot a fake link
- YouTube title: Spot a fake link in 3 seconds: 3 phishing tricks #shorts
- Cover: out/phishing-links/phishing-links-cover.jpg (own design, 1080×1440); cover_ms 1000 = hook frame (headline, the four links, Sudo)
- Hashtags: #phishing (topic), #security (1.11×, in [[Hashtags]]) + #cybersecurity (niche), #quiz (1.32×, 6 uses; the hook is a quiz). No #coding/#programming: the video shows no code.
- Post at: 18:00–21:00

## Results & learnings
- **48h (2026-10-13):** TikTok 157 views / 8 likes / 1 save (0.6%), Instagram 1,375 views / 23 likes / 7 saves (0.5%) / 21 shares (1.5%), YouTube 141 views (1,673 total). General security myth-vs-fact gets shares (1.5% IG) but lower views and saves than terminal command videos.
