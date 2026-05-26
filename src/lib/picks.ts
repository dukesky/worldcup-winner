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
  matchId: string // "R32_L1" ... "R32_L8", "R32_R1" ... "R32_R8", "R16_L1" ... "FINAL"
  homeSlot: string // e.g. "1E" or "BRA" once resolved
  awaySlot: string
  winner: TeamId | null
  score: { home: number | null; away: number | null }
}

export interface GroupMatch {
  home: TeamId
  away: TeamId
  date: string   // "2026-06-12"
  time: string   // "17:00 ET"
  venue: string  // "MetLife Stadium, New York"
}

export interface BracketPicks {
  groups: GroupPick[]        // 12 entries, one per group
  knockout: KnockoutMatchPick[] // 31 matches total
  language: Language
  photoDataUrl?: string      // base64 selfie
  wildcardSelections?: Record<string, TeamId>
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
  matchId: string   // "R32_L1" through "R32_L8", "R32_R1" through "R32_R8"
  homeSlot: string  // e.g. "1E"
  awaySlot: string  // e.g. "3ABCDF"
  side: 'left' | 'right'
  position: number  // 1-8 within side (top=1, bottom=8)
}

export interface KnockoutStructureEntry {
  matchId: string   // "R16_L1" through "FINAL"
  homeFeeder: string
  awayFeeder: string
}
