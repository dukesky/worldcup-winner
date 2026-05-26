'use client'
import { TEAMS } from '@/data/wc2026'
import { t } from '@/lib/i18n'
import type { Language, KnockoutMatchPick } from '@/lib/picks'
import type { R32Matchup } from '@/lib/bracket'

type QuadrantId = 'UL' | 'LL' | 'UR' | 'LR'

interface Props {
  r32Matchups: R32Matchup[]
  knockoutPicks: KnockoutMatchPick[]
  wildcardSelections: Record<string, string>
  lang: Language
  onSelectQuadrant: (q: QuadrantId) => void
  onBack: () => void
  onProceedFinalFour: () => void
}

const QUADRANTS: Record<QuadrantId, { r32: string[]; r16: string[]; qf: string; labelKey: 'quadrantUL'|'quadrantLL'|'quadrantUR'|'quadrantLR' }> = {
  UL: { r32: ['R32_L1','R32_L2','R32_L3','R32_L4'], r16: ['R16_L1','R16_L2'], qf: 'QF_L1', labelKey: 'quadrantUL' },
  LL: { r32: ['R32_L5','R32_L6','R32_L7','R32_L8'], r16: ['R16_L3','R16_L4'], qf: 'QF_L2', labelKey: 'quadrantLL' },
  UR: { r32: ['R32_R1','R32_R2','R32_R3','R32_R4'], r16: ['R16_R1','R16_R2'], qf: 'QF_R1', labelKey: 'quadrantUR' },
  LR: { r32: ['R32_R5','R32_R6','R32_R7','R32_R8'], r16: ['R16_R3','R16_R4'], qf: 'QF_R2', labelKey: 'quadrantLR' },
}

function getWinner(matchId: string, picks: KnockoutMatchPick[]): string | null {
  return picks.find(p => p.matchId === matchId)?.winner ?? null
}

export function KnockoutOverview({ r32Matchups, knockoutPicks, wildcardSelections, lang, onSelectQuadrant, onBack, onProceedFinalFour }: Props) {
  const allComplete = (Object.keys(QUADRANTS) as QuadrantId[]).every(q =>
    getWinner(QUADRANTS[q].qf, knockoutPicks) !== null
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pt-14">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-[#8a9bc0] text-sm hover:text-[#ffd700] transition-colors">
          {t(lang, 'backToGroups')}
        </button>
        <h2 className="text-[#ffd700] font-bold text-lg">{t(lang, 'knockoutOverview')}</h2>
        <div className="w-20" />
      </div>

      <p className="text-[#8a9bc0] text-sm text-center mb-6">
        {t(lang, 'tapToPickWinners')}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {(Object.keys(QUADRANTS) as QuadrantId[]).map(qId => {
          const q = QUADRANTS[qId]
          const complete = getWinner(q.qf, knockoutPicks) !== null
          const qfWinnerId = complete ? getWinner(q.qf, knockoutPicks) : null
          const qfWinner = qfWinnerId ? TEAMS[qfWinnerId] : null

          const r32Teams = q.r32.flatMap(matchId => {
            const m = r32Matchups.find(x => x.matchId === matchId)
            if (!m) return []
            const home = m.homeTeam ? TEAMS[m.homeTeam] : null
            const awayId = m.awayTeam ?? wildcardSelections[matchId]
            const away = awayId ? TEAMS[awayId] : null
            return [home, away].filter((x): x is NonNullable<typeof x> => x !== null)
          })

          return (
            <button
              key={qId}
              onClick={() => onSelectQuadrant(qId)}
              className={`rounded-xl border p-4 text-left transition-all hover:scale-[1.02] active:scale-100 ${
                complete
                  ? 'border-[#ffd700] bg-[#1a2e0a]'
                  : 'border-[#1a2847] bg-[#0c1526] hover:border-[#3a5080]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#ffd700] text-xs font-bold">{t(lang, q.labelKey)}</span>
                {complete
                  ? <span className="text-green-400 text-[10px]">✓</span>
                  : <span className="text-[#4a5a7a] text-[10px]">{t(lang, 'quadrantTapFill')}</span>
                }
              </div>
              {complete && qfWinner ? (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xl">{qfWinner.flag}</span>
                  <span className="text-white text-xs font-semibold">{qfWinner.name}</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1 mt-1">
                  {r32Teams.slice(0, 6).map((team, i) => (
                    <span key={i} title={team.name} className="text-sm">{team.flag}</span>
                  ))}
                  {r32Teams.length > 6 && (
                    <span className="text-[#4a5a7a] text-[10px] self-center">+{r32Teams.length - 6}</span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {allComplete && (
        <button
          onClick={onProceedFinalFour}
          className="w-full bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black py-4 rounded-xl hover:scale-[1.02] transition-transform text-lg"
        >
          {t(lang, 'proceedFinalFour')}
        </button>
      )}
    </div>
  )
}
