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
