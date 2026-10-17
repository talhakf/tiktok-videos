---
id: api-curl
title: "What an API is, with one curl"
status: posted
format: concept-explainer
topic: how-tech-works
tools: [curl, GitHub REST API, JSON]
score: 26
voice: Autonoe
music: lofi-relax
duration: 107
composition: ApiCurl
output: out/api-curl/api-curl-tiktok.mp4
yt_likes: 24
ig_saves: 28
ig_shares: 3
ig_comments: 0
ig_likes: 42
ig_views: 2084
yt_views: 933
youtube_url: https://www.youtube.com/watch?v=nldGsck63co
instagram_url: https://www.instagram.com/reel/DejROBGjGz7/
tiktok_url: https://www.tiktok.com/@sudoraccoon
scheduled: 2026-10-16 12:00
cover: out/api-curl/api-curl-cover.jpg
cover_ms: 5800
caption: "What is an API? Run curl https://api.github.com/users/torvalds in your terminal and watch a GET request bring back live data — login, repos, and 327K followers, with no key needed. Sudo still got 403 Forbidden on the kitchen fridge. What API should Sudo call next? 🦝 #api #terminal #coding #softwareengineer"
created: 2026-10-11
posted: 2026-10-16 12:00
url: https://www.tiktok.com/@sudoraccoon/video/7697203802964839713
views: 1056
likes: 37
saves: 5
comments: 0
shares: 4
---

# What an API is, with one curl

## Promise
An API is a menu for programs: one curl to GitHub's API shows a request going out and JSON coming back.

## Why now (evidence)
- YouTube "what is an api explained": top-5 median **3.0M**, max 5.4M; "get vs post" 214K; "jwt" 1.1M, "rest vs graphql" 539K (follow-ups).
- Not in coding.kitty7's catalog as of this scan (their concept explainers are their best videos: TCP vs UDP 689K).
- Verified 2026-10-11 from this machine: `curl https://api.github.com/users/torvalds` returns JSON without a key (`login`, `id`, `followers`, …). Unauthenticated GitHub API limit is 60 requests/hour ([GitHub docs](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)).
- Library fit: `dev/` HTTP request/response + JSON tree, terminal.

### Facts checked (2026-10-13)
Sources: [GitHub REST API — Users](https://docs.github.com/en/rest/users/users#get-a-user), [GitHub REST API — Rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api), [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html); verified locally on this machine 2026-10-13.
- `curl -s https://api.github.com/users/torvalds` and `curl -i -s https://api.github.com/users/torvalds | head -n 25`: returns `HTTP/2 200`, `content-type: application/json; charset=utf-8`, `x-github-api-version-selected: 2022-11-28`, `x-ratelimit-limit: 60` without an API key or browser.
- Real JSON payload fields verified 2026-10-13: `"login": "torvalds"`, `"id": 1024025`, `"name": "Linus Torvalds"`, `"company": "Linux Foundation"`, `"location": "Portland, OR"`, `"public_repos": 12`, `"public_gists": 1`, `"followers": 327655`, `"following": 0`, `"created_at": "2011-09-03T15:26:22Z"`.
- Unauthenticated GitHub REST API rate limit is 60 requests per hour per IP (`x-ratelimit-limit: 60`).
- HTTP methods (RFC 9110 §9.3): `GET` requests transfer of a current representation of the target resource (read data); `POST` requests that the target resource process the representation enclosed in the request (send/create data).
- HTTP status codes (RFC 9110 §15): `200 OK` (request succeeded), `403 Forbidden` (server understood the request but refuses to authorize it), `404 Not Found` (server did not find a current representation for the target resource).

## Hook options
- Analogy: "An API is a waiter for programs."
- Curiosity: "Every app on your phone does this a thousand times a day."

## Outline
1. Hook: app icon → request → JSON, headline.
2. Waiter analogy: you (app) → menu (API docs) → kitchen (server).
3. Live: `curl https://api.github.com/users/torvalds` → JSON tree, `followers` ringed.
4. Request = URL + method (GET), response = status 200 + JSON.
5. Weather app, login with Google, maps: all APIs.
6. EndCard: "what API should Sudo call next?"

## Raccoon angle
Sudo orders from a snack API: GET /snacks returns JSON; POST /fridge/unlock gets 403 Forbidden (no root access to the fridge).

## Notes
Use a real public endpoint for the terminal beat (GitHub); numbers like follower counts change, so show them as they are on the build day or blur.

## Voice style
Upbeat, clear and curious, like a friendly developer showing a beginner how the curtain comes down. Playful on the restaurant kitchen and locked-fridge raccoon jokes, crisp on the terminal command and HTTP status codes.

## Script
<!-- source of truth for scripts/tts.py. Pronunciation: {display|spoken}, e.g. {fd|F D}, {--tree|dash dash tree}. Last line = CTA: follow + save + comment ([[Video format]] → Ending) -->
What an {API|A P I} actually is, shown with one command, because every app on your phone does this a thousand times a day.
Imagine Sudo wants snacks from a restaurant kitchen he isn't allowed inside. He needs a menu of what he's allowed to ask for, and a waiter to bring it out. That's an {API|A P I}, an Application Programming Interface. Your app orders from the menu, the server's kitchen does the work, and the waiter brings back data.
Watch it happen live in the terminal. Type {curl https://api.github.com/users/torvalds|curl, A P I dot github dot com, slash users, slash torvalds}. No browser, no {API|A P I} key. Your terminal sends a request to GitHub's server, and a {JSON|jay-son} object comes right back: {login|login} torvalds, {public_repos|public repos} 12, {followers|followers} over 327 thousand, and {location|location} Portland. Why {JSON|jay-son} instead of a webpage? A normal webpage is {HTML|H T M L}, full of buttons, colors, and fonts for human eyes. {JSON|jay-son} skips the page and gives your code clean key-value pairs it can read in one line.
Every {API|A P I} call has three parts. First, the method: {GET|get} to read data, or {POST|post} to send and create data. Second, the {URL|U R L} endpoint, like {/users/torvalds|slash users slash torvalds} or {/snacks|slash snacks}. And third, the status code in the response: {200 OK|two hundred O K} means it worked, {404 Not Found|four oh four not found} means it doesn't exist, and {403 Forbidden|four oh three forbidden} is what Sudo gets when he tries {POST /fridge/unlock|post, slash fridge, slash unlock} without permission.
Once you see it, you realize every app on your phone is just {API|A P I} calls behind the scenes. Opening your weather app? {GET /forecast|get slash forecast}. Tapping Sign in with Google? An {API|A P I}. Watching your pizza delivery move on a map? Another {API|A P I}.
Save this to try that curl command yourself. Follow for more terminal explainers, and comment what {API|A P I} Sudo should call next.

## Beats
Built 2026-10-13 from the library; every beat anchored to spoken words. Voice: one Gemini request (104.52 s of speech, 273/298 heard words matched — the remaining diffs are the spelled-out URL and HTTP status phrases). Video 1:47 (107.0 s).

| Beat | Visual | Raccoon |
| --- | --- | --- |
| Hook 0–7.1s | Headline "What an API actually is. / One curl command." + `HttpExchange` (`GET /users/torvalds` → `42 ms` → `200 OK` with JSON body) from frame 0; mono note `curl https://api.github.com/users/torvalds` swaps to `IconNote` "Every app on your phone: 1,000× a day" at "thousand" | `peek-paws` over the request card |
| Analogy 7.1–23.2s | Headline "Snacks in the kitchen. / The menu and the waiter."; 3 nodes (`Your app · Sudo` ↔ `API · menu + waiter` ↔ `Server · the kitchen` with red lock badge at "allowed"); `LetterSplit` splits `A · P · I` into `Application · Programming · Interface` at "Application"; packets `GET /snacks` and `{ snacks }` travel across; notes explain kitchen lock, menu, waiter, and round-trip | `standing-front` at "imagine", `crepe` at "waiter" (2nd) |
| Live curl + JSON 23.2–45.9s | Headline "One curl in the terminal. / No browser. No API key."; `Terminal` types `curl https://api.github.com/users/torvalds`; `JsonTree` (`api.github.com/users/torvalds`, `200 OK · JSON`) highlights `login`, `public_repos`, `followers` (green), and `location` on cue; notes on 60 req/hr free limit and live profile data | `pointing` at "JSON" |
| HTML vs JSON 45.9–58.7s | Headline "Why JSON, not HTML? / Webpages vs raw data."; `VsSplit` compares `HTML` (`<div class="btn">`, buttons & layout ✗, colors & fonts ✗, for human eyes ✗) vs `JSON` (`"followers": 327655`, skips the webpage ✓, key-value pairs ✓, read in 1 line ✓, winner tick) | `scheming` at "JSON" (3rd) |
| Anatomy 58.7–84.4s | Headline "3 parts of an API call. / Method · Endpoint · Status"; `HttpExchange` with blue `Circle` focus ring gliding from `GET` ("method") to `/users/torvalds` ("URL") to `200 OK` ("status"), plus notes on `GET`, `POST`, endpoints, `200 OK`, and `404 Not Found`; at "403 Forbidden" swaps to Sudo's `POST /fridge/unlock` → `403 Forbidden` (`Permission denied: locked`) | `pointing` (flipped), then `hands-up` at "tries" |
| Everyday apps 84.4–98.4s | Headline "Every app on your phone. / API calls under the hood."; `BuildList` card builds 3 rows (`1 GET /forecast?city=portland`, `2 POST /oauth/google`, `3 GET /orders/pizza/location`) above `Phone` ↔ `Server APIs` diagram with packets | `laughing` at "pizza" |
| Save 98.4–100.6s | `SaveOutro` cheat sheet (`curl api.github.com/users/torvalds`, `GET /path`, `POST /path`, `200 OK / 404`, `403 Forbidden`), bubble "What API should Sudo call next?" | `waving-laugh` |
| End 100.6–107.0s | `EndCard`: follow tap, save, comment "What API should Sudo call next?" | avatar |

## Post
<!-- written by Claude as the last build step, checked by scripts/package.py: see [[Caption and hashtags]] -->
```text
What is an API? Run curl https://api.github.com/users/torvalds in your terminal and watch a GET request bring back live data — login, repos, and 327K followers, with no key needed. Sudo still got 403 Forbidden on the kitchen fridge. What API should Sudo call next? 🦝 #api #terminal #coding #softwareengineer
```
- Keyword: what is an api
- YouTube title: What an API actually is, shown with one curl command #shorts
- Cover: TikTok and Instagram get the video frame at `cover_ms` (5.8s: hook headline, `GET /users/torvalds` → `200 OK` HTTP exchange, Sudo peeking over the card, and "Every app on your phone: 1,000× a day") because Postiz can't send a custom cover; designed covers stay in out/api-curl/ for a manual swap
- Post at: 2026-10-16 12:00

## Results & learnings
-
