import { TEAMS, KNOCKOUT_STRUCTURE, R32_SLOTS } from '@/data/wc2026'
import type { BracketPicks, TeamId, Language } from '@/lib/picks'

const GOLD = '#c8960a'       // dark gold — readable on light bg
const DARK = '#f4f6f9'       // light background
const DIM_BORDER = '#ccd5e0' // light card border
const WIN_BG = '#e4f5e4'     // light green (winner row)
const LOSE_BG = '#eeeeee'    // light gray (loser row)
const PATH_BORDER = '#c8960a'

// 2× resolution — all pixel values doubled so the PNG renders crisp at high DPI
const CARD_H = 140
const INNER_GAP = 8
const OUTER_GAP = 32
const ROW_H = CARD_H / 2  // 70

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
const CONTAINER_H = r32Top(8) + CARD_H + 32

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
  const bg = isWinner ? WIN_BG : isLoser ? LOSE_BG : '#edf1f8'
  const textColor = isWinner ? '#1a5c0a' : isLoser ? '#a0a8b8' : '#2a3a54'
  const fw = isWinner ? 700 : 400
  const flagSrc = tid ? (flagImages[tid] ?? '') : ''

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height: ROW_H,
      padding: '0 12px',
      background: bg,
      borderTop: isBottom ? `1px solid ${DIM_BORDER}40` : 'none',
      gap: 10,
    }}>
      {flagSrc
        ? <img src={flagSrc} width={56} height={38} style={{ borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
        : <div style={{ width: 56, height: 38, background: '#dde3ee', borderRadius: 4, flexShrink: 0 }} />
      }
      <div style={{ fontSize: 26, fontWeight: fw, color: textColor, flex: 1, display: 'flex', alignItems: 'center' }}>
        {getName(tid, lang)}
      </div>
      {score !== null && (
        <div style={{
          fontSize: 28, fontWeight: 700, display: 'flex',
          color: isWinner ? GOLD : '#b0b8c8',
          minWidth: 36, justifyContent: 'flex-end',
        }}>
          {score}
        </div>
      )}
      {isWinner && (
        <div style={{ fontSize: 20, color: GOLD, marginLeft: 4, display: 'flex' }}>✓</div>
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
  const border = isPath ? `4px solid ${PATH_BORDER}` : `2px solid ${DIM_BORDER}`
  const hasResult = winner !== null
  const homeWins = hasResult && homeTeam === winner
  const awayWins = hasResult && awayTeam === winner

  return (
    <div style={{
      border,
      borderRadius: 12,
      overflow: 'hidden',
      height: CARD_H,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: isPath ? `0 0 16px ${GOLD}30` : 'none',
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
      background: 'linear-gradient(135deg, #e4fce0 0%, #cef5c8 100%)',
      border: `4px solid ${PATH_BORDER}`,
      borderRadius: 24,
      height: 200,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      boxShadow: `0 0 40px ${PATH_BORDER}30`,
    }}>
      <span style={{ color: GOLD, fontSize: 18, fontWeight: 700, letterSpacing: 6, display: 'flex' }}>FINAL</span>
      {flagSrc
        ? <img src={flagSrc} width={104} height={70} style={{ borderRadius: 8, objectFit: 'cover' }} />
        : <div style={{ width: 104, height: 70, background: '#dde3ee', borderRadius: 8 }} />
      }
      <span style={{ color: '#1a4a08', fontSize: 28, fontWeight: 800, display: 'flex' }}>{name}</span>
      <span style={{ color: '#2e7d32', fontSize: 18, fontWeight: 700, letterSpacing: 4, display: 'flex' }}>CHAMPION</span>
    </div>
  )
}

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

  const ColW = { r32: 400, r16: 348, qf: 304, sf: 260, final: 264 }
  const GAP = 16

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
      background: DARK, padding: '28px 36px',
      borderRadius: 28, fontFamily: 'Inter',
      width: '100%', height: '100%',
    }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <span style={{ color: GOLD, fontSize: 26, fontWeight: 700, letterSpacing: 8, display: 'flex' }}>
          FIFA WORLD CUP 2026 · MY BRACKET
        </span>
      </div>

      {/* Round labels row */}
      <div style={{ display: 'flex', gap: GAP, justifyContent: 'center', marginBottom: 12 }}>
        {colOrder.map((col, i) => (
          <div key={i} style={{ width: col.w, display: 'flex', justifyContent: 'center' }}>
            <span style={{ color: col.label ? GOLD : 'transparent', fontSize: 20, fontWeight: 700, letterSpacing: 4, display: 'flex' }}>
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
          <div style={{ position: 'absolute', top: sfTop() - 30, left: 0, right: 0, height: 200, display: 'flex' }}>
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
