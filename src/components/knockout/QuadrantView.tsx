'use client'
import { useState } from 'react'
import { TEAMS, KNOCKOUT_STRUCTURE } from '@/data/wc2026'
import { t, getTeamName } from '@/lib/i18n'
import type { Language, KnockoutMatchPick, TeamId } from '@/lib/picks'
import type { R32Matchup } from '@/lib/bracket'

type QuadrantId = 'UL' | 'LL' | 'UR' | 'LR'

const QUADRANT_MATCHES: Record<QuadrantId, { r32: string[]; r16: string[]; qf: string }> = {
  UL: { r32: ['R32_L1','R32_L2','R32_L3','R32_L4'], r16: ['R16_L1','R16_L2'], qf: 'QF_L1' },
  LL: { r32: ['R32_L5','R32_L6','R32_L7','R32_L8'], r16: ['R16_L3','R16_L4'], qf: 'QF_L2' },
  UR: { r32: ['R32_R1','R32_R2','R32_R3','R32_R4'], r16: ['R16_R1','R16_R2'], qf: 'QF_R1' },
  LR: { r32: ['R32_R5','R32_R6','R32_R7','R32_R8'], r16: ['R16_R3','R16_R4'], qf: 'QF_R2' },
}

interface Props {
  quadrant: QuadrantId
  r32Matchups: R32Matchup[]
  knockoutPicks: KnockoutMatchPick[]
  wildcardSelections: Record<string, TeamId>
  lang: Language
  onWinnerSelect: (matchId: string, winner: TeamId) => void
  onScoreChange: (matchId: string, home: number | null, away: number | null) => void
  onWildcardSelect: (matchId: string, teamId: TeamId) => void
  onBack: () => void
}

function getWinner(matchId: string, picks: KnockoutMatchPick[]): TeamId | null {
  return picks.find(p => p.matchId === matchId)?.winner ?? null
}

function getScore(matchId: string, picks: KnockoutMatchPick[]): { home: number | null; away: number | null } {
  return picks.find(p => p.matchId === matchId)?.score ?? { home: null, away: null }
}

function resolveMatchTeams(
  matchId: string,
  r32Matchups: R32Matchup[],
  picks: KnockoutMatchPick[],
  wildcards: Record<string, TeamId>
): { home: TeamId | null; away: TeamId | null; awayOptions?: TeamId[] } {
  const r32 = r32Matchups.find(m => m.matchId === matchId)
  if (r32) {
    const resolvedAway = r32.awayTeam ?? wildcards[matchId] ?? null
    return {
      home: r32.homeTeam,
      away: resolvedAway,
      awayOptions: !r32.awayTeam && !wildcards[matchId] ? r32.awayOptions : undefined,
    }
  }
  const entry = KNOCKOUT_STRUCTURE.find(e => e.matchId === matchId)
  if (!entry) return { home: null, away: null }
  return {
    home: getWinner(entry.homeFeeder, picks),
    away: getWinner(entry.awayFeeder, picks),
  }
}

interface MatchBlockProps {
  matchId: string
  homeId: TeamId | null
  awayId: TeamId | null
  awayOptions?: TeamId[]
  winner: TeamId | null
  score: { home: number | null; away: number | null }
  lang: Language
  disabled: boolean
  onWinnerSelect: (matchId: string, w: TeamId) => void
  onScoreChange: (matchId: string, home: number | null, away: number | null) => void
  onWildcardSelect: (matchId: string, w: TeamId) => void
}

function MatchBlock({ matchId, homeId, awayId, awayOptions, winner, score, lang, disabled, onWinnerSelect, onScoreChange, onWildcardSelect }: MatchBlockProps) {
  const [hs, setHs] = useState<string>(score.home !== null ? String(score.home) : '')
  const [as_, setAs] = useState<string>(score.away !== null ? String(score.away) : '')
  const home = homeId ? TEAMS[homeId] : null
  const away = awayId ? TEAMS[awayId] : null
  const bothReady = !!homeId && !!awayId

  function applyScore(newHs: string, newAs: string) {
    const h = newHs !== '' ? parseInt(newHs) : null
    const a = newAs !== '' ? parseInt(newAs) : null
    onScoreChange(matchId, h, a)
    if (h !== null && a !== null && h !== a && homeId && awayId) {
      onWinnerSelect(matchId, h > a ? homeId : awayId)
    }
  }

  return (
    <div className={`rounded-lg border p-2 bg-[#0c1526] transition-all ${
      disabled ? 'opacity-40' : winner ? 'border-[#ffd700]/40' : 'border-[#1a2847]'
    }`}>
      <div className="text-[8px] text-[#3a4a6a] uppercase mb-1.5 tracking-wider">{matchId}</div>

      {awayOptions && awayOptions.length > 0 && (
        <div className="mb-2">
          <div className="text-[9px] text-[#ffd700] mb-1">{t(lang, 'pickWildCard')}</div>
          <div className="flex flex-wrap gap-1">
            {awayOptions.map(tid => {
              const team = TEAMS[tid]
              return (
                <button
                  key={tid}
                  onClick={() => onWildcardSelect(matchId, tid)}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-[#1a2847] text-[9px] hover:border-[#ffd700] transition-colors"
                >
                  <span>{team?.flag}</span>
                  <span className="text-[#8a9bc0]">{team ? getTeamName(team, lang) : tid}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Home team */}
      <button
        disabled={disabled || !bothReady}
        onClick={() => homeId && bothReady && !disabled && onWinnerSelect(matchId, homeId)}
        className={`flex items-center gap-1.5 w-full px-2 py-1.5 rounded transition-all ${
          winner === homeId && homeId
            ? 'bg-[#1a2e0a] border border-[#ffd700] text-[#ffd700] font-bold'
            : homeId
            ? 'hover:bg-[#111b35] text-[#7a8fb0] hover:text-white'
            : 'opacity-30 cursor-default'
        }`}
      >
        {home ? (
          <>
            <span className="text-sm leading-none">{home.flag}</span>
            <span className="text-[10px]">{getTeamName(home, lang)}</span>
            {winner === homeId && <span className="ml-auto text-[9px]" aria-hidden="true">✓</span>}
          </>
        ) : (
          <span className="text-[9px] text-[#3a4a6a]">TBD</span>
        )}
      </button>

      {/* Center row: score inputs with winner arrow between the two teams */}
      {bothReady && !disabled ? (
        <div className="flex items-center justify-center gap-1 py-1">
          <input
            type="number"
            min="0"
            max="20"
            value={hs}
            onChange={e => { setHs(e.target.value); applyScore(e.target.value, as_) }}
            placeholder="–"
            className="w-8 h-5 text-center text-[10px] bg-[#111b35] border border-[#2a3a5a] rounded text-white focus:border-[#ffd700] focus:outline-none [appearance:textfield]"
          />
          <span className={`text-[10px] px-1 font-bold ${winner ? 'text-[#ffd700]' : 'text-[#3a4a6a]'}`}>
            {winner === homeId ? '▲' : winner === awayId ? '▼' : ':'}
          </span>
          <input
            type="number"
            min="0"
            max="20"
            value={as_}
            onChange={e => { setAs(e.target.value); applyScore(hs, e.target.value) }}
            placeholder="–"
            className="w-8 h-5 text-center text-[10px] bg-[#111b35] border border-[#2a3a5a] rounded text-white focus:border-[#ffd700] focus:outline-none [appearance:textfield]"
          />
        </div>
      ) : (
        <div className="h-2" />
      )}

      {/* Away team */}
      <button
        disabled={disabled || !awayId || !bothReady}
        onClick={() => awayId && bothReady && !disabled && onWinnerSelect(matchId, awayId)}
        className={`flex items-center gap-1.5 w-full px-2 py-1.5 rounded transition-all ${
          winner === awayId && awayId
            ? 'bg-[#1a2e0a] border border-[#ffd700] text-[#ffd700] font-bold'
            : awayId
            ? 'hover:bg-[#111b35] text-[#7a8fb0] hover:text-white'
            : 'opacity-30 cursor-default'
        }`}
      >
        {away ? (
          <>
            <span className="text-sm leading-none">{away.flag}</span>
            <span className="text-[10px]">{getTeamName(away, lang)}</span>
            {winner === awayId && <span className="ml-auto text-[9px]" aria-hidden="true">✓</span>}
          </>
        ) : (
          <span className="text-[9px] text-[#3a4a6a]">TBD</span>
        )}
      </button>
    </div>
  )
}

export function QuadrantView({ quadrant, r32Matchups, knockoutPicks, wildcardSelections, lang, onWinnerSelect, onScoreChange, onWildcardSelect, onBack }: Props) {
  const qDef = QUADRANT_MATCHES[quadrant]

  const r32Data = qDef.r32.map(id => ({
    matchId: id,
    ...resolveMatchTeams(id, r32Matchups, knockoutPicks, wildcardSelections),
    winner: getWinner(id, knockoutPicks),
    score: getScore(id, knockoutPicks),
  }))

  const r16Data = qDef.r16.map((id, i) => {
    const feeders = [qDef.r32[i * 2], qDef.r32[i * 2 + 1]]
    const bothFeedersDone = feeders.every(fid => getWinner(fid, knockoutPicks) !== null)
    return {
      matchId: id,
      ...resolveMatchTeams(id, r32Matchups, knockoutPicks, wildcardSelections),
      winner: getWinner(id, knockoutPicks),
      score: getScore(id, knockoutPicks),
      disabled: !bothFeedersDone,
    }
  })

  const qfDone = qDef.r16.every(id => getWinner(id, knockoutPicks) !== null)
  const qfData = {
    matchId: qDef.qf,
    ...resolveMatchTeams(qDef.qf, r32Matchups, knockoutPicks, wildcardSelections),
    winner: getWinner(qDef.qf, knockoutPicks),
    score: getScore(qDef.qf, knockoutPicks),
    disabled: !qfDone,
  }

  const quadrantComplete = qfData.winner !== null

  const labelMap: Record<QuadrantId, string> = {
    UL: t(lang, 'quadrantUL'),
    LL: t(lang, 'quadrantLL'),
    UR: t(lang, 'quadrantUR'),
    LR: t(lang, 'quadrantLR'),
  }

  const qfWinner = qfData.winner ? TEAMS[qfData.winner] : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pt-14">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-[#8a9bc0] text-sm hover:text-[#ffd700] transition-colors">
          {t(lang, 'backToOverview')}
        </button>
        <h2 className="text-[#ffd700] font-bold">{labelMap[quadrant]}</h2>
        <div className="w-16" />
      </div>

      {quadrantComplete && qfWinner && (
        <div className="bg-[#1a2e0a] border border-[#ffd700] rounded-xl p-3 mb-4 text-center">
          <div className="text-[#ffd700] text-xs font-bold mb-1">{t(lang, 'sectionWinner')}</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">{qfWinner.flag}</span>
            <span className="text-white font-bold">{getTeamName(qfWinner, lang)}</span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-3 min-w-[580px]">
          {/* R32 column */}
          <div className="flex-1 min-w-0">
            <div className="text-[#4a5a7a] text-[9px] uppercase text-center mb-2 font-bold tracking-wider">R32</div>
            <div className="flex flex-col gap-2">
              {r32Data.map(m => (
                <MatchBlock
                  key={m.matchId}
                  matchId={m.matchId}
                  homeId={m.home}
                  awayId={m.away}
                  awayOptions={m.awayOptions}
                  winner={m.winner}
                  score={m.score}
                  lang={lang}
                  disabled={false}
                  onWinnerSelect={onWinnerSelect}
                  onScoreChange={onScoreChange}
                  onWildcardSelect={onWildcardSelect}
                />
              ))}
            </div>
          </div>

          {/* R16 column */}
          <div className="flex-1 min-w-0">
            <div className="text-[#4a5a7a] text-[9px] uppercase text-center mb-2 font-bold tracking-wider">R16</div>
            <div className="flex flex-col gap-2 pt-[calc(50%-1rem)]">
              {r16Data.map(m => (
                <MatchBlock
                  key={m.matchId}
                  matchId={m.matchId}
                  homeId={m.home}
                  awayId={m.away}
                  winner={m.winner}
                  score={m.score}
                  lang={lang}
                  disabled={m.disabled}
                  onWinnerSelect={onWinnerSelect}
                  onScoreChange={onScoreChange}
                  onWildcardSelect={onWildcardSelect}
                />
              ))}
            </div>
          </div>

          {/* QF column */}
          <div className="flex-1 min-w-0">
            <div className="text-[#4a5a7a] text-[9px] uppercase text-center mb-2 font-bold tracking-wider">QF</div>
            <div className="pt-[calc(75%-1rem)]">
              <MatchBlock
                matchId={qfData.matchId}
                homeId={qfData.home}
                awayId={qfData.away}
                winner={qfData.winner}
                score={qfData.score}
                lang={lang}
                disabled={qfData.disabled}
                onWinnerSelect={onWinnerSelect}
                onScoreChange={onScoreChange}
                onWildcardSelect={onWildcardSelect}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={onBack}
          className="w-full border border-[#1e2d50] text-[#8a9bc0] py-3 rounded-xl font-semibold hover:border-[#ffd700] transition-colors"
        >
          {t(lang, 'backToOverview')}
        </button>
      </div>
    </div>
  )
}
