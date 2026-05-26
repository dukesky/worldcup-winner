'use client'
import { useEffect, useState } from 'react'
import { t } from '@/lib/i18n'
import type { BracketPicks, Language } from '@/lib/picks'

interface Props { lang: Language }

export function SharePage({ lang }: Props) {
  const [bracketUrl, setBracketUrl] = useState<string | null>(null)
  const [groupStageUrl, setGroupStageUrl] = useState<string | null>(null)
  const [celebrationUrl, setCelebrationUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('wc2026_picks')
    if (!stored) {
      setError('No picks found — please start from the beginning.')
      setLoading(false)
      return
    }

    let picks: BracketPicks
    try {
      picks = JSON.parse(stored)
    } catch {
      setError('Could not read your picks — please try again.')
      setLoading(false)
      return
    }

    const champion = picks.knockout.find(m => m.matchId === 'FINAL')?.winner

    const postJson = (url: string) =>
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(picks) })

    Promise.all([
      // Bracket image (bracket only)
      postJson('/api/generate-bracket')
        .then(r => { if (!r.ok) throw new Error(`Bracket API returned ${r.status}`); return r.blob() })
        .then(b => URL.createObjectURL(b)),

      // Group stage image
      postJson('/api/generate-group-stage')
        .then(r => r.ok ? r.blob() : null)
        .then(b => b ? URL.createObjectURL(b) : null),

      // Celebration image (only if champion known)
      champion
        ? fetch('/api/generate-celebration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photo: picks.photoDataUrl, championTeam: champion, language: picks.language }),
          })
            .then(r => r.ok ? r.json() : null)
            .then(d => d?.imageUrl ?? null)
        : Promise.resolve(null),
    ])
      .then(([bracket, groupStage, celebration]) => {
        setBracketUrl(bracket)
        setGroupStageUrl(groupStage)
        setCelebrationUrl(celebration)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function download(url: string, filename: string) {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = filename
      a.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      // Fallback: open in new tab
      window.open(url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#ffd700] border-t-transparent animate-spin" />
        <p className="text-[#8a9bc0]">{t(lang, 'generating')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <a href="/" className="text-[#ffd700] underline">Start over</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <h1 className="text-center text-[#ffd700] text-2xl font-black">🏆 Your Predictions</h1>

        {/* Bracket image */}
        {bracketUrl && (
          <div className="flex flex-col gap-3">
            <img src={bracketUrl} alt="Your bracket" className="w-full rounded-xl border border-[#1e2d50]" />
            <button
              onClick={() => download(bracketUrl, 'wc2026-bracket.png')}
              className="self-center bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black px-8 py-3 rounded-xl hover:scale-105 transition-transform"
            >
              {t(lang, 'downloadBracket')}
            </button>
          </div>
        )}

        {/* Group stage image */}
        {groupStageUrl && (
          <div className="flex flex-col gap-3">
            <img src={groupStageUrl} alt="Group stage" className="w-full rounded-xl border border-[#1e2d50]" />
            <button
              onClick={() => download(groupStageUrl, 'wc2026-groups.png')}
              className="self-center border border-[#ffd700] text-[#ffd700] font-black px-8 py-3 rounded-xl hover:bg-[#ffd700]/10 transition-colors"
            >
              {t(lang, 'downloadGroupStage')}
            </button>
          </div>
        )}

        {/* Celebration image */}
        {celebrationUrl && (
          <div className="flex flex-col items-center gap-3">
            <img src={celebrationUrl} alt="Your celebration" className="max-w-sm w-full rounded-xl border border-[#ffd700]/30" />
            <button
              onClick={() => download(celebrationUrl, 'wc2026-celebration.png')}
              className="bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black px-8 py-3 rounded-xl hover:scale-105 transition-transform"
            >
              {t(lang, 'downloadCelebration')}
            </button>
          </div>
        )}

        <p className="text-center text-[#8a9bc0] text-sm">{t(lang, 'shareHint')}</p>

        <a href="/" className="text-center text-[#ffd700]/60 text-xs hover:text-[#ffd700] transition-colors">
          ← Start a new prediction
        </a>
      </div>
    </div>
  )
}
