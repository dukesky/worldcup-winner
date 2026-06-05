import { TEAMS } from '@/data/wc2026'
import type { Language } from '@/lib/picks'

const GOLD = '#ffd700'
const DARK = '#060b18'
const DIM = '#1a2847'

interface JourneyMatch {
  roundLabel: string        // "ROUND OF 32", "QUARTER-FINAL", etc.
  opponent: string | null   // TeamId of opponent, or null
  isChampHome: boolean      // true = champion was home team
  score: { home: number | null; away: number | null }
}

interface Props {
  champion: string
  path: JourneyMatch[]
  lang: Language
  flagImages: Record<string, string>
}

export function ChampionJourneyTemplate({ champion, path, lang, flagImages }: Props) {
  const champTeam = TEAMS[champion]
  const champName = lang === 'cn' ? champTeam?.nameZh : lang === 'es' ? champTeam?.nameEs : champTeam?.name
  const champFlag = flagImages[champion] ?? ''

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: DARK, padding: '20px 24px',
      fontFamily: 'Inter', width: '100%', height: '100%',
    }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <span style={{ color: GOLD, fontSize: 18, fontWeight: 700, letterSpacing: 5, display: 'flex' }}>
          {lang === 'cn' ? '夺冠之路' : lang === 'es' ? 'CAMINO AL TÍTULO' : 'ROAD TO THE TITLE'}
        </span>
      </div>

      {/* Champion banner */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        background: 'linear-gradient(135deg, #1a3a0a 0%, #0f2606 100%)',
        border: `3px solid ${GOLD}`, borderRadius: 16,
        padding: '14px 20px', marginBottom: 16,
        boxShadow: `0 0 20px ${GOLD}30`,
      }}>
        {champFlag
          ? <img src={champFlag} width={64} height={44} style={{ borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
          : <div style={{ width: 64, height: 44, background: DIM, borderRadius: 6 }} />
        }
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ color: GOLD, fontSize: 13, fontWeight: 700, letterSpacing: 4, display: 'flex' }}>
            {lang === 'cn' ? '🏆 世界冠军' : lang === 'es' ? '🏆 CAMPEÓN' : '🏆 CHAMPION'}
          </span>
          <span style={{ color: '#ffffff', fontSize: 26, fontWeight: 800, display: 'flex' }}>{champName}</span>
        </div>
      </div>

      {/* Round rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {path.map((match, i) => {
          const oppTeam = match.opponent ? TEAMS[match.opponent] : null
          const oppName = match.opponent
            ? (lang === 'cn' ? oppTeam?.nameZh : lang === 'es' ? oppTeam?.nameEs : oppTeam?.name) ?? match.opponent
            : (lang === 'cn' ? '待定' : lang === 'es' ? 'TBD' : 'TBD')
          const oppFlag = match.opponent ? (flagImages[match.opponent] ?? '') : ''
          const champScoreNum = match.isChampHome ? match.score.home : match.score.away
          const oppScoreNum = match.isChampHome ? match.score.away : match.score.home
          const hasScore = champScoreNum !== null && oppScoreNum !== null
          const isFinal = match.roundLabel.includes('FINAL') || match.roundLabel.includes('决赛') || match.roundLabel.includes('Final')

          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center',
              background: isFinal ? 'linear-gradient(90deg, #1a3a0a 0%, #0c1526 100%)' : '#0c1526',
              border: `1px solid ${isFinal ? GOLD + '60' : DIM}`,
              borderRadius: 10, padding: '0 14px', height: 72,
              gap: 10,
            }}>
              {/* Round label */}
              <span style={{ color: GOLD, fontSize: 11, fontWeight: 700, width: 68, letterSpacing: 1, display: 'flex', flexShrink: 0 }}>
                {match.roundLabel}
              </span>

              {/* Opponent */}
              {oppFlag
                ? <img src={oppFlag} width={34} height={23} style={{ borderRadius: 3, objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 34, height: 23, background: DIM, borderRadius: 3, flexShrink: 0 }} />
              }
              <span style={{ color: '#5a6a80', fontSize: 14, flex: 1, display: 'flex', alignItems: 'center' }}>
                {oppName}
              </span>

              {/* Score or W */}
              {hasScore ? (
                <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#4a5a6a', fontSize: 18, fontWeight: 700, display: 'flex' }}>{oppScoreNum}</span>
                  <span style={{ color: '#2a3a54', fontSize: 14, display: 'flex' }}>–</span>
                  <span style={{ color: GOLD, fontSize: 18, fontWeight: 700, display: 'flex' }}>{champScoreNum}</span>
                </div>
              ) : (
                <span style={{ color: GOLD, fontSize: 14, fontWeight: 700, display: 'flex', flexShrink: 0 }}>W</span>
              )}

              {/* Champion team */}
              <span style={{ color: '#d0e8ff', fontSize: 14, fontWeight: 700, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                {champName}
              </span>
              {champFlag
                ? <img src={champFlag} width={34} height={23} style={{ borderRadius: 3, objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 34, height: 23, background: DIM, borderRadius: 3, flexShrink: 0 }} />
              }
              <span style={{ color: GOLD, fontSize: 16, display: 'flex', flexShrink: 0 }}>✓</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
