'use client'
import { TEAMS } from '@/data/wc2026'
import { t } from '@/lib/i18n'
import type { GroupPick, TeamId, Language } from '@/lib/picks'

const RANK_BADGES = ['①', '②', '③', '④']
const RANK_COLORS = ['text-green-400', 'text-blue-400', 'text-amber-500', 'text-[#2a3a5a]']
const RANK_BG = ['bg-[#1a2e0a] border-[#ffd700]', 'bg-[#0c1526] border-[#1a2847]', 'bg-[#0c1526] border-[#1a2847]', 'bg-[#060b18] border-[#1a2847]']

interface Props {
  group: { id: string; teams: string[] }
  teams: typeof TEAMS
  pick: GroupPick
  lang: Language
  onRankingChange: (ranking: [TeamId, TeamId, TeamId, TeamId]) => void
  onScoreChange: (matchKey: string, home: number | null, away: number | null) => void
}

export function GroupCard({ group, teams, pick, lang, onRankingChange }: Props) {
  function handleTeamClick(teamId: TeamId) {
    // Don't allow interacting with the auto-filled 4th place slot
    const currentRankIdx = pick.ranking.findIndex(r => r === teamId)
    if (currentRankIdx === 3) return  // slot 3 is auto-filled, not user-selectable

    const current = [...pick.ranking] as [TeamId, TeamId, TeamId, TeamId]
    const existingIdx = current.indexOf(teamId)
    if (existingIdx !== -1) {
      // Deselect: remove from ranking (only slots 0-2)
      current[existingIdx] = '' as TeamId
    } else {
      // Place in next empty slot (slots 0, 1, 2 only — slot 3 is auto-4th)
      const emptyIdx = current.findIndex((t, i) => !t && i < 3)
      if (emptyIdx === -1) return // top 3 slots all filled
      current[emptyIdx] = teamId
    }
    // Auto-fill 4th if exactly 3 are set
    const filled = current.slice(0, 3).filter(Boolean)
    if (filled.length === 3) {
      const remaining = group.teams.find(t => !filled.includes(t as TeamId))
      if (remaining) current[3] = remaining as TeamId
    } else {
      current[3] = '' as TeamId
    }
    onRankingChange(current)
  }

  return (
    <div className="bg-[#0a0f1e] border border-[#1e2d50] rounded-xl p-4">
      <div className="text-[#ffd700] text-xs font-bold tracking-[2px] uppercase mb-3 pb-2 border-b border-[#1e2d50]">
        GROUP {group.id}
      </div>

      <div className="text-[#8a9bc0] text-[10px] mb-3">{t(lang, 'pickRanking')}</div>

      <div className="flex flex-col gap-2">
        {group.teams.map(teamId => {
          const team = teams[teamId]
          const rankIdx = pick.ranking.findIndex(r => r === teamId)
          const isRanked = rankIdx !== -1 && !!pick.ranking[rankIdx]
          const isAutoFilled = isRanked && rankIdx === 3

          return (
            <button
              key={teamId}
              data-testid={`team-${teamId}`}
              onClick={() => handleTeamClick(teamId as TeamId)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 border transition-all text-left ${
                isAutoFilled
                  ? `${RANK_BG[rankIdx]} opacity-60 cursor-default`
                  : isRanked
                    ? RANK_BG[rankIdx]
                    : 'bg-[#0c1526] border-[#1a2847] hover:border-[#2a3a60]'
              }`}
            >
              <span className={`text-sm font-bold w-5 ${isRanked ? RANK_COLORS[rankIdx] : 'text-[#2a3a5a]'}`}>
                {isRanked ? RANK_BADGES[rankIdx] : '·'}
              </span>
              <span className="text-lg leading-none">{team?.flag}</span>
              <span className={`text-sm font-semibold ${isRanked ? 'text-white' : 'text-[#5a6a7a]'}`}>
                {lang === 'cn' ? team?.nameZh : lang === 'es' ? team?.nameEs : team?.name}
              </span>
              {rankIdx === 3 && isRanked && (
                <span className="text-[8px] text-[#4a5a6a] ml-auto">AUTO</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
