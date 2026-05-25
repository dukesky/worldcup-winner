'use client'
import { useEffect } from 'react'
import { TEAMS } from '@/data/wc2026'
import { t } from '@/lib/i18n'
import type { Language, TeamId } from '@/lib/picks'

// canvas-confetti is browser-only
let confetti: ((opts: object) => void) | null = null
if (typeof window !== 'undefined') {
  import('canvas-confetti').then(m => { confetti = m.default })
}

interface Props {
  champion: TeamId
  lang: Language
  onContinue: () => void
}

export function ChampionReveal({ champion, lang, onContinue }: Props) {
  const team = TEAMS[champion]

  useEffect(() => {
    confetti?.({
      particleCount: 150,
      spread: 80,
      colors: ['#ffd700', '#ff8c00', '#ffffff', '#4caf50'],
      origin: { y: 0.6 },
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="text-[#ffd700] text-xs font-bold tracking-[4px] uppercase mb-4">
        {t(lang, 'yourChampion')}
      </div>
      <div className="text-8xl mb-4">{team?.flag}</div>
      <h2 className="text-4xl font-black text-white mb-2">
        {lang === 'cn' ? team?.nameZh : lang === 'es' ? team?.nameEs : team?.name}
      </h2>
      <div className="text-[#ffd700] text-2xl mb-12">🏆</div>

      <button
        onClick={onContinue}
        className="bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black text-lg px-10 py-4 rounded-xl hover:scale-105 transition-transform"
      >
        {t(lang, 'addSelfie')} →
      </button>
    </div>
  )
}
