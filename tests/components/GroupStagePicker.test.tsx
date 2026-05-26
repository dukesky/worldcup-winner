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
  expect(screen.getAllByText(/Rose Bowl/).length).toBeGreaterThan(0)
})
