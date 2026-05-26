'use client'
import { useEffect } from 'react'
import { TEAMS, KNOCKOUT_STRUCTURE } from '@/data/wc2026'
import { t, getTeamName } from '@/lib/i18n'
import type { Language, KnockoutMatchPick, TeamId } from '@/lib/picks'
import type { R32Matchup } from '@/lib/bracket'

interface Props {
  knockoutPicks: KnockoutMatchPick[]
  wildcardSelections: Record<string, TeamId>
  r32Matchups: R32Matchup[]
  lang: Language
  onWinnerSelect: (matchId: string, winner: TeamId) => void
  onBack: () => void
  onChampionSelected: () => void
}

function getWinner(matchId: string, picks: KnockoutMatchPick[]): TeamId | null {
  return picks.find(p => p.matchId === matchId)?.winner ?? null
}

function getSFTeams(picks: KnockoutMatchPick[]): {
  sfLHome: TeamId|null; sfLAway: TeamId|null; sfLWinner: TeamId|null
  sfRHome: TeamId|null; sfRAway: TeamId|null; sfRWinner: TeamId|null
  finalHome: TeamId|null; finalAway: TeamId|null; champion: TeamId|null
} {
  const sfL = KNOCKOUT_STRUCTURE.find(e => e.matchId === 'SF_L')
  const sfR = KNOCKOUT_STRUCTURE.find(e => e.matchId === 'SF_R')
  const sfLWinner = getWinner('SF_L', picks)
  const sfRWinner = getWinner('SF_R', picks)
  return {
    sfLHome: sfL ? getWinner(sfL.homeFeeder, picks) : null,
    sfLAway: sfL ? getWinner(sfL.awayFeeder, picks) : null,
    sfLWinner,
    sfRHome: sfR ? getWinner(sfR.homeFeeder, picks) : null,
    sfRAway: sfR ? getWinner(sfR.awayFeeder, picks) : null,
    sfRWinner,
    finalHome: sfLWinner,
    finalAway: sfRWinner,
    champion: getWinner('FINAL', picks),
  }
}

interface PickCardProps {
  matchId: string
  label: string
  homeId: TeamId | null
  awayId: TeamId | null
  winner: TeamId | null
  disabled: boolean
  lang: Language
  onPick: (matchId: string, w: TeamId) => void
}

function PickCard({ matchId, label, homeId, awayId, winner, disabled, lang, onPick }: PickCardProps) {
  return (
    <div className={`rounded-xl border p-3 transition-all ${
      disabled ? 'opacity-40' : winner ? 'border-[#ffd700]/50 bg-[#0c1526]' : 'border-[#1a2847] bg-[#0c1526]'
    }`}>
      <div className="text-[9px] text-[#4a5a7a] uppercase mb-2 tracking-wider">{label}</div>
      {[homeId, awayId].map((id, i) => {
        const team = id ? TEAMS[id] : null
        const isWinner = winner === id && !!id
        return (
          <button
            key={i}
            disabled={disabled || !id}
            onClick={() => id && !disabled && onPick(matchId, id)}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg mb-1 transition-all ${
              isWinner
                ? 'bg-[#1a2e0a] border border-[#ffd700] text-[#ffd700] font-bold'
                : id
                ? 'hover:bg-[#111b35] text-[#8a9bc0] hover:text-white'
                : 'opacity-30 cursor-default'
            }`}
          >
            {team ? (
              <>
                <span className="text-lg leading-none">{team.flag}</span>
                <span className="text-sm">{getTeamName(team, lang)}</span>
              </>
            ) : (
              <span className="text-xs text-[#3a4a6a]">TBD</span>
            )}
            {isWinner && <span className="ml-auto" aria-hidden="true">✓</span>}
          </button>
        )
      })}
    </div>
  )
}

export function FinalFourView({ knockoutPicks, wildcardSelections: _wc, r32Matchups: _r32, lang, onWinnerSelect, onBack, onChampionSelected }: Props) {
  const { sfLHome, sfLAway, sfLWinner, sfRHome, sfRAway, sfRWinner, finalHome, finalAway, champion } = getSFTeams(knockoutPicks)
  const championTeam = champion ? TEAMS[champion] : null

  useEffect(() => {
    if (!champion) return
    const timer = setTimeout(onChampionSelected, 1400)
    return () => clearTimeout(timer)
  }, [champion, onChampionSelected])

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pt-14">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-[#8a9bc0] text-sm hover:text-[#ffd700] transition-colors">
          {t(lang, 'backToOverview')}
        </button>
        <h2 className="text-[#ffd700] font-bold text-lg">{t(lang, 'finalFour')}</h2>
        <div className="w-20" />
      </div>

      {/* Semifinals */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <PickCard
          matchId="SF_L"
          label={t(lang, 'semifinal')}
          homeId={sfLHome}
          awayId={sfLAway}
          winner={sfLWinner}
          disabled={!sfLHome || !sfLAway}
          lang={lang}
          onPick={onWinnerSelect}
        />
        <PickCard
          matchId="SF_R"
          label={t(lang, 'semifinal')}
          homeId={sfRHome}
          awayId={sfRAway}
          winner={sfRWinner}
          disabled={!sfRHome || !sfRAway}
          lang={lang}
          onPick={onWinnerSelect}
        />
      </div>

      {/* Final */}
      <PickCard
        matchId="FINAL"
        label={`🏆 ${t(lang, 'final')}`}
        homeId={finalHome}
        awayId={finalAway}
        winner={champion}
        disabled={!finalHome || !finalAway}
        lang={lang}
        onPick={onWinnerSelect}
      />

      {/* Champion flash */}
      {championTeam && (
        <div className="mt-6 text-center">
          <div className="text-[#ffd700] text-sm font-bold mb-2">{t(lang, 'champion')}</div>
          <div className="text-6xl mb-2">{championTeam.flag}</div>
          <div className="text-white font-black text-2xl">{getTeamName(championTeam, lang)}</div>
        </div>
      )}
    </div>
  )
}
