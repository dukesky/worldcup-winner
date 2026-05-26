import { TEAMS, GROUPS } from '@/data/wc2026'
import type { BracketPicks, Language } from '@/lib/picks'

const GOLD = '#ffd700'
const DARK = '#060b18'
const DIM_BORDER = '#1a2847'

const RANK_BG = ['#256325', '#1e4a6e', '#6e520d', '#1a2535']
const RANK_TEXT = ['#b8ffb8', '#a8d8f8', '#f0c840', '#4a5a7a']

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
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    }}>
      {/* Group header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderBottom: `1px solid ${DIM_BORDER}`,
        paddingBottom: 7,
        marginBottom: 8,
      }}>
        <span style={{ color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>GROUP {id}</span>
      </div>

      {/* Team rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
        {teams.map((t, i) => {
          const src = t.tid ? (flagImages[t.tid] ?? '') : ''
          const name = t.tid ? getName(t.tid, lang) : 'TBD'
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              {/* Rank badge */}
              <div style={{
                width: 20, height: 20,
                background: RANK_BG[i],
                borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: RANK_TEXT[i] }}>{i + 1}</span>
              </div>

              {/* Flag */}
              {src
                ? <img src={src} width={32} height={22} style={{ borderRadius: 3, objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 32, height: 22, background: '#1a2847', borderRadius: 3, flexShrink: 0 }} />
              }

              {/* Team name */}
              <span style={{
                fontSize: 14, fontWeight: i < 2 ? 600 : 400,
                color: i < 2 ? '#d0e8ff' : '#5a6a80',
                flex: 1,
              }}>
                {name}
              </span>
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
      padding: '16px 18px',
      fontFamily: 'Inter',
      width: '100%',
      height: '100%',
    }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <span style={{ color: GOLD, fontSize: 14, fontWeight: 700, letterSpacing: 4 }}>
          FIFA WORLD CUP 2026 · GROUP STAGE
        </span>
      </div>

      {/* 3-column grid, fills remaining height */}
      <div style={{ display: 'flex', gap: 12, flex: 1 }}>
        {[col1, col2, col3].map((col, ci) => (
          <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {col.map(g => (
              <GroupCard key={g.id} id={g.id} teams={g.teams} lang={lang} flagImages={flagImages} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
