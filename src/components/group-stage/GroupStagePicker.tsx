'use client'
import { useState } from 'react'
import { GroupCard } from './GroupCard'
import { GROUPS, TEAMS } from '@/data/wc2026'
import { t } from '@/lib/i18n'
import type { GroupPick, TeamId, GroupId, Language } from '@/lib/picks'

interface Props {
  picks: GroupPick[]
  lang: Language
  onRankingChange: (groupId: GroupId, ranking: [TeamId, TeamId, TeamId, TeamId]) => void
  onScoreChange: (groupId: GroupId, matchKey: string, home: number | null, away: number | null) => void
  onComplete: () => void
}

export function GroupStagePicker({ picks, lang, onRankingChange, onScoreChange, onComplete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const group = GROUPS[currentIdx]
  const pick = picks.find(p => p.groupId === group.id) ?? picks[currentIdx]
  const isLast = currentIdx === GROUPS.length - 1
  const currentComplete = pick.ranking.filter(Boolean).length >= 3

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[#8a9bc0] text-sm">{t(lang, 'groupStage')}</span>
        <span className="text-[#ffd700] text-sm font-bold">
          {t(lang, 'groupOf', currentIdx + 1, GROUPS.length)}
        </span>
      </div>
      <div className="h-1 bg-[#1e2d50] rounded mb-8">
        <div
          className="h-full bg-gradient-to-r from-[#ffd700] to-[#ff8c00] rounded transition-all"
          style={{ width: `${((currentIdx + 1) / GROUPS.length) * 100}%` }}
        />
      </div>

      <GroupCard
        group={group}
        teams={TEAMS}
        pick={pick}
        lang={lang}
        onRankingChange={r => onRankingChange(group.id as GroupId, r)}
        onScoreChange={(k, h, a) => onScoreChange(group.id as GroupId, k, h, a)}
      />

      <div className="flex gap-3 mt-6">
        {currentIdx > 0 && (
          <button
            onClick={() => setCurrentIdx(i => i - 1)}
            className="flex-1 border border-[#1e2d50] text-[#8a9bc0] py-3 rounded-xl font-semibold hover:border-[#ffd700] transition-colors"
          >
            {t(lang, 'prevGroup')}
          </button>
        )}
        <button
          onClick={() => isLast ? onComplete() : setCurrentIdx(i => i + 1)}
          disabled={!currentComplete}
          className="flex-1 bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform"
        >
          {isLast ? t(lang, 'knockoutRounds') : t(lang, 'nextGroup')}
        </button>
      </div>
    </div>
  )
}
