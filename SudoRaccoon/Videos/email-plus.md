---
id: email-plus
title: "The + trick that shows who sold your email"
status: posted
format: myth-vs-fact
topic: security
tools: [Gmail plus addressing, Outlook plus addressing, mail filters]
score: 27
voice: Autonoe
music: lofi-relax
duration: 54
composition: EmailPlus
output: out/email-plus/email-plus-tiktok.mp4
ig_saves: 25
ig_shares: 9
ig_comments: 0
ig_likes: 63
ig_views: 2611
yt_likes: 15
yt_views: 732
youtube_url: https://www.youtube.com/watch?v=_24TWGe8Qgo
instagram_url: https://www.instagram.com/reel/Debi0a5ibHC/
tiktok_url: https://www.tiktok.com/@sudoraccoon
scheduled: 2026-10-13 12:00
cover: out/email-plus/email-plus-cover.jpg
cover_ms: 3000
caption: "The Gmail plus trick shows who sold your email: sign up as yourname+site@gmail.com and the mail still lands in your normal inbox. Spam sent to +pizza? The pizza app leaked it. Works in Gmail and Outlook, but it's a clue, not proof. Which site sold yours? 🦝 #gmail #privacy #cybersecurity #security"
created: 2026-10-11
posted: 2026-10-13 12:00
url: https://www.tiktok.com/@sudoraccoon/video/7696090185120910625
views: 94
likes: 2
saves: 1
comments: 0
shares: 0
---

# The + trick that shows who sold your email

## Promise
Add +anything to your email address and every spam mail tells you which website leaked or sold it.

## Why now (evidence)
- YouTube "gmail plus address trick": top-5 median **1.0M**, max 1.4M. @theprimeagen "Email Trick" 171K (17× his median; content not checked, TikTok blocks single-video fetches).
- Security mini-series fit ([[phishing-links]], [[wifi-passwords]], [[wifi-hacking]]): practical, everyone has an email, high save value.
- Facts re-checked 2026-10-12: Gmail delivers `name+anything@gmail.com` to `name@gmail.com` and suggests `yourname+shopping@gmail.com` for an online shop, then a filter (label, forward, archive or delete) ([Google: Send emails from a different address or alias → Use Gmail aliases](https://support.google.com/mail/answer/12096?hl=en); the page title changed, the old "task-specific addresses" name is gone). Gmail ignores dots in @gmail.com addresses, not in work/school addresses ([Google: Dots don't matter in Gmail addresses](https://support.google.com/mail/answer/7436150?hl=en)). Outlook.com takes `+` aliases with no setup since Sept 2013 ([Within Windows, archived](https://web.archive.org/web/20140220025605/http://withinwindows.com/within-windows/outlookcom-supports-simpler-email-aliases-too), cited by Wikipedia "Email address" → subaddressing); Microsoft 365 / Exchange Online has plus addressing on by default, receive-only, sorted with an Inbox rule "Recipient address includes" ([Microsoft Learn](https://learn.microsoft.com/en-us/exchange/recipients-in-exchange-online/plus-addressing-in-exchange-online)). The old Office Watch link (?p=56247) is about personalized domains, not plus addressing: dropped. Caveats said in the video: some sign-up forms reject the +, and a spammer can strip the tag (the base address is right there), so it's a clue, not proof. A leak can be a breach, not a sale → script says "leaked or sold".

## Hook options
- Curiosity: "One character tells you who sold your email."
- Story: "Sudo's friend got spam from a pizza place he never ordered from."

## Outline
1. Hook: inbox with a spam mail, the "To:" line `you+pizzashop@gmail.com` ringed.
2. The trick: sign up as you+netflix@…, you+pizzashop@… → all land in your inbox.
3. Spam arrives addressed to +pizzashop → now you know who leaked it.
4. Bonus: filter or block that alias with one rule.
5. Myth check: works on Gmail and Outlook; some sites block +, spammers can strip it.
6. EndCard: "which site do you think sold yours?"

## Raccoon angle
Sudo the detective (masked bandit catching other bandits): every snack-delivery signup gets its own +tag, the leaky one is unmasked.

## Notes
Not a terminal video: use browser/field/inbox components (`ui/` fields, `windows/` browser). Fake addresses only.

## Voice style
Friendly, quick and a little sly, like a detective letting a friend in on a trick. Short clear pauses between the beats; deadpan on the Sudo trash joke.

## Script
<!-- source of truth for scripts/tts.py. Pronunciation: {display|spoken}, e.g. {fd|F D}, {--tree|dash dash tree}. Last line = CTA: follow + save + comment ([[Video format]] → Ending) -->
One plus sign can show you who sold your email. It's the Gmail plus trick.
Sudo signs up for every snack app, and now the spam won't stop. Time to find the leak.
Add a plus and any word before the at sign. {yourname|your name} {+pizza|plus pizza} {@gmail.com|at gmail dot com} still lands in your normal inbox.
So give every site its own tag. {+pizza|Plus pizza}. {+snackbox|Plus snack box}. {+trashdeals|Plus trash deals}.
Weeks later, spam shows up sent to {+pizza|plus pizza}. Now you know who leaked or sold your address.
Make one filter for that address, and it all goes straight to the trash. Sudo's favorite place.
It works in Gmail and Outlook. Two catches: some sign-up forms reject the plus. And a spammer can simply delete it, so it's a clue, not proof.
Save this for your next sign-up. Follow for more, and comment which site you think sold yours.

## Beats
Built 2026-10-12 from the library + new `windows/Mail.tsx` (`MailInbox`, `MailMessage`); every beat anchored to a spoken word. Voice: one Gemini request, 153/153 heard words matched, 50.9 s.

| Beat | Visual | Raccoon |
| --- | --- | --- |
| Hook 0–5.6s "One plus sign can show you who sold your email" | `Headline` "The + trick that shows / who sold your email." from frame 0 + `MailMessage` spam mail (Hot Deals 4U, "You won a free pizza oven!!"), To: yourname+pizza@gmail.com, blue ring locks on "+pizza" at "sold" | `side-eye` (from frame 0) |
| Problem 5.6–11.1s "Sudo signs up for every snack app" | `Headline` + `MailInbox`: Pizza app / Snack Box welcome mails, then 4 spam rows push in on "spam" (title Inbox · 2 → 46); `Note` "Who leaked my email?" on "leak" | `oops` |
| Trick 11.1–19.2s "Add a plus and any word before the at sign" | `Annotate` yourname+pizza@gmail.com: ring on "+" ("plus"), ring on "@" ("at"), brackets you / any word (blue) / same address; mini `MailInbox` "Inbox · yourname@gmail.com" receives the Pizza app mail on "lands" (ding) | `scheming` |
| Tags 19.2–25.6s "give every site its own tag" | 3 `TextField`s "1/3 Pizza app · sign up" … "3/3 Trash Deals", each types yourname+tag@gmail.com so the +tag lands on its spoken word | `pointing` |
| Spam 25.6–31.6s "spam shows up sent to +pizza" | `Headline` "Spam sent to +pizza? / The pizza app leaked it." + `MailInbox` (spam row arrives on top, red +pizza chip, row tint + ring on "+pizza"; +snackbox / +trashdeals rows below); `Note` "+pizza → the pizza app" | `gasp` |
| Filter 31.6–36.8s "one filter … straight to the trash" | `MacWindow` "Create filter": `TextField` To types the address, "Delete it" ticks, `Button` → "Filter created"; `ChipDrop` 3 spam subjects into the `TrashCan` on "trash" | `peek-ledge` rises out of the can on "Sudo's favorite place" |
| Works 36.8–38.8s "Gmail and Outlook" | `BuildList` card: Gmail ✓, Outlook ✓ on their words | `hands-up` |
| Catches 38.8–46.4s "Two catches" | `TextField` "1/2 some sign-up forms" turns red + shakes on "reject" ("Please enter a valid email address"); "2/2 a spammer deletes the tag": +pizza strikes and collapses on "delete" → yourname@gmail.com; `Verdict` "a clue" ✓ / "not proof" ✗ | `sneaking` from the right |
| Save 46.4s | `SaveOutro` cheat sheet (6 rows) + bubble "Which site sold yours?" | `waving-laugh` |
| CTA 48.0s | `EndCard` follow → save → comment, line "Follow for more security tricks.", question "Which site sold yours?" | `closeup-face` avatar |

## Post
<!-- written by Claude as the last build step, checked by scripts/package.py: see [[Caption and hashtags]] -->
```text
The Gmail plus trick shows who sold your email: sign up as yourname+site@gmail.com and the mail still lands in your normal inbox. Spam sent to +pizza? The pizza app leaked it. Works in Gmail and Outlook, but it's a clue, not proof. Which site sold yours? 🦝 #gmail #privacy #cybersecurity #security
```
- Keyword: gmail plus trick
- YouTube title: The Gmail plus trick that shows who sold your email #shorts
- Cover: out/email-plus/email-plus-cover.jpg (own design, 1080×1440: "Who sold your email? / The + trick tells you.", the spam mail with +pizza ringed, side-eye Sudo, chips +pizza · Gmail · Outlook). TikTok and Instagram get the video frame at `cover_ms` (3.0s: hook headline, the spam mail with "+pizza" ringed, side-eye Sudo) because Postiz can't send a custom cover
- Hashtags: #gmail (topic), #privacy + #cybersecurity (niche, security series like [[phishing-links]]), #security (1.11× in [[Hashtags]]). No #coding/#programming: the video shows no code.
- Post at: 2026-10-13 12:00

## Results & learnings
- **48h calibration (predicted 27/30):** TT 94 · IG 2,606 · YT 732 views (TT 1.1% · IG 1.4% saves). Over-scored on TT, solid on IG/YT: non-terminal privacy tips do better on Reels/Shorts than TikTok.
