import { describe, it, expect } from 'vitest'
import { resolveSlot, buildR32Matchups, resolveWildCardOptions } from '@/lib/bracket'
import type { GroupPick } from '@/lib/picks'

const mockGroups: GroupPick[] = [
  { groupId: 'A', ranking: ['USA','PAN','BOL','JAM'], scores: {} },
  { groupId: 'B', ranking: ['FRA','MEX','SRB','ALB'], scores: {} },
  { groupId: 'C', ranking: ['ENG','DEN','SVK','CAN'], scores: {} },
  { groupId: 'D', ranking: ['NED','AUT','UKR','ISL'], scores: {} },
  { groupId: 'E', ranking: ['BRA','COL','SEN','PER'], scores: {} },
  { groupId: 'F', ranking: ['ITA','SUI','CMR','GIN'], scores: {} },
  { groupId: 'G', ranking: ['ESP','TUR','GEO','UZB'], scores: {} },
  { groupId: 'H', ranking: ['POR','CRO','CZE','TZA'], scores: {} },
  { groupId: 'I', ranking: ['GER','JPN','IDN','VIE'], scores: {} },
  { groupId: 'J', ranking: ['ARG','URU','ECU','CHL'], scores: {} },
  { groupId: 'K', ranking: ['MAR','AUS','TUN','SAU'], scores: {} },
  { groupId: 'L', ranking: ['KOR','NGA','CRI','GHA'], scores: {} },
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

describe('resolveWildCardOptions', () => {
  it('resolves 3ABCDF to 3rd-place teams from groups A,B,C,D,F only', () => {
    const options = resolveWildCardOptions('3ABCDF', mockGroups)
    expect(options).toContain('BOL')  // A's 3rd
    expect(options).toContain('SRB')  // B's 3rd
    expect(options).toContain('SVK')  // C's 3rd
    expect(options).toContain('UKR')  // D's 3rd
    expect(options).toContain('CMR')  // F's 3rd
    expect(options).not.toContain('SEN') // E's 3rd — not in ABCDF
    expect(options).toHaveLength(5)
  })
})

describe('buildR32Matchups', () => {
  it('resolves simple slots to team IDs', () => {
    const matchups = buildR32Matchups(mockGroups)
    const r32L3 = matchups.find(m => m.matchId === 'R32_L3')
    // R32_L3: 2A vs 2B => PAN vs MEX
    expect(r32L3?.homeTeam).toBe('PAN')
    expect(r32L3?.awayTeam).toBe('MEX')
  })

  it('resolves 1E correctly', () => {
    const matchups = buildR32Matchups(mockGroups)
    const r32L1 = matchups.find(m => m.matchId === 'R32_L1')
    // R32_L1: 1E vs 3ABCDF => BRA vs (wild card)
    expect(r32L1?.homeTeam).toBe('BRA')
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
