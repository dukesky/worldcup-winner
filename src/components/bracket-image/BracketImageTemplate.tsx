import { TEAMS, KNOCKOUT_STRUCTURE, R32_SLOTS } from '@/data/wc2026'
import type { BracketPicks, TeamId } from '@/lib/picks'

const GOLD = '#ffd700'
const DARK = '#060b18'
const NAVY = '#0c1526'
const DIM_BORDER = '#1a2847'

const CARD_H = 56
const INNER_GAP = 6
const OUTER_GAP = 18

function r32Top(pos: number) {
  const pair = Math.floor((pos - 1) / 2)
  const within = (pos - 1) % 2
  return pair * (2 * CARD_H + INNER_GAP + OUTER_GAP) + within * (CARD_H + INNER_GAP)
}
function r16Top(i: number) {
  return (r32Top(i * 2 + 1) + CARD_H / 2 + r32Top(i * 2 + 2) + CARD_H / 2) / 2 - CARD_H / 2
}
function qfTop(i: number) {
  return (r16Top(i * 2) + CARD_H / 2 + r16Top(i * 2 + 1) + CARD_H / 2) / 2 - CARD_H / 2
}
function sfTop() {
  return (qfTop(0) + CARD_H / 2 + qfTop(1) + CARD_H / 2) / 2 - CARD_H / 2
}
const CONTAINER_H = r32Top(8) + CARD_H + 16

interface TeamRowProps {
  tid: TeamId | null
  isWinner: boolean
  isPath: boolean
  isBottom: boolean
}

function TeamRow({ tid, isWinner, isPath: path, isBottom }: TeamRowProps) {
  const tm = tid ? TEAMS[tid] : null
  const textColor = isWinner && path ? GOLD : isWinner ? '#ffffff' : '#7a8fb0'
  const fontWeight = isWinner ? 700 : 400
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderTop: isBottom ? `1px solid ${DIM_BORDER}40` : 'none',
    }}>
      <span style={{ fontSize: 15 }}>{tm?.flag ?? ''}</span>
      <span style={{ fontSize: 12, fontWeight, color: textColor }}>
        {tm?.name ?? 'TBD'}
      </span>
    </div>
  )
}

interface MatchCellProps {
  homeTeam: TeamId | null
  awayTeam: TeamId | null
  winner: TeamId | null
  isPath: boolean
}

function MatchCell({ homeTeam, awayTeam, winner, isPath }: MatchCellProps) {
  const bg = isPath ? '#1a2e0a' : NAVY
  const border = isPath ? GOLD : DIM_BORDER
  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 6,
      overflow: 'hidden',
      height: CARD_H,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <TeamRow tid={homeTeam} isWinner={homeTeam === winner && winner !== null} isPath={isPath} isBottom={false} />
      <TeamRow tid={awayTeam} isWinner={awayTeam === winner && winner !== null} isPath={isPath} isBottom={true} />
    </div>
  )
}

interface FinalCellProps {
  champion: TeamId | null
}

function FinalCell({ champion }: FinalCellProps) {
  const tm = champion ? TEAMS[champion] : null
  return (
    <div style={{
      background: '#1a3a0a',
      border: `2px solid ${GOLD}`,
      borderRadius: 10,
      height: 80,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    }}>
      <div style={{ display: 'flex', color: GOLD, fontSize: 9, fontWeight: 700, letterSpacing: 3 }}>FINAL</div>
      <div style={{ display: 'flex', fontSize: 22 }}>{tm?.flag ?? ''}</div>
      <div style={{ display: 'flex', color: GOLD, fontSize: 12, fontWeight: 700 }}>{tm?.name ?? '?'}</div>
      <div style={{ display: 'flex', color: '#4caf50', fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>CHAMPION</div>
    </div>
  )
}

export function BracketImageTemplate({ picks }: { picks: BracketPicks }) {
  const { groups, knockout } = picks
  const wildcardSelections = picks.wildcardSelections ?? {}
  const champion = knockout.find(m => m.matchId === 'FINAL')?.winner ?? null

  function getWinner(matchId: string): TeamId | null {
    return knockout.find(m => m.matchId === matchId)?.winner ?? null
  }

  function isPath(matchId: string): boolean {
    const w = getWinner(matchId)
    return !!champion && w === champion
  }

  function r32HomeTeam(slot: string): TeamId | null {
    if (slot.length !== 2) return null
    const rank = parseInt(slot[0]) - 1
    const grp = groups.find(g => g.groupId === slot[1])
    return grp?.ranking[rank] ?? null
  }

  function r32AwayTeam(slot: string, matchId: string): TeamId | null {
    if (slot.length === 2) {
      const rank = parseInt(slot[0]) - 1
      const grp = groups.find(g => g.groupId === slot[1])
      return grp?.ranking[rank] ?? null
    }
    // wildcard slot — check wildcard selections
    return wildcardSelections[matchId] ?? null
  }

  const ColW = { r32: 168, r16: 148, qf: 130, sf: 116, final: 110 }
  const GAP = 7

  const leftR32 = R32_SLOTS.filter(s => s.side === 'left').sort((a, b) => a.position - b.position)
  const rightR32 = R32_SLOTS.filter(s => s.side === 'right').sort((a, b) => a.position - b.position)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: DARK, padding: '18px 20px', borderRadius: 14, fontFamily: 'Inter' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <span style={{ color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: 4 }}>
          FIFA WORLD CUP 2026 · MY BRACKET
        </span>
      </div>

      {/* Bracket columns */}
      <div style={{ display: 'flex', gap: GAP, alignItems: 'flex-start' }}>

        {/* LEFT R32 */}
        <div style={{ position: 'relative', width: ColW.r32, height: CONTAINER_H, display: 'flex' }}>
          {leftR32.map(slot => (
            <div key={slot.matchId} style={{ position: 'absolute', top: r32Top(slot.position), left: 0, right: 0, height: CARD_H, display: 'flex' }}>
              <MatchCell
                homeTeam={r32HomeTeam(slot.homeSlot)}
                awayTeam={r32AwayTeam(slot.awaySlot, slot.matchId)}
                winner={getWinner(slot.matchId)}
                isPath={isPath(slot.matchId)}
              />
            </div>
          ))}
        </div>

        {/* LEFT R16 */}
        <div style={{ position: 'relative', width: ColW.r16, height: CONTAINER_H, display: 'flex' }}>
          {[0, 1, 2, 3].map(i => {
            const matchId = `R16_L${i + 1}`
            const struct = KNOCKOUT_STRUCTURE.find(s => s.matchId === matchId)
            return (
              <div key={matchId} style={{ position: 'absolute', top: r16Top(i), left: 0, right: 0, height: CARD_H, display: 'flex' }}>
                <MatchCell
                  homeTeam={getWinner(struct?.homeFeeder ?? '')}
                  awayTeam={getWinner(struct?.awayFeeder ?? '')}
                  winner={getWinner(matchId)}
                  isPath={isPath(matchId)}
                />
              </div>
            )
          })}
        </div>

        {/* LEFT QF */}
        <div style={{ position: 'relative', width: ColW.qf, height: CONTAINER_H, display: 'flex' }}>
          {[0, 1].map(i => {
            const matchId = `QF_L${i + 1}`
            const struct = KNOCKOUT_STRUCTURE.find(s => s.matchId === matchId)
            return (
              <div key={matchId} style={{ position: 'absolute', top: qfTop(i), left: 0, right: 0, height: CARD_H, display: 'flex' }}>
                <MatchCell
                  homeTeam={getWinner(struct?.homeFeeder ?? '')}
                  awayTeam={getWinner(struct?.awayFeeder ?? '')}
                  winner={getWinner(matchId)}
                  isPath={isPath(matchId)}
                />
              </div>
            )
          })}
        </div>

        {/* LEFT SF */}
        <div style={{ position: 'relative', width: ColW.sf, height: CONTAINER_H, display: 'flex' }}>
          <div style={{ position: 'absolute', top: sfTop(), left: 0, right: 0, height: CARD_H, display: 'flex' }}>
            <MatchCell homeTeam={getWinner('QF_L1')} awayTeam={getWinner('QF_L2')} winner={getWinner('SF_L')} isPath={isPath('SF_L')} />
          </div>
        </div>

        {/* FINAL */}
        <div style={{ position: 'relative', width: ColW.final, height: CONTAINER_H, display: 'flex' }}>
          <div style={{ position: 'absolute', top: sfTop() - 12, left: 0, right: 0, height: 80, display: 'flex' }}>
            <FinalCell champion={champion} />
          </div>
        </div>

        {/* RIGHT SF */}
        <div style={{ position: 'relative', width: ColW.sf, height: CONTAINER_H, display: 'flex' }}>
          <div style={{ position: 'absolute', top: sfTop(), left: 0, right: 0, height: CARD_H, display: 'flex' }}>
            <MatchCell homeTeam={getWinner('QF_R1')} awayTeam={getWinner('QF_R2')} winner={getWinner('SF_R')} isPath={isPath('SF_R')} />
          </div>
        </div>

        {/* RIGHT QF */}
        <div style={{ position: 'relative', width: ColW.qf, height: CONTAINER_H, display: 'flex' }}>
          {[0, 1].map(i => {
            const matchId = `QF_R${i + 1}`
            const struct = KNOCKOUT_STRUCTURE.find(s => s.matchId === matchId)
            return (
              <div key={matchId} style={{ position: 'absolute', top: qfTop(i), left: 0, right: 0, height: CARD_H, display: 'flex' }}>
                <MatchCell
                  homeTeam={getWinner(struct?.homeFeeder ?? '')}
                  awayTeam={getWinner(struct?.awayFeeder ?? '')}
                  winner={getWinner(matchId)}
                  isPath={isPath(matchId)}
                />
              </div>
            )
          })}
        </div>

        {/* RIGHT R16 */}
        <div style={{ position: 'relative', width: ColW.r16, height: CONTAINER_H, display: 'flex' }}>
          {[0, 1, 2, 3].map(i => {
            const matchId = `R16_R${i + 1}`
            const struct = KNOCKOUT_STRUCTURE.find(s => s.matchId === matchId)
            return (
              <div key={matchId} style={{ position: 'absolute', top: r16Top(i), left: 0, right: 0, height: CARD_H, display: 'flex' }}>
                <MatchCell
                  homeTeam={getWinner(struct?.homeFeeder ?? '')}
                  awayTeam={getWinner(struct?.awayFeeder ?? '')}
                  winner={getWinner(matchId)}
                  isPath={isPath(matchId)}
                />
              </div>
            )
          })}
        </div>

        {/* RIGHT R32 */}
        <div style={{ position: 'relative', width: ColW.r32, height: CONTAINER_H, display: 'flex' }}>
          {rightR32.map(slot => (
            <div key={slot.matchId} style={{ position: 'absolute', top: r32Top(slot.position), left: 0, right: 0, height: CARD_H, display: 'flex' }}>
              <MatchCell
                homeTeam={r32HomeTeam(slot.homeSlot)}
                awayTeam={r32AwayTeam(slot.awaySlot, slot.matchId)}
                winner={getWinner(slot.matchId)}
                isPath={isPath(slot.matchId)}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
