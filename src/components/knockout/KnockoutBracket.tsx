'use client'
import { MatchCard } from './MatchCard'
import { TEAMS, R32_SLOTS, KNOCKOUT_STRUCTURE } from '@/data/wc2026'
import type { KnockoutMatchPick, TeamId, Language } from '@/lib/picks'
import type { R32Matchup } from '@/lib/bracket'

// Bracket alignment constants (px)
const CARD_H = 40
const INNER_GAP = 4
const OUTER_GAP = 10

function r32Top(pos: number): number {
  const pair = Math.floor((pos - 1) / 2)
  const withinPair = (pos - 1) % 2
  return pair * (2 * CARD_H + INNER_GAP + OUTER_GAP) + withinPair * (CARD_H + INNER_GAP)
}

function r16Top(pairIdx: number): number {
  const top1 = r32Top(pairIdx * 2 + 1) + CARD_H / 2
  const top2 = r32Top(pairIdx * 2 + 2) + CARD_H / 2
  return (top1 + top2) / 2 - CARD_H / 2
}

function qfTop(pairIdx: number): number {
  const t1 = r16Top(pairIdx * 2) + CARD_H / 2
  const t2 = r16Top(pairIdx * 2 + 1) + CARD_H / 2
  return (t1 + t2) / 2 - CARD_H / 2
}

function sfTop(): number {
  const t1 = qfTop(0) + CARD_H / 2
  const t2 = qfTop(1) + CARD_H / 2
  return (t1 + t2) / 2 - CARD_H / 2
}

const CONTAINER_H = r32Top(8) + CARD_H + 20

interface Props {
  r32Matchups: R32Matchup[]
  knockoutPicks: KnockoutMatchPick[]
  lang: Language
  championTeamId: TeamId | null
  onWinnerSelect: (matchId: string, winner: TeamId) => void
}

function teamInfo(id: TeamId | null) {
  if (!id) return null
  const tm = TEAMS[id]
  return tm ? { id: tm.id, name: tm.name, flag: tm.flag } : null
}

function getWinner(matchId: string, picks: KnockoutMatchPick[]): TeamId | null {
  return picks.find(p => p.matchId === matchId)?.winner ?? null
}

export function KnockoutBracket({ r32Matchups, knockoutPicks, lang, championTeamId, onWinnerSelect }: Props) {
  const leftR32 = R32_SLOTS.filter(s => s.side === 'left').sort((a, b) => a.position - b.position)
  const rightR32 = R32_SLOTS.filter(s => s.side === 'right').sort((a, b) => a.position - b.position)

  function resolvedMatchup(matchId: string) {
    const mu = r32Matchups.find(m => m.matchId === matchId)
    return {
      homeTeam: teamInfo(mu?.homeTeam ?? null),
      awayTeam: teamInfo(mu?.awayTeam ?? null),
    }
  }

  function knockoutMatchup(matchId: string) {
    const struct = KNOCKOUT_STRUCTURE.find(s => s.matchId === matchId)
    if (!struct) return { homeTeam: null, awayTeam: null }
    return {
      homeTeam: teamInfo(getWinner(struct.homeFeeder, knockoutPicks)),
      awayTeam: teamInfo(getWinner(struct.awayFeeder, knockoutPicks)),
    }
  }

  const isChampionPath = (matchId: string, pick: KnockoutMatchPick | undefined) =>
    !!championTeamId && pick?.winner === championTeamId

  const W = { r32: 112, r16: 100, qf: 90, sf: 85, final: 80 }

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-0 bg-[#060b18] rounded-xl p-4">
        {/* Column labels */}
        <div className="flex gap-[5px] items-end mb-2 text-[#3a4a6a] text-[8px] font-bold tracking-widest uppercase px-4">
          <div style={{ width: W.r32, textAlign: 'center' }}>R32</div>
          <div style={{ width: W.r16, textAlign: 'center' }}>R16</div>
          <div style={{ width: W.qf, textAlign: 'center' }}>QF</div>
          <div style={{ width: W.sf, textAlign: 'center' }}>SF</div>
          <div style={{ width: W.final, textAlign: 'center' }}>FINAL</div>
          <div style={{ width: W.sf, textAlign: 'center' }}>SF</div>
          <div style={{ width: W.qf, textAlign: 'center' }}>QF</div>
          <div style={{ width: W.r16, textAlign: 'center' }}>R16</div>
          <div style={{ width: W.r32, textAlign: 'center' }}>R32</div>
        </div>

        {/* Bracket */}
        <div className="flex gap-[5px] items-start">

          {/* LEFT R32 */}
          <div style={{ position: 'relative', width: W.r32, height: CONTAINER_H }}>
            {leftR32.map(slot => {
              const { homeTeam, awayTeam } = resolvedMatchup(slot.matchId)
              const pick = knockoutPicks.find(p => p.matchId === slot.matchId)
              return (
                <div key={slot.matchId} style={{ position: 'absolute', top: r32Top(slot.position), left: 0, right: 0, height: CARD_H }}>
                  <MatchCard matchId={slot.matchId} homeTeam={homeTeam} awayTeam={awayTeam}
                    winner={pick?.winner ?? null} score={pick?.score ?? { home: null, away: null }}
                    lang={lang} isChampionPath={isChampionPath(slot.matchId, pick)}
                    onWinnerSelect={t => onWinnerSelect(slot.matchId, t)} onScoreChange={() => {}} />
                </div>
              )
            })}
          </div>

          {/* LEFT R16 */}
          <div style={{ position: 'relative', width: W.r16, height: CONTAINER_H }}>
            {[0,1,2,3].map(i => {
              const matchId = `R16_L${i+1}`
              const { homeTeam, awayTeam } = knockoutMatchup(matchId)
              const pick = knockoutPicks.find(p => p.matchId === matchId)
              return (
                <div key={matchId} style={{ position: 'absolute', top: r16Top(i), left: 0, right: 0, height: CARD_H }}>
                  <MatchCard matchId={matchId} homeTeam={homeTeam} awayTeam={awayTeam}
                    winner={pick?.winner ?? null} score={pick?.score ?? { home: null, away: null }}
                    lang={lang} isChampionPath={isChampionPath(matchId, pick)}
                    onWinnerSelect={t => onWinnerSelect(matchId, t)} onScoreChange={() => {}} />
                </div>
              )
            })}
          </div>

          {/* LEFT QF */}
          <div style={{ position: 'relative', width: W.qf, height: CONTAINER_H }}>
            {[0,1].map(i => {
              const matchId = `QF_L${i+1}`
              const { homeTeam, awayTeam } = knockoutMatchup(matchId)
              const pick = knockoutPicks.find(p => p.matchId === matchId)
              return (
                <div key={matchId} style={{ position: 'absolute', top: qfTop(i), left: 0, right: 0, height: CARD_H }}>
                  <MatchCard matchId={matchId} homeTeam={homeTeam} awayTeam={awayTeam}
                    winner={pick?.winner ?? null} score={pick?.score ?? { home: null, away: null }}
                    lang={lang} isChampionPath={isChampionPath(matchId, pick)}
                    onWinnerSelect={t => onWinnerSelect(matchId, t)} onScoreChange={() => {}} />
                </div>
              )
            })}
          </div>

          {/* LEFT SF */}
          <div style={{ position: 'relative', width: W.sf, height: CONTAINER_H }}>
            {(() => {
              const matchId = 'SF_L'
              const { homeTeam, awayTeam } = knockoutMatchup(matchId)
              const pick = knockoutPicks.find(p => p.matchId === matchId)
              return (
                <div style={{ position: 'absolute', top: sfTop(), left: 0, right: 0, height: CARD_H }}>
                  <MatchCard matchId={matchId} homeTeam={homeTeam} awayTeam={awayTeam}
                    winner={pick?.winner ?? null} score={pick?.score ?? { home: null, away: null }}
                    lang={lang} isChampionPath={isChampionPath(matchId, pick)}
                    onWinnerSelect={t => onWinnerSelect(matchId, t)} onScoreChange={() => {}} />
                </div>
              )
            })()}
          </div>

          {/* FINAL */}
          <div style={{ position: 'relative', width: W.final, height: CONTAINER_H }}>
            {(() => {
              const matchId = 'FINAL'
              const { homeTeam, awayTeam } = knockoutMatchup(matchId)
              const pick = knockoutPicks.find(p => p.matchId === matchId)
              const center = sfTop() + CARD_H / 2
              return (
                <div style={{ position: 'absolute', top: center - 30, left: 0, right: 0, height: 60 }}
                  className="bg-gradient-to-b from-[#1a3a0a] to-[#0a1e04] border-2 border-[#ffd700] rounded-lg shadow-[0_0_18px_rgba(255,215,0,0.3)] flex flex-col items-center justify-center text-center p-2">
                  <div className="text-[#ffd700] text-[7px] font-bold tracking-widest mb-1">🏆 FINAL</div>
                  {pick?.winner ? (
                    <>
                      <div className="text-xl">{TEAMS[pick.winner]?.flag}</div>
                      <div className="text-[#ffd700] text-[9px] font-black">{TEAMS[pick.winner]?.name}</div>
                      <div className="text-green-400 text-[7px] font-bold mt-1">CHAMPION</div>
                    </>
                  ) : (
                    homeTeam && awayTeam ? (
                      <>
                        <MatchCard matchId={matchId} homeTeam={homeTeam} awayTeam={awayTeam}
                          winner={pick?.winner ?? null} score={pick?.score ?? { home: null, away: null }}
                          lang={lang} isChampionPath={true}
                          onWinnerSelect={t => onWinnerSelect(matchId, t)} onScoreChange={() => {}} />
                      </>
                    ) : (
                      <div className="text-[#555] text-[9px]">Pick your champion</div>
                    )
                  )}
                </div>
              )
            })()}
          </div>

          {/* RIGHT SF */}
          <div style={{ position: 'relative', width: W.sf, height: CONTAINER_H }}>
            {(() => {
              const matchId = 'SF_R'
              const { homeTeam, awayTeam } = knockoutMatchup(matchId)
              const pick = knockoutPicks.find(p => p.matchId === matchId)
              return (
                <div style={{ position: 'absolute', top: sfTop(), left: 0, right: 0, height: CARD_H }}>
                  <MatchCard matchId={matchId} homeTeam={homeTeam} awayTeam={awayTeam}
                    winner={pick?.winner ?? null} score={pick?.score ?? { home: null, away: null }}
                    lang={lang} isChampionPath={false}
                    onWinnerSelect={t => onWinnerSelect(matchId, t)} onScoreChange={() => {}} />
                </div>
              )
            })()}
          </div>

          {/* RIGHT QF */}
          <div style={{ position: 'relative', width: W.qf, height: CONTAINER_H }}>
            {[0,1].map(i => {
              const matchId = `QF_R${i+1}`
              const { homeTeam, awayTeam } = knockoutMatchup(matchId)
              const pick = knockoutPicks.find(p => p.matchId === matchId)
              return (
                <div key={matchId} style={{ position: 'absolute', top: qfTop(i), left: 0, right: 0, height: CARD_H }}>
                  <MatchCard matchId={matchId} homeTeam={homeTeam} awayTeam={awayTeam}
                    winner={pick?.winner ?? null} score={pick?.score ?? { home: null, away: null }}
                    lang={lang} isChampionPath={false}
                    onWinnerSelect={t => onWinnerSelect(matchId, t)} onScoreChange={() => {}} />
                </div>
              )
            })}
          </div>

          {/* RIGHT R16 */}
          <div style={{ position: 'relative', width: W.r16, height: CONTAINER_H }}>
            {[0,1,2,3].map(i => {
              const matchId = `R16_R${i+1}`
              const { homeTeam, awayTeam } = knockoutMatchup(matchId)
              const pick = knockoutPicks.find(p => p.matchId === matchId)
              return (
                <div key={matchId} style={{ position: 'absolute', top: r16Top(i), left: 0, right: 0, height: CARD_H }}>
                  <MatchCard matchId={matchId} homeTeam={homeTeam} awayTeam={awayTeam}
                    winner={pick?.winner ?? null} score={pick?.score ?? { home: null, away: null }}
                    lang={lang} isChampionPath={false}
                    onWinnerSelect={t => onWinnerSelect(matchId, t)} onScoreChange={() => {}} />
                </div>
              )
            })}
          </div>

          {/* RIGHT R32 */}
          <div style={{ position: 'relative', width: W.r32, height: CONTAINER_H }}>
            {rightR32.map(slot => {
              const { homeTeam, awayTeam } = resolvedMatchup(slot.matchId)
              const pick = knockoutPicks.find(p => p.matchId === slot.matchId)
              return (
                <div key={slot.matchId} style={{ position: 'absolute', top: r32Top(slot.position), left: 0, right: 0, height: CARD_H }}>
                  <MatchCard matchId={slot.matchId} homeTeam={homeTeam} awayTeam={awayTeam}
                    winner={pick?.winner ?? null} score={pick?.score ?? { home: null, away: null }}
                    lang={lang} isChampionPath={isChampionPath(slot.matchId, pick)}
                    onWinnerSelect={t => onWinnerSelect(slot.matchId, t)} onScoreChange={() => {}} />
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}
