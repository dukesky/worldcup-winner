'use client'
import { useState, useCallback, useMemo } from 'react'
import type { GroupPick, KnockoutMatchPick, TeamId, GroupId } from '@/lib/picks'
import { GROUPS, KNOCKOUT_STRUCTURE } from '@/data/wc2026'
import { buildR32Matchups } from '@/lib/bracket'

function initialGroups(): GroupPick[] {
  return GROUPS.map(g => ({
    groupId: g.id as GroupId,
    ranking: ['', '', '', ''] as [TeamId, TeamId, TeamId, TeamId],
    scores: {},
  }))
}

const R32_IDS = [
  'R32_L1','R32_L2','R32_L3','R32_L4','R32_L5','R32_L6','R32_L7','R32_L8',
  'R32_R1','R32_R2','R32_R3','R32_R4','R32_R5','R32_R6','R32_R7','R32_R8',
]

function initialKnockout(): KnockoutMatchPick[] {
  return [
    ...R32_IDS.map(matchId => ({
      matchId, homeSlot: '', awaySlot: '', winner: null as TeamId | null,
      score: { home: null as number | null, away: null as number | null },
    })),
    ...KNOCKOUT_STRUCTURE.map(m => ({
      matchId: m.matchId, homeSlot: m.homeFeeder, awaySlot: m.awayFeeder,
      winner: null as TeamId | null,
      score: { home: null as number | null, away: null as number | null },
    })),
  ]
}

export function usePredictions() {
  const [groups, setGroups] = useState<GroupPick[]>(initialGroups)
  const [knockout, setKnockout] = useState<KnockoutMatchPick[]>(initialKnockout)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>()
  const [wildcardSelections, setWildcardSelectionsState] = useState<Record<string, string>>({})

  const setGroupRanking = useCallback((groupId: GroupId, ranking: [TeamId, TeamId, TeamId, TeamId]) => {
    setGroups(prev => prev.map(g => g.groupId === groupId ? { ...g, ranking } : g))
  }, [])

  const setGroupScore = useCallback((groupId: GroupId, matchKey: string, home: number | null, away: number | null) => {
    setGroups(prev => prev.map(g =>
      g.groupId === groupId
        ? { ...g, scores: { ...g.scores, [matchKey]: { home, away } } }
        : g
    ))
  }, [])

  const setKnockoutWinner = useCallback((matchId: string, winner: TeamId) => {
    setKnockout(prev => prev.map(m => m.matchId === matchId ? { ...m, winner } : m))
  }, [])

  const setKnockoutScore = useCallback((matchId: string, home: number | null, away: number | null) => {
    setKnockout(prev => prev.map(m => m.matchId === matchId ? { ...m, score: { home, away } } : m))
  }, [])

  const setWildcardSelection = useCallback((matchId: string, teamId: string) => {
    setWildcardSelectionsState(prev => ({ ...prev, [matchId]: teamId }))
  }, [])

  const champion = knockout.find(m => m.matchId === 'FINAL')?.winner ?? null

  const r32Matchups = useMemo(() => buildR32Matchups(groups), [groups])

  const groupsComplete = groups.every(g => g.ranking[0] && g.ranking[1] && g.ranking[2])

  const knockoutComplete = knockout.find(m => m.matchId === 'FINAL')?.winner != null

  return {
    groups, knockout, photoDataUrl, champion,
    r32Matchups, groupsComplete, knockoutComplete, wildcardSelections,
    setGroupRanking, setGroupScore,
    setKnockoutWinner, setKnockoutScore,
    setPhotoDataUrl, setWildcardSelection,
  }
}
