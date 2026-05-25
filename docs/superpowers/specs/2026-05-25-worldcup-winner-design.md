# World Cup Winner — Design Spec
_Date: 2026-05-25_

## Overview

A mobile-friendly web app that lets users predict the 2026 FIFA World Cup results — picking group standings and knockout round winners all the way to a champion — then generates two shareable images: a full bracket infographic and an AI-generated cartoon celebration photo.

---

## Goals

- Users fill in their World Cup predictions (group stage + knockout bracket) in minutes
- App generates two images users want to share with friends on WeChat or iMessage
- Supports English, Chinese (Simplified), and Spanish
- Ships before June 11, 2026 (tournament start)

---

## Platform & Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | API routes for image gen, easy Vercel deploy |
| Styling | Tailwind CSS | Rapid dark-sports theme implementation |
| Deployment | Vercel (free tier) | Zero-config, serverless API routes |
| Bracket image | Satori + Resvg (server-side) | Canvas-quality PNG without headless browser |
| Celebration image | OpenRouter image generation API | AI cartoon composite of user photo + champion team |
| i18n | next-intl | EN / CN / ES language switcher |
| State | React state (client-side only) | No database needed — predictions live in session |

---

## 2026 World Cup Data

Hardcoded as a static JSON file at `src/data/wc2026.ts`:

- **48 teams** across **12 groups** (A–L), 4 teams per group
- All **104 match fixtures** with date, time, and venue
- **Official R32 seeding slots** (e.g. `1E vs 3ABCDF`, `1I vs 3CDFGH`, etc.) for bracket construction
- No external API dependency

---

## Visual Style

**Dark Sports** — deep navy/black background (`#060b18`), gold accents (`#ffd700`), white text hierarchy.

- Champion's path: gold border + dark green background (`#1a2e0a`)
- Other matches: very dark navy (`#0c1526`), dim blue border
- Rank colors: ① green, ② blue, ③ amber (wild card), ④ near-invisible (eliminated)

---

## User Flow

### Step 1 — Landing Page
- Full-screen dark hero, centered layout
- Large title: "FIFA World Cup 2026"
- Subtitle: "Make your prediction"
- Single prominent **Start** button
- Language switcher (EN / 中文 / ES) in top-right corner
- Brief teaser of the 2 images they'll receive

### Step 2 — Group Stage (12 groups)
- One group shown at a time, progress indicator ("Group 3 of 12")
- Each group card shows all 4 teams
- User picks **1st, 2nd, 3rd** place by tapping teams in order (tap once = 1st, tap again = 2nd, tap again = 3rd)
- **Optional score input** per match (6 matches per group) — small score fields beside each matchup
- "Next Group →" button advances; user can navigate back
- 4th place is auto-assigned (the unranked team)

### Step 3 — Knockout Rounds
- R32 bracket auto-seeded from group picks using official FIFA 2026 seeding rules
- User picks the winner of each match; advances winner to next round automatically
- **Optional score input** per match
- Progress bar shows overall completion (e.g., "R32 — 4 of 16 done")
- Rounds: R32 (16 matches) → R16 (8) → QF (4) → SF (2) → Final (1)

### Step 4 — Your Champion
- Confetti reveal screen showing the user's predicted champion
- Prompt: upload a photo or take a selfie (both options available)
- Selfie is optional — user can skip to generate bracket image only
- "Generate my images" CTA button

### Step 5 — Generate & Share
- Loading screen while both images generate (estimated ~10–20s)
- Results page shows both images side by side
- **Download** button saves each image to camera roll (mobile) or triggers download (desktop)
- **Share** hint: "Save and share on WeChat / iMessage"

---

## Bracket Prediction Rules

### Group Stage
- User ranks teams 1st → 3rd in each group (4th is auto)
- 1st and 2nd from each group automatically advance to R32
- 3rd-place picks are used to fill the 8 wild-card R32 slots per FIFA seeding rules (e.g. `3ABCDF` slot filled by the best 3rd-place team from groups A, B, C, D, or F). The app auto-assigns each user's 3rd-place picks to the correct wild-card slots based on which groups they came from — users do not need to understand the seeding rules themselves.

### Knockout Stage
- R32 bracket is pre-seeded with official slot labels
- After group picks are complete, the app resolves each slot to the user's chosen team
- User then picks each match winner round-by-round
- Optional predicted score (e.g. `2–1`) can be entered per match

---

## Generated Images

### Image 1 — Full Bracket (Canvas, ~1400×460px landscape)

Two-section combined image:

**Left section — Knockout Bracket (double-sided)**
- 9 columns: `R32 | R16 | QF | SF | FINAL | SF | QF | R16 | R32`
- Left half (Groups A–F side) flows right → center
- Right half (Groups G–L side) flows left → center
- Final match card in center
- Each match vertically centered between its two source matches
- Champion's path highlighted in gold; other matches dim

**Right section — Group Stage Panel**
- Vertical divider separating from bracket
- 2 columns × 6 rows = all 12 groups (A–L)
- Each group card shows all 4 teams ranked ① ② ③ ④
- Color-coded: green (advance), amber (wild card), dim (eliminated)
- Legend at bottom

**Tech:** React component → Satori (JSX→SVG) → Resvg (SVG→PNG) in `/api/generate-bracket`

### Image 2 — AI Celebration Cartoon (~1024×1024px square)

- User's photo combined with the champion team in a cartoon/anime style
- Generated via OpenRouter image generation API
- Auto-generated prompt: _"Cartoon anime-style illustration of [person in photo] joyfully celebrating with the [team name] national football team, yellow confetti, World Cup trophy, stadium crowd, vibrant celebratory colors"_
- If user skips selfie: generates generic fan celebration scene for the champion team
- **Tech:** `POST /api/generate-celebration` — accepts user photo (base64) + champion team name, calls OpenRouter, returns image URL

---

## API Routes

### `POST /api/generate-bracket`
- Input: `{ picks: BracketPicks, language: 'en'|'cn'|'es' }`
- Renders bracket React component with Satori, converts to PNG with Resvg
- Returns: PNG binary (`image/png`)

### `POST /api/generate-celebration`
- Input: `{ photo?: string (base64), championTeam: string, language: 'en'|'cn'|'es' }`
- Calls OpenRouter image generation API (API key in server env var `OPENROUTER_API_KEY`)
- Returns: `{ imageUrl: string }`

---

## Internationalisation (i18n)

Three languages: **EN** (English), **CN** (Simplified Chinese), **ES** (Spanish)

- Language switcher persists in `localStorage`
- All UI labels, button text, and step instructions are translated
- Team names and venue names remain in their standard form (not translated)
- Generated image captions use the selected language

---

## Sharing

- Both images download as PNG files when user taps "Download"
- On mobile, images save directly to the camera roll via the standard browser download flow
- User then shares manually via WeChat / iMessage from their camera roll
- No server-side storage — images are generated on demand and not persisted

---

## Out of Scope

- Live match result tracking (predict-only, not live)
- User accounts or saved brackets
- Social features (leaderboards, compare picks)
- Native mobile app (web only)
- Third-place playoff match prediction

---

## Environment Variables

```
OPENROUTER_API_KEY=...
```

All other config is hardcoded or derived from the static data file.
