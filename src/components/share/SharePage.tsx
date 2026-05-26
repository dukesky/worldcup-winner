'use client'
import { useEffect, useState } from 'react'
import { t, getTeamName } from '@/lib/i18n'
import { TEAMS } from '@/data/wc2026'
import type { BracketPicks, Language, TeamId } from '@/lib/picks'

interface Props { lang: Language }

function generateCaption(lang: Language, champion: TeamId | null, finalHome: TeamId | null, finalAway: TeamId | null): string {
  if (!champion) return ''
  const c = TEAMS[champion]
  if (!c) return ''
  const championName = getTeamName(c, lang)
  const cFlag = c.flag

  const homeTeam = finalHome ? TEAMS[finalHome] : null
  const awayTeam = finalAway ? TEAMS[finalAway] : null
  const hFlag = homeTeam?.flag ?? ''
  const aFlag = awayTeam?.flag ?? ''
  const homeName = homeTeam ? getTeamName(homeTeam, lang) : 'TBD'
  const awayName = awayTeam ? getTeamName(awayTeam, lang) : 'TBD'

  if (lang === 'cn') {
    return `我预测的世界杯冠军是：${cFlag} ${championName}！决赛对阵：${hFlag} ${homeName} vs ${aFlag} ${awayName}。截图存证，赛后见分晓！🏆 #FIFA世界杯2026`
  }
  if (lang === 'es') {
    return `¡Mi predicción del campeón del Mundial: ${cFlag} ${championName}! Final: ${hFlag} ${homeName} vs ${aFlag} ${awayName}. ¡Guarda esto — ¡veremos quién tiene razón! 🏆 #FIFAWorldCup2026`
  }
  return `My World Cup champion prediction: ${cFlag} ${championName}! Final: ${hFlag} ${homeName} vs ${aFlag} ${awayName}. Screenshot this — let's see who's right! 🏆 #FIFAWorldCup2026`
}

export function SharePage({ lang }: Props) {
  const [bracketUrl, setBracketUrl] = useState<string | null>(null)
  const [groupStageUrl, setGroupStageUrl] = useState<string | null>(null)
  const [celebrationUrl, setCelebrationUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [captionCopied, setCaptionCopied] = useState(false)

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

    const champion = picks.knockout.find(m => m.matchId === 'FINAL')?.winner ?? null
    const finalHome = picks.knockout.find(m => m.matchId === 'SF_L')?.winner ?? null
    const finalAway = picks.knockout.find(m => m.matchId === 'SF_R')?.winner ?? null
    setCaption(generateCaption(lang, champion, finalHome, finalAway))

    const postJson = (url: string) =>
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(picks) })

    Promise.all([
      // Bracket image
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
  }, [lang])

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
      window.open(url, '_blank')
    }
  }

  async function handleCopyCaption() {
    try {
      await navigator.clipboard.writeText(caption)
      setCaptionCopied(true)
      setTimeout(() => setCaptionCopied(false), 2000)
    } catch {
      // Fallback: select the text element
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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-10">
        <h1 className="text-center text-[#ffd700] text-2xl font-black">🏆 Your Predictions</h1>

        {/* Bracket image */}
        {bracketUrl && (
          <div className="flex flex-col gap-4 items-center">
            <img src={bracketUrl} alt="Your bracket" className="w-full block rounded-xl" style={{ display: 'block' }} />
            <button
              onClick={() => download(bracketUrl, 'wc2026-bracket.png')}
              className="bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black px-8 py-3 rounded-xl hover:scale-105 transition-transform"
            >
              {t(lang, 'downloadBracket')}
            </button>
          </div>
        )}

        {/* Group stage image */}
        {groupStageUrl && (
          <div className="flex flex-col gap-4 items-center">
            <img src={groupStageUrl} alt="Group stage" className="w-full block rounded-xl" style={{ display: 'block' }} />
            <button
              onClick={() => download(groupStageUrl, 'wc2026-groups.png')}
              className="border border-[#ffd700] text-[#ffd700] font-black px-8 py-3 rounded-xl hover:bg-[#ffd700]/10 transition-colors"
            >
              {t(lang, 'downloadGroupStage')}
            </button>
          </div>
        )}

        {/* Celebration image */}
        {celebrationUrl && (
          <div className="flex flex-col items-center gap-4">
            <img src={celebrationUrl} alt="Your celebration" className="w-full max-w-lg block rounded-xl" style={{ display: 'block' }} />
            <button
              onClick={() => download(celebrationUrl, 'wc2026-celebration.png')}
              className="bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black px-8 py-3 rounded-xl hover:scale-105 transition-transform"
            >
              {t(lang, 'downloadCelebration')}
            </button>
          </div>
        )}

        {/* Auto-generated share caption */}
        {caption && (
          <div className="bg-[#0c1526] border border-[#1a2847] rounded-xl p-4">
            <div className="text-[#ffd700] text-xs font-bold uppercase tracking-wider mb-3">
              {lang === 'cn' ? '分享文字' : lang === 'es' ? 'Texto para compartir' : 'Share Caption'}
            </div>
            <p className="text-white text-sm leading-relaxed mb-4 select-all">{caption}</p>
            <button
              onClick={handleCopyCaption}
              className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${
                captionCopied
                  ? 'bg-green-600 text-white'
                  : 'bg-[#1a2847] text-[#ffd700] hover:bg-[#1e3060] border border-[#ffd700]/30'
              }`}
            >
              {captionCopied ? t(lang, 'captionCopied') : t(lang, 'copyCaption')}
            </button>
          </div>
        )}

        {/* WeChat sharing guide */}
        <div className="bg-[#0c1526] border border-[#1a2847] rounded-xl p-4">
          <div className="text-[#ffd700] text-sm font-bold mb-3">
            📱 {t(lang, 'shareGuideTitle')}
          </div>
          <ol className="space-y-2">
            {[t(lang, 'shareStep1'), t(lang, 'shareStep2'), t(lang, 'shareStep3')].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#8a9bc0]">
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-3 pt-3 border-t border-[#1a2847] text-[#4a5a7a] text-xs">
            {t(lang, 'shareHint')}
          </div>
        </div>

        <a href="/" className="text-center text-[#ffd700]/60 text-xs hover:text-[#ffd700] transition-colors">
          ← {lang === 'cn' ? '重新开始预测' : lang === 'es' ? 'Empezar de nuevo' : 'Start a new prediction'}
        </a>
      </div>
    </div>
  )
}
