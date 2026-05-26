import { render, screen, fireEvent } from '@testing-library/react'
import { GroupStagePicker } from '@/components/group-stage/GroupStagePicker'
import { GROUPS } from '@/data/wc2026'

const basePicks = GROUPS.map(g => ({
  groupId: g.id as import('@/lib/picks').GroupId,
  ranking: ['', '', '', ''] as [string, string, string, string],
  scores: {},
}))

const defaultProps = {
  picks: basePicks,
  lang: 'en' as const,
  currentGroupIdx: 0,
  onGroupIdxChange: () => {},
  onRankingChange: () => {},
  onScoreChange: () => {},
  onComplete: () => {},
  onBack: () => {},
}

test('calls onBack when back-to-home button is clicked', () => {
  const onBack = vi.fn()
  render(<GroupStagePicker {...defaultProps} onBack={onBack} />)
  fireEvent.click(screen.getByText('Home'))
  expect(onBack).toHaveBeenCalledTimes(1)
})

test('shows fixture venue for group A', () => {
  render(<GroupStagePicker {...defaultProps} />)
  expect(screen.getAllByText(/Rose Bowl/).length).toBeGreaterThan(0)
})
