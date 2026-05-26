'use client'
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

export function FinalFourView(_props: Props) {
  return <div>FinalFourView — coming soon</div>
}
