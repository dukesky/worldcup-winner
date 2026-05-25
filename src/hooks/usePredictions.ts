'use client'
import { useState, useCallback } from 'react'
import type { GroupPick, KnockoutMatchPick, TeamId, GroupId } from '@/lib/picks'
import { GROUPS, KNOCKOUT_STRUCTURE } from '@/data/wc2026'
import { buildR32Matchups } from '@/lib/bracket'

function initialGroups(): GroupPick[] {
  return GROUPS.map(g => ({
    groupId: g.id as GroupId,
    ranking: [...g.teams, ''].slice(0, 4) as [TeamId, TeamId, TeamId, TeamId],
    scores: {},
  }))
}

function initialKnockout(): KnockoutMatchPick[] {
  return KNOCKOUT_STRUCTURE.map(m => ({
    matchId: m.matchId,
    homeSlot: m.homeFeeder,
    awaySlot: m.awayFeeder,
    winner: null,
    score: { home: null, away: null },
  }))
}

export function usePredictions() {
  const [groups, setGroups] = useState<GroupPick[]>(initialGroups)
  const [knockout, setKnockout] = useState<KnockoutMatchPick[]>(initialKnockout)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>()

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

  const champion = knockout.find(m => m.matchId === 'FINAL')?.winner ?? null

  const r32Matchups = buildR32Matchups(groups)

  const groupsComplete = groups.every(g => g.ranking[0] && g.ranking[1] && g.ranking[2])

  const knockoutComplete = knockout.find(m => m.matchId === 'FINAL')?.winner != null

  return {
    groups, knockout, photoDataUrl, champion,
    r32Matchups, groupsComplete, knockoutComplete,
    setGroupRanking, setGroupScore,
    setKnockoutWinner, setKnockoutScore,
    setPhotoDataUrl,
  }
}
