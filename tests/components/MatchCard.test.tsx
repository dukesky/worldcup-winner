import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MatchCard } from '@/components/knockout/MatchCard'

describe('MatchCard', () => {
  const baseProps = {
    matchId: 'R32_L1',
    homeTeam: { id: 'BRA', name: 'Brazil', flag: '🇧🇷' },
    awayTeam: { id: 'SEN', name: 'Senegal', flag: '🇸🇳' },
    winner: null,
    score: { home: null, away: null },
    lang: 'en' as const,
    onWinnerSelect: vi.fn(),
    onScoreChange: vi.fn(),
    isChampionPath: false,
  }

  it('renders both teams', () => {
    render(<MatchCard {...baseProps} />)
    expect(screen.getByText('Brazil')).toBeInTheDocument()
    expect(screen.getByText('Senegal')).toBeInTheDocument()
  })

  it('calls onWinnerSelect when a team is clicked', () => {
    const onWinnerSelect = vi.fn()
    render(<MatchCard {...baseProps} onWinnerSelect={onWinnerSelect} />)
    fireEvent.click(screen.getByTestId('team-BRA'))
    expect(onWinnerSelect).toHaveBeenCalledWith('BRA')
  })

  it('highlights winner with gold border', () => {
    render(<MatchCard {...baseProps} winner="BRA" />)
    expect(screen.getByTestId('team-BRA')).toHaveClass('border-[#ffd700]')
  })
})
