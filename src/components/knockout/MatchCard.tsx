'use client'
import type { Language, TeamId } from '@/lib/picks'

interface TeamInfo { id: TeamId; name: string; flag: string }

interface Props {
  matchId: string
  homeTeam: TeamInfo | null
  awayTeam: TeamInfo | null
  winner: TeamId | null
  score: { home: number | null; away: number | null }
  lang: Language
  isChampionPath: boolean
  onWinnerSelect: (teamId: TeamId) => void
  onScoreChange: (home: number | null, away: number | null) => void
  awayOptions?: TeamInfo[]
}

function TeamRow({ team, isWinner, isChampionPath, onClick }: {
  team: TeamInfo | null
  isWinner: boolean
  isChampionPath: boolean
  onClick: () => void
}) {
  if (!team) return (
    <div className="flex items-center gap-2 px-2 py-[5px] opacity-30">
      <span className="text-[10px] text-[#3a4a6a]">TBD</span>
    </div>
  )
  return (
    <button
      data-testid={`team-${team.id}`}
      onClick={onClick}
      className={`flex items-center justify-between w-full px-2 py-[5px] rounded transition-all border ${
        isWinner && isChampionPath
          ? 'border-[#ffd700] bg-[#1a2e0a]'
          : isWinner
          ? 'border-[#ffd700] bg-[#111b35]'
          : 'border-transparent hover:border-[#2a3a60]'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm leading-none">{team.flag}</span>
        <span className={`text-[9px] font-semibold ${isWinner && isChampionPath ? 'text-[#ffd700]' : isWinner ? 'text-white' : 'text-[#7a8fb0]'}`}>
          {team.name}
        </span>
      </div>
    </button>
  )
}

export function MatchCard({ matchId, homeTeam, awayTeam, winner, isChampionPath, onWinnerSelect }: Props) {
  return (
    <div className={`rounded-md border text-left ${
      isChampionPath ? 'bg-[#1a2e0a] border-[#ffd700]' : 'bg-[#0c1526] border-[#1a2847]'
    }`}>
      <TeamRow
        team={homeTeam}
        isWinner={winner === homeTeam?.id}
        isChampionPath={isChampionPath && winner === homeTeam?.id}
        onClick={() => homeTeam && onWinnerSelect(homeTeam.id)}
      />
      <div className="border-t border-[#1a2847]/50" />
      <TeamRow
        team={awayTeam}
        isWinner={winner === awayTeam?.id}
        isChampionPath={isChampionPath && winner === awayTeam?.id}
        onClick={() => awayTeam && onWinnerSelect(awayTeam.id)}
      />
    </div>
  )
}
