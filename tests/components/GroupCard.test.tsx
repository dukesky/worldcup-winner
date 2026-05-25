import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GroupCard } from '@/components/group-stage/GroupCard'
import type { GroupPick } from '@/lib/picks'

const mockGroup = {
  id: 'E',
  teams: ['BRA', 'COL', 'SEN', 'PER'],
}

const mockPick: GroupPick = {
  groupId: 'E',
  ranking: ['BRA', 'COL', 'SEN', 'PER'],
  scores: {},
}

const mockTeams = {
  BRA: { id: 'BRA', name: 'Brazil', nameZh: '巴西', nameEs: 'Brasil', flag: '🇧🇷', group: 'E' as const },
  COL: { id: 'COL', name: 'Colombia', nameZh: '哥伦比亚', nameEs: 'Colombia', flag: '🇨🇴', group: 'E' as const },
  SEN: { id: 'SEN', name: 'Senegal', nameZh: '塞内加尔', nameEs: 'Senegal', flag: '🇸🇳', group: 'E' as const },
  PER: { id: 'PER', name: 'Peru', nameZh: '秘鲁', nameEs: 'Perú', flag: '🇵🇪', group: 'E' as const },
}

describe('GroupCard', () => {
  it('renders all 4 teams', () => {
    render(
      <GroupCard
        group={mockGroup}
        teams={mockTeams}
        pick={mockPick}
        lang="en"
        onRankingChange={vi.fn()}
        onScoreChange={vi.fn()}
      />
    )
    expect(screen.getByText('Brazil')).toBeInTheDocument()
    expect(screen.getByText('Colombia')).toBeInTheDocument()
    expect(screen.getByText('Senegal')).toBeInTheDocument()
    expect(screen.getByText('Peru')).toBeInTheDocument()
  })

  it('shows rank badges for ranked teams', () => {
    render(
      <GroupCard
        group={mockGroup}
        teams={mockTeams}
        pick={mockPick}
        lang="en"
        onRankingChange={vi.fn()}
        onScoreChange={vi.fn()}
      />
    )
    expect(screen.getByText('①')).toBeInTheDocument()
    expect(screen.getByText('②')).toBeInTheDocument()
  })

  it('calls onRankingChange when user taps a team', () => {
    const onRankingChange = vi.fn()
    const emptyPick: GroupPick = { groupId: 'E', ranking: ['' as any, '' as any, '' as any, '' as any], scores: {} }
    render(
      <GroupCard
        group={mockGroup}
        teams={mockTeams}
        pick={emptyPick}
        lang="en"
        onRankingChange={onRankingChange}
        onScoreChange={vi.fn()}
      />
    )
    fireEvent.click(screen.getByTestId('team-BRA'))
    expect(onRankingChange).toHaveBeenCalled()
  })
})
