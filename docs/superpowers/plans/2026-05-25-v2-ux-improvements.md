# UX Improvements v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Four UX improvements: (1) persistent language switcher on every page, (2) group match venue/time panel in group stage, (3) back-navigation between all stages, (4) fully interactive knockout bracket using a quadrant-zoom + Final Four flow.

**Architecture:** All changes are in existing Next.js App Router + TypeScript codebase at `src/`. LanguageSwitcher moves from LandingPage into a persistent `<header>` added to `src/app/layout.tsx`. Fixture data is added to `src/data/wc2026.ts`. The knockout stage is rebuilt from a single static `KnockoutBracket` into three new components: `KnockoutOverview` (2×2 quadrant map) → `QuadrantView` (interactive R32→R16→QF per quadrant with wild-card picker) → `FinalFourView` (2 SFs + Final). State management gains `wildcardSelections` in `usePredictions`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Vitest + React Testing Library. No new dependencies.

---

## File Map

```
src/
  data/
    wc2026.ts               MODIFY — add GroupMatch type + GROUP_MATCHES (72 fixtures)
  lib/
    picks.ts                MODIFY — add GroupMatch type + wildcardSelections to BracketPicks
    i18n.ts                 MODIFY — add 12 new translation keys
  hooks/
    usePredictions.ts       MODIFY — add wildcardSelections state + setWildcardSelection
  components/
    LanguageSwitcher.tsx    CREATE — extracted language switcher (client component)
    group-stage/
      GroupStagePicker.tsx  MODIFY — add fixture panel sidebar + onBack prop
    knockout/
      KnockoutBracket.tsx   DELETE — replaced by three new components below
      MatchCard.tsx         KEEP — no changes
      KnockoutOverview.tsx  CREATE — 2×2 quadrant overview map
      QuadrantView.tsx      CREATE — R32→R16→QF bracket for one quadrant + wild-card picker
      FinalFourView.tsx     CREATE — 2 SFs + Final, calls onChampionSelected when done
  app/
    layout.tsx              MODIFY — add <header> with LanguageSwitcher
    predict/page.tsx        MODIFY — new step machine: groups→knockout(overview/quadrant)→final-four→champion→photo
tests/
  components/
    KnockoutOverview.test.tsx  CREATE
    QuadrantView.test.tsx      CREATE
```

---

## Quadrant Structure Reference

The 16 R32 matches map to 4 quadrants as follows (critical for Tasks 3 and 4):

| Quadrant | R32 matches | R16 matches | QF match |
|---|---|---|---|
| UL (Upper-Left)  | R32_L1, R32_L2, R32_L3, R32_L4 | R16_L1, R16_L2 | QF_L1 |
| LL (Lower-Left)  | R32_L5, R32_L6, R32_L7, R32_L8 | R16_L3, R16_L4 | QF_L2 |
| UR (Upper-Right) | R32_R1, R32_R2, R32_R3, R32_R4 | R16_R1, R16_R2 | QF_R1 |
| LR (Lower-Right) | R32_R5, R32_R6, R32_R7, R32_R8 | R16_R3, R16_R4 | QF_R2 |

Final Four:
- SF_L: QF_L1 winner vs QF_L2 winner
- SF_R: QF_R1 winner vs QF_R2 winner
- FINAL: SF_L winner vs SF_R winner

Wild-card slots per quadrant (slots starting with '3'):
- UL: R32_L1 (`3ABCDF`), R32_L2 (`3CDFGH`)
- LL: R32_L7 (`3BEFIJ`), R32_L8 (`3AEHIJ`)
- UR: R32_R3 (`3CEFHI`), R32_R4 (`3EHIJK`)
- LR: R32_R7 (`3EFGIJ`), R32_R8 (`3DEIJL`)

---

## Task 1: Fixture Data + i18n Keys + LanguageSwitcher

**Files:**
- Modify: `src/lib/picks.ts`
- Modify: `src/data/wc2026.ts`
- Modify: `src/lib/i18n.ts`
- Create: `src/components/LanguageSwitcher.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/landing/LandingPage.tsx`

- [ ] **Step 1: Add GroupMatch type to picks.ts**

Open `src/lib/picks.ts` and add after the existing exports:

```typescript
export interface GroupMatch {
  home: TeamId
  away: TeamId
  date: string   // "2026-06-12"
  time: string   // "17:00 ET"
  venue: string  // "MetLife Stadium, New York"
}
```

Also add `wildcardSelections` to `BracketPicks`:

```typescript
export interface BracketPicks {
  groups: GroupPick[]
  knockout: KnockoutMatchPick[]
  language: Language
  photoDataUrl?: string
  wildcardSelections?: Record<string, TeamId>
}
```

- [ ] **Step 2: Add GROUP_MATCHES to wc2026.ts**

Open `src/data/wc2026.ts`. Add this import at the top (it's already imported but add GroupMatch):

```typescript
import type { Team, GroupId, TeamId, R32Slot, KnockoutStructureEntry, GroupMatch } from '@/lib/picks'
```

Then append after the existing exports at the bottom of the file:

```typescript
export const GROUP_MATCHES: Record<GroupId, GroupMatch[]> = {
  A: [
    { home: 'USA', away: 'PAN', date: '2026-06-11', time: '17:00 ET', venue: 'Rose Bowl, Los Angeles' },
    { home: 'BOL', away: 'JAM', date: '2026-06-11', time: '20:00 ET', venue: 'SoFi Stadium, Los Angeles' },
    { home: 'USA', away: 'BOL', date: '2026-06-16', time: '17:00 ET', venue: 'Lumen Field, Seattle' },
    { home: 'JAM', away: 'PAN', date: '2026-06-16', time: '20:00 ET', venue: "Levi's Stadium, San Francisco" },
    { home: 'USA', away: 'JAM', date: '2026-06-26', time: '17:00 ET', venue: 'Rose Bowl, Los Angeles' },
    { home: 'PAN', away: 'BOL', date: '2026-06-26', time: '17:00 ET', venue: "Levi's Stadium, San Francisco" },
  ],
  B: [
    { home: 'MEX', away: 'FRA', date: '2026-06-12', time: '18:00 CT', venue: 'Estadio Azteca, Mexico City' },
    { home: 'SRB', away: 'ALB', date: '2026-06-12', time: '21:00 ET', venue: 'AT&T Stadium, Arlington' },
    { home: 'MEX', away: 'SRB', date: '2026-06-17', time: '18:00 CT', venue: 'Estadio BBVA, Monterrey' },
    { home: 'ALB', away: 'FRA', date: '2026-06-17', time: '21:00 ET', venue: 'Hard Rock Stadium, Miami' },
    { home: 'MEX', away: 'ALB', date: '2026-06-25', time: '17:00 CT', venue: 'Estadio Azteca, Mexico City' },
    { home: 'FRA', away: 'SRB', date: '2026-06-25', time: '17:00 ET', venue: 'Mercedes-Benz Stadium, Atlanta' },
  ],
  C: [
    { home: 'CAN', away: 'ENG', date: '2026-06-12', time: '14:00 ET', venue: 'BMO Field, Toronto' },
    { home: 'DEN', away: 'SVK', date: '2026-06-12', time: '20:00 PT', venue: 'BC Place, Vancouver' },
    { home: 'CAN', away: 'DEN', date: '2026-06-17', time: '17:00 ET', venue: 'BMO Field, Toronto' },
    { home: 'SVK', away: 'ENG', date: '2026-06-17', time: '20:00 PT', venue: 'BC Place, Vancouver' },
    { home: 'CAN', away: 'SVK', date: '2026-06-27', time: '20:00 PT', venue: 'BC Place, Vancouver' },
    { home: 'ENG', away: 'DEN', date: '2026-06-27', time: '17:00 ET', venue: 'BMO Field, Toronto' },
  ],
  D: [
    { home: 'NED', away: 'AUT', date: '2026-06-13', time: '17:00 ET', venue: 'Lincoln Financial Field, Philadelphia' },
    { home: 'UKR', away: 'ISL', date: '2026-06-13', time: '20:00 ET', venue: 'Gillette Stadium, Boston' },
    { home: 'NED', away: 'UKR', date: '2026-06-18', time: '17:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'ISL', away: 'AUT', date: '2026-06-18', time: '20:00 ET', venue: 'Lincoln Financial Field, Philadelphia' },
    { home: 'NED', away: 'ISL', date: '2026-06-25', time: '17:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'AUT', away: 'UKR', date: '2026-06-25', time: '17:00 ET', venue: 'Gillette Stadium, Boston' },
  ],
  E: [
    { home: 'BRA', away: 'COL', date: '2026-06-13', time: '14:00 CT', venue: 'NRG Stadium, Houston' },
    { home: 'SEN', away: 'PER', date: '2026-06-13', time: '20:00 CT', venue: 'AT&T Stadium, Arlington' },
    { home: 'BRA', away: 'SEN', date: '2026-06-18', time: '14:00 ET', venue: 'Hard Rock Stadium, Miami' },
    { home: 'PER', away: 'COL', date: '2026-06-18', time: '20:00 CT', venue: 'NRG Stadium, Houston' },
    { home: 'BRA', away: 'PER', date: '2026-06-26', time: '14:00 ET', venue: 'Hard Rock Stadium, Miami' },
    { home: 'COL', away: 'SEN', date: '2026-06-26', time: '14:00 CT', venue: 'AT&T Stadium, Arlington' },
  ],
  F: [
    { home: 'ITA', away: 'SUI', date: '2026-06-14', time: '17:00 ET', venue: 'Mercedes-Benz Stadium, Atlanta' },
    { home: 'CMR', away: 'GIN', date: '2026-06-14', time: '20:00 CT', venue: 'Arrowhead Stadium, Kansas City' },
    { home: 'ITA', away: 'CMR', date: '2026-06-19', time: '17:00 PT', venue: 'Lumen Field, Seattle' },
    { home: 'GIN', away: 'SUI', date: '2026-06-19', time: '20:00 PT', venue: 'SoFi Stadium, Los Angeles' },
    { home: 'ITA', away: 'GIN', date: '2026-06-27', time: '17:00 ET', venue: 'Mercedes-Benz Stadium, Atlanta' },
    { home: 'SUI', away: 'CMR', date: '2026-06-27', time: '17:00 CT', venue: 'Arrowhead Stadium, Kansas City' },
  ],
  G: [
    { home: 'ESP', away: 'TUR', date: '2026-06-14', time: '18:00 CT', venue: 'Estadio Akron, Guadalajara' },
    { home: 'GEO', away: 'UZB', date: '2026-06-14', time: '21:00 CT', venue: 'Estadio BBVA, Monterrey' },
    { home: 'ESP', away: 'GEO', date: '2026-06-19', time: '18:00 CT', venue: 'Estadio Azteca, Mexico City' },
    { home: 'UZB', away: 'TUR', date: '2026-06-19', time: '21:00 CT', venue: 'Estadio Akron, Guadalajara' },
    { home: 'ESP', away: 'UZB', date: '2026-06-28', time: '17:00 CT', venue: 'Estadio Azteca, Mexico City' },
    { home: 'TUR', away: 'GEO', date: '2026-06-28', time: '17:00 CT', venue: 'Estadio Akron, Guadalajara' },
  ],
  H: [
    { home: 'POR', away: 'CRO', date: '2026-06-15', time: '17:00 PT', venue: "Levi's Stadium, San Francisco" },
    { home: 'CZE', away: 'TZA', date: '2026-06-15', time: '20:00 PT', venue: 'Rose Bowl, Los Angeles' },
    { home: 'POR', away: 'CZE', date: '2026-06-20', time: '17:00 PT', venue: 'SoFi Stadium, Los Angeles' },
    { home: 'TZA', away: 'CRO', date: '2026-06-20', time: '20:00 PT', venue: "Levi's Stadium, San Francisco" },
    { home: 'POR', away: 'TZA', date: '2026-06-29', time: '17:00 PT', venue: 'SoFi Stadium, Los Angeles' },
    { home: 'CRO', away: 'CZE', date: '2026-06-29', time: '17:00 PT', venue: 'Rose Bowl, Los Angeles' },
  ],
  I: [
    { home: 'GER', away: 'JPN', date: '2026-06-15', time: '14:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'IDN', away: 'VIE', date: '2026-06-15', time: '20:00 ET', venue: 'Gillette Stadium, Boston' },
    { home: 'GER', away: 'IDN', date: '2026-06-20', time: '14:00 ET', venue: 'Lincoln Financial Field, Philadelphia' },
    { home: 'VIE', away: 'JPN', date: '2026-06-20', time: '20:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'GER', away: 'VIE', date: '2026-06-29', time: '14:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'JPN', away: 'IDN', date: '2026-06-29', time: '14:00 ET', venue: 'Gillette Stadium, Boston' },
  ],
  J: [
    { home: 'ARG', away: 'URU', date: '2026-06-15', time: '21:00 CT', venue: 'NRG Stadium, Houston' },
    { home: 'ECU', away: 'CHL', date: '2026-06-15', time: '18:00 CT', venue: 'AT&T Stadium, Arlington' },
    { home: 'ARG', away: 'ECU', date: '2026-06-21', time: '17:00 CT', venue: 'Arrowhead Stadium, Kansas City' },
    { home: 'CHL', away: 'URU', date: '2026-06-21', time: '20:00 CT', venue: 'NRG Stadium, Houston' },
    { home: 'ARG', away: 'CHL', date: '2026-06-29', time: '17:00 CT', venue: 'NRG Stadium, Houston' },
    { home: 'URU', away: 'ECU', date: '2026-06-29', time: '17:00 CT', venue: 'AT&T Stadium, Arlington' },
  ],
  K: [
    { home: 'MAR', away: 'AUS', date: '2026-06-16', time: '14:00 PT', venue: 'BC Place, Vancouver' },
    { home: 'TUN', away: 'SAU', date: '2026-06-16', time: '20:00 ET', venue: 'BMO Field, Toronto' },
    { home: 'MAR', away: 'TUN', date: '2026-06-21', time: '14:00 CT', venue: 'Arrowhead Stadium, Kansas City' },
    { home: 'SAU', away: 'AUS', date: '2026-06-21', time: '20:00 ET', venue: 'Mercedes-Benz Stadium, Atlanta' },
    { home: 'MAR', away: 'SAU', date: '2026-06-28', time: '14:00 CT', venue: 'Arrowhead Stadium, Kansas City' },
    { home: 'AUS', away: 'TUN', date: '2026-06-28', time: '14:00 ET', venue: 'Mercedes-Benz Stadium, Atlanta' },
  ],
  L: [
    { home: 'KOR', away: 'NGA', date: '2026-06-16', time: '17:00 ET', venue: 'Hard Rock Stadium, Miami' },
    { home: 'CRI', away: 'GHA', date: '2026-06-16', time: '20:00 ET', venue: 'Lincoln Financial Field, Philadelphia' },
    { home: 'KOR', away: 'CRI', date: '2026-06-21', time: '17:00 PT', venue: 'Lumen Field, Seattle' },
    { home: 'GHA', away: 'NGA', date: '2026-06-21', time: '20:00 ET', venue: 'Hard Rock Stadium, Miami' },
    { home: 'KOR', away: 'GHA', date: '2026-06-28', time: '17:00 PT', venue: 'Lumen Field, Seattle' },
    { home: 'NGA', away: 'CRI', date: '2026-06-28', time: '17:00 ET', venue: 'Hard Rock Stadium, Miami' },
  ],
}
```

- [ ] **Step 3: Add new i18n keys**

Open `src/lib/i18n.ts`. Add these entries to each language in the `STRINGS` object:

```typescript
// Add to the en block:
backToHome: 'Home',
backToGroups: '← Groups',
backToOverview: '← Back',
knockoutOverview: 'Knockout Bracket',
quadrantUL: 'Section 1',
quadrantLL: 'Section 2',
quadrantUR: 'Section 3',
quadrantLR: 'Section 4',
quadrantTapFill: 'Tap to fill',
proceedFinalFour: 'Final Four →',
finalFour: 'Final Four',
semifinal: 'Semifinal',
pickWildCard: 'Pick 3rd-place team',

// Add to the cn block (same keys, Chinese values):
backToHome: '首页',
backToGroups: '← 小组赛',
backToOverview: '← 返回',
knockoutOverview: '淘汰赛',
quadrantUL: '第一区',
quadrantLL: '第二区',
quadrantUR: '第三区',
quadrantLR: '第四区',
quadrantTapFill: '点击填写',
proceedFinalFour: '最后四强 →',
finalFour: '最后四强',
semifinal: '半决赛',
pickWildCard: '选择第三名球队',

// Add to the es block:
backToHome: 'Inicio',
backToGroups: '← Grupos',
backToOverview: '← Atrás',
knockoutOverview: 'Eliminatoria',
quadrantUL: 'Sección 1',
quadrantLL: 'Sección 2',
quadrantUR: 'Sección 3',
quadrantLR: 'Sección 4',
quadrantTapFill: 'Toca para llenar',
proceedFinalFour: 'Final Four →',
finalFour: 'Final Four',
semifinal: 'Semifinal',
pickWildCard: 'Elige el equipo 3°',
```

The `i18n.ts` file uses a `STRINGS` record keyed by language. Look at the existing structure and add these keys to each language's block in the same pattern.

- [ ] **Step 4: Create LanguageSwitcher component**

Create `src/components/LanguageSwitcher.tsx`:

```typescript
'use client'
import { useLanguage } from '@/hooks/useLanguage'
import type { Language } from '@/lib/picks'

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  return (
    <div className="flex gap-2">
      {(['en', 'cn', 'es'] as Language[]).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
            lang === l
              ? 'bg-[#ffd700] text-black'
              : 'text-[#ffd700] border border-[#ffd700] hover:bg-[#ffd700]/10'
          }`}
        >
          {l === 'en' ? 'EN' : l === 'cn' ? '中文' : 'ES'}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Add persistent header to layout.tsx**

Replace the content of `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FIFA World Cup 2026 — My Prediction',
  description: 'Predict the 2026 World Cup and generate your bracket image',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#060b18] text-white min-h-screen`}>
        <header className="fixed top-0 right-0 z-50 p-3">
          <LanguageSwitcher />
        </header>
        <div className="pt-0">
          {children}
        </div>
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Remove inline switcher from LandingPage**

Open `src/components/landing/LandingPage.tsx`. Delete the language switcher block (lines 14–28 of the original):

```typescript
// DELETE this block entirely:
{/* Language switcher */}
<div className="absolute top-4 right-4 flex gap-2">
  {(['en', 'cn', 'es'] as Language[]).map(l => (
    <button
      key={l}
      onClick={() => setLang(l)}
      className={...}
    >
      {l === 'en' ? 'EN' : l === 'cn' ? '中文' : 'ES'}
    </button>
  ))}
</div>
```

Also remove the unused `setLang` destructure and the `Language` import if no longer needed after the deletion.

- [ ] **Step 7: Build check**

```bash
npm run build
```

Expected: clean build, no TypeScript errors.

- [ ] **Step 8: Commit**

```bash
git add src/lib/picks.ts src/data/wc2026.ts src/lib/i18n.ts src/components/LanguageSwitcher.tsx src/app/layout.tsx src/components/landing/LandingPage.tsx
git commit -m "feat: fixture data, i18n keys, persistent language switcher in header"
```

---

## Task 2: Group Stage Fixture Panel + Back Navigation

**Files:**
- Modify: `src/components/group-stage/GroupStagePicker.tsx`
- Modify: `src/app/predict/page.tsx`

- [ ] **Step 1: Write failing test for GroupStagePicker back button**

Open `tests/components/GroupCard.test.tsx` (or create `tests/components/GroupStagePicker.test.tsx`):

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { GroupStagePicker } from '@/components/group-stage/GroupStagePicker'
import { GROUPS } from '@/data/wc2026'

const basePicks = GROUPS.map(g => ({
  groupId: g.id as import('@/lib/picks').GroupId,
  ranking: ['', '', '', ''] as [string, string, string, string],
  scores: {},
}))

test('calls onBack when back-to-home button is clicked', () => {
  const onBack = vi.fn()
  render(
    <GroupStagePicker
      picks={basePicks}
      lang="en"
      onRankingChange={() => {}}
      onScoreChange={() => {}}
      onComplete={() => {}}
      onBack={onBack}
    />
  )
  fireEvent.click(screen.getByText('Home'))
  expect(onBack).toHaveBeenCalledTimes(1)
})

test('shows fixture venue for group A', () => {
  render(
    <GroupStagePicker
      picks={basePicks}
      lang="en"
      onRankingChange={() => {}}
      onScoreChange={() => {}}
      onComplete={() => {}}
      onBack={() => {}}
    />
  )
  expect(screen.getByText(/Rose Bowl/)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm run test:run -- --reporter=verbose tests/components/GroupStagePicker.test.tsx
```

Expected: FAIL — `onBack` prop missing, `Rose Bowl` not found.

- [ ] **Step 3: Update GroupStagePicker**

Replace the full content of `src/components/group-stage/GroupStagePicker.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { GroupCard } from './GroupCard'
import { GROUPS, TEAMS, GROUP_MATCHES } from '@/data/wc2026'
import { t } from '@/lib/i18n'
import type { GroupPick, TeamId, GroupId, Language } from '@/lib/picks'

interface Props {
  picks: GroupPick[]
  lang: Language
  onRankingChange: (groupId: GroupId, ranking: [TeamId, TeamId, TeamId, TeamId]) => void
  onScoreChange: (groupId: GroupId, matchKey: string, home: number | null, away: number | null) => void
  onComplete: () => void
  onBack: () => void
}

export function GroupStagePicker({ picks, lang, onRankingChange, onScoreChange, onComplete, onBack }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const group = GROUPS[currentIdx]
  const pick = picks.find(p => p.groupId === group.id) ?? picks[currentIdx]
  const isLast = currentIdx === GROUPS.length - 1
  const currentComplete = pick.ranking.filter(Boolean).length >= 3
  const fixtures = GROUP_MATCHES[group.id as GroupId]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pt-14">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-[#8a9bc0] text-sm hover:text-[#ffd700] transition-colors"
        >
          {t(lang, 'backToHome')}
        </button>
        <span className="text-[#ffd700] text-sm font-bold">
          {t(lang, 'groupOf', currentIdx + 1, GROUPS.length)}
        </span>
      </div>
      <div className="h-1 bg-[#1e2d50] rounded mb-6">
        <div
          className="h-full bg-gradient-to-r from-[#ffd700] to-[#ff8c00] rounded transition-all"
          style={{ width: `${((currentIdx + 1) / GROUPS.length) * 100}%` }}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Group ranking card */}
        <div className="flex-1">
          <GroupCard
            group={group}
            teams={TEAMS}
            pick={pick}
            lang={lang}
            onRankingChange={r => onRankingChange(group.id as GroupId, r)}
            onScoreChange={(k, h, a) => onScoreChange(group.id as GroupId, k, h, a)}
          />
        </div>

        {/* Fixtures panel */}
        <div className="md:w-64 bg-[#0c1526] border border-[#1a2847] rounded-xl p-3">
          <div className="text-[#ffd700] text-[10px] font-bold uppercase tracking-wider mb-3">
            {t(lang, 'groupStage')} — Group {group.id}
          </div>
          <div className="flex flex-col gap-2">
            {fixtures.map((m, i) => {
              const home = TEAMS[m.home]
              const away = TEAMS[m.away]
              return (
                <div key={i} className="text-[9px] text-[#8a9bc0]">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span>{home?.flag}</span>
                    <span className="text-white">{home?.name}</span>
                    <span className="text-[#3a4a6a] mx-1">vs</span>
                    <span>{away?.flag}</span>
                    <span className="text-white">{away?.name}</span>
                  </div>
                  <div className="text-[#4a5a7a]">{m.date} · {m.time}</div>
                  <div className="text-[#4a5a7a] truncate">{m.venue}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        {currentIdx > 0 && (
          <button
            onClick={() => setCurrentIdx(i => i - 1)}
            className="flex-1 border border-[#1e2d50] text-[#8a9bc0] py-3 rounded-xl font-semibold hover:border-[#ffd700] transition-colors"
          >
            {t(lang, 'prevGroup')}
          </button>
        )}
        <button
          onClick={() => isLast ? onComplete() : setCurrentIdx(i => i + 1)}
          disabled={!currentComplete}
          className="flex-1 bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform"
        >
          {isLast ? t(lang, 'knockoutRounds') : t(lang, 'nextGroup')}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm run test:run -- --reporter=verbose tests/components/GroupStagePicker.test.tsx
```

Expected: PASS

- [ ] **Step 5: Update predict/page.tsx to pass onBack + back from knockout**

Replace `src/app/predict/page.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePredictions } from '@/hooks/usePredictions'
import { useLanguage } from '@/hooks/useLanguage'
import { GroupStagePicker } from '@/components/group-stage/GroupStagePicker'
import { ChampionReveal } from '@/components/champion/ChampionReveal'
import { PhotoCapture } from '@/components/champion/PhotoCapture'
import { KnockoutOverview } from '@/components/knockout/KnockoutOverview'
import { QuadrantView } from '@/components/knockout/QuadrantView'
import { FinalFourView } from '@/components/knockout/FinalFourView'

type Step = 'groups' | 'knockout' | 'final-four' | 'champion' | 'photo'
type QuadrantId = 'UL' | 'LL' | 'UR' | 'LR'
type KnockoutView = 'overview' | QuadrantId

export default function PredictPage() {
  const [step, setStep] = useState<Step>('groups')
  const [knockoutView, setKnockoutView] = useState<KnockoutView>('overview')
  const { lang } = useLanguage()
  const router = useRouter()
  const {
    groups, knockout, r32Matchups, champion, wildcardSelections,
    setGroupRanking, setGroupScore, setKnockoutWinner, setKnockoutScore, setWildcardSelection,
  } = usePredictions()

  function handlePhotoReady(dataUrl: string | undefined) {
    sessionStorage.setItem('wc2026_picks', JSON.stringify({
      groups, knockout, language: lang, photoDataUrl: dataUrl, wildcardSelections,
    }))
    router.push('/share')
  }

  if (step === 'groups') {
    return (
      <GroupStagePicker
        picks={groups}
        lang={lang}
        onRankingChange={setGroupRanking}
        onScoreChange={setGroupScore}
        onComplete={() => { setStep('knockout'); setKnockoutView('overview') }}
        onBack={() => router.push('/')}
      />
    )
  }

  if (step === 'knockout') {
    if (knockoutView !== 'overview') {
      return (
        <QuadrantView
          quadrant={knockoutView as QuadrantId}
          r32Matchups={r32Matchups}
          knockoutPicks={knockout}
          wildcardSelections={wildcardSelections}
          lang={lang}
          onWinnerSelect={setKnockoutWinner}
          onScoreChange={setKnockoutScore}
          onWildcardSelect={setWildcardSelection}
          onBack={() => setKnockoutView('overview')}
        />
      )
    }
    return (
      <KnockoutOverview
        r32Matchups={r32Matchups}
        knockoutPicks={knockout}
        wildcardSelections={wildcardSelections}
        lang={lang}
        onSelectQuadrant={(q) => setKnockoutView(q)}
        onBack={() => setStep('groups')}
        onProceedFinalFour={() => setStep('final-four')}
      />
    )
  }

  if (step === 'final-four') {
    return (
      <FinalFourView
        knockoutPicks={knockout}
        wildcardSelections={wildcardSelections}
        r32Matchups={r32Matchups}
        lang={lang}
        onWinnerSelect={setKnockoutWinner}
        onBack={() => { setStep('knockout'); setKnockoutView('overview') }}
        onChampionSelected={() => setStep('champion')}
      />
    )
  }

  if (step === 'champion' && champion) {
    return <ChampionReveal champion={champion} lang={lang} onContinue={() => setStep('photo')} />
  }

  if (step === 'photo') {
    return <PhotoCapture lang={lang} onPhotoReady={handlePhotoReady} />
  }

  return null
}
```

- [ ] **Step 6: Update usePredictions to add wildcardSelections**

Open `src/hooks/usePredictions.ts`. Add:
1. A `wildcardSelections` state: `const [wildcardSelections, setWildcardSelectionsState] = useState<Record<string, string>>({})` 
2. A handler: `function setWildcardSelection(matchId: string, teamId: string) { setWildcardSelectionsState(prev => ({ ...prev, [matchId]: teamId })) }`
3. Export both `wildcardSelections` and `setWildcardSelection` from the hook's return value.

The full modified hook return type becomes:
```typescript
return {
  groups, knockout, r32Matchups, champion, wildcardSelections,
  setGroupRanking, setGroupScore, setKnockoutWinner, setKnockoutScore, setWildcardSelection,
}
```

- [ ] **Step 7: Build check**

```bash
npm run build
```

Expected: may fail because KnockoutOverview, QuadrantView, FinalFourView don't exist yet. That's fine — the plan continues to create them. If you want an intermediate working state, comment out those imports in predict/page.tsx temporarily. Otherwise proceed to Task 3.

- [ ] **Step 8: Commit**

```bash
git add src/components/group-stage/GroupStagePicker.tsx src/app/predict/page.tsx src/hooks/usePredictions.ts tests/components/GroupStagePicker.test.tsx
git commit -m "feat: group fixture panel, back navigation, wildcard selections state"
```

---

## Task 3: KnockoutOverview + QuadrantView

**Files:**
- Create: `src/components/knockout/KnockoutOverview.tsx`
- Create: `src/components/knockout/QuadrantView.tsx`
- Create: `tests/components/KnockoutOverview.test.tsx`
- Create: `tests/components/QuadrantView.test.tsx`

### Context

`r32Matchups` comes from `buildR32Matchups(groups)` which returns `R32Matchup[]`:
```typescript
interface R32Matchup {
  matchId: string        // e.g. 'R32_L1'
  homeTeam: string|null  // resolved team id or null
  awayTeam: string|null  // null when wild-card slot needs selection
  awayOptions?: string[] // candidate team ids when awayTeam is null
}
```

`knockoutPicks` is `KnockoutMatchPick[]`. To get the winner for match `matchId`:
```typescript
knockoutPicks.find(p => p.matchId === matchId)?.winner ?? null
```

To get a team's info: `TEAMS[teamId]` → `{ id, name, nameZh, nameEs, flag }`.

`wildcardSelections` is `Record<string, string>` mapping matchId → selected teamId for wild-card away slots.

### Quadrant definitions (hardcoded in these components):

```typescript
const QUADRANTS = {
  UL: { r32: ['R32_L1','R32_L2','R32_L3','R32_L4'], r16: ['R16_L1','R16_L2'], qf: 'QF_L1' },
  LL: { r32: ['R32_L5','R32_L6','R32_L7','R32_L8'], r16: ['R16_L3','R16_L4'], qf: 'QF_L2' },
  UR: { r32: ['R32_R1','R32_R2','R32_R3','R32_R4'], r16: ['R16_R1','R16_R2'], qf: 'QF_R1' },
  LR: { r32: ['R32_R5','R32_R6','R32_R7','R32_R8'], r16: ['R16_R3','R16_R4'], qf: 'QF_R2' },
}
```

`KNOCKOUT_STRUCTURE` from `wc2026.ts` provides the feeder relationships. Import it where needed.

- [ ] **Step 1: Write failing tests for KnockoutOverview**

Create `tests/components/KnockoutOverview.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { KnockoutOverview } from '@/components/knockout/KnockoutOverview'
import { GROUPS } from '@/data/wc2026'
import { buildR32Matchups } from '@/lib/bracket'
import type { GroupPick, GroupId, KnockoutMatchPick } from '@/lib/picks'

const emptyGroups: GroupPick[] = GROUPS.map(g => ({
  groupId: g.id as GroupId,
  ranking: ['', '', '', ''] as [string,string,string,string],
  scores: {},
}))
const r32 = buildR32Matchups(emptyGroups)
const emptyKnockout: KnockoutMatchPick[] = []

test('renders 4 quadrant cards', () => {
  render(
    <KnockoutOverview
      r32Matchups={r32}
      knockoutPicks={emptyKnockout}
      wildcardSelections={{}}
      lang="en"
      onSelectQuadrant={() => {}}
      onBack={() => {}}
      onProceedFinalFour={() => {}}
    />
  )
  expect(screen.getByText('Section 1')).toBeInTheDocument()
  expect(screen.getByText('Section 2')).toBeInTheDocument()
  expect(screen.getByText('Section 3')).toBeInTheDocument()
  expect(screen.getByText('Section 4')).toBeInTheDocument()
})

test('calls onSelectQuadrant with UL when Section 1 is clicked', () => {
  const onSelect = vi.fn()
  render(
    <KnockoutOverview
      r32Matchups={r32}
      knockoutPicks={emptyKnockout}
      wildcardSelections={{}}
      lang="en"
      onSelectQuadrant={onSelect}
      onBack={() => {}}
      onProceedFinalFour={() => {}}
    />
  )
  fireEvent.click(screen.getByText('Section 1'))
  expect(onSelect).toHaveBeenCalledWith('UL')
})

test('does not show Final Four button when no quadrant is complete', () => {
  render(
    <KnockoutOverview
      r32Matchups={r32}
      knockoutPicks={emptyKnockout}
      wildcardSelections={{}}
      lang="en"
      onSelectQuadrant={() => {}}
      onBack={() => {}}
      onProceedFinalFour={() => {}}
    />
  )
  expect(screen.queryByText(/Final Four/)).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm run test:run -- --reporter=verbose tests/components/KnockoutOverview.test.tsx
```

Expected: FAIL — component file doesn't exist.

- [ ] **Step 3: Create KnockoutOverview.tsx**

Create `src/components/knockout/KnockoutOverview.tsx`:

```typescript
'use client'
import { TEAMS, KNOCKOUT_STRUCTURE } from '@/data/wc2026'
import { t } from '@/lib/i18n'
import type { Language, KnockoutMatchPick } from '@/lib/picks'
import type { R32Matchup } from '@/lib/bracket'

type QuadrantId = 'UL' | 'LL' | 'UR' | 'LR'

interface Props {
  r32Matchups: R32Matchup[]
  knockoutPicks: KnockoutMatchPick[]
  wildcardSelections: Record<string, string>
  lang: Language
  onSelectQuadrant: (q: QuadrantId) => void
  onBack: () => void
  onProceedFinalFour: () => void
}

const QUADRANTS: Record<QuadrantId, { r32: string[]; r16: string[]; qf: string; labelKey: keyof typeof import('@/lib/i18n').STRINGS['en'] }> = {
  UL: { r32: ['R32_L1','R32_L2','R32_L3','R32_L4'], r16: ['R16_L1','R16_L2'], qf: 'QF_L1', labelKey: 'quadrantUL' },
  LL: { r32: ['R32_L5','R32_L6','R32_L7','R32_L8'], r16: ['R16_L3','R16_L4'], qf: 'QF_L2', labelKey: 'quadrantLL' },
  UR: { r32: ['R32_R1','R32_R2','R32_R3','R32_R4'], r16: ['R16_R1','R16_R2'], qf: 'QF_R1', labelKey: 'quadrantUR' },
  LR: { r32: ['R32_R5','R32_R6','R32_R7','R32_R8'], r16: ['R16_R3','R16_R4'], qf: 'QF_R2', labelKey: 'quadrantLR' },
}

function getWinner(matchId: string, picks: KnockoutMatchPick[]): string | null {
  return picks.find(p => p.matchId === matchId)?.winner ?? null
}

function resolveTeam(matchId: string, picks: KnockoutMatchPick[], r32Matchups: R32Matchup[], wildcards: Record<string,string>): string | null {
  // For R32 matches
  const r32 = r32Matchups.find(m => m.matchId === matchId)
  if (r32) {
    const winner = getWinner(matchId, picks)
    return winner
  }
  // For R16/QF: winner of feeder match
  const entry = KNOCKOUT_STRUCTURE.find(e => e.matchId === matchId)
  if (!entry) return null
  return getWinner(matchId, picks)
}

function isQuadrantComplete(q: typeof QUADRANTS[QuadrantId], picks: KnockoutMatchPick[]): boolean {
  return getWinner(q.qf, picks) !== null
}

function getQFWinner(qfMatchId: string, picks: KnockoutMatchPick[]): { id: string; flag: string; name: string } | null {
  const winner = getWinner(qfMatchId, picks)
  if (!winner) return null
  const team = TEAMS[winner]
  return team ? { id: winner, flag: team.flag, name: team.name } : null
}

export function KnockoutOverview({ r32Matchups, knockoutPicks, wildcardSelections, lang, onSelectQuadrant, onBack, onProceedFinalFour }: Props) {
  const allComplete = (Object.keys(QUADRANTS) as QuadrantId[]).every(q =>
    isQuadrantComplete(QUADRANTS[q], knockoutPicks)
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pt-14">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-[#8a9bc0] text-sm hover:text-[#ffd700] transition-colors">
          {t(lang, 'backToGroups')}
        </button>
        <h2 className="text-[#ffd700] font-bold text-lg">{t(lang, 'knockoutOverview')}</h2>
        <div className="w-16" />
      </div>

      <p className="text-[#8a9bc0] text-sm text-center mb-6">
        Tap a section to pick the winners
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {(Object.keys(QUADRANTS) as QuadrantId[]).map(qId => {
          const q = QUADRANTS[qId]
          const complete = isQuadrantComplete(q, knockoutPicks)
          const qfWinner = complete ? getQFWinner(q.qf, knockoutPicks) : null
          const r32Teams = q.r32.flatMap(matchId => {
            const m = r32Matchups.find(x => x.matchId === matchId)
            if (!m) return []
            const home = m.homeTeam ? TEAMS[m.homeTeam] : null
            const awayId = m.awayTeam ?? wildcardSelections[matchId]
            const away = awayId ? TEAMS[awayId] : null
            return [home, away].filter(Boolean)
          })

          return (
            <button
              key={qId}
              onClick={() => onSelectQuadrant(qId)}
              className={`rounded-xl border p-4 text-left transition-all hover:scale-[1.02] ${
                complete
                  ? 'border-[#ffd700] bg-[#1a2e0a]'
                  : 'border-[#1a2847] bg-[#0c1526] hover:border-[#3a5080]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#ffd700] text-xs font-bold">{t(lang, q.labelKey as any)}</span>
                {complete
                  ? <span className="text-green-400 text-[10px]">✓</span>
                  : <span className="text-[#4a5a7a] text-[10px]">{t(lang, 'quadrantTapFill')}</span>
                }
              </div>
              {complete && qfWinner ? (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-base">{qfWinner.flag}</span>
                  <span className="text-white text-xs font-semibold">{qfWinner.name}</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1 mt-1">
                  {r32Teams.slice(0, 4).map((team, i) => (
                    <span key={i} className="text-sm" title={team!.name}>{team!.flag}</span>
                  ))}
                  {r32Teams.length > 4 && (
                    <span className="text-[#4a5a7a] text-[10px] self-center">+{r32Teams.length - 4}</span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {allComplete && (
        <button
          onClick={onProceedFinalFour}
          className="w-full bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black py-4 rounded-xl hover:scale-[1.02] transition-transform text-lg"
        >
          {t(lang, 'proceedFinalFour')}
        </button>
      )}
    </div>
  )
}
```

**Note on the labelKey typing:** The `labelKey` field in QUADRANTS uses `as any` to avoid a complex conditional type. If TypeScript complains, change the type to `string` and pass it directly to `t(lang, q.labelKey as any)`.

- [ ] **Step 4: Run KnockoutOverview tests**

```bash
npm run test:run -- --reporter=verbose tests/components/KnockoutOverview.test.tsx
```

Expected: PASS (3 tests).

- [ ] **Step 5: Write failing tests for QuadrantView**

Create `tests/components/QuadrantView.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { QuadrantView } from '@/components/knockout/QuadrantView'
import { GROUPS, TEAMS } from '@/data/wc2026'
import { buildR32Matchups } from '@/lib/bracket'
import type { GroupPick, GroupId, KnockoutMatchPick } from '@/lib/picks'

const filledGroups: GroupPick[] = GROUPS.map(g => ({
  groupId: g.id as GroupId,
  ranking: [g.teams[0], g.teams[1], g.teams[2], g.teams[3]] as [string,string,string,string],
  scores: {},
}))
const r32 = buildR32Matchups(filledGroups)
const emptyKnockout: KnockoutMatchPick[] = []

test('renders UL quadrant R32 matches', () => {
  render(
    <QuadrantView
      quadrant="UL"
      r32Matchups={r32}
      knockoutPicks={emptyKnockout}
      wildcardSelections={{}}
      lang="en"
      onWinnerSelect={() => {}}
      onScoreChange={() => {}}
      onWildcardSelect={() => {}}
      onBack={() => {}}
    />
  )
  // R32_L1 home slot is 1E → group E rank1 = BRA
  expect(screen.getByText(/Brazil/i)).toBeInTheDocument()
})

test('calls onBack when back button is clicked', () => {
  const onBack = vi.fn()
  render(
    <QuadrantView
      quadrant="UL"
      r32Matchups={r32}
      knockoutPicks={emptyKnockout}
      wildcardSelections={{}}
      lang="en"
      onWinnerSelect={() => {}}
      onScoreChange={() => {}}
      onWildcardSelect={() => {}}
      onBack={onBack}
    />
  )
  fireEvent.click(screen.getByText(/Back/i))
  expect(onBack).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 6: Run test to confirm it fails**

```bash
npm run test:run -- --reporter=verbose tests/components/QuadrantView.test.tsx
```

Expected: FAIL — component doesn't exist.

- [ ] **Step 7: Create QuadrantView.tsx**

Create `src/components/knockout/QuadrantView.tsx`:

```typescript
'use client'
import { TEAMS, KNOCKOUT_STRUCTURE } from '@/data/wc2026'
import { t } from '@/lib/i18n'
import type { Language, KnockoutMatchPick, TeamId } from '@/lib/picks'
import type { R32Matchup } from '@/lib/bracket'

type QuadrantId = 'UL' | 'LL' | 'UR' | 'LR'

const QUADRANT_MATCHES: Record<QuadrantId, { r32: [string,string,string,string]; r16: [string,string]; qf: string }> = {
  UL: { r32: ['R32_L1','R32_L2','R32_L3','R32_L4'], r16: ['R16_L1','R16_L2'], qf: 'QF_L1' },
  LL: { r32: ['R32_L5','R32_L6','R32_L7','R32_L8'], r16: ['R16_L3','R16_L4'], qf: 'QF_L2' },
  UR: { r32: ['R32_R1','R32_R2','R32_R3','R32_R4'], r16: ['R16_R1','R16_R2'], qf: 'QF_R1' },
  LR: { r32: ['R32_R5','R32_R6','R32_R7','R32_R8'], r16: ['R16_R3','R16_R4'], qf: 'QF_R2' },
}

interface Props {
  quadrant: QuadrantId
  r32Matchups: R32Matchup[]
  knockoutPicks: KnockoutMatchPick[]
  wildcardSelections: Record<string, TeamId>
  lang: Language
  onWinnerSelect: (matchId: string, winner: TeamId) => void
  onScoreChange: (matchId: string, home: number | null, away: number | null) => void
  onWildcardSelect: (matchId: string, teamId: TeamId) => void
  onBack: () => void
}

function getWinner(matchId: string, picks: KnockoutMatchPick[]): TeamId | null {
  return picks.find(p => p.matchId === matchId)?.winner ?? null
}

function resolveMatchTeams(
  matchId: string,
  r32Matchups: R32Matchup[],
  picks: KnockoutMatchPick[],
  wildcards: Record<string, TeamId>
): { home: TeamId | null; away: TeamId | null; awayOptions?: TeamId[] } {
  // R32 match: teams come from r32Matchups
  const r32 = r32Matchups.find(m => m.matchId === matchId)
  if (r32) {
    return {
      home: r32.homeTeam,
      away: r32.awayTeam ?? wildcards[matchId] ?? null,
      awayOptions: !r32.awayTeam && !wildcards[matchId] ? r32.awayOptions : undefined,
    }
  }
  // R16/QF: home = winner of homeFeeder, away = winner of awayFeeder
  const entry = KNOCKOUT_STRUCTURE.find(e => e.matchId === matchId)
  if (!entry) return { home: null, away: null }
  return {
    home: getWinner(entry.homeFeeder, picks),
    away: getWinner(entry.awayFeeder, picks),
  }
}

interface MatchRowProps {
  matchId: string
  homeTeam: TeamId | null
  awayTeam: TeamId | null
  awayOptions?: TeamId[]
  winner: TeamId | null
  lang: Language
  onWinnerSelect: (matchId: string, w: TeamId) => void
  onWildcardSelect: (matchId: string, w: TeamId) => void
  disabled: boolean
}

function MatchRow({ matchId, homeTeam, awayTeam, awayOptions, winner, lang, onWinnerSelect, onWildcardSelect, disabled }: MatchRowProps) {
  const home = homeTeam ? TEAMS[homeTeam] : null
  const away = awayTeam ? TEAMS[awayTeam] : null

  return (
    <div className={`rounded-lg border p-2 transition-all ${disabled ? 'opacity-40' : 'border-[#1a2847]'} ${winner ? 'border-[#ffd700]/50' : 'border-[#1a2847]'} bg-[#0c1526]`}>
      <div className="text-[9px] text-[#4a5a7a] mb-1 uppercase tracking-wider">{matchId}</div>

      {/* Wild card picker */}
      {awayOptions && awayOptions.length > 0 && (
        <div className="mb-2">
          <div className="text-[9px] text-[#ffd700] mb-1">{t(lang, 'pickWildCard')}</div>
          <div className="flex flex-wrap gap-1">
            {awayOptions.map(tid => {
              const team = TEAMS[tid]
              return (
                <button
                  key={tid}
                  onClick={() => onWildcardSelect(matchId, tid)}
                  className="flex items-center gap-1 px-2 py-1 rounded border border-[#1a2847] text-[10px] hover:border-[#ffd700] transition-colors"
                >
                  <span>{team?.flag}</span>
                  <span className="text-[#8a9bc0]">{team?.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Team rows */}
      {[{ team: home, id: homeTeam }, { team: away, id: awayTeam }].map(({ team, id }, i) => (
        <button
          key={i}
          disabled={disabled || !id || !home || (!away && !awayOptions)}
          onClick={() => id && !disabled && onWinnerSelect(matchId, id)}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded transition-all ${
            winner === id && id
              ? 'bg-[#1a2e0a] border border-[#ffd700] text-[#ffd700] font-bold'
              : id
              ? 'hover:bg-[#111b35] text-[#8a9bc0] hover:text-white'
              : 'opacity-30 cursor-default'
          }`}
        >
          {team ? (
            <>
              <span className="text-sm">{team.flag}</span>
              <span className="text-xs">{team.name}</span>
            </>
          ) : (
            <span className="text-[10px] text-[#3a4a6a]">TBD</span>
          )}
          {winner === id && id && <span className="ml-auto text-[10px]">✓</span>}
        </button>
      ))}
    </div>
  )
}

export function QuadrantView({ quadrant, r32Matchups, knockoutPicks, wildcardSelections, lang, onWinnerSelect, onScoreChange, onWildcardSelect, onBack }: Props) {
  const qDef = QUADRANT_MATCHES[quadrant]

  // Build match data for all 7 matches in this quadrant
  const r32Data = qDef.r32.map(id => ({
    matchId: id,
    ...resolveMatchTeams(id, r32Matchups, knockoutPicks, wildcardSelections),
    winner: getWinner(id, knockoutPicks),
  }))

  const r16Data = qDef.r16.map((id, i) => {
    const feeders = [qDef.r32[i * 2], qDef.r32[i * 2 + 1]]
    const bothFeedersDone = feeders.every(fid => getWinner(fid, knockoutPicks) !== null)
    return {
      matchId: id,
      ...resolveMatchTeams(id, r32Matchups, knockoutPicks, wildcardSelections),
      winner: getWinner(id, knockoutPicks),
      disabled: !bothFeedersDone,
    }
  })

  const qfDone = qDef.r16.every(id => getWinner(id, knockoutPicks) !== null)
  const qfData = {
    matchId: qDef.qf,
    ...resolveMatchTeams(qDef.qf, r32Matchups, knockoutPicks, wildcardSelections),
    winner: getWinner(qDef.qf, knockoutPicks),
    disabled: !qfDone,
  }

  const quadrantComplete = qfData.winner !== null

  const labelMap: Record<QuadrantId, string> = { UL: t(lang,'quadrantUL'), LL: t(lang,'quadrantLL'), UR: t(lang,'quadrantUR'), LR: t(lang,'quadrantLR') }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pt-14">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-[#8a9bc0] text-sm hover:text-[#ffd700] transition-colors">
          {t(lang, 'backToOverview')}
        </button>
        <h2 className="text-[#ffd700] font-bold">{labelMap[quadrant]}</h2>
        <div className="w-16" />
      </div>

      {quadrantComplete && (
        <div className="bg-[#1a2e0a] border border-[#ffd700] rounded-xl p-3 mb-6 text-center">
          <div className="text-[#ffd700] text-xs font-bold mb-1">Section Winner</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">{TEAMS[qfData.winner!]?.flag}</span>
            <span className="text-white font-bold">{TEAMS[qfData.winner!]?.name}</span>
          </div>
        </div>
      )}

      {/* Three rounds side by side */}
      <div className="overflow-x-auto">
        <div className="flex gap-3 min-w-[640px] md:min-w-0">
          {/* R32 column */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-[#4a5a7a] text-[10px] uppercase text-center mb-1">R32</div>
            {r32Data.map(m => (
              <MatchRow
                key={m.matchId}
                matchId={m.matchId}
                homeTeam={m.home}
                awayTeam={m.away}
                awayOptions={m.awayOptions}
                winner={m.winner}
                lang={lang}
                onWinnerSelect={onWinnerSelect}
                onWildcardSelect={onWildcardSelect}
                disabled={false}
              />
            ))}
          </div>

          {/* R16 column */}
          <div className="flex-1 flex flex-col gap-2 pt-12">
            <div className="text-[#4a5a7a] text-[10px] uppercase text-center mb-1">R16</div>
            {r16Data.map(m => (
              <MatchRow
                key={m.matchId}
                matchId={m.matchId}
                homeTeam={m.home}
                awayTeam={m.away}
                winner={m.winner}
                lang={lang}
                onWinnerSelect={onWinnerSelect}
                onWildcardSelect={onWildcardSelect}
                disabled={m.disabled}
              />
            ))}
          </div>

          {/* QF column */}
          <div className="flex-1 flex flex-col gap-2 pt-24">
            <div className="text-[#4a5a7a] text-[10px] uppercase text-center mb-1">QF</div>
            <MatchRow
              matchId={qfData.matchId}
              homeTeam={qfData.home}
              awayTeam={qfData.away}
              winner={qfData.winner}
              lang={lang}
              onWinnerSelect={onWinnerSelect}
              onWildcardSelect={onWildcardSelect}
              disabled={qfData.disabled}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={onBack}
          className="w-full border border-[#1e2d50] text-[#8a9bc0] py-3 rounded-xl font-semibold hover:border-[#ffd700] transition-colors"
        >
          {quadrantComplete ? `← ${t(lang, 'knockoutOverview')}` : t(lang, 'backToOverview')}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Run QuadrantView tests**

```bash
npm run test:run -- --reporter=verbose tests/components/QuadrantView.test.tsx
```

Expected: PASS (2 tests).

- [ ] **Step 9: Run all tests**

```bash
npm run test:run
```

Expected: all pass.

- [ ] **Step 10: Commit**

```bash
git add src/components/knockout/KnockoutOverview.tsx src/components/knockout/QuadrantView.tsx tests/components/KnockoutOverview.test.tsx tests/components/QuadrantView.test.tsx
git commit -m "feat: knockout quadrant overview and quadrant view"
```

---

## Task 4: FinalFourView + Wire Up + Cleanup

**Files:**
- Create: `src/components/knockout/FinalFourView.tsx`
- Modify: `src/app/predict/page.tsx` (already done in Task 2 — just verify the imports work)
- Delete: `src/components/knockout/KnockoutBracket.tsx`

### Context

The Final Four consists of:
- `SF_L`: winner of `QF_L1` vs winner of `QF_L2`
- `SF_R`: winner of `QF_R1` vs winner of `QF_R2`
- `FINAL`: winner of `SF_L` vs winner of `SF_R`

`KNOCKOUT_STRUCTURE` already has:
```
{ matchId: 'SF_L', homeFeeder: 'QF_L1', awayFeeder: 'QF_L2' }
{ matchId: 'SF_R', homeFeeder: 'QF_R1', awayFeeder: 'QF_R2' }
{ matchId: 'FINAL', homeFeeder: 'SF_L', awayFeeder: 'SF_R' }
```

The `champion` computed in `usePredictions` is the winner of `FINAL`.

- [ ] **Step 1: Create FinalFourView.tsx**

Create `src/components/knockout/FinalFourView.tsx`:

```typescript
'use client'
import { useEffect } from 'react'
import { TEAMS, KNOCKOUT_STRUCTURE } from '@/data/wc2026'
import { t } from '@/lib/i18n'
import type { Language, KnockoutMatchPick, TeamId } from '@/lib/picks'
import type { R32Matchup } from '@/lib/bracket'

interface Props {
  knockoutPicks: KnockoutMatchPick[]
  wildcardSelections: Record<string, TeamId>
  r32Matchups: R32Matchup[]
  lang: Language
  onWinnerSelect: (matchId: string, winner: TeamId) => void
  onBack: () => void
  onChampionSelected: () => void
}

function getWinner(matchId: string, picks: KnockoutMatchPick[]): TeamId | null {
  return picks.find(p => p.matchId === matchId)?.winner ?? null
}

function getFinalFourTeams(picks: KnockoutMatchPick[]): {
  sfLHome: TeamId|null; sfLAway: TeamId|null; sfLWinner: TeamId|null
  sfRHome: TeamId|null; sfRAway: TeamId|null; sfRWinner: TeamId|null
  finalHome: TeamId|null; finalAway: TeamId|null; champion: TeamId|null
} {
  const sfL = KNOCKOUT_STRUCTURE.find(e => e.matchId === 'SF_L')!
  const sfR = KNOCKOUT_STRUCTURE.find(e => e.matchId === 'SF_R')!
  return {
    sfLHome: getWinner(sfL.homeFeeder, picks),
    sfLAway: getWinner(sfL.awayFeeder, picks),
    sfLWinner: getWinner('SF_L', picks),
    sfRHome: getWinner(sfR.homeFeeder, picks),
    sfRAway: getWinner(sfR.awayFeeder, picks),
    sfRWinner: getWinner('SF_R', picks),
    finalHome: getWinner('SF_L', picks),
    finalAway: getWinner('SF_R', picks),
    champion: getWinner('FINAL', picks),
  }
}

interface MatchCardProps {
  matchId: string
  homeId: TeamId | null
  awayId: TeamId | null
  winner: TeamId | null
  disabled: boolean
  lang: Language
  onPick: (matchId: string, w: TeamId) => void
}

function SFMatchCard({ matchId, homeId, awayId, winner, disabled, lang, onPick }: MatchCardProps) {
  return (
    <div className={`rounded-xl border p-3 ${disabled ? 'opacity-40' : ''} ${winner ? 'border-[#ffd700]/50' : 'border-[#1a2847]'} bg-[#0c1526]`}>
      <div className="text-[9px] text-[#4a5a7a] uppercase mb-2">{t(lang, 'semifinal')}</div>
      {[homeId, awayId].map(id => {
        const team = id ? TEAMS[id] : null
        const isWinner = winner === id && !!id
        return (
          <button
            key={id ?? `tbd-${Math.random()}`}
            disabled={disabled || !id}
            onClick={() => id && !disabled && onPick(matchId, id)}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded mb-1 transition-all ${
              isWinner
                ? 'bg-[#1a2e0a] border border-[#ffd700] text-[#ffd700] font-bold'
                : id
                ? 'hover:bg-[#111b35] text-[#8a9bc0] hover:text-white'
                : 'opacity-30 cursor-default'
            }`}
          >
            {team ? (
              <>
                <span className="text-lg">{team.flag}</span>
                <span className="text-sm">{team.name}</span>
              </>
            ) : (
              <span className="text-xs text-[#3a4a6a]">TBD</span>
            )}
            {isWinner && <span className="ml-auto">✓</span>}
          </button>
        )
      })}
    </div>
  )
}

export function FinalFourView({ knockoutPicks, wildcardSelections, r32Matchups, lang, onWinnerSelect, onBack, onChampionSelected }: Props) {
  const { sfLHome, sfLAway, sfLWinner, sfRHome, sfRAway, sfRWinner, finalHome, finalAway, champion } = getFinalFourTeams(knockoutPicks)

  useEffect(() => {
    if (champion) {
      const timer = setTimeout(onChampionSelected, 1200)
      return () => clearTimeout(timer)
    }
  }, [champion, onChampionSelected])

  const championTeam = champion ? TEAMS[champion] : null

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pt-14">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-[#8a9bc0] text-sm hover:text-[#ffd700] transition-colors">
          {t(lang, 'backToOverview')}
        </button>
        <h2 className="text-[#ffd700] font-bold text-lg">{t(lang, 'finalFour')}</h2>
        <div className="w-16" />
      </div>

      {/* Semifinals */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <SFMatchCard
          matchId="SF_L"
          homeId={sfLHome}
          awayId={sfLAway}
          winner={sfLWinner}
          disabled={!sfLHome || !sfLAway}
          lang={lang}
          onPick={onWinnerSelect}
        />
        <SFMatchCard
          matchId="SF_R"
          homeId={sfRHome}
          awayId={sfRAway}
          winner={sfRWinner}
          disabled={!sfRHome || !sfRAway}
          lang={lang}
          onPick={onWinnerSelect}
        />
      </div>

      {/* Final */}
      <div className={`rounded-xl border p-4 mb-6 transition-all ${
        champion ? 'border-[#ffd700] bg-[#1a2e0a]' : 'border-[#1a2847] bg-[#0c1526]'
      } ${!finalHome || !finalAway ? 'opacity-40' : ''}`}>
        <div className="text-[#ffd700] text-xs font-bold uppercase text-center mb-3">🏆 Final</div>
        {[finalHome, finalAway].map(id => {
          const team = id ? TEAMS[id] : null
          const isWinner = champion === id && !!id
          return (
            <button
              key={id ?? `tbd-${Math.random()}`}
              disabled={!finalHome || !finalAway || !id}
              onClick={() => id && finalHome && finalAway && onWinnerSelect('FINAL', id)}
              className={`flex items-center gap-2 w-full px-4 py-3 rounded-lg mb-2 transition-all ${
                isWinner
                  ? 'bg-[#2a4a0a] border border-[#ffd700] text-[#ffd700] font-black text-lg'
                  : id
                  ? 'hover:bg-[#111b35] text-[#8a9bc0] hover:text-white'
                  : 'opacity-30 cursor-default'
              }`}
            >
              {team ? (
                <>
                  <span className="text-xl">{team.flag}</span>
                  <span>{team.name}</span>
                </>
              ) : (
                <span className="text-xs text-[#3a4a6a]">TBD</span>
              )}
              {isWinner && <span className="ml-auto text-xl">🏆</span>}
            </button>
          )
        })}
      </div>

      {/* Champion flash */}
      {championTeam && (
        <div className="text-center animate-pulse">
          <div className="text-[#ffd700] text-sm font-bold mb-1">{t(lang, 'champion')}</div>
          <div className="text-4xl">{championTeam.flag}</div>
          <div className="text-white font-black text-xl mt-1">{championTeam.name}</div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Delete KnockoutBracket.tsx**

```bash
rm src/components/knockout/KnockoutBracket.tsx
```

Verify nothing imports it anymore (predict/page.tsx was already updated in Task 2 to not import KnockoutBracket).

- [ ] **Step 3: Verify predict/page.tsx imports**

Open `src/app/predict/page.tsx` and confirm these imports are present and correct:
```typescript
import { KnockoutOverview } from '@/components/knockout/KnockoutOverview'
import { QuadrantView } from '@/components/knockout/QuadrantView'
import { FinalFourView } from '@/components/knockout/FinalFourView'
```

Also confirm the `champion` translation key exists in `i18n.ts` (it was used in original ChampionReveal and should already be there). If `t(lang, 'champion')` throws a TypeScript error, check `src/lib/i18n.ts` for the key name and use the correct one.

- [ ] **Step 4: Full build**

```bash
npm run build
```

Expected: clean build, zero TypeScript errors.

- [ ] **Step 5: Run all tests**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/knockout/FinalFourView.tsx src/app/predict/page.tsx
git rm src/components/knockout/KnockoutBracket.tsx
git commit -m "feat: final four view, complete knockout quadrant flow, remove KnockoutBracket"
git push
```

---

## Self-Review Notes

**Spec coverage:**
1. Language on every page ✓ — LanguageSwitcher in layout.tsx header, visible on /, /predict, /share
2. Group match venue/time ✓ — fixture panel in GroupStagePicker shows date, time, venue for all 6 group matches
3. Back navigation ✓ — groups has Home back, knockout has back-to-groups, quadrant has back-to-overview, final-four has back-to-overview
4. Knockout redesign ✓ — KnockoutOverview (2×2 map) → QuadrantView (R32→R16→QF) → FinalFourView (SF+Final+champion flash) → ChampionReveal

**Wild cards:** Handled inline in QuadrantView via `awayOptions` picker that calls `onWildcardSelect`.

**Champion detection:** `usePredictions.champion` derives from winner of `FINAL` match. FinalFourView uses `useEffect` on `champion` to call `onChampionSelected` after 1.2s delay, allowing champion flash to be seen before transitioning.

**i18n:** All new UI strings go through `t()`. The `champion` key already exists in i18n.ts from the original implementation; verify before Task 4 ships.

**Type note:** `QUADRANT_MATCHES` in QuadrantView uses a tuple type `[string,string,string,string]` for r32 — if TypeScript complains about the array being `string[]`, add `as const` to the array literals or change to `string[]`.
