import { TEAMS, GROUPS } from '@/data/wc2026'
import type { BracketPicks } from '@/lib/picks'

const GOLD = '#ffd700'
const DARK = '#060b18'
const DIM_BORDER = '#1a2847'

const RANK_COLORS = ['#4caf50', '#5b9fd6', '#c89a30', '#3a4a6a']
const RANK_TEXT = ['#e0ffe0', '#c0d8f0', '#d0b060', '#4a5a7a']
const RANK_SYMBOLS = ['①', '②', '③', '④']

interface GroupCardProps {
  id: string
  teams: Array<{ flag: string; name: string; rank: number }>
}

function GroupCard({ id, teams }: GroupCardProps) {
  return (
    <div style={{
      background: '#0a1020',
      border: `1px solid ${DIM_BORDER}`,
      borderRadius: 8,
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    }}>
      <div style={{
        display: 'flex',
        color: GOLD,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 2,
        borderBottom: `1px solid ${DIM_BORDER}`,
        paddingBottom: 6,
        marginBottom: 8,
      }}>
        GROUP {id}
      </div>
      {teams.map((t, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: i < 3 ? 6 : 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: RANK_COLORS[i], width: 14, flexShrink: 0 }}>
            {RANK_SYMBOLS[i]}
          </span>
          <span style={{ fontSize: 17 }}>{t.flag}</span>
          <span style={{ fontSize: 13, color: RANK_TEXT[i], fontWeight: i < 2 ? 600 : 400 }}>
            {t.name}
          </span>
        </div>
      ))}
    </div>
  )
}

export function GroupStageImageTemplate({ picks }: { picks: BracketPicks }) {
  const { groups } = picks

  const groupData = GROUPS.map(g => {
    const pick = groups.find(p => p.groupId === g.id)
    const ranking = pick?.ranking ?? []
    return {
      id: g.id,
      teams: [0, 1, 2, 3].map(i => {
        const tid = ranking[i] ?? ''
        const team = tid ? TEAMS[tid] : null
        return { flag: team?.flag ?? '', name: team?.name ?? 'TBD', rank: i + 1 }
      }),
    }
  })

  // 3 columns × 4 rows
  const col1 = groupData.filter((_, i) => i % 3 === 0) // A D G J
  const col2 = groupData.filter((_, i) => i % 3 === 1) // B E H K
  const col3 = groupData.filter((_, i) => i % 3 === 2) // C F I L

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: DARK,
      padding: '20px 22px',
      borderRadius: 14,
      fontFamily: 'Inter',
    }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <span style={{ color: GOLD, fontSize: 13, fontWeight: 700, letterSpacing: 4 }}>
          FIFA WORLD CUP 2026 · GROUP STAGE
        </span>
      </div>

      {/* 3-column grid */}
      <div style={{ display: 'flex', gap: 10 }}>
        {[col1, col2, col3].map((col, ci) => (
          <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {col.map(g => (
              <GroupCard key={g.id} id={g.id} teams={g.teams} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
