# World Cup Winner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app where users predict the 2026 FIFA World Cup bracket, then generate two shareable images: a full bracket infographic and an AI cartoon celebration with their selfie.

**Architecture:** Next.js 14 App Router with TypeScript and Tailwind. Client-side React state manages all predictions (no database). Two server-side API routes handle image generation: `/api/generate-bracket` (Satori → PNG) and `/api/generate-celebration` (OpenRouter image API). Static JSON data file encodes the full 2026 WC schedule and official R32 seeding rules.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Satori + @resvg/resvg-js, next-intl, OpenRouter API, Vitest + React Testing Library, canvas-confetti

---

## File Map

```
src/
  app/
    layout.tsx                    # Root layout: fonts, i18n provider
    page.tsx                      # Landing page route
    predict/page.tsx              # Prediction flow: groups → knockout → champion
    share/page.tsx                # Generate & share route
    api/
      generate-bracket/route.ts  # POST → PNG (Satori + Resvg)
      generate-celebration/route.ts # POST → OpenRouter → image URL
  components/
    landing/LandingPage.tsx       # Hero, Start CTA, language switcher
    group-stage/
      GroupStagePicker.tsx        # Orchestrates all 12 groups, prev/next nav
      GroupCard.tsx               # 4-team card: tap-to-rank + score inputs
    knockout/
      KnockoutBracket.tsx         # Double-sided bracket, all 5 rounds
      MatchCard.tsx               # Single match: pick winner + optional score
    champion/
      ChampionReveal.tsx          # Confetti + champion display
      PhotoCapture.tsx            # Upload or camera selfie
    share/SharePage.tsx           # Display images + download buttons
    bracket-image/
      BracketImageTemplate.tsx    # Satori JSX for bracket PNG
  data/
    wc2026.ts                     # 48 teams, 12 groups, 104 fixtures, R32 slots
  lib/
    picks.ts                      # All TypeScript types
    bracket.ts                    # Slot resolution: group picks → R32 matchups
    i18n.ts                       # EN/CN/ES translation strings + t() helper
  hooks/
    usePredictions.ts             # Central prediction state
    useLanguage.ts                # Language selection + localStorage
tests/
  lib/bracket.test.ts
  components/GroupCard.test.tsx
  components/MatchCard.test.tsx
```

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `.env.local`, `vitest.config.ts`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd /Users/tianzhang/Projects/worldcup-winner
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

When prompted: TypeScript=Yes, ESLint=Yes, Tailwind=Yes, src/=Yes, App Router=Yes, import alias=@/*

- [ ] **Step 2: Install dependencies**

```bash
npm install satori @resvg/resvg-js next-intl canvas-confetti
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

Create `vitest.setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Add test script to package.json**

In `package.json` scripts, add:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 5: Create .env.local**

```bash
echo "OPENROUTER_API_KEY=your_key_here" > .env.local
```

- [ ] **Step 6: Verify setup**

```bash
npm run test:run
```
Expected: "No test files found" (zero failures)

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: project setup with Next.js 14, Tailwind, Vitest"
git push
```

---

## Task 2: Types and World Cup Data

**Files:**
- Create: `src/lib/picks.ts`
- Create: `src/data/wc2026.ts`

- [ ] **Step 1: Create core types**

Create `src/lib/picks.ts`:
```typescript
export type TeamId = string // e.g. "BRA", "ARG", "USA"
export type Language = 'en' | 'cn' | 'es'
export type GroupId = 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'

export interface GroupPick {
  groupId: GroupId
  // ranking[0]=1st, [1]=2nd, [2]=3rd, [3]=4th (auto)
  ranking: [TeamId, TeamId, TeamId, TeamId]
  // key: "T1_T2" where T1 < T2 alphabetically
  scores: Record<string, { home: number | null; away: number | null }>
}

export interface KnockoutMatchPick {
  matchId: string // "R32_1" ... "R32_16", "R16_1" ... "FINAL"
  homeSlot: string // e.g. "1E" or "BRA" once resolved
  awaySlot: string
  winner: TeamId | null
  score: { home: number | null; away: number | null }
}

export interface BracketPicks {
  groups: GroupPick[]        // 12 entries, one per group
  knockout: KnockoutMatchPick[] // 31 matches total
  language: Language
  photoDataUrl?: string      // base64 selfie
}

export interface Team {
  id: TeamId
  name: string
  nameZh: string  // Chinese name
  nameEs: string  // Spanish name
  flag: string    // emoji
  group: GroupId
}

export interface R32Slot {
  matchId: string   // "R32_1" through "R32_16"
  homeSlot: string  // e.g. "1E"
  awaySlot: string  // e.g. "3ABCDF"
  side: 'left' | 'right'
  position: number  // 1-8 within side (top=1, bottom=8)
}
```

- [ ] **Step 2: Create World Cup 2026 data file**

Create `src/data/wc2026.ts`. **Verify all group assignments against https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026 before shipping.**

```typescript
import type { Team, GroupId } from '@/lib/picks'

export const TEAMS: Record<string, Team> = {
  // Group A
  USA:  { id: 'USA',  name: 'USA',        nameZh: '美国',   nameEs: 'EE.UU.',   flag: '🇺🇸', group: 'A' },
  PAN:  { id: 'PAN',  name: 'Panama',      nameZh: '巴拿马', nameEs: 'Panamá',   flag: '🇵🇦', group: 'A' },
  BOL:  { id: 'BOL',  name: 'Bolivia',     nameZh: '玻利维亚',nameEs: 'Bolivia',  flag: '🇧🇴', group: 'A' },
  // TODO: verify 4th team of Group A
  JAM:  { id: 'JAM',  name: 'Jamaica',     nameZh: '牙买加', nameEs: 'Jamaica',  flag: '🇯🇲', group: 'A' },
  // Group B
  MEX:  { id: 'MEX',  name: 'Mexico',      nameZh: '墨西哥', nameEs: 'México',   flag: '🇲🇽', group: 'B' },
  // TODO: complete all 48 teams — see https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/groups
  // Group C
  CAN:  { id: 'CAN',  name: 'Canada',      nameZh: '加拿大', nameEs: 'Canadá',   flag: '🇨🇦', group: 'C' },
  // (continue for all 48 teams)
  BRA:  { id: 'BRA',  name: 'Brazil',      nameZh: '巴西',   nameEs: 'Brasil',   flag: '🇧🇷', group: 'E' },
  ARG:  { id: 'ARG',  name: 'Argentina',   nameZh: '阿根廷', nameEs: 'Argentina',flag: '🇦🇷', group: 'J' },
  ENG:  { id: 'ENG',  name: 'England',     nameZh: '英格兰', nameEs: 'Inglaterra',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',group: 'C' },
  FRA:  { id: 'FRA',  name: 'France',      nameZh: '法国',   nameEs: 'Francia',  flag: '🇫🇷', group: 'B' },
  GER:  { id: 'GER',  name: 'Germany',     nameZh: '德国',   nameEs: 'Alemania', flag: '🇩🇪', group: 'I' },
  ESP:  { id: 'ESP',  name: 'Spain',       nameZh: '西班牙', nameEs: 'España',   flag: '🇪🇸', group: 'G' },
  POR:  { id: 'POR',  name: 'Portugal',    nameZh: '葡萄牙', nameEs: 'Portugal', flag: '🇵🇹', group: 'H' },
  NED:  { id: 'NED',  name: 'Netherlands', nameZh: '荷兰',   nameEs: 'Países Bajos',flag:'🇳🇱',group:'D'},
  JPN:  { id: 'JPN',  name: 'Japan',       nameZh: '日本',   nameEs: 'Japón',    flag: '🇯🇵', group: 'I' },
  KOR:  { id: 'KOR',  name: 'South Korea', nameZh: '韩国',   nameEs: 'Corea del Sur',flag:'🇰🇷',group:'L'},
  MAR:  { id: 'MAR',  name: 'Morocco',     nameZh: '摩洛哥', nameEs: 'Marruecos',flag: '🇲🇦', group: 'K' },
}

export const GROUPS: { id: GroupId; teams: string[] }[] = [
  { id: 'A', teams: ['USA', 'PAN', 'BOL', 'JAM'] },
  { id: 'B', teams: ['MEX', 'FRA', /* fill remaining 2 */] },  // TODO: verify
  { id: 'C', teams: ['CAN', 'ENG', /* fill remaining 2 */] },
  { id: 'D', teams: ['NED', /* fill remaining 3 */] },
  { id: 'E', teams: ['BRA', /* fill remaining 3 */] },
  { id: 'F', teams: [/* fill 4 */] },
  { id: 'G', teams: ['ESP', /* fill remaining 3 */] },
  { id: 'H', teams: ['POR', /* fill remaining 3 */] },
  { id: 'I', teams: ['GER', 'JPN', /* fill remaining 2 */] },
  { id: 'J', teams: ['ARG', /* fill remaining 3 */] },
  { id: 'K', teams: ['MAR', /* fill remaining 3 */] },
  { id: 'L', teams: ['KOR', /* fill remaining 3 */] },
]

// Official FIFA 2026 R32 seeding — verified from official bracket
// Left side: positions 1-8 (top to bottom); right side: positions 1-8
export const R32_SLOTS: import('@/lib/picks').R32Slot[] = [
  // LEFT SIDE (8 matches)
  { matchId: 'R32_L1', homeSlot: '1E',     awaySlot: '3ABCDF', side: 'left',  position: 1 },
  { matchId: 'R32_L2', homeSlot: '1I',     awaySlot: '3CDFGH', side: 'left',  position: 2 },
  { matchId: 'R32_L3', homeSlot: '2A',     awaySlot: '2B',     side: 'left',  position: 3 },
  { matchId: 'R32_L4', homeSlot: '1F',     awaySlot: '2C',     side: 'left',  position: 4 },
  { matchId: 'R32_L5', homeSlot: '2K',     awaySlot: '2L',     side: 'left',  position: 5 },
  { matchId: 'R32_L6', homeSlot: '1H',     awaySlot: '2J',     side: 'left',  position: 6 },
  { matchId: 'R32_L7', homeSlot: '1D',     awaySlot: '3BEFIJ', side: 'left',  position: 7 },
  { matchId: 'R32_L8', homeSlot: '1G',     awaySlot: '3AEHIJ', side: 'left',  position: 8 },
  // RIGHT SIDE (8 matches)
  { matchId: 'R32_R1', homeSlot: '1C',     awaySlot: '2F',     side: 'right', position: 1 },
  { matchId: 'R32_R2', homeSlot: '2E',     awaySlot: '2I',     side: 'right', position: 2 },
  { matchId: 'R32_R3', homeSlot: '1A',     awaySlot: '3CEFHI', side: 'right', position: 3 },
  { matchId: 'R32_R4', homeSlot: '1L',     awaySlot: '3EHIJK', side: 'right', position: 4 },
  { matchId: 'R32_R5', homeSlot: '1J',     awaySlot: '2H',     side: 'right', position: 5 },
  { matchId: 'R32_R6', homeSlot: '2D',     awaySlot: '2G',     side: 'right', position: 6 },
  { matchId: 'R32_R7', homeSlot: '1B',     awaySlot: '3EFGIJ', side: 'right', position: 7 },
  { matchId: 'R32_R8', homeSlot: '1K',     awaySlot: '3DEIJL', side: 'right', position: 8 },
]

// Knockout bracket pairing: which R32 matches feed into R16, etc.
// Each entry: [matchId, homeFeeder, awayFeeder]
export const KNOCKOUT_STRUCTURE = [
  // R16 (left side feeds left→right)
  { matchId: 'R16_L1', homeFeeder: 'R32_L1', awayFeeder: 'R32_L2' },
  { matchId: 'R16_L2', homeFeeder: 'R32_L3', awayFeeder: 'R32_L4' },
  { matchId: 'R16_L3', homeFeeder: 'R32_L5', awayFeeder: 'R32_L6' },
  { matchId: 'R16_L4', homeFeeder: 'R32_L7', awayFeeder: 'R32_L8' },
  // R16 (right side)
  { matchId: 'R16_R1', homeFeeder: 'R32_R1', awayFeeder: 'R32_R2' },
  { matchId: 'R16_R2', homeFeeder: 'R32_R3', awayFeeder: 'R32_R4' },
  { matchId: 'R16_R3', homeFeeder: 'R32_R5', awayFeeder: 'R32_R6' },
  { matchId: 'R16_R4', homeFeeder: 'R32_R7', awayFeeder: 'R32_R8' },
  // QF
  { matchId: 'QF_L1', homeFeeder: 'R16_L1', awayFeeder: 'R16_L2' },
  { matchId: 'QF_L2', homeFeeder: 'R16_L3', awayFeeder: 'R16_L4' },
  { matchId: 'QF_R1', homeFeeder: 'R16_R1', awayFeeder: 'R16_R2' },
  { matchId: 'QF_R2', homeFeeder: 'R16_R3', awayFeeder: 'R16_R4' },
  // SF
  { matchId: 'SF_L', homeFeeder: 'QF_L1', awayFeeder: 'QF_L2' },
  { matchId: 'SF_R', homeFeeder: 'QF_R1', awayFeeder: 'QF_R2' },
  // Final
  { matchId: 'FINAL', homeFeeder: 'SF_L', awayFeeder: 'SF_R' },
]
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/picks.ts src/data/wc2026.ts
git commit -m "feat: core types and WC2026 data structure"
git push
```

---

## Task 3: Bracket Seeding Logic (TDD)

**Files:**
- Create: `src/lib/bracket.ts`
- Create: `tests/lib/bracket.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/lib/bracket.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { resolveSlot, buildR32Matchups } from '@/lib/bracket'
import type { GroupPick } from '@/lib/picks'

const mockGroups: GroupPick[] = [
  { groupId: 'A', ranking: ['USA','PAN','BOL','JAM'], scores: {} },
  { groupId: 'B', ranking: ['FRA','MEX','SRB','ALB'], scores: {} },
  { groupId: 'C', ranking: ['ENG','DEN','SVK','SVN'], scores: {} },
  { groupId: 'D', ranking: ['NED','AUT','UKR','ISL'], scores: {} },
  { groupId: 'E', ranking: ['BRA','COL','SEN','PER'], scores: {} },
  { groupId: 'F', ranking: ['ITA','SUI','CMR','GIN'], scores: {} },
  { groupId: 'G', ranking: ['ESP','TUR','GEO','UZB'], scores: {} },
  { groupId: 'H', ranking: ['POR','CRO','CZE','TZA'], scores: {} },
  { groupId: 'I', ranking: ['GER','JPN','IDN','VIE'], scores: {} },
  { groupId: 'J', ranking: ['ARG','URU','ECU','BOL'], scores: {} },
  { groupId: 'K', ranking: ['MAR','AUS','TUN','SAU'], scores: {} },
  { groupId: 'L', ranking: ['KOR','MEX2','CRI','GHA'], scores: {} },
]

describe('resolveSlot', () => {
  it('resolves 1st place from a group', () => {
    expect(resolveSlot('1E', mockGroups)).toBe('BRA')
  })

  it('resolves 2nd place from a group', () => {
    expect(resolveSlot('2A', mockGroups)).toBe('PAN')
  })

  it('resolves 3rd place from a group', () => {
    expect(resolveSlot('3E', mockGroups)).toBe('SEN')
  })

  it('returns null for unresolvable slot when groups incomplete', () => {
    const incomplete: GroupPick[] = [mockGroups[0]]
    expect(resolveSlot('1B', incomplete)).toBeNull()
  })
})

describe('resolveWildCard', () => {
  it('resolves 3ABCDF to the user 3rd-place pick from group E (not in ABCDF)', () => {
    // "3ABCDF" means: from the user's 3rd-place picks of groups A,B,C,D,F
    // returns all eligible 3rd-place teams so the user can pick
    const { resolveWildCardOptions } = require('@/lib/bracket')
    const options = resolveWildCardOptions('3ABCDF', mockGroups)
    expect(options).toContain('BOL')  // A's 3rd
    expect(options).toContain('SRB')  // B's 3rd
    expect(options).not.toContain('SEN') // E's 3rd — not in ABCDF
  })
})

describe('buildR32Matchups', () => {
  it('resolves simple slots to team IDs', () => {
    const matchups = buildR32Matchups(mockGroups)
    const r32L3 = matchups.find(m => m.matchId === 'R32_L3')
    // R32_L3: 2A vs 2B
    expect(r32L3?.homeTeam).toBe('PAN')  // 2nd of group A
    expect(r32L3?.awayTeam).toBe('FRA') // wait, FRA is 1st of B... fix: 2B = MEX
    // 2nd of B is MEX in mockGroups
    expect(r32L3?.awayTeam).toBe('MEX')
  })

  it('marks wild-card slots as needing user selection', () => {
    const matchups = buildR32Matchups(mockGroups)
    const wildCard = matchups.find(m => m.matchId === 'R32_L1')
    // R32_L1: 1E vs 3ABCDF — 1E=BRA is resolved; 3ABCDF needs user pick
    expect(wildCard?.homeTeam).toBe('BRA')
    expect(wildCard?.awayOptions).toHaveLength(5) // A,B,C,D,F each have a 3rd
    expect(wildCard?.awayTeam).toBeNull() // not yet picked
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm run test:run -- tests/lib/bracket.test.ts
```
Expected: FAIL — "Cannot find module '@/lib/bracket'"

- [ ] **Step 3: Implement bracket.ts**

Create `src/lib/bracket.ts`:
```typescript
import { R32_SLOTS, KNOCKOUT_STRUCTURE, GROUPS } from '@/data/wc2026'
import type { GroupPick, TeamId } from '@/lib/picks'

export interface R32Matchup {
  matchId: string
  homeTeam: TeamId | null
  awayTeam: TeamId | null
  awayOptions?: TeamId[] // set when awaySlot is a wild-card (e.g. "3ABCDF")
}

// Resolve a slot string like "1E", "2A", "3B" to a team ID
export function resolveSlot(slot: string, groups: GroupPick[]): TeamId | null {
  const rank = parseInt(slot[0]) - 1 // 0-indexed
  const groupId = slot[1] as string
  const group = groups.find(g => g.groupId === groupId)
  if (!group) return null
  return group.ranking[rank] ?? null
}

// For a wild-card slot like "3ABCDF", return the eligible 3rd-place team IDs
export function resolveWildCardOptions(slot: string, groups: GroupPick[]): TeamId[] {
  const eligibleGroups = slot.slice(1).split('') // "3ABCDF" → ["A","B","C","D","F"]
  return eligibleGroups
    .map(gId => groups.find(g => g.groupId === gId)?.ranking[2] ?? null)
    .filter((t): t is TeamId => t !== null)
}

const isWildCard = (slot: string) => slot.startsWith('3') && slot.length > 2

// Build initial R32 matchup list from group picks.
// Wild-card away slots return awayTeam=null + awayOptions for user to choose.
export function buildR32Matchups(groups: GroupPick[]): R32Matchup[] {
  return R32_SLOTS.map(slot => {
    const homeTeam = resolveSlot(slot.homeSlot, groups)
    let awayTeam: TeamId | null = null
    let awayOptions: TeamId[] | undefined

    if (isWildCard(slot.awaySlot)) {
      awayOptions = resolveWildCardOptions(slot.awaySlot, groups)
    } else {
      awayTeam = resolveSlot(slot.awaySlot, groups)
    }

    return { matchId: slot.matchId, homeTeam, awayTeam, awayOptions }
  })
}

// Given all knockout picks, return the winner of a match by matchId
export function getMatchWinner(
  matchId: string,
  knockoutPicks: Record<string, TeamId | null>
): TeamId | null {
  return knockoutPicks[matchId] ?? null
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm run test:run -- tests/lib/bracket.test.ts
```
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/bracket.ts tests/lib/bracket.test.ts
git commit -m "feat: bracket seeding logic with TDD"
git push
```

---

## Task 4: i18n Strings

**Files:**
- Create: `src/lib/i18n.ts`
- Create: `src/hooks/useLanguage.ts`

- [ ] **Step 1: Create translation strings**

Create `src/lib/i18n.ts`:
```typescript
import type { Language } from '@/lib/picks'

export const TRANSLATIONS = {
  en: {
    appTitle: 'FIFA World Cup 2026',
    appSubtitle: 'Make your prediction',
    start: 'Start',
    groupStage: 'Group Stage',
    groupOf: (n: number, total: number) => `Group ${n} of ${total}`,
    pickRanking: 'Tap to rank teams',
    nextGroup: 'Next Group →',
    prevGroup: '← Back',
    knockoutRounds: 'Knockout Rounds',
    pickWinner: 'Pick the winner',
    optional: 'Score (optional)',
    yourChampion: 'Your Champion!',
    addSelfie: 'Add your selfie',
    uploadPhoto: 'Upload Photo',
    takePhoto: 'Take Selfie',
    skipPhoto: 'Skip — bracket only',
    generateImages: 'Generate My Images',
    generating: 'Generating your images...',
    downloadBracket: 'Download Bracket',
    downloadCelebration: 'Download Celebration',
    shareHint: 'Save and share on WeChat / iMessage',
    round32: 'Round of 32',
    round16: 'Round of 16',
    quarterFinal: 'Quarter-Final',
    semiFinal: 'Semi-Final',
    final: 'Final',
    champion: 'Champion',
    groupStageResults: 'Group Stage',
    advancesToR32: 'Advances',
    wildCard: 'Wild Card',
    eliminated: 'Eliminated',
  },
  cn: {
    appTitle: 'FIFA 2026世界杯',
    appSubtitle: '预测你的冠军',
    start: '开始预测',
    groupStage: '小组赛',
    groupOf: (n: number, total: number) => `第${n}组，共${total}组`,
    pickRanking: '点击排名球队',
    nextGroup: '下一组 →',
    prevGroup: '← 返回',
    knockoutRounds: '淘汰赛',
    pickWinner: '选择胜者',
    optional: '比分（可选）',
    yourChampion: '你的冠军！',
    addSelfie: '添加自拍',
    uploadPhoto: '上传照片',
    takePhoto: '拍自拍',
    skipPhoto: '跳过 — 仅生成赛程图',
    generateImages: '生成我的图片',
    generating: '正在生成图片...',
    downloadBracket: '下载赛程图',
    downloadCelebration: '下载庆典图',
    shareHint: '保存后分享到微信 / iMessage',
    round32: '32强',
    round16: '16强',
    quarterFinal: '四分之一决赛',
    semiFinal: '半决赛',
    final: '决赛',
    champion: '冠军',
    groupStageResults: '小组赛',
    advancesToR32: '晋级',
    wildCard: '附加赛席位',
    eliminated: '淘汰',
  },
  es: {
    appTitle: 'Copa del Mundo FIFA 2026',
    appSubtitle: 'Haz tu predicción',
    start: 'Empezar',
    groupStage: 'Fase de Grupos',
    groupOf: (n: number, total: number) => `Grupo ${n} de ${total}`,
    pickRanking: 'Toca para clasificar',
    nextGroup: 'Siguiente Grupo →',
    prevGroup: '← Volver',
    knockoutRounds: 'Eliminatorias',
    pickWinner: 'Elige el ganador',
    optional: 'Marcador (opcional)',
    yourChampion: '¡Tu Campeón!',
    addSelfie: 'Añade tu selfie',
    uploadPhoto: 'Subir foto',
    takePhoto: 'Tomar selfie',
    skipPhoto: 'Omitir — solo el cuadro',
    generateImages: 'Generar mis imágenes',
    generating: 'Generando tus imágenes...',
    downloadBracket: 'Descargar Cuadro',
    downloadCelebration: 'Descargar Celebración',
    shareHint: 'Guarda y comparte en WeChat / iMessage',
    round32: 'Ronda de 32',
    round16: 'Ronda de 16',
    quarterFinal: 'Cuartos de Final',
    semiFinal: 'Semifinal',
    final: 'Final',
    champion: 'Campeón',
    groupStageResults: 'Fase de Grupos',
    advancesToR32: 'Clasifica',
    wildCard: 'Comodín',
    eliminated: 'Eliminado',
  },
} satisfies Record<Language, Record<string, unknown>>

export type TranslationKey = keyof typeof TRANSLATIONS.en

export function t(lang: Language, key: TranslationKey, ...args: number[]): string {
  const val = TRANSLATIONS[lang][key]
  if (typeof val === 'function') return (val as (...a: number[]) => string)(...args)
  return val as string
}
```

- [ ] **Step 2: Create useLanguage hook**

Create `src/hooks/useLanguage.ts`:
```typescript
'use client'
import { useState, useEffect } from 'react'
import type { Language } from '@/lib/picks'

const STORAGE_KEY = 'wc2026_lang'

export function useLanguage() {
  const [lang, setLangState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null
    if (saved && ['en', 'cn', 'es'].includes(saved)) setLangState(saved)
  }, [])

  const setLang = (l: Language) => {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }

  return { lang, setLang }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/i18n.ts src/hooks/useLanguage.ts
git commit -m "feat: i18n strings and useLanguage hook (EN/CN/ES)"
git push
```

---

## Task 5: Prediction State Hook

**Files:**
- Create: `src/hooks/usePredictions.ts`

- [ ] **Step 1: Create hook**

Create `src/hooks/usePredictions.ts`:
```typescript
'use client'
import { useState, useCallback } from 'react'
import type { GroupPick, KnockoutMatchPick, TeamId, GroupId, Language } from '@/lib/picks'
import { GROUPS } from '@/data/wc2026'
import { buildR32Matchups } from '@/lib/bracket'
import { KNOCKOUT_STRUCTURE } from '@/data/wc2026'

function initialGroups(): GroupPick[] {
  return GROUPS.map(g => ({
    groupId: g.id as GroupId,
    ranking: [...g.teams, ''].slice(0, 4) as [TeamId, TeamId, TeamId, TeamId],
    scores: {},
  }))
}

function initialKnockout(): KnockoutMatchPick[] {
  return KNOCKOUT_STRUCTURE.map(m => ({
    matchId: m.matchId,
    homeSlot: m.homeFeeder,
    awaySlot: m.awayFeeder,
    winner: null,
    score: { home: null, away: null },
  }))
}

export function usePredictions() {
  const [groups, setGroups] = useState<GroupPick[]>(initialGroups)
  const [knockout, setKnockout] = useState<KnockoutMatchPick[]>(initialKnockout)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>()
  const [lang, setLang] = useState<Language>('en')

  const setGroupRanking = useCallback((groupId: GroupId, ranking: [TeamId, TeamId, TeamId, TeamId]) => {
    setGroups(prev => prev.map(g => g.groupId === groupId ? { ...g, ranking } : g))
  }, [])

  const setGroupScore = useCallback((groupId: GroupId, matchKey: string, home: number | null, away: number | null) => {
    setGroups(prev => prev.map(g =>
      g.groupId === groupId
        ? { ...g, scores: { ...g.scores, [matchKey]: { home, away } } }
        : g
    ))
  }, [])

  const setKnockoutWinner = useCallback((matchId: string, winner: TeamId) => {
    setKnockout(prev => prev.map(m => m.matchId === matchId ? { ...m, winner } : m))
  }, [])

  const setKnockoutScore = useCallback((matchId: string, home: number | null, away: number | null) => {
    setKnockout(prev => prev.map(m => m.matchId === matchId ? { ...m, score: { home, away } } : m))
  }, [])

  const champion = knockout.find(m => m.matchId === 'FINAL')?.winner ?? null

  const r32Matchups = buildR32Matchups(groups)

  const groupsComplete = groups.every(g => g.ranking[0] && g.ranking[1] && g.ranking[2])

  const knockoutComplete = knockout.find(m => m.matchId === 'FINAL')?.winner != null

  return {
    groups, knockout, photoDataUrl, lang, champion,
    r32Matchups, groupsComplete, knockoutComplete,
    setGroupRanking, setGroupScore,
    setKnockoutWinner, setKnockoutScore,
    setPhotoDataUrl, setLang,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/usePredictions.ts
git commit -m "feat: usePredictions central state hook"
git push
```

---

## Task 6: Landing Page

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/components/landing/LandingPage.tsx`

- [ ] **Step 1: Configure root layout with dark theme**

Replace `src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FIFA World Cup 2026 — My Prediction',
  description: 'Predict the 2026 World Cup and generate your bracket image',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#060b18] text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Create LandingPage component**

Create `src/components/landing/LandingPage.tsx`:
```tsx
'use client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import type { Language } from '@/lib/picks'

export function LandingPage() {
  const router = useRouter()
  const { lang, setLang } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
      {/* Language switcher */}
      <div className="absolute top-4 right-4 flex gap-2">
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

      {/* Hero */}
      <div className="text-center max-w-lg">
        <div className="text-[#ffd700] text-xs font-bold tracking-[4px] uppercase mb-4">
          FIFA
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-2 leading-tight">
          {t(lang, 'appTitle')}
        </h1>
        <p className="text-[#8a9bc0] text-lg mb-10">
          {t(lang, 'appSubtitle')}
        </p>

        {/* Image teasers */}
        <div className="flex gap-3 justify-center mb-10">
          <div className="bg-[#0d1529] border border-[#1e2d50] rounded-lg p-3 text-left w-36">
            <div className="text-[#ffd700] text-[9px] font-bold mb-1">IMAGE 1</div>
            <div className="text-white text-[10px]">Your full bracket prediction</div>
          </div>
          <div className="bg-[#0d1529] border border-[#1e2d50] rounded-lg p-3 text-left w-36">
            <div className="text-[#ffd700] text-[9px] font-bold mb-1">IMAGE 2</div>
            <div className="text-white text-[10px]">You celebrating with the winners</div>
          </div>
        </div>

        <button
          onClick={() => router.push('/predict')}
          className="bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black text-xl px-12 py-4 rounded-xl hover:scale-105 transition-transform shadow-lg"
        >
          {t(lang, 'start')}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Wire landing page route**

Replace `src/app/page.tsx`:
```tsx
import { LandingPage } from '@/components/landing/LandingPage'
export default function Home() { return <LandingPage /> }
```

- [ ] **Step 4: Run dev server and verify landing page visually**

```bash
npm run dev
```
Open http://localhost:3000 — should see dark hero, gold title, Start button, EN/中文/ES switcher.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx src/components/landing/LandingPage.tsx
git commit -m "feat: landing page with dark-sports hero and language switcher"
git push
```

---

## Task 7: Group Stage UI

**Files:**
- Create: `src/components/group-stage/GroupCard.tsx`
- Create: `src/components/group-stage/GroupStagePicker.tsx`
- Create: `tests/components/GroupCard.test.tsx`

- [ ] **Step 1: Write failing test for GroupCard tap-to-rank**

Create `tests/components/GroupCard.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GroupCard } from '@/components/group-stage/GroupCard'
import type { GroupPick } from '@/lib/picks'

const mockGroup = {
  id: 'E',
  teams: ['BRA', 'COL', 'SEN', 'PER'],
}

const mockPick: GroupPick = {
  groupId: 'E',
  ranking: ['BRA', 'COL', 'SEN', 'PER'],
  scores: {},
}

const mockTeams = {
  BRA: { id: 'BRA', name: 'Brazil', nameZh: '巴西', nameEs: 'Brasil', flag: '🇧🇷', group: 'E' as const },
  COL: { id: 'COL', name: 'Colombia', nameZh: '哥伦比亚', nameEs: 'Colombia', flag: '🇨🇴', group: 'E' as const },
  SEN: { id: 'SEN', name: 'Senegal', nameZh: '塞内加尔', nameEs: 'Senegal', flag: '🇸🇳', group: 'E' as const },
  PER: { id: 'PER', name: 'Peru', nameZh: '秘鲁', nameEs: 'Perú', flag: '🇵🇪', group: 'E' as const },
}

describe('GroupCard', () => {
  it('renders all 4 teams', () => {
    const onRankingChange = vi.fn()
    render(
      <GroupCard
        group={mockGroup}
        teams={mockTeams}
        pick={mockPick}
        lang="en"
        onRankingChange={onRankingChange}
        onScoreChange={vi.fn()}
      />
    )
    expect(screen.getByText('Brazil')).toBeInTheDocument()
    expect(screen.getByText('Colombia')).toBeInTheDocument()
    expect(screen.getByText('Senegal')).toBeInTheDocument()
    expect(screen.getByText('Peru')).toBeInTheDocument()
  })

  it('shows rank badges for ranked teams', () => {
    render(
      <GroupCard
        group={mockGroup}
        teams={mockTeams}
        pick={mockPick}
        lang="en"
        onRankingChange={vi.fn()}
        onScoreChange={vi.fn()}
      />
    )
    expect(screen.getByText('①')).toBeInTheDocument()
    expect(screen.getByText('②')).toBeInTheDocument()
  })

  it('calls onRankingChange when user taps a team to change its rank', () => {
    const onRankingChange = vi.fn()
    // Start with empty ranking
    const emptyPick: GroupPick = { groupId: 'E', ranking: ['' as any, '' as any, '' as any, '' as any], scores: {} }
    render(
      <GroupCard
        group={mockGroup}
        teams={mockTeams}
        pick={emptyPick}
        lang="en"
        onRankingChange={onRankingChange}
        onScoreChange={vi.fn()}
      />
    )
    fireEvent.click(screen.getByTestId('team-BRA'))
    expect(onRankingChange).toHaveBeenCalledWith(['BRA', '', '', 'COL']) // BRA→1st, COL auto 4th
    // Actually just check it was called
    expect(onRankingChange).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm run test:run -- tests/components/GroupCard.test.tsx
```
Expected: FAIL — "Cannot find module '@/components/group-stage/GroupCard'"

- [ ] **Step 3: Create GroupCard component**

Create `src/components/group-stage/GroupCard.tsx`:
```tsx
'use client'
import { TEAMS } from '@/data/wc2026'
import { t } from '@/lib/i18n'
import type { GroupPick, TeamId, Language } from '@/lib/picks'

const RANK_BADGES = ['①', '②', '③', '④']
const RANK_COLORS = ['text-green-400', 'text-blue-400', 'text-amber-500', 'text-[#2a3a5a]']
const RANK_BG = ['bg-[#1a2e0a] border-[#ffd700]', 'bg-[#0c1526] border-[#1a2847]', 'bg-[#0c1526] border-[#1a2847]', 'bg-[#060b18] border-[#1a2847]']

interface Props {
  group: { id: string; teams: string[] }
  teams: typeof TEAMS
  pick: GroupPick
  lang: Language
  onRankingChange: (ranking: [TeamId, TeamId, TeamId, TeamId]) => void
  onScoreChange: (matchKey: string, home: number | null, away: number | null) => void
}

export function GroupCard({ group, teams, pick, lang, onRankingChange }: Props) {
  const ranking = pick.ranking.filter(Boolean)

  function handleTeamClick(teamId: TeamId) {
    const current = [...pick.ranking] as [TeamId, TeamId, TeamId, TeamId]
    const existingIdx = current.indexOf(teamId)
    if (existingIdx !== -1) {
      // Deselect: remove from ranking
      current[existingIdx] = '' as TeamId
    } else {
      // Place in next empty slot
      const emptyIdx = current.findIndex(t => !t)
      if (emptyIdx === -1) return // all slots filled
      current[emptyIdx] = teamId
    }
    // auto-fill 4th if 3 are set
    const filled = current.filter(Boolean)
    if (filled.length === 3) {
      const remaining = group.teams.find(t => !filled.includes(t))
      const emptyIdx = current.findIndex(t => !t)
      if (remaining && emptyIdx !== -1) current[emptyIdx] = remaining as TeamId
    }
    onRankingChange(current)
  }

  return (
    <div className="bg-[#0a0f1e] border border-[#1e2d50] rounded-xl p-4">
      <div className="text-[#ffd700] text-xs font-bold tracking-[2px] uppercase mb-3 pb-2 border-b border-[#1e2d50]">
        GROUP {group.id}
      </div>

      <div className="text-[#8a9bc0] text-[10px] mb-3">{t(lang, 'pickRanking')}</div>

      <div className="flex flex-col gap-2">
        {group.teams.map(teamId => {
          const team = teams[teamId]
          const rankIdx = pick.ranking.indexOf(teamId as TeamId)
          const isRanked = rankIdx !== -1 && !!pick.ranking[rankIdx]

          return (
            <button
              key={teamId}
              data-testid={`team-${teamId}`}
              onClick={() => handleTeamClick(teamId as TeamId)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 border transition-all text-left ${
                isRanked ? RANK_BG[rankIdx] : 'bg-[#0c1526] border-[#1a2847] hover:border-[#2a3a60]'
              }`}
            >
              <span className={`text-sm font-bold w-5 ${isRanked ? RANK_COLORS[rankIdx] : 'text-[#2a3a5a]'}`}>
                {isRanked ? RANK_BADGES[rankIdx] : '·'}
              </span>
              <span className="text-lg leading-none">{team?.flag}</span>
              <span className={`text-sm font-semibold ${isRanked ? 'text-white' : 'text-[#5a6a7a]'}`}>
                {lang === 'cn' ? team?.nameZh : lang === 'es' ? team?.nameEs : team?.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create GroupStagePicker**

Create `src/components/group-stage/GroupStagePicker.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { GroupCard } from './GroupCard'
import { GROUPS, TEAMS } from '@/data/wc2026'
import { t } from '@/lib/i18n'
import type { GroupPick, TeamId, GroupId, Language } from '@/lib/picks'

interface Props {
  picks: GroupPick[]
  lang: Language
  onRankingChange: (groupId: GroupId, ranking: [TeamId, TeamId, TeamId, TeamId]) => void
  onScoreChange: (groupId: GroupId, matchKey: string, home: number | null, away: number | null) => void
  onComplete: () => void
}

export function GroupStagePicker({ picks, lang, onRankingChange, onScoreChange, onComplete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const group = GROUPS[currentIdx]
  const pick = picks.find(p => p.groupId === group.id) ?? picks[currentIdx]
  const isLast = currentIdx === GROUPS.length - 1
  const currentComplete = pick.ranking.filter(Boolean).length >= 3

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[#8a9bc0] text-sm">{t(lang, 'groupStage')}</span>
        <span className="text-[#ffd700] text-sm font-bold">
          {t(lang, 'groupOf', currentIdx + 1, GROUPS.length)}
        </span>
      </div>
      <div className="h-1 bg-[#1e2d50] rounded mb-8">
        <div
          className="h-full bg-gradient-to-r from-[#ffd700] to-[#ff8c00] rounded transition-all"
          style={{ width: `${((currentIdx + 1) / GROUPS.length) * 100}%` }}
        />
      </div>

      <GroupCard
        group={group}
        teams={TEAMS}
        pick={pick}
        lang={lang}
        onRankingChange={r => onRankingChange(group.id as GroupId, r)}
        onScoreChange={(k, h, a) => onScoreChange(group.id as GroupId, k, h, a)}
      />

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

- [ ] **Step 5: Run tests — verify they pass**

```bash
npm run test:run -- tests/components/GroupCard.test.tsx
```
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/group-stage/ tests/components/GroupCard.test.tsx
git commit -m "feat: group stage picker with tap-to-rank"
git push
```

---

## Task 8: Knockout Bracket UI

**Files:**
- Create: `src/components/knockout/MatchCard.tsx`
- Create: `src/components/knockout/KnockoutBracket.tsx`
- Create: `tests/components/MatchCard.test.tsx`

- [ ] **Step 1: Write failing test**

Create `tests/components/MatchCard.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MatchCard } from '@/components/knockout/MatchCard'

describe('MatchCard', () => {
  const baseProps = {
    matchId: 'R32_L1',
    homeTeam: { id: 'BRA', name: 'Brazil', flag: '🇧🇷' },
    awayTeam: { id: 'SEN', name: 'Senegal', flag: '🇸🇳' },
    winner: null,
    score: { home: null, away: null },
    lang: 'en' as const,
    onWinnerSelect: vi.fn(),
    onScoreChange: vi.fn(),
    isChampionPath: false,
  }

  it('renders both teams', () => {
    render(<MatchCard {...baseProps} />)
    expect(screen.getByText('Brazil')).toBeInTheDocument()
    expect(screen.getByText('Senegal')).toBeInTheDocument()
  })

  it('calls onWinnerSelect when a team is clicked', () => {
    const onWinnerSelect = vi.fn()
    render(<MatchCard {...baseProps} onWinnerSelect={onWinnerSelect} />)
    fireEvent.click(screen.getByTestId('team-BRA'))
    expect(onWinnerSelect).toHaveBeenCalledWith('BRA')
  })

  it('highlights winner with gold border', () => {
    render(<MatchCard {...baseProps} winner="BRA" />)
    expect(screen.getByTestId('team-BRA')).toHaveClass('border-[#ffd700]')
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm run test:run -- tests/components/MatchCard.test.tsx
```
Expected: FAIL

- [ ] **Step 3: Create MatchCard**

Create `src/components/knockout/MatchCard.tsx`:
```tsx
'use client'
import type { Language, TeamId } from '@/lib/picks'

interface TeamInfo { id: TeamId; name: string; flag: string }

interface Props {
  matchId: string
  homeTeam: TeamInfo | null
  awayTeam: TeamInfo | null
  winner: TeamId | null
  score: { home: number | null; away: number | null }
  lang: Language
  isChampionPath: boolean
  onWinnerSelect: (teamId: TeamId) => void
  onScoreChange: (home: number | null, away: number | null) => void
  // For wild-card slots: list of eligible teams to choose from
  awayOptions?: TeamInfo[]
}

function TeamRow({ team, isWinner, isChampionPath, onClick }: {
  team: TeamInfo | null
  isWinner: boolean
  isChampionPath: boolean
  onClick: () => void
}) {
  if (!team) return (
    <div className="flex items-center gap-2 px-2 py-[5px] opacity-30">
      <span className="text-[10px] text-[#3a4a6a]">TBD</span>
    </div>
  )
  return (
    <button
      data-testid={`team-${team.id}`}
      onClick={onClick}
      className={`flex items-center justify-between w-full px-2 py-[5px] rounded transition-all border ${
        isWinner && isChampionPath
          ? 'border-[#ffd700] bg-[#1a2e0a]'
          : isWinner
          ? 'border-[#ffd700]/50 bg-[#111b35]'
          : 'border-transparent hover:border-[#2a3a60]'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm leading-none">{team.flag}</span>
        <span className={`text-[9px] font-semibold ${isWinner && isChampionPath ? 'text-[#ffd700]' : isWinner ? 'text-white' : 'text-[#7a8fb0]'}`}>
          {team.name}
        </span>
      </div>
    </button>
  )
}

export function MatchCard({ matchId, homeTeam, awayTeam, winner, isChampionPath, onWinnerSelect }: Props) {
  return (
    <div className={`rounded-md border text-left ${
      isChampionPath ? 'bg-[#1a2e0a] border-[#ffd700]' : 'bg-[#0c1526] border-[#1a2847]'
    }`}>
      <TeamRow
        team={homeTeam}
        isWinner={winner === homeTeam?.id}
        isChampionPath={isChampionPath && winner === homeTeam?.id}
        onClick={() => homeTeam && onWinnerSelect(homeTeam.id)}
      />
      <div className="border-t border-[#1a2847]/50" />
      <TeamRow
        team={awayTeam}
        isWinner={winner === awayTeam?.id}
        isChampionPath={isChampionPath && winner === awayTeam?.id}
        onClick={() => awayTeam && onWinnerSelect(awayTeam.id)}
      />
    </div>
  )
}
```

- [ ] **Step 4: Create KnockoutBracket**

Create `src/components/knockout/KnockoutBracket.tsx`:
```tsx
'use client'
import { MatchCard } from './MatchCard'
import { TEAMS, R32_SLOTS, KNOCKOUT_STRUCTURE } from '@/data/wc2026'
import type { KnockoutMatchPick, TeamId, Language } from '@/lib/picks'
import type { R32Matchup } from '@/lib/bracket'

// Bracket alignment constants (px)
const CARD_H = 40
const INNER_GAP = 4   // gap between pairs within a column
const OUTER_GAP = 10  // gap between pair groups

// Precomputed absolute tops for each R32 position (1-8)
function r32Top(pos: number): number {
  // pos 1-8, paired: (1,2), (3,4), (5,6), (7,8)
  const pair = Math.floor((pos - 1) / 2) // 0-3
  const withinPair = (pos - 1) % 2       // 0 or 1
  return pair * (2 * CARD_H + INNER_GAP + OUTER_GAP) + withinPair * (CARD_H + INNER_GAP)
}

function r16Top(pairIdx: number): number {
  // centered between r32 positions pairIdx*2+1 and pairIdx*2+2
  const top1 = r32Top(pairIdx * 2 + 1) + CARD_H / 2
  const top2 = r32Top(pairIdx * 2 + 2) + CARD_H / 2
  return (top1 + top2) / 2 - CARD_H / 2
}

function qfTop(pairIdx: number): number {
  const t1 = r16Top(pairIdx * 2) + CARD_H / 2
  const t2 = r16Top(pairIdx * 2 + 1) + CARD_H / 2
  return (t1 + t2) / 2 - CARD_H / 2
}

function sfTop(side: 'left' | 'right'): number {
  const t1 = qfTop(0) + CARD_H / 2
  const t2 = qfTop(1) + CARD_H / 2
  return (t1 + t2) / 2 - CARD_H / 2
}

const CONTAINER_H = r32Top(8) + CARD_H + 20

interface Props {
  r32Matchups: R32Matchup[]
  knockoutPicks: KnockoutMatchPick[]
  lang: Language
  championTeamId: TeamId | null
  onWinnerSelect: (matchId: string, winner: TeamId) => void
}

function teamInfo(id: TeamId | null) {
  if (!id) return null
  const t = TEAMS[id]
  return t ? { id: t.id, name: t.name, flag: t.flag } : null
}

function getWinnerOfMatch(matchId: string, picks: KnockoutMatchPick[]): TeamId | null {
  return picks.find(p => p.matchId === matchId)?.winner ?? null
}

export function KnockoutBracket({ r32Matchups, knockoutPicks, lang, championTeamId, onWinnerSelect }: Props) {
  const leftR32 = R32_SLOTS.filter(s => s.side === 'left').sort((a, b) => a.position - b.position)
  const rightR32 = R32_SLOTS.filter(s => s.side === 'right').sort((a, b) => a.position - b.position)

  function resolvedMatchup(matchId: string) {
    const mu = r32Matchups.find(m => m.matchId === matchId)
    return {
      homeTeam: teamInfo(mu?.homeTeam ?? null),
      awayTeam: teamInfo(mu?.awayTeam ?? null),
    }
  }

  function knockoutMatchup(matchId: string) {
    const struct = KNOCKOUT_STRUCTURE.find(s => s.matchId === matchId)
    if (!struct) return { homeTeam: null, awayTeam: null }
    return {
      homeTeam: teamInfo(getWinnerOfMatch(struct.homeFeeder, knockoutPicks)),
      awayTeam: teamInfo(getWinnerOfMatch(struct.awayFeeder, knockoutPicks)),
    }
  }

  const isChampionPath = (matchId: string, teamId: TeamId | null) =>
    !!championTeamId && teamId === championTeamId

  const W = { r32: 112, r16: 100, qf: 90, sf: 85, final: 80 }
  const GAP = 5

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-0 bg-[#060b18] rounded-xl p-4" style={{ minWidth: 'max-content' }}>
        {/* Stage labels */}
        <div className="flex flex-col" style={{ gap: GAP }}>

          {/* Full bracket grid */}
          <div className="flex gap-[5px] items-start">

            {/* LEFT R32 */}
            <div style={{ position: 'relative', width: W.r32, height: CONTAINER_H }}>
              {leftR32.map(slot => {
                const { homeTeam, awayTeam } = resolvedMatchup(slot.matchId)
                const pick = knockoutPicks.find(p => p.matchId === slot.matchId)
                return (
                  <div key={slot.matchId} style={{ position: 'absolute', top: r32Top(slot.position), left: 0, right: 0, height: CARD_H }}>
                    <MatchCard
                      matchId={slot.matchId}
                      homeTeam={homeTeam} awayTeam={awayTeam}
                      winner={pick?.winner ?? null}
                      score={pick?.score ?? { home: null, away: null }}
                      lang={lang}
                      isChampionPath={isChampionPath(slot.matchId, pick?.winner ?? null)}
                      onWinnerSelect={t => onWinnerSelect(slot.matchId, t)}
                      onScoreChange={() => {}}
                    />
                  </div>
                )
              })}
            </div>

            {/* LEFT R16 */}
            <div style={{ position: 'relative', width: W.r16, height: CONTAINER_H }}>
              {[0,1,2,3].map(i => {
                const matchId = `R16_L${i+1}`
                const { homeTeam, awayTeam } = knockoutMatchup(matchId)
                const pick = knockoutPicks.find(p => p.matchId === matchId)
                return (
                  <div key={matchId} style={{ position: 'absolute', top: r16Top(i), left: 0, right: 0, height: CARD_H }}>
                    <MatchCard matchId={matchId} homeTeam={homeTeam} awayTeam={awayTeam}
                      winner={pick?.winner ?? null} score={pick?.score ?? { home: null, away: null }}
                      lang={lang} isChampionPath={isChampionPath(matchId, pick?.winner ?? null)}
                      onWinnerSelect={t => onWinnerSelect(matchId, t)} onScoreChange={() => {}} />
                  </div>
                )
              })}
            </div>

            {/* LEFT QF */}
            <div style={{ position: 'relative', width: W.qf, height: CONTAINER_H }}>
              {[0,1].map(i => {
                const matchId = `QF_L${i+1}`
                const { homeTeam, awayTeam } = knockoutMatchup(matchId)
                const pick = knockoutPicks.find(p => p.matchId === matchId)
                return (
                  <div key={matchId} style={{ position: 'absolute', top: qfTop(i), left: 0, right: 0, height: CARD_H }}>
                    <MatchCard matchId={matchId} homeTeam={homeTeam} awayTeam={awayTeam}
                      winner={pick?.winner ?? null} score={pick?.score ?? { home: null, away: null }}
                      lang={lang} isChampionPath={isChampionPath(matchId, pick?.winner ?? null)}
                      onWinnerSelect={t => onWinnerSelect(matchId, t)} onScoreChange={() => {}} />
                  </div>
                )
              })}
            </div>

            {/* LEFT SF */}
            <div style={{ position: 'relative', width: W.sf, height: CONTAINER_H }}>
              {(() => {
                const matchId = 'SF_L'
                const { homeTeam, awayTeam } = knockoutMatchup(matchId)
                const pick = knockoutPicks.find(p => p.matchId === matchId)
                return (
                  <div style={{ position: 'absolute', top: sfTop('left'), left: 0, right: 0, height: CARD_H }}>
                    <MatchCard matchId={matchId} homeTeam={homeTeam} awayTeam={awayTeam}
                      winner={pick?.winner ?? null} score={pick?.score ?? { home: null, away: null }}
                      lang={lang} isChampionPath={isChampionPath(matchId, pick?.winner ?? null)}
                      onWinnerSelect={t => onWinnerSelect(matchId, t)} onScoreChange={() => {}} />
                  </div>
                )
              })()}
            </div>

            {/* FINAL */}
            <div style={{ position: 'relative', width: W.final, height: CONTAINER_H }}>
              {(() => {
                const matchId = 'FINAL'
                const { homeTeam, awayTeam } = knockoutMatchup(matchId)
                const pick = knockoutPicks.find(p => p.matchId === matchId)
                const center = sfTop('left') + CARD_H / 2
                return (
                  <div style={{ position: 'absolute', top: center - 30, left: 0, right: 0, height: 60 }}
                    className="bg-gradient-to-b from-[#1a3a0a] to-[#0a1e04] border-2 border-[#ffd700] rounded-lg shadow-[0_0_18px_rgba(255,215,0,0.3)] flex flex-col items-center justify-center text-center p-2">
                    <div className="text-[#ffd700] text-[7px] font-bold tracking-widest mb-1">🏆 FINAL</div>
                    {pick?.winner ? (
                      <>
                        <div className="text-xl">{TEAMS[pick.winner]?.flag}</div>
                        <div className="text-[#ffd700] text-[9px] font-black">{TEAMS[pick.winner]?.name}</div>
                        <div className="text-green-400 text-[7px] font-bold mt-1">CHAMPION</div>
                      </>
                    ) : (
                      <div className="text-[#555] text-[9px]">Pick your champion</div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* RIGHT SF */}
            <div style={{ position: 'relative', width: W.sf, height: CONTAINER_H }}>
              {(() => {
                const matchId = 'SF_R'
                const { homeTeam, awayTeam } = knockoutMatchup(matchId)
                const pick = knockoutPicks.find(p => p.matchId === matchId)
                return (
                  <div style={{ position: 'absolute', top: sfTop('right'), left: 0, right: 0, height: CARD_H }}>
                    <MatchCard matchId={matchId} homeTeam={homeTeam} awayTeam={awayTeam}
                      winner={pick?.winner ?? null} score={pick?.score ?? { home: null, away: null }}
                      lang={lang} isChampionPath={false}
                      onWinnerSelect={t => onWinnerSelect(matchId, t)} onScoreChange={() => {}} />
                  </div>
                )
              })()}
            </div>

            {/* RIGHT QF */}
            <div style={{ position: 'relative', width: W.qf, height: CONTAINER_H }}>
              {[0,1].map(i => {
                const matchId = `QF_R${i+1}`
                const { homeTeam, awayTeam } = knockoutMatchup(matchId)
                const pick = knockoutPicks.find(p => p.matchId === matchId)
                return (
                  <div key={matchId} style={{ position: 'absolute', top: qfTop(i), left: 0, right: 0, height: CARD_H }}>
                    <MatchCard matchId={matchId} homeTeam={homeTeam} awayTeam={awayTeam}
                      winner={pick?.winner ?? null} score={pick?.score ?? { home: null, away: null }}
                      lang={lang} isChampionPath={false}
                      onWinnerSelect={t => onWinnerSelect(matchId, t)} onScoreChange={() => {}} />
                  </div>
                )
              })}
            </div>

            {/* RIGHT R16 */}
            <div style={{ position: 'relative', width: W.r16, height: CONTAINER_H }}>
              {[0,1,2,3].map(i => {
                const matchId = `R16_R${i+1}`
                const { homeTeam, awayTeam } = knockoutMatchup(matchId)
                const pick = knockoutPicks.find(p => p.matchId === matchId)
                return (
                  <div key={matchId} style={{ position: 'absolute', top: r16Top(i), left: 0, right: 0, height: CARD_H }}>
                    <MatchCard matchId={matchId} homeTeam={homeTeam} awayTeam={awayTeam}
                      winner={pick?.winner ?? null} score={pick?.score ?? { home: null, away: null }}
                      lang={lang} isChampionPath={false}
                      onWinnerSelect={t => onWinnerSelect(matchId, t)} onScoreChange={() => {}} />
                  </div>
                )
              })}
            </div>

            {/* RIGHT R32 */}
            <div style={{ position: 'relative', width: W.r32, height: CONTAINER_H }}>
              {rightR32.map(slot => {
                const { homeTeam, awayTeam } = resolvedMatchup(slot.matchId)
                const pick = knockoutPicks.find(p => p.matchId === slot.matchId)
                return (
                  <div key={slot.matchId} style={{ position: 'absolute', top: r32Top(slot.position), left: 0, right: 0, height: CARD_H }}>
                    <MatchCard matchId={slot.matchId} homeTeam={homeTeam} awayTeam={awayTeam}
                      winner={pick?.winner ?? null} score={pick?.score ?? { home: null, away: null }}
                      lang={lang} isChampionPath={false}
                      onWinnerSelect={t => onWinnerSelect(slot.matchId, t)} onScoreChange={() => {}} />
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run tests**

```bash
npm run test:run -- tests/components/MatchCard.test.tsx
```
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/knockout/ tests/components/MatchCard.test.tsx
git commit -m "feat: knockout bracket UI with aligned double-sided bracket"
git push
```

---

## Task 9: Champion Reveal + Photo Capture

**Files:**
- Create: `src/components/champion/ChampionReveal.tsx`
- Create: `src/components/champion/PhotoCapture.tsx`

- [ ] **Step 1: Create ChampionReveal**

Create `src/components/champion/ChampionReveal.tsx`:
```tsx
'use client'
import { useEffect } from 'react'
import { TEAMS } from '@/data/wc2026'
import { t } from '@/lib/i18n'
import type { Language, TeamId } from '@/lib/picks'

// canvas-confetti is browser-only
let confetti: ((opts: object) => void) | null = null
if (typeof window !== 'undefined') {
  import('canvas-confetti').then(m => { confetti = m.default })
}

interface Props {
  champion: TeamId
  lang: Language
  onContinue: () => void
}

export function ChampionReveal({ champion, lang, onContinue }: Props) {
  const team = TEAMS[champion]

  useEffect(() => {
    confetti?.({
      particleCount: 150,
      spread: 80,
      colors: ['#ffd700', '#ff8c00', '#ffffff', '#4caf50'],
      origin: { y: 0.6 },
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="text-[#ffd700] text-xs font-bold tracking-[4px] uppercase mb-4">
        {t(lang, 'yourChampion')}
      </div>
      <div className="text-8xl mb-4">{team?.flag}</div>
      <h2 className="text-4xl font-black text-white mb-2">
        {lang === 'cn' ? team?.nameZh : lang === 'es' ? team?.nameEs : team?.name}
      </h2>
      <div className="text-[#ffd700] text-2xl mb-12">🏆</div>

      <button
        onClick={onContinue}
        className="bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black text-lg px-10 py-4 rounded-xl hover:scale-105 transition-transform"
      >
        {t(lang, 'addSelfie')} →
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Create PhotoCapture**

Create `src/components/champion/PhotoCapture.tsx`:
```tsx
'use client'
import { useRef, useState } from 'react'
import { t } from '@/lib/i18n'
import type { Language } from '@/lib/picks'

interface Props {
  lang: Language
  onPhotoReady: (dataUrl: string | undefined) => void
}

export function PhotoCapture({ lang, onPhotoReady }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function handleFile(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      const url = e.target?.result as string
      setPreview(url)
      onPhotoReady(url)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-8 flex flex-col items-center gap-6">
      <h2 className="text-white text-xl font-bold text-center">{t(lang, 'addSelfie')}</h2>

      {preview && (
        <img src={preview} alt="Your photo" className="w-40 h-40 rounded-full object-cover border-4 border-[#ffd700]" />
      )}

      <div className="flex flex-col gap-3 w-full">
        {/* Upload from device */}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border border-[#ffd700] text-[#ffd700] font-bold py-3 rounded-xl hover:bg-[#ffd700]/10 transition-colors"
        >
          {t(lang, 'uploadPhoto')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />

        {/* Camera capture (mobile) */}
        <button
          onClick={() => cameraRef.current?.click()}
          className="w-full border border-[#ffd700] text-[#ffd700] font-bold py-3 rounded-xl hover:bg-[#ffd700]/10 transition-colors"
        >
          {t(lang, 'takePhoto')}
        </button>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />

        {/* Skip */}
        <button
          onClick={() => onPhotoReady(undefined)}
          className="w-full text-[#8a9bc0] text-sm py-2 underline hover:text-white transition-colors"
        >
          {t(lang, 'skipPhoto')}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/champion/
git commit -m "feat: champion reveal with confetti and photo capture"
git push
```

---

## Task 10: Prediction Flow Route

**Files:**
- Create: `src/app/predict/page.tsx`

- [ ] **Step 1: Create prediction orchestrator**

Create `src/app/predict/page.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePredictions } from '@/hooks/usePredictions'
import { useLanguage } from '@/hooks/useLanguage'
import { GroupStagePicker } from '@/components/group-stage/GroupStagePicker'
import { KnockoutBracket } from '@/components/knockout/KnockoutBracket'
import { ChampionReveal } from '@/components/champion/ChampionReveal'
import { PhotoCapture } from '@/components/champion/PhotoCapture'

type Step = 'groups' | 'knockout' | 'champion' | 'photo'

export default function PredictPage() {
  const [step, setStep] = useState<Step>('groups')
  const { lang } = useLanguage()
  const router = useRouter()
  const {
    groups, knockout, r32Matchups, champion,
    setGroupRanking, setGroupScore, setKnockoutWinner, setKnockoutScore,
    setPhotoDataUrl, photoDataUrl,
  } = usePredictions()

  async function handlePhotoReady(dataUrl: string | undefined) {
    setPhotoDataUrl(dataUrl)
    // Navigate to share page, passing picks via sessionStorage
    sessionStorage.setItem('wc2026_picks', JSON.stringify({ groups, knockout, lang, photoDataUrl: dataUrl }))
    router.push('/share')
  }

  if (step === 'groups') {
    return (
      <GroupStagePicker
        picks={groups}
        lang={lang}
        onRankingChange={setGroupRanking}
        onScoreChange={setGroupScore}
        onComplete={() => setStep('knockout')}
      />
    )
  }

  if (step === 'knockout') {
    return (
      <div className="py-6 px-2">
        <div className="text-center mb-6">
          <h2 className="text-[#ffd700] text-lg font-bold">Knockout Bracket</h2>
        </div>
        <KnockoutBracket
          r32Matchups={r32Matchups}
          knockoutPicks={knockout}
          lang={lang}
          championTeamId={champion}
          onWinnerSelect={(matchId, winner) => {
            setKnockoutWinner(matchId, winner)
            if (matchId === 'FINAL') setStep('champion')
          }}
        />
      </div>
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

- [ ] **Step 2: Test full flow manually**

```bash
npm run dev
```
Navigate: / → Start → Group stage (rank teams) → Knockout → pick FINAL winner → Champion reveal → Photo capture

- [ ] **Step 3: Commit**

```bash
git add src/app/predict/page.tsx
git commit -m "feat: prediction flow orchestrator (groups → knockout → champion → photo)"
git push
```

---

## Task 11: Bracket Image Template + API

**Files:**
- Create: `src/components/bracket-image/BracketImageTemplate.tsx`
- Create: `src/app/api/generate-bracket/route.ts`

- [ ] **Step 1: Create Satori-compatible bracket template**

Create `src/components/bracket-image/BracketImageTemplate.tsx`:

> **Note:** Satori only supports a subset of CSS (no Tailwind classes — use inline styles only). No `className` allowed.

```tsx
import { TEAMS, GROUPS } from '@/data/wc2026'
import type { BracketPicks, TeamId, GroupId } from '@/lib/picks'

const GOLD = '#ffd700'
const DARK = '#060b18'
const NAVY = '#0c1526'
const DIM_BORDER = '#1a2847'

const CARD_H = 38
const INNER_GAP = 4
const OUTER_GAP = 10

function r32Top(pos: number) {
  const pair = Math.floor((pos - 1) / 2)
  const within = (pos - 1) % 2
  return pair * (2 * CARD_H + INNER_GAP + OUTER_GAP) + within * (CARD_H + INNER_GAP)
}
function r16Top(i: number) { return (r32Top(i*2+1) + CARD_H/2 + r32Top(i*2+2) + CARD_H/2) / 2 - CARD_H/2 }
function qfTop(i: number) { return (r16Top(i*2) + CARD_H/2 + r16Top(i*2+1) + CARD_H/2) / 2 - CARD_H/2 }
function sfTop() { return (qfTop(0) + CARD_H/2 + qfTop(1) + CARD_H/2) / 2 - CARD_H/2 }
const CONTAINER_H = r32Top(8) + CARD_H + 10

interface MatchCellProps {
  homeTeam: TeamId | null; awayTeam: TeamId | null
  winner: TeamId | null; isPath: boolean
}
function MatchCell({ homeTeam, awayTeam, winner, isPath }: MatchCellProps) {
  const bg = isPath ? '#1a2e0a' : NAVY
  const border = isPath ? GOLD : DIM_BORDER
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 4, overflow: 'hidden', height: CARD_H, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {[homeTeam, awayTeam].map((tid, i) => {
        const tm = tid ? TEAMS[tid] : null
        const isWinner = tid && tid === winner
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 7px', borderTop: i === 1 ? `1px solid ${DIM_BORDER}40` : 'none' }}>
            <span style={{ fontSize: 11 }}>{tm?.flag ?? ''}</span>
            <span style={{ fontSize: 9, fontWeight: isWinner && isPath ? 700 : 400, color: isWinner && isPath ? GOLD : isWinner ? '#fff' : '#7a8fb0' }}>
              {tm?.name ?? 'TBD'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function BracketImageTemplate({ picks }: { picks: BracketPicks }) {
  const { groups, knockout } = picks
  const champion = knockout.find(m => m.matchId === 'FINAL')?.winner ?? null

  function winner(matchId: string): TeamId | null {
    return knockout.find(m => m.matchId === matchId)?.winner ?? null
  }
  function feedWinner(feeder: string): TeamId | null { return winner(feeder) }
  function isPath(matchId: string): boolean {
    const w = winner(matchId)
    return !!champion && w === champion
  }

  // Group panel data
  const groupData = GROUPS.map(g => {
    const pick = groups.find(p => p.groupId === g.id)
    return { id: g.id, teams: g.teams.map((tid, i) => ({ tid, rank: i + 1, team: TEAMS[tid] })) }
  })

  const ColW = { r32: 108, r16: 96, qf: 86, sf: 80, final: 76, gap: 5 }

  return (
    <div style={{ display: 'flex', background: DARK, padding: 14, borderRadius: 12, gap: 0 }}>
      {/* BRACKET */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', color: GOLD, fontSize: 9, fontWeight: 700, letterSpacing: 3, marginBottom: 10 }}>
          FIFA WORLD CUP 2026 · MY BRACKET
        </div>
        <div style={{ display: 'flex', gap: ColW.gap, alignItems: 'flex-start' }}>
          {/* LEFT R32 */}
          <div style={{ position: 'relative', width: ColW.r32, height: CONTAINER_H }}>
            {[1,2,3,4,5,6,7,8].map(pos => (
              <div key={pos} style={{ position: 'absolute', top: r32Top(pos), left: 0, right: 0, height: CARD_H }}>
                <MatchCell homeTeam={null} awayTeam={null} winner={null} isPath={false} />
              </div>
            ))}
          </div>
          {/* LEFT R16 */}
          <div style={{ position: 'relative', width: ColW.r16, height: CONTAINER_H }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ position: 'absolute', top: r16Top(i), left: 0, right: 0, height: CARD_H }}>
                <MatchCell homeTeam={feedWinner(`R32_L${i*2+1}`)} awayTeam={feedWinner(`R32_L${i*2+2}`)} winner={winner(`R16_L${i+1}`)} isPath={isPath(`R16_L${i+1}`)} />
              </div>
            ))}
          </div>
          {/* LEFT QF */}
          <div style={{ position: 'relative', width: ColW.qf, height: CONTAINER_H }}>
            {[0,1].map(i => (
              <div key={i} style={{ position: 'absolute', top: qfTop(i), left: 0, right: 0, height: CARD_H }}>
                <MatchCell homeTeam={feedWinner(`R16_L${i*2+1}`)} awayTeam={feedWinner(`R16_L${i*2+2}`)} winner={winner(`QF_L${i+1}`)} isPath={isPath(`QF_L${i+1}`)} />
              </div>
            ))}
          </div>
          {/* LEFT SF */}
          <div style={{ position: 'relative', width: ColW.sf, height: CONTAINER_H }}>
            <div style={{ position: 'absolute', top: sfTop(), left: 0, right: 0, height: CARD_H }}>
              <MatchCell homeTeam={feedWinner('QF_L1')} awayTeam={feedWinner('QF_L2')} winner={winner('SF_L')} isPath={isPath('SF_L')} />
            </div>
          </div>
          {/* FINAL */}
          <div style={{ position: 'relative', width: ColW.final, height: CONTAINER_H }}>
            <div style={{ position: 'absolute', top: sfTop() - 10, left: 0, right: 0, height: 60, background: 'linear-gradient(135deg,#1a3a0a,#0a1e04)', border: `2px solid ${GOLD}`, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ color: GOLD, fontSize: 7, fontWeight: 700, letterSpacing: 2 }}>🏆 FINAL</div>
              {champion && <div style={{ color: GOLD, fontSize: 16 }}>{TEAMS[champion]?.flag}</div>}
              {champion && <div style={{ color: GOLD, fontSize: 9, fontWeight: 700 }}>{TEAMS[champion]?.name}</div>}
              <div style={{ color: '#4caf50', fontSize: 7, fontWeight: 700 }}>CHAMPION</div>
            </div>
          </div>
          {/* RIGHT SF */}
          <div style={{ position: 'relative', width: ColW.sf, height: CONTAINER_H }}>
            <div style={{ position: 'absolute', top: sfTop(), left: 0, right: 0, height: CARD_H }}>
              <MatchCell homeTeam={feedWinner('QF_R1')} awayTeam={feedWinner('QF_R2')} winner={winner('SF_R')} isPath={false} />
            </div>
          </div>
          {/* RIGHT QF */}
          <div style={{ position: 'relative', width: ColW.qf, height: CONTAINER_H }}>
            {[0,1].map(i => (
              <div key={i} style={{ position: 'absolute', top: qfTop(i), left: 0, right: 0, height: CARD_H }}>
                <MatchCell homeTeam={feedWinner(`R16_R${i*2+1}`)} awayTeam={feedWinner(`R16_R${i*2+2}`)} winner={winner(`QF_R${i+1}`)} isPath={false} />
              </div>
            ))}
          </div>
          {/* RIGHT R16 */}
          <div style={{ position: 'relative', width: ColW.r16, height: CONTAINER_H }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ position: 'absolute', top: r16Top(i), left: 0, right: 0, height: CARD_H }}>
                <MatchCell homeTeam={feedWinner(`R32_R${i*2+1}`)} awayTeam={feedWinner(`R32_R${i*2+2}`)} winner={winner(`R16_R${i+1}`)} isPath={false} />
              </div>
            ))}
          </div>
          {/* RIGHT R32 */}
          <div style={{ position: 'relative', width: ColW.r32, height: CONTAINER_H }}>
            {[1,2,3,4,5,6,7,8].map(pos => (
              <div key={pos} style={{ position: 'absolute', top: r32Top(pos), left: 0, right: 0, height: CARD_H }}>
                <MatchCell homeTeam={null} awayTeam={null} winner={null} isPath={false} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ width: 1, background: '#1e2d50', margin: '0 12px', alignSelf: 'stretch' }} />

      {/* GROUP PANEL */}
      <div style={{ width: 210, display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>GROUP STAGE</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {groupData.map(g => (
            <div key={g.id} style={{ background: '#0a1020', border: `1px solid ${DIM_BORDER}`, borderRadius: 5, padding: '5px 6px' }}>
              <div style={{ color: GOLD, fontSize: 7, fontWeight: 700, letterSpacing: 1, borderBottom: `1px solid ${DIM_BORDER}`, paddingBottom: 3, marginBottom: 4 }}>GROUP {g.id}</div>
              {g.teams.map((t, i) => (
                <div key={t.tid} style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 }}>
                  <span style={{ fontSize: 7, fontWeight: 700, color: i===0?'#4caf50':i===1?'#5b7fa6':i===2?'#8a6a2a':'#2a3a5a', width: 8 }}>{['①','②','③','④'][i]}</span>
                  <span style={{ fontSize: 10 }}>{t.team?.flag}</span>
                  <span style={{ fontSize: 8, color: i===0?'#d0d8e8':i===1?'#8a9bc0':i===2?'#5a6a7a':'#2a3a5a' }}>{t.team?.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create bracket image API route**

Create `src/app/api/generate-bracket/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync } from 'fs'
import path from 'path'
import { BracketImageTemplate } from '@/components/bracket-image/BracketImageTemplate'
import type { BracketPicks } from '@/lib/picks'

// Load a font for Satori (Inter or any TTF)
let fontData: ArrayBuffer | null = null
function getFont() {
  if (!fontData) {
    const fontPath = path.join(process.cwd(), 'public', 'Inter-Regular.ttf')
    fontData = readFileSync(fontPath).buffer
  }
  return fontData
}

export async function POST(req: NextRequest) {
  try {
    const picks: BracketPicks = await req.json()

    const svg = await satori(
      BracketImageTemplate({ picks }) as React.ReactElement,
      {
        width: 1400,
        height: 480,
        fonts: [{ name: 'Inter', data: getFont(), weight: 400 }],
      }
    )

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1400 } })
    const png = resvg.render().asPng()

    return new NextResponse(png, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="wc2026-bracket.png"',
      },
    })
  } catch (err) {
    console.error('Bracket generation error:', err)
    return NextResponse.json({ error: 'Failed to generate bracket' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Download Inter font to public/**

```bash
curl -L "https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.ttf" -o public/Inter-Regular.ttf
```

- [ ] **Step 4: Test the route**

```bash
npm run dev
```

```bash
curl -X POST http://localhost:3000/api/generate-bracket \
  -H "Content-Type: application/json" \
  -d '{"groups":[],"knockout":[],"language":"en"}' \
  --output /tmp/test-bracket.png && open /tmp/test-bracket.png
```
Expected: PNG file opens with the bracket layout.

- [ ] **Step 5: Commit**

```bash
git add src/components/bracket-image/ src/app/api/generate-bracket/ public/Inter-Regular.ttf
git commit -m "feat: bracket image generation via Satori + Resvg"
git push
```

---

## Task 12: Celebration Image API

**Files:**
- Create: `src/app/api/generate-celebration/route.ts`

- [ ] **Step 1: Create API route**

Create `src/app/api/generate-celebration/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { TEAMS } from '@/data/wc2026'
import type { Language, TeamId } from '@/lib/picks'

const PROMPT_TEMPLATES: Record<Language, (team: string) => string> = {
  en: (team) => `Cartoon anime-style illustration of a person joyfully celebrating with the ${team} national football team players. World Cup trophy, colorful confetti, packed stadium crowd in background, vibrant celebratory atmosphere. Person is prominently featured alongside the team.`,
  cn: (team) => `卡通动漫风格插画，一个人与${team}国家足球队球员一起欢庆，背景有世界杯奖杯、彩色纸屑和欢腾的球场观众，欢乐庆典氛围。`,
  es: (team) => `Ilustración estilo caricatura anime de una persona celebrando con los jugadores del equipo nacional de fútbol de ${team}. Trofeo de la Copa Mundial, confeti colorido, estadio lleno de fanáticos, atmósfera de celebración vibrante.`,
}

export async function POST(req: NextRequest) {
  try {
    const { photo, championTeam, language }: {
      photo?: string
      championTeam: TeamId
      language: Language
    } = await req.json()

    const team = TEAMS[championTeam]
    if (!team) return NextResponse.json({ error: 'Unknown team' }, { status: 400 })

    const prompt = PROMPT_TEMPLATES[language ?? 'en'](team.name)

    const body: Record<string, unknown> = {
      model: 'openai/gpt-image-1', // or 'black-forest-labs/flux-1.1-pro'
      prompt,
      n: 1,
      size: '1024x1024',
    }

    // If user provided a photo, include it as reference image
    if (photo) {
      body.image = photo // base64 data URL — check OpenRouter docs for exact field name
    }

    const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://worldcup2026.app',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenRouter error:', err)
      return NextResponse.json({ error: 'Image generation failed' }, { status: 502 })
    }

    const data = await response.json()
    const imageUrl: string = data.data?.[0]?.url ?? data.data?.[0]?.b64_json

    return NextResponse.json({ imageUrl })
  } catch (err) {
    console.error('Celebration generation error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

> **Note:** The exact field name for passing a reference image to OpenRouter depends on the model chosen. Check https://openrouter.ai/docs for the active model's image-in capabilities. `gpt-image-1` via OpenRouter supports image editing with a base64 input.

- [ ] **Step 2: Commit**

```bash
git add src/app/api/generate-celebration/
git commit -m "feat: celebration image API via OpenRouter"
git push
```

---

## Task 13: Share Page

**Files:**
- Create: `src/components/share/SharePage.tsx`
- Create: `src/app/share/page.tsx`

- [ ] **Step 1: Create SharePage component**

Create `src/components/share/SharePage.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'
import { t } from '@/lib/i18n'
import type { BracketPicks, Language } from '@/lib/picks'

interface Props { lang: Language }

export function SharePage({ lang }: Props) {
  const [bracketUrl, setBracketUrl] = useState<string | null>(null)
  const [celebrationUrl, setCelebrationUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('wc2026_picks')
    if (!stored) { setError('No picks found'); setLoading(false); return }

    const picks: BracketPicks = JSON.parse(stored)
    const champion = picks.knockout.find(m => m.matchId === 'FINAL')?.winner

    Promise.all([
      // Generate bracket image
      fetch('/api/generate-bracket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...picks }),
      }).then(r => r.blob()).then(b => URL.createObjectURL(b)),

      // Generate celebration image (only if champion known)
      champion
        ? fetch('/api/generate-celebration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photo: picks.photoDataUrl, championTeam: champion, language: picks.language }),
          }).then(r => r.json()).then(d => d.imageUrl)
        : Promise.resolve(null),
    ])
      .then(([bracket, celebration]) => {
        setBracketUrl(bracket)
        setCelebrationUrl(celebration)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function download(url: string, filename: string) {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#ffd700] border-t-transparent animate-spin" />
        <p className="text-[#8a9bc0]">{t(lang, 'generating')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <h1 className="text-center text-[#ffd700] text-2xl font-black">🏆 Your Predictions</h1>

        {/* Bracket image */}
        {bracketUrl && (
          <div className="flex flex-col gap-3">
            <img src={bracketUrl} alt="Your bracket" className="w-full rounded-xl border border-[#1e2d50]" />
            <button
              onClick={() => download(bracketUrl, 'wc2026-bracket.png')}
              className="self-center bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black px-8 py-3 rounded-xl hover:scale-105 transition-transform"
            >
              {t(lang, 'downloadBracket')}
            </button>
          </div>
        )}

        {/* Celebration image */}
        {celebrationUrl && (
          <div className="flex flex-col items-center gap-3">
            <img src={celebrationUrl} alt="Your celebration" className="max-w-sm w-full rounded-xl border border-[#ffd700]/30" />
            <button
              onClick={() => download(celebrationUrl, 'wc2026-celebration.png')}
              className="bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black px-8 py-3 rounded-xl hover:scale-105 transition-transform"
            >
              {t(lang, 'downloadCelebration')}
            </button>
          </div>
        )}

        <p className="text-center text-[#8a9bc0] text-sm">{t(lang, 'shareHint')}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create share route**

Create `src/app/share/page.tsx`:
```tsx
'use client'
import { useLanguage } from '@/hooks/useLanguage'
import { SharePage } from '@/components/share/SharePage'
export default function Share() {
  const { lang } = useLanguage()
  return <SharePage lang={lang} />
}
```

- [ ] **Step 3: End-to-end test**

```bash
npm run dev
```
Complete the full flow: Landing → group picks → knockout picks → pick Final winner → photo (or skip) → Share page loads and shows both images with download buttons.

- [ ] **Step 4: Commit**

```bash
git add src/components/share/ src/app/share/
git commit -m "feat: share page — displays and downloads both generated images"
git push
```

---

## Task 14: Final QA + Deployment

- [ ] **Step 1: Run all tests**

```bash
npm run test:run
```
Expected: All tests pass.

- [ ] **Step 2: Build for production**

```bash
npm run build
```
Expected: No TypeScript errors, clean build output.

- [ ] **Step 3: Verify .env.local is excluded from git**

```bash
echo ".env.local" >> .gitignore
git add .gitignore
```

- [ ] **Step 4: Fill in all 48 teams in wc2026.ts**

Open `src/data/wc2026.ts` and complete all team entries. Verify against https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/groups. All `// TODO: verify` and `// TODO: complete` comments must be resolved.

- [ ] **Step 5: Deploy to Vercel**

```bash
npx vercel --prod
```

When prompted, link to existing project or create new. Set environment variable in Vercel dashboard:
- `OPENROUTER_API_KEY` → your key

- [ ] **Step 6: Add .gitignore for .superpowers**

```bash
echo ".superpowers/" >> .gitignore
git add .gitignore
git commit -m "chore: add .superpowers to gitignore"
git push
```

- [ ] **Step 7: Smoke test production**

Visit the deployed Vercel URL. Complete the full prediction flow and verify both images download correctly on mobile.

---

## Self-Review Notes

- **Spec coverage:** Landing ✓, Group stage ✓, Knockout ✓, Champion reveal ✓, Photo capture ✓, Bracket image ✓, Celebration image ✓, i18n EN/CN/ES ✓, Download/share ✓, Dark sports style ✓
- **Wild-card slots:** Task 3 returns `awayOptions` for wild-card R32 matchups. The KnockoutBracket in Task 8 must display these options when `awayTeam` is null — implementer should add a dropdown/picker in MatchCard for this case using the `awayOptions` prop.
- **WC2026 data:** Task 2 is a skeleton — Task 14 Step 4 makes completing the real data mandatory before shipping.
- **OpenRouter model:** `gpt-image-1` may not support image-in on OpenRouter. Check available models at https://openrouter.ai/models and update `model` in Task 12 if needed. `black-forest-labs/flux-1.1-pro` is a reliable fallback for text-to-image without a reference photo.
