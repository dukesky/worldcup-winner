'use client'
import { GroupCard } from './GroupCard'
import { GROUPS, TEAMS, GROUP_MATCHES } from '@/data/wc2026'
import { t, getTeamName } from '@/lib/i18n'
import type { GroupPick, TeamId, GroupId, Language } from '@/lib/picks'

interface Props {
  picks: GroupPick[]
  lang: Language
  currentGroupIdx: number
  onGroupIdxChange: (idx: number) => void
  onRankingChange: (groupId: GroupId, ranking: [TeamId, TeamId, TeamId, TeamId]) => void
  onScoreChange: (groupId: GroupId, matchKey: string, home: number | null, away: number | null) => void
  onComplete: () => void
  onBack: () => void
}

export function GroupStagePicker({ picks, lang, currentGroupIdx, onGroupIdxChange, onRankingChange, onScoreChange, onComplete, onBack }: Props) {
  const currentIdx = currentGroupIdx
  const setCurrentIdx = onGroupIdxChange
  const group = GROUPS[currentIdx]
  const pick = picks.find(p => p.groupId === group.id) ?? picks[currentIdx]
  const isLast = currentIdx === GROUPS.length - 1
  const currentComplete = pick.ranking.filter(Boolean).length >= 3
  const fixtures = GROUP_MATCHES[group.id as GroupId]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pt-14">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="text-[#8a9bc0] text-sm hover:text-[#ffd700] transition-colors"
        >
          {t(lang, 'backToHome')}
        </button>
        <span className="text-[#ffd700] text-sm font-bold">
          {t(lang, 'groupOf', currentIdx + 1, GROUPS.length)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#1e2d50] rounded mb-3">
        <div
          className="h-full bg-gradient-to-r from-[#ffd700] to-[#ff8c00] rounded transition-all"
          style={{ width: `${((currentIdx + 1) / GROUPS.length) * 100}%` }}
        />
      </div>

      {/* Quick-jump group tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {GROUPS.map((g, i) => {
          const gPick = picks.find(p => p.groupId === g.id)
          const done = gPick ? gPick.ranking.filter(Boolean).length >= 3 : false
          return (
            <button
              key={g.id}
              onClick={() => setCurrentIdx(i)}
              className={`flex-none px-2.5 py-1 rounded text-[10px] font-bold transition-colors relative ${
                i === currentIdx
                  ? 'bg-[#ffd700] text-black'
                  : done
                  ? 'border border-[#ffd700]/40 text-[#ffd700]/60 hover:border-[#ffd700] hover:text-[#ffd700]'
                  : 'border border-[#1a2847] text-[#4a5a7a] hover:border-[#ffd700] hover:text-[#ffd700]'
              }`}
            >
              {g.id}
              {done && i !== currentIdx && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Group ranking card */}
        <div className="flex-1">
          <GroupCard
            group={group}
            teams={TEAMS}
            pick={pick}
            lang={lang}
            onRankingChange={r => onRankingChange(group.id as GroupId, r)}
            onScoreChange={(k, h, a) => onScoreChange(group.id as GroupId, k, h, a)}
          />
        </div>

        {/* Fixtures panel */}
        <div className="md:w-64 bg-[#0c1526] border border-[#1a2847] rounded-xl p-3">
          <div className="text-[#ffd700] text-[10px] font-bold uppercase tracking-wider mb-3">
            {t(lang, 'groupStage')} — Group {group.id}
          </div>
          <div className="flex flex-col gap-2">
            {fixtures.map((m, i) => {
              const home = TEAMS[m.home]
              const away = TEAMS[m.away]
              return (
                <div key={i} className="text-[9px] text-[#8a9bc0]">
                  <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                    <span>{home?.flag}</span>
                    <span className="text-white text-[10px]">{home ? getTeamName(home, lang) : m.home}</span>
                    <span className="text-[#3a4a6a] mx-1">vs</span>
                    <span>{away?.flag}</span>
                    <span className="text-white text-[10px]">{away ? getTeamName(away, lang) : m.away}</span>
                  </div>
                  <div className="text-[#4a5a7a]">{m.date} · {m.time}</div>
                  <div className="text-[#4a5a7a] truncate">{m.venue}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        {currentIdx > 0 && (
          <button
            onClick={() => setCurrentIdx(currentIdx - 1)}
            className="flex-1 border border-[#1e2d50] text-[#8a9bc0] py-3 rounded-xl font-semibold hover:border-[#ffd700] transition-colors"
          >
            {t(lang, 'prevGroup')}
          </button>
        )}
        <button
          onClick={() => isLast ? onComplete() : setCurrentIdx(currentIdx + 1)}
          disabled={!currentComplete}
          className="flex-1 bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform"
        >
          {isLast ? t(lang, 'knockoutRounds') : t(lang, 'nextGroup')}
        </button>
      </div>
    </div>
  )
}
