import { TEAMS, KNOCKOUT_STRUCTURE, R32_SLOTS } from '@/data/wc2026'
import type { BracketPicks, TeamId, Language } from '@/lib/picks'

const GOLD = '#ffd700'
const DARK = '#060b18'
const DIM_BORDER = '#1a2847'
const WIN_BG = '#152206'
const LOSE_BG = '#070c18'
const PATH_BORDER = '#ffd700'

const CARD_H = 66
const INNER_GAP = 4
const OUTER_GAP = 16
const ROW_H = CARD_H / 2  // 33

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

function getName(tid: TeamId | null, lang: Language): string {
  if (!tid) return 'TBD'
  const t = TEAMS[tid]
  if (!t) return tid
  if (lang === 'cn') return t.nameZh
  if (lang === 'es') return t.nameEs
  return t.name
}

interface TeamRowProps {
  tid: TeamId | null
  isWinner: boolean
  isLoser: boolean
  score: number | null
  isBottom: boolean
  lang: Language
  flagImages: Record<string, string>
}

function TeamRow({ tid, isWinner, isLoser, score, isBottom, lang, flagImages }: TeamRowProps) {
  const bg = isWinner ? WIN_BG : isLoser ? LOSE_BG : '#0c1526'
  const textColor = isWinner ? '#ffffff' : isLoser ? '#3a4a6a' : '#7a8fb0'
  const fw = isWinner ? 700 : 400
  const flagSrc = tid ? (flagImages[tid] ?? '') : ''

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height: ROW_H,
      padding: '0 8px',
      background: bg,
      borderTop: isBottom ? `1px solid ${DIM_BORDER}40` : 'none',
      gap: 6,
    }}>
      {flagSrc
        ? <img src={flagSrc} width={26} height={18} style={{ borderRadius: 2, objectFit: 'cover', flexShrink: 0 }} />
        : <div style={{ width: 26, height: 18, background: '#1a2847', borderRadius: 2, flexShrink: 0 }} />
      }
      <span style={{ fontSize: 12, fontWeight: fw, color: textColor, flex: 1 }}>
        {getName(tid, lang)}
      </span>
      {score !== null && (
        <span style={{
          fontSize: 14, fontWeight: 700,
          color: isWinner ? GOLD : '#3a4a6a',
          minWidth: 18, textAlign: 'right' as const,
        }}>
          {score}
        </span>
      )}
    </div>
  )
}

interface MatchCellProps {
  homeTeam: TeamId | null
  awayTeam: TeamId | null
  winner: TeamId | null
  homeScore: number | null
  awayScore: number | null
  isPath: boolean
  lang: Language
  flagImages: Record<string, string>
}

function MatchCell({ homeTeam, awayTeam, winner, homeScore, awayScore, isPath, lang, flagImages }: MatchCellProps) {
  const border = isPath ? `1px solid ${PATH_BORDER}` : `1px solid ${DIM_BORDER}`
  const hasResult = winner !== null
  const homeWins = hasResult && homeTeam === winner
  const awayWins = hasResult && awayTeam === winner

  return (
    <div style={{
      border,
      borderRadius: 6,
      overflow: 'hidden',
      height: CARD_H,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <TeamRow
        tid={homeTeam} isWinner={homeWins} isLoser={hasResult && !homeWins}
        score={homeScore} isBottom={false} lang={lang} flagImages={flagImages}
      />
      <TeamRow
        tid={awayTeam} isWinner={awayWins} isLoser={hasResult && !awayWins}
        score={awayScore} isBottom={true} lang={lang} flagImages={flagImages}
      />
    </div>
  )
}

function FinalCell({ champion, lang, flagImages }: { champion: TeamId | null; lang: Language; flagImages: Record<string, string> }) {
  const flagSrc = champion ? (flagImages[champion] ?? '') : ''
  const name = getName(champion, lang)
  return (
    <div style={{
      background: '#1a3a0a',
      border: `2px solid ${GOLD}`,
      borderRadius: 10,
      height: 90,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    }}>
      <span style={{ color: GOLD, fontSize: 9, fontWeight: 700, letterSpacing: 3, display: 'flex' }}>FINAL</span>
      {flagSrc
        ? <img src={flagSrc} width={44} height={30} style={{ borderRadius: 3, objectFit: 'cover' }} />
        : <div style={{ width: 44, height: 30, background: '#1a2847', borderRadius: 3 }} />
      }
      <span style={{ color: '#ffffff', fontSize: 13, fontWeight: 700, display: 'flex' }}>{name}</span>
      <span style={{ color: '#4caf50', fontSize: 9, fontWeight: 700, letterSpacing: 1, display: 'flex' }}>CHAMPION</span>
    </div>
  )
}

const ROUND_LABELS = ['R32', 'R16', 'QF', 'SF', '', 'SF', 'QF', 'R16', 'R32']

interface Props {
  picks: BracketPicks
  flagImages: Record<string, string>
}

export function BracketImageTemplate({ picks, flagImages }: Props) {
  const { groups, knockout } = picks
  const lang = picks.language
  const wildcardSelections = picks.wildcardSelections ?? {}
  const champion = knockout.find(m => m.matchId === 'FINAL')?.winner ?? null

  function getWinner(matchId: string): TeamId | null {
    return knockout.find(m => m.matchId === matchId)?.winner ?? null
  }
  function getScore(matchId: string): { home: number | null; away: number | null } {
    const m = knockout.find(m => m.matchId === matchId)
    return m?.score ?? { home: null, away: null }
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
    return wildcardSelections[matchId] ?? null
  }

  const ColW = { r32: 198, r16: 170, qf: 148, sf: 126, final: 128 }
  const GAP = 8

  const leftR32 = R32_SLOTS.filter(s => s.side === 'left').sort((a, b) => a.position - b.position)
  const rightR32 = R32_SLOTS.filter(s => s.side === 'right').sort((a, b) => a.position - b.position)

  function matchCell(matchId: string, homeTeam: TeamId | null, awayTeam: TeamId | null) {
    const sc = getScore(matchId)
    return (
      <MatchCell
        homeTeam={homeTeam} awayTeam={awayTeam}
        winner={getWinner(matchId)}
        homeScore={sc.home} awayScore={sc.away}
        isPath={isPath(matchId)}
        lang={lang} flagImages={flagImages}
      />
    )
  }

  const colOrder = [
    { label: 'R32', w: ColW.r32 }, { label: 'R16', w: ColW.r16 },
    { label: 'QF', w: ColW.qf }, { label: 'SF', w: ColW.sf },
    { label: '', w: ColW.final },
    { label: 'SF', w: ColW.sf }, { label: 'QF', w: ColW.qf },
    { label: 'R16', w: ColW.r16 }, { label: 'R32', w: ColW.r32 },
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: DARK, padding: '14px 18px',
      borderRadius: 14, fontFamily: 'Inter',
      width: '100%', height: '100%',
    }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <span style={{ color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: 4 }}>
          FIFA WORLD CUP 2026 · MY BRACKET
        </span>
      </div>

      {/* Round labels row */}
      <div style={{ display: 'flex', gap: GAP, justifyContent: 'center', marginBottom: 6 }}>
        {colOrder.map((col, i) => (
          <div key={i} style={{ width: col.w, display: 'flex', justifyContent: 'center' }}>
            <span style={{ color: col.label ? GOLD : 'transparent', fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>
              {col.label || '.'}
            </span>
          </div>
        ))}
      </div>

      {/* Bracket columns */}
      <div style={{ display: 'flex', gap: GAP, alignItems: 'flex-start', justifyContent: 'center' }}>

        {/* LEFT R32 */}
        <div style={{ position: 'relative', width: ColW.r32, height: CONTAINER_H, display: 'flex' }}>
          {leftR32.map(slot => (
            <div key={slot.matchId} style={{ position: 'absolute', top: r32Top(slot.position), left: 0, right: 0, height: CARD_H, display: 'flex' }}>
              {matchCell(slot.matchId, r32HomeTeam(slot.homeSlot), r32AwayTeam(slot.awaySlot, slot.matchId))}
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
                {matchCell(matchId, getWinner(struct?.homeFeeder ?? ''), getWinner(struct?.awayFeeder ?? ''))}
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
                {matchCell(matchId, getWinner(struct?.homeFeeder ?? ''), getWinner(struct?.awayFeeder ?? ''))}
              </div>
            )
          })}
        </div>

        {/* LEFT SF */}
        <div style={{ position: 'relative', width: ColW.sf, height: CONTAINER_H, display: 'flex' }}>
          <div style={{ position: 'absolute', top: sfTop(), left: 0, right: 0, height: CARD_H, display: 'flex' }}>
            {matchCell('SF_L', getWinner('QF_L1'), getWinner('QF_L2'))}
          </div>
        </div>

        {/* FINAL */}
        <div style={{ position: 'relative', width: ColW.final, height: CONTAINER_H, display: 'flex' }}>
          <div style={{ position: 'absolute', top: sfTop() - 12, left: 0, right: 0, height: 90, display: 'flex' }}>
            <FinalCell champion={champion} lang={lang} flagImages={flagImages} />
          </div>
        </div>

        {/* RIGHT SF */}
        <div style={{ position: 'relative', width: ColW.sf, height: CONTAINER_H, display: 'flex' }}>
          <div style={{ position: 'absolute', top: sfTop(), left: 0, right: 0, height: CARD_H, display: 'flex' }}>
            {matchCell('SF_R', getWinner('QF_R1'), getWinner('QF_R2'))}
          </div>
        </div>

        {/* RIGHT QF */}
        <div style={{ position: 'relative', width: ColW.qf, height: CONTAINER_H, display: 'flex' }}>
          {[0, 1].map(i => {
            const matchId = `QF_R${i + 1}`
            const struct = KNOCKOUT_STRUCTURE.find(s => s.matchId === matchId)
            return (
              <div key={matchId} style={{ position: 'absolute', top: qfTop(i), left: 0, right: 0, height: CARD_H, display: 'flex' }}>
                {matchCell(matchId, getWinner(struct?.homeFeeder ?? ''), getWinner(struct?.awayFeeder ?? ''))}
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
                {matchCell(matchId, getWinner(struct?.homeFeeder ?? ''), getWinner(struct?.awayFeeder ?? ''))}
              </div>
            )
          })}
        </div>

        {/* RIGHT R32 */}
        <div style={{ position: 'relative', width: ColW.r32, height: CONTAINER_H, display: 'flex' }}>
          {rightR32.map(slot => (
            <div key={slot.matchId} style={{ position: 'absolute', top: r32Top(slot.position), left: 0, right: 0, height: CARD_H, display: 'flex' }}>
              {matchCell(slot.matchId, r32HomeTeam(slot.homeSlot), r32AwayTeam(slot.awaySlot, slot.matchId))}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
