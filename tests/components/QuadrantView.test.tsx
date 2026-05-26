import { render, screen, fireEvent } from '@testing-library/react'
import { QuadrantView } from '@/components/knockout/QuadrantView'
import { GROUPS } from '@/data/wc2026'
import { buildR32Matchups } from '@/lib/bracket'
import type { GroupPick, GroupId, KnockoutMatchPick } from '@/lib/picks'

const filledGroups: GroupPick[] = GROUPS.map(g => ({
  groupId: g.id as GroupId,
  ranking: [g.teams[0], g.teams[1], g.teams[2], g.teams[3]] as [string,string,string,string],
  scores: {},
}))
const r32 = buildR32Matchups(filledGroups)
const emptyKnockout: KnockoutMatchPick[] = []

test('renders UL quadrant showing a team from group E (R32_L1 home is 1E = GER)', () => {
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
  // R32_L1 homeSlot='1E' → group E rank[0] = 'GER' → name "Germany"
  expect(screen.getByText('Germany')).toBeInTheDocument()
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
  fireEvent.click(screen.getAllByText(/Back/i)[0])
  expect(onBack).toHaveBeenCalledTimes(1)
})

test('wild-card slot shows options when awayTeam is null', () => {
  // R32_L1 awaySlot='3ABCDF' which is a wild card → awayOptions should list 3rd-place teams
  // With filled groups, awayOptions = [BOL (group A 3rd), SRB (B 3rd), SVK (C 3rd), UKR (D 3rd), CMR (F 3rd)]
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
  // The wild card pick prompt should be visible
  expect(screen.getAllByText(/Pick 3rd-place team/i).length).toBeGreaterThan(0)
})
