import { TEAMS, GROUPS, KNOCKOUT_STRUCTURE, R32_SLOTS } from '@/data/wc2026'
import type { BracketPicks, TeamId } from '@/lib/picks'

const GOLD = '#ffd700'
const DARK = '#060b18'
const NAVY = '#0c1526'
const DIM_BORDER = '#1a2847'

const CARD_H = 38
const INNER_GAP = 4
const OUTER_GAP = 10

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
const CONTAINER_H = r32Top(8) + CARD_H + 10

interface TeamRowProps {
  tid: TeamId | null
  isWinner: boolean
  isPath: boolean
  isBottom: boolean
}

function TeamRow({ tid, isWinner, isPath: path, isBottom }: TeamRowProps) {
  const tm = tid ? TEAMS[tid] : null
  const textColor = isWinner && path ? GOLD : isWinner ? '#fff' : '#7a8fb0'
  const fontWeight = isWinner && path ? 700 : 400
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 7px',
      borderTop: isBottom ? `1px solid ${DIM_BORDER}40` : 'none',
    }}>
      <span style={{ fontSize: 11 }}>{tm?.flag ?? ''}</span>
      <span style={{ fontSize: 9, fontWeight, color: textColor }}>
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
      borderRadius: 4,
      overflow: 'hidden',
      height: CARD_H,
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
      borderRadius: 8,
      height: 60,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ display: 'flex', color: GOLD, fontSize: 7, fontWeight: 700, letterSpacing: 2 }}>FINAL</div>
      <div style={{ display: 'flex', color: GOLD, fontSize: 16 }}>{tm?.flag ?? ''}</div>
      <div style={{ display: 'flex', color: GOLD, fontSize: 9, fontWeight: 700 }}>{tm?.name ?? ''}</div>
      <div style={{ display: 'flex', color: '#4caf50', fontSize: 7, fontWeight: 700 }}>CHAMPION</div>
    </div>
  )
}

interface GroupCardProps {
  id: string
  teams: Array<{ tid: string; rank: number; team: typeof TEAMS[string] | null }>
}

const RANK_COLORS = ['#4caf50', '#5b7fa6', '#8a6a2a', '#2a3a5a']
const RANK_TEXT_COLORS = ['#d0d8e8', '#8a9bc0', '#5a6a7a', '#2a3a5a']
const RANK_SYMBOLS = ['①', '②', '③', '④']

function GroupCard({ id, teams }: GroupCardProps) {
  return (
    <div style={{ background: '#0a1020', border: `1px solid ${DIM_BORDER}`, borderRadius: 5, padding: '5px 6px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', color: GOLD, fontSize: 7, fontWeight: 700, letterSpacing: 1, borderBottom: `1px solid ${DIM_BORDER}`, paddingBottom: 3, marginBottom: 4 }}>
        GROUP {id}
      </div>
      {teams.map((t, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 }}>
          <span style={{ fontSize: 7, fontWeight: 700, color: RANK_COLORS[i], width: 8 }}>{RANK_SYMBOLS[i]}</span>
          <span style={{ fontSize: 10 }}>{t.team?.flag ?? ''}</span>
          <span style={{ fontSize: 8, color: RANK_TEXT_COLORS[i] }}>{t.team?.name ?? ''}</span>
        </div>
      ))}
    </div>
  )
}

export function BracketImageTemplate({ picks }: { picks: BracketPicks }) {
  const { groups, knockout } = picks
  const champion = knockout.find(m => m.matchId === 'FINAL')?.winner ?? null

  function getWinner(matchId: string): TeamId | null {
    return knockout.find(m => m.matchId === matchId)?.winner ?? null
  }

  function feedWinner(feeder: string): TeamId | null {
    return getWinner(feeder)
  }

  function isPath(matchId: string): boolean {
    const w = getWinner(matchId)
    return !!champion && w === champion
  }

  function r32TeamFromGroup(slot: string): TeamId | null {
    const rank = parseInt(slot[0]) - 1
    const groupId = slot[1]
    const grp = groups.find(g => g.groupId === groupId)
    if (!grp) return null
    return grp.ranking[rank] || null
  }

  const groupData = GROUPS.map(g => {
    const pick = groups.find(p => p.groupId === g.id)
    const ranking = pick?.ranking ?? ([] as string[])
    return {
      id: g.id,
      teams: [0, 1, 2, 3].map(i => ({
        tid: ranking[i] ?? '',
        rank: i + 1,
        team: ranking[i] ? TEAMS[ranking[i]] : null,
      })),
    }
  })

  const ColW = { r32: 108, r16: 96, qf: 86, sf: 80, final: 76 }
  const GAP = 5

  const leftR32 = R32_SLOTS.filter(s => s.side === 'left').sort((a, b) => a.position - b.position)
  const rightR32 = R32_SLOTS.filter(s => s.side === 'right').sort((a, b) => a.position - b.position)

  const leftGroups = groupData.filter((_, idx) => idx % 2 === 0)
  const rightGroups = groupData.filter((_, idx) => idx % 2 === 1)

  return (
    <div style={{ display: 'flex', background: DARK, padding: 14, borderRadius: 12, fontFamily: 'Inter' }}>

      {/* === BRACKET SECTION === */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <span style={{ color: GOLD, fontSize: 9, fontWeight: 700, letterSpacing: 3 }}>
            FIFA WORLD CUP 2026 · MY BRACKET
          </span>
        </div>

        {/* All bracket columns */}
        <div style={{ display: 'flex', gap: GAP, alignItems: 'flex-start' }}>

          {/* LEFT R32 */}
          <div style={{ position: 'relative', width: ColW.r32, height: CONTAINER_H, display: 'flex' }}>
            {leftR32.map(slot => (
              <div key={slot.matchId} style={{ position: 'absolute', top: r32Top(slot.position), left: 0, right: 0, height: CARD_H, display: 'flex' }}>
                <MatchCell
                  homeTeam={slot.homeSlot.length === 2 ? r32TeamFromGroup(slot.homeSlot) : null}
                  awayTeam={slot.awaySlot.length === 2 ? r32TeamFromGroup(slot.awaySlot) : null}
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
                    homeTeam={feedWinner(struct?.homeFeeder ?? '')}
                    awayTeam={feedWinner(struct?.awayFeeder ?? '')}
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
                    homeTeam={feedWinner(struct?.homeFeeder ?? '')}
                    awayTeam={feedWinner(struct?.awayFeeder ?? '')}
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
              <MatchCell homeTeam={feedWinner('QF_L1')} awayTeam={feedWinner('QF_L2')} winner={getWinner('SF_L')} isPath={isPath('SF_L')} />
            </div>
          </div>

          {/* FINAL */}
          <div style={{ position: 'relative', width: ColW.final, height: CONTAINER_H, display: 'flex' }}>
            <div style={{ position: 'absolute', top: sfTop() - 10, left: 0, right: 0, height: 60, display: 'flex' }}>
              <FinalCell champion={champion} />
            </div>
          </div>

          {/* RIGHT SF */}
          <div style={{ position: 'relative', width: ColW.sf, height: CONTAINER_H, display: 'flex' }}>
            <div style={{ position: 'absolute', top: sfTop(), left: 0, right: 0, height: CARD_H, display: 'flex' }}>
              <MatchCell homeTeam={feedWinner('QF_R1')} awayTeam={feedWinner('QF_R2')} winner={getWinner('SF_R')} isPath={isPath('SF_R')} />
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
                    homeTeam={feedWinner(struct?.homeFeeder ?? '')}
                    awayTeam={feedWinner(struct?.awayFeeder ?? '')}
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
                    homeTeam={feedWinner(struct?.homeFeeder ?? '')}
                    awayTeam={feedWinner(struct?.awayFeeder ?? '')}
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
                  homeTeam={slot.homeSlot.length === 2 ? r32TeamFromGroup(slot.homeSlot) : null}
                  awayTeam={slot.awaySlot.length === 2 ? r32TeamFromGroup(slot.awaySlot) : null}
                  winner={getWinner(slot.matchId)}
                  isPath={isPath(slot.matchId)}
                />
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ width: 1, background: '#1e2d50', margin: '0 12px', alignSelf: 'stretch', display: 'flex' }} />

      {/* === GROUP PANEL === */}
      <div style={{ width: 210, display: 'flex', flexDirection: 'column' }}>
        {/* Panel title */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <span style={{ color: GOLD, fontSize: 8, fontWeight: 700, letterSpacing: 2 }}>GROUP STAGE</span>
        </div>

        {/* Two-column flex layout (Satori does not support display:grid) */}
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {/* Left column: A, C, E, G, I, K */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            {leftGroups.map(g => <GroupCard key={g.id} id={g.id} teams={g.teams} />)}
          </div>
          {/* Right column: B, D, F, H, J, L */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            {rightGroups.map(g => <GroupCard key={g.id} id={g.id} teams={g.teams} />)}
          </div>
        </div>
      </div>

    </div>
  )
}
