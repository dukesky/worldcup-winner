'use client'
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

export function KnockoutOverview(_props: Props) {
  return <div>KnockoutOverview — coming soon</div>
}
