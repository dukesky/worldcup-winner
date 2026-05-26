'use client'
import { useState } from 'react'
import { GroupCard } from './GroupCard'
import { GROUPS, TEAMS, GROUP_MATCHES } from '@/data/wc2026'
import { t, getTeamName } from '@/lib/i18n'
import type { GroupPick, TeamId, GroupId, Language, GroupMatch } from '@/lib/picks'

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

function parseVenue(venue: string): { stadium: string; city: string } {
  const comma = venue.indexOf(',')
  if (comma === -1) return { stadium: venue, city: '' }
  return { stadium: venue.slice(0, comma).trim(), city: venue.slice(comma + 1).trim() }
}

function venueMapUrl(venue: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`
}

function FixtureCard({ match, teams, lang, highlighted }: {
  match: GroupMatch
  teams: typeof TEAMS
  lang: Language
  highlighted: boolean
}) {
  const home = teams[match.home]
  const away = teams[match.away]
  const { stadium, city } = parseVenue(match.venue)

  return (
    <div className={`rounded-lg p-2 transition-all ${
      highlighted
        ? 'bg-[#1a2847] border border-[#ffd700]/30 shadow-sm shadow-[#ffd700]/10'
        : 'border border-transparent'
    }`}>
      <div className="flex items-center gap-1 mb-1 flex-wrap">
        <span className="text-base leading-none">{home?.flag}</span>
        <span className={`text-[10px] font-semibold ${highlighted ? 'text-white' : 'text-[#8a9bc0]'}`}>
          {home ? getTeamName(home, lang) : match.home}
        </span>
        <span className="text-[#3a4a6a] mx-1 text-[9px]">vs</span>
        <span className="text-base leading-none">{away?.flag}</span>
        <span className={`text-[10px] font-semibold ${highlighted ? 'text-white' : 'text-[#8a9bc0]'}`}>
          {away ? getTeamName(away, lang) : match.away}
        </span>
      </div>
      <div className="text-[9px] text-[#4a5a7a] mb-0.5">{match.date} · {match.time}</div>
      <a
        href={venueMapUrl(match.venue)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-1 group cursor-pointer"
        onClick={e => e.stopPropagation()}
      >
        <span className="text-[#4a5a7a] text-[9px] mt-px leading-tight group-hover:text-[#ffd700] transition-colors">📍</span>
        <div>
          <div className="text-[9px] text-[#5a6a80] leading-tight group-hover:text-[#ffd700] transition-colors">{stadium}</div>
          {city && <div className="text-[8px] text-[#3a4a6a] leading-tight">{city}</div>}
        </div>
      </a>
    </div>
  )
}

export function GroupStagePicker({ picks, lang, currentGroupIdx, onGroupIdxChange, onRankingChange, onScoreChange, onComplete, onBack }: Props) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)

  const currentIdx = currentGroupIdx
  const setCurrentIdx = onGroupIdxChange
  const group = GROUPS[currentIdx]
  const pick = picks.find(p => p.groupId === group.id) ?? picks[currentIdx]
  const isLast = currentIdx === GROUPS.length - 1
  const currentComplete = pick.ranking.filter(Boolean).length >= 3
  const completedCount = picks.filter(p => p.ranking.filter(Boolean).length >= 3).length
  const allComplete = completedCount === GROUPS.length
  const fixtures = GROUP_MATCHES[group.id as GroupId]

  function handleTeamSelect(teamId: TeamId) {
    setSelectedTeamId(prev => prev === teamId ? null : teamId)
  }

  function goNext() {
    setSelectedTeamId(null)
    if (isLast) { onComplete() } else { setCurrentIdx(currentIdx + 1) }
  }

  function goPrev() {
    setSelectedTeamId(null)
    setCurrentIdx(currentIdx - 1)
  }

  function jumpToGroup(i: number) {
    setSelectedTeamId(null)
    setCurrentIdx(i)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-14 pb-24">
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
          style={{ width: `${(completedCount / GROUPS.length) * 100}%` }}
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
              onClick={() => jumpToGroup(i)}
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
            selectedTeamId={selectedTeamId}
            onRankingChange={r => onRankingChange(group.id as GroupId, r)}
            onScoreChange={(k, h, a) => onScoreChange(group.id as GroupId, k, h, a)}
            onTeamSelect={handleTeamSelect}
          />
          {selectedTeamId && (
            <div className="mt-2 text-[9px] text-[#ffd700]/60 text-center">
              {lang === 'cn' ? '高亮显示相关赛事' : lang === 'es' ? 'Partidos del equipo resaltados' : 'Matches for selected team highlighted'}
            </div>
          )}
        </div>

        {/* Fixtures panel */}
        <div className="md:w-64 bg-[#0c1526] border border-[#1a2847] rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[#ffd700] text-[10px] font-bold uppercase tracking-wider">
              {t(lang, 'groupStage')} — {lang === 'cn' ? '第' : lang === 'es' ? 'Grupo ' : 'Group '}{group.id}
            </div>
            {selectedTeamId && (
              <button
                onClick={() => setSelectedTeamId(null)}
                className="text-[#4a5a7a] text-[9px] hover:text-[#8a9bc0] transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {fixtures.map((m, i) => {
              const isHighlighted = !!selectedTeamId && (m.home === selectedTeamId || m.away === selectedTeamId)
              return (
                <FixtureCard
                  key={i}
                  match={m}
                  teams={TEAMS}
                  lang={lang}
                  highlighted={isHighlighted}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Sticky bottom navigation — always visible on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#060b18]/95 backdrop-blur-sm border-t border-[#1a2847] py-3 px-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          {currentIdx > 0 && (
            <button
              onClick={goPrev}
              className="flex-none border border-[#1e2d50] text-[#8a9bc0] py-3 px-4 rounded-xl font-semibold hover:border-[#ffd700] transition-colors"
            >
              {t(lang, 'prevGroup')}
            </button>
          )}
          <button
            onClick={goNext}
            disabled={isLast ? !allComplete : !currentComplete}
            className="flex-1 bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform"
          >
            {isLast
              ? allComplete
                ? t(lang, 'knockoutRounds')
                : `${completedCount}/${GROUPS.length} ${lang === 'cn' ? '组完成' : lang === 'es' ? 'grupos hechos' : 'groups done'}`
              : t(lang, 'nextGroup')}
          </button>
        </div>
      </div>
    </div>
  )
}
