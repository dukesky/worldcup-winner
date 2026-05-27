import { TEAMS, GROUPS } from '@/data/wc2026'
import type { BracketPicks, Language } from '@/lib/picks'

const GOLD = '#ffd700'
const DARK = '#060b18'
const DIM_BORDER = '#1a2847'

const RANK_BG = ['#1e4a14', '#123a5e', '#5a3e0a', '#111d30']
const RANK_TEXT = ['#80ff80', '#80c8f8', '#f8c020', '#3a4a6a']
const RANK_LABEL_COLOR = ['#4caf50', '#5b9bd5', '#c8921a', '#2a3a5a']

function getName(tid: string, lang: Language): string {
  const t = TEAMS[tid]
  if (!t) return tid
  if (lang === 'cn') return t.nameZh
  if (lang === 'es') return t.nameEs
  return t.name
}

interface GroupCardProps {
  id: string
  teams: Array<{ tid: string }>
  lang: Language
  flagImages: Record<string, string>
}

function GroupCard({ id, teams, lang, flagImages }: GroupCardProps) {
  return (
    <div style={{
      background: '#080f1e',
      border: `1px solid ${DIM_BORDER}`,
      borderRadius: 10,
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    }}>
      {/* Group header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: `1px solid ${DIM_BORDER}`,
        paddingBottom: 8,
        marginBottom: 10,
      }}>
        <span style={{ color: GOLD, fontSize: 17, fontWeight: 800, letterSpacing: 2, display: 'flex' }}>GROUP {id}</span>
      </div>

      {/* Team rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {teams.map((t, i) => {
          const src = t.tid ? (flagImages[t.tid] ?? '') : ''
          const name = t.tid ? getName(t.tid, lang) : 'TBD'
          const isAdvancing = i < 2

          return (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              flex: 1,
              background: isAdvancing ? `${RANK_BG[i]}60` : 'transparent',
              borderRadius: 6,
              padding: '3px 5px',
            }}>
              {/* Rank badge */}
              <div style={{
                width: 24, height: 24,
                background: RANK_BG[i],
                borderRadius: 5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                border: `1px solid ${RANK_LABEL_COLOR[i]}40`,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: RANK_TEXT[i], display: 'flex' }}>{i + 1}</div>
              </div>

              {/* Flag */}
              {src
                ? <img src={src} width={38} height={26} style={{ borderRadius: 3, objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 38, height: 26, background: '#1a2847', borderRadius: 3, flexShrink: 0 }} />
              }

              {/* Team name */}
              <div style={{
                fontSize: 18,
                fontWeight: isAdvancing ? 700 : 400,
                color: isAdvancing ? '#e0f0ff' : '#4a5a70',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
              }}>
                {name}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface Props {
  picks: BracketPicks
  flagImages: Record<string, string>
}

export function GroupStageImageTemplate({ picks, flagImages }: Props) {
  const { groups } = picks
  const lang = picks.language

  const groupData = GROUPS.map(g => {
    const pick = groups.find(p => p.groupId === g.id)
    const ranking = pick?.ranking ?? []
    return {
      id: g.id,
      teams: [0, 1, 2, 3].map(i => ({ tid: ranking[i] ?? '' })),
    }
  })

  // 3 columns × 4 rows: col1=A D G J, col2=B E H K, col3=C F I L
  const col1 = groupData.filter((_, i) => i % 3 === 0)
  const col2 = groupData.filter((_, i) => i % 3 === 1)
  const col3 = groupData.filter((_, i) => i % 3 === 2)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: DARK,
      padding: '18px 16px',
      fontFamily: 'Inter',
      width: '100%',
      height: '100%',
    }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <span style={{ color: GOLD, fontSize: 20, fontWeight: 800, letterSpacing: 4, display: 'flex' }}>
          FIFA WORLD CUP 2026 · GROUP STAGE
        </span>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 12 }}>
        {[
          { color: '#4caf50', label: lang === 'cn' ? '第一名晋级' : lang === 'es' ? '1° - Clasifica' : '1st — Advances' },
          { color: '#5b9bd5', label: lang === 'cn' ? '第二名晋级' : lang === 'es' ? '2° - Clasifica' : '2nd — Advances' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
            <span style={{ fontSize: 13, color: '#6a7a9a', fontWeight: 500, display: 'flex' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* 3-column grid, fills remaining height */}
      <div style={{ display: 'flex', gap: 10, flex: 1 }}>
        {[col1, col2, col3].map((col, ci) => (
          <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {col.map(g => (
              <GroupCard key={g.id} id={g.id} teams={g.teams} lang={lang} flagImages={flagImages} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
