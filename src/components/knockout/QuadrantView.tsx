'use client'
import type { Language, KnockoutMatchPick, TeamId } from '@/lib/picks'
import type { R32Matchup } from '@/lib/bracket'

type QuadrantId = 'UL' | 'LL' | 'UR' | 'LR'

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

export function QuadrantView(_props: Props) {
  return <div>QuadrantView — coming soon</div>
}
