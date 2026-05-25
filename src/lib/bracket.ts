import { R32_SLOTS } from '@/data/wc2026'
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
