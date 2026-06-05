'use client'
import { useEffect, useRef, useState } from 'react'
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

  const url = 'worldcup-winner.vercel.app'
  if (lang === 'cn') {
    return `我预测的世界杯冠军是：${cFlag} ${championName}！决赛对阵：${hFlag} ${homeName} vs ${aFlag} ${awayName}。截图存证，赛后见分晓！🏆 ${url} #FIFA世界杯2026`
  }
  if (lang === 'es') {
    return `¡Mi predicción del campeón del Mundial: ${cFlag} ${championName}! Final: ${hFlag} ${homeName} vs ${aFlag} ${awayName}. ¡Guarda esto! 🏆 ${url} #FIFAWorldCup2026`
  }
  return `My World Cup champion prediction: ${cFlag} ${championName}! Final: ${hFlag} ${homeName} vs ${aFlag} ${awayName}. Let's see who's right! 🏆 ${url} #FIFAWorldCup2026`
}

function compressPhoto(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 800
      const scale = Math.min(1, MAX / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.src = dataUrl
  })
}

function encodePicks(picks: BracketPicks): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { photoDataUrl: _photo, ...rest } = picks
  return btoa(encodeURIComponent(JSON.stringify(rest)))
}

function decodePicks(b64: string): BracketPicks | null {
  try {
    return JSON.parse(decodeURIComponent(atob(b64))) as BracketPicks
  } catch {
    return null
  }
}

export function SharePage({ lang }: Props) {
  const [bracketUrl, setBracketUrl] = useState<string | null>(null)
  const [groupStageUrl, setGroupStageUrl] = useState<string | null>(null)
  const [celebrationUrl, setCelebrationUrl] = useState<string | null>(null)
  const [journeyUrl, setJourneyUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [captionCopied, setCaptionCopied] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)
  const [champion, setChampion] = useState<TeamId | null>(null)
  const [loadedPicks, setLoadedPicks] = useState<BracketPicks | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // 1. Check URL for shared bracket
    const urlParams = new URLSearchParams(window.location.search)
    const b64Param = urlParams.get('b')
    let picks: BracketPicks | null = null

    if (b64Param) {
      picks = decodePicks(b64Param)
    }

    // 2. Fall back to localStorage
    if (!picks) {
      const stored = localStorage.getItem('wc2026_picks')
      if (!stored) {
        setError('No picks found — please start from the beginning.')
        setLoading(false)
        return
      }
      try {
        picks = JSON.parse(stored)
      } catch {
        setError('Could not read your picks — please try again.')
        setLoading(false)
        return
      }
    }

    if (!picks) {
      setError('Could not read picks — please try again.')
      setLoading(false)
      return
    }

    setLoadedPicks(picks)

    const champion = picks.knockout.find(m => m.matchId === 'FINAL')?.winner ?? null
    const finalHome = picks.knockout.find(m => m.matchId === 'SF_L')?.winner ?? null
    const finalAway = picks.knockout.find(m => m.matchId === 'SF_R')?.winner ?? null
    setChampion(champion)
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

      // Journey image
      postJson('/api/generate-journey')
        .then(r => r.ok ? r.blob() : null)
        .then(b => b ? URL.createObjectURL(b) : null),
    ])
      .then(([bracket, groupStage, celebration, journey]) => {
        setBracketUrl(bracket)
        setGroupStageUrl(groupStage)
        setCelebrationUrl(celebration)
        setJourneyUrl(journey)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [lang])

  async function handlePhotoChange(file: File | undefined) {
    if (!file || !champion) return
    setRegenLoading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const raw = e.target?.result as string
        const compressed = await compressPhoto(raw)
        // Update localStorage so the photo persists on next visit
        const stored = localStorage.getItem('wc2026_picks')
        if (stored) {
          const picks = JSON.parse(stored)
          picks.photoDataUrl = compressed
          localStorage.setItem('wc2026_picks', JSON.stringify(picks))
        }
        const res = await fetch('/api/generate-celebration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo: compressed, championTeam: champion, language: lang }),
        })
        const d = res.ok ? await res.json() : null
        setCelebrationUrl(d?.imageUrl ?? null)
      } catch {
        // silently keep old celebration if regen fails
      } finally {
        setRegenLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleNativeShare() {
    if (!celebrationUrl && !bracketUrl) return

    async function buildCombinedImage(): Promise<string | null> {
      const loadImg = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
        const img = new Image()
        img.onload = () => res(img)
        img.onerror = rej
        img.crossOrigin = 'anonymous'
        img.src = src
      })

      // Use journey as primary; fall back to bracket if journey failed
      const primaryUrl = journeyUrl ?? bracketUrl
      if (!primaryUrl && !celebrationUrl) return null

      const [primaryImg, celebrationImg] = await Promise.all([
        primaryUrl ? loadImg(primaryUrl) : Promise.resolve(null),
        celebrationUrl ? loadImg(celebrationUrl) : Promise.resolve(null),
      ])

      const W = 750
      const FOOTER_H = 56

      // Primary image (journey or bracket) — scale to W
      let primaryH = 0
      if (primaryImg) {
        primaryH = Math.round(W * primaryImg.naturalHeight / primaryImg.naturalWidth)
      }

      // Celebration — scale to max W, max 700px tall
      let celebW = 0
      let celebH = 0
      const CELEB_GAP = primaryImg && celebrationImg ? 16 : 0
      if (celebrationImg) {
        const maxCelebH = 700
        const scaleByW = W / celebrationImg.naturalWidth
        const scaleByH = maxCelebH / celebrationImg.naturalHeight
        const scale = Math.min(scaleByW, scaleByH, 1)
        celebW = Math.round(celebrationImg.naturalWidth * scale)
        celebH = Math.round(celebrationImg.naturalHeight * scale)
      }

      const totalH = primaryH + CELEB_GAP + celebH + FOOTER_H

      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = totalH
      const ctx = canvas.getContext('2d')!

      ctx.fillStyle = '#060b18'
      ctx.fillRect(0, 0, W, totalH)

      if (primaryImg) {
        ctx.drawImage(primaryImg, 0, 0, W, primaryH)
      }

      if (celebrationImg && celebW > 0) {
        const cx = Math.round((W - celebW) / 2)
        ctx.drawImage(celebrationImg, cx, primaryH + CELEB_GAP, celebW, celebH)
      }

      // Footer
      const footerY = totalH - FOOTER_H
      ctx.fillStyle = 'rgba(6,11,24,0.92)'
      ctx.fillRect(0, footerY, W, FOOTER_H)
      ctx.fillStyle = '#ffd70040'
      ctx.fillRect(0, footerY, W, 1)
      ctx.fillStyle = '#ffd700'
      ctx.font = `bold ${Math.round(FOOTER_H * 0.40)}px system-ui,-apple-system,sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('worldcup-winner.vercel.app  ·  #FIFAWorldCup2026', W / 2, footerY + FOOTER_H / 2)

      return canvas.toDataURL('image/jpeg', 0.90)
    }

    async function urlToFile(url: string, filename: string): Promise<File> {
      if (url.startsWith('data:')) {
        const [meta, b64] = url.split(',')
        const mime = meta.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
        const bytes = atob(b64)
        const arr = new Uint8Array(bytes.length)
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
        return new File([arr], filename, { type: mime })
      }
      const blob = await fetch(url).then(r => r.blob())
      return new File([blob], filename, { type: blob.type })
    }

    try {
      // Build the combined image; fall back to celebration or bracket alone if canvas fails
      const combined = await buildCombinedImage().catch(() => null)
      const primaryUrl = combined ?? celebrationUrl ?? bracketUrl!

      const file = await urlToFile(primaryUrl, 'wc2026-predictions.jpg')
      const baseData = { title: 'FIFA World Cup 2026 Prediction', text: caption }
      const shareData: ShareData = { ...baseData, files: [file] }

      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
        return
      }
      if (navigator.share) {
        await navigator.share(baseData)
        return
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }

    navigator.clipboard?.writeText(caption)
    setCaptionCopied(true)
    setTimeout(() => setCaptionCopied(false), 2000)
  }

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

  function handleCopyLink() {
    if (!loadedPicks) return
    const encoded = encodePicks(loadedPicks)
    const url = `${window.location.origin}/share?b=${encoded}`
    navigator.clipboard?.writeText(url).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2500)
    })
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

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-10">
        <h1 className="text-center text-[#ffd700] text-2xl font-black">🏆 Your Predictions</h1>

        {/* One-tap share button */}
        {canNativeShare && (celebrationUrl || bracketUrl) && (
          <button
            onClick={handleNativeShare}
            className="w-full bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black py-4 rounded-2xl text-lg hover:scale-105 transition-transform shadow-lg"
          >
            {lang === 'cn' ? '📤 一键分享 (微信 / iMessage)' : lang === 'es' ? '📤 Compartir (WeChat / iMessage)' : '📤 Share (WeChat / iMessage)'}
          </button>
        )}

        {caption && (
          <button
            onClick={() => {
              window.open(
                `https://x.com/intent/tweet?text=${encodeURIComponent(caption)}`,
                '_blank',
                'noopener,noreferrer'
              )
            }}
            className="w-full bg-black border border-[#ffffff20] text-white font-black py-3.5 rounded-2xl text-base hover:bg-[#111] transition-colors flex items-center justify-center gap-2"
          >
            <span style={{ fontFamily: 'monospace', fontWeight: 900 }}>𝕏</span>
            {lang === 'cn' ? '分享到 X' : lang === 'es' ? 'Compartir en X' : 'Share to X'}
          </button>
        )}

        {/* Bracket image */}
        {bracketUrl && (
          <div className="flex flex-col gap-4 items-center">
            <img src={bracketUrl} alt="Your bracket" className="w-full block rounded-xl" style={{ display: 'block' }} />
            <button
              onClick={() => download(bracketUrl, 'wc2026-bracket.png')}
              className="border border-[#ffd700] text-[#ffd700] font-black px-8 py-3 rounded-xl hover:bg-[#ffd700]/10 transition-colors"
            >
              {t(lang, 'downloadBracket')}
            </button>
          </div>
        )}

        {/* Journey image */}
        {journeyUrl && (
          <div className="flex flex-col gap-4 items-center">
            <img src={journeyUrl} alt="Champion's road" className="w-full max-w-sm block rounded-xl" />
            <button
              onClick={() => download(journeyUrl, 'wc2026-champion-road.png')}
              className="border border-[#ffd700] text-[#ffd700] font-black px-8 py-3 rounded-xl hover:bg-[#ffd700]/10 transition-colors"
            >
              {lang === 'cn' ? '下载夺冠之路' : lang === 'es' ? 'Descargar camino al título' : 'Download Champion\'s Road'}
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
        {champion && (
          <div className="flex flex-col items-center gap-4">
            {celebrationUrl && (
              <img src={celebrationUrl} alt="Your celebration" className="w-full max-w-lg block rounded-xl" style={{ display: 'block' }} />
            )}

            {/* Hidden file inputs */}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhotoChange(e.target.files?.[0])} />
            <input ref={cameraRef} type="file" accept="image/*" capture="user" className="hidden" onChange={e => handlePhotoChange(e.target.files?.[0])} />

            <div className="flex flex-wrap justify-center gap-3">
              {celebrationUrl && (
                <button
                  onClick={() => download(celebrationUrl, 'wc2026-celebration.png')}
                  className="bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black px-8 py-3 rounded-xl hover:scale-105 transition-transform"
                >
                  {t(lang, 'downloadCelebration')}
                </button>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={regenLoading}
                className="border border-[#ffd700]/60 text-[#ffd700]/80 text-sm font-bold px-5 py-3 rounded-xl hover:bg-[#ffd700]/10 transition-colors disabled:opacity-40"
              >
                {regenLoading ? '⏳' : celebrationUrl ? (lang === 'cn' ? '换张照片' : lang === 'es' ? 'Cambiar foto' : 'Change photo') : (lang === 'cn' ? '上传照片' : lang === 'es' ? 'Subir foto' : 'Upload photo')}
              </button>
              <button
                onClick={() => cameraRef.current?.click()}
                disabled={regenLoading}
                className="border border-[#ffd700]/60 text-[#ffd700]/80 text-sm font-bold px-5 py-3 rounded-xl hover:bg-[#ffd700]/10 transition-colors disabled:opacity-40"
              >
                {lang === 'cn' ? '拍自拍' : lang === 'es' ? 'Tomar selfie' : 'Take selfie'}
              </button>
            </div>

            {regenLoading && (
              <p className="text-[#8a9bc0] text-sm animate-pulse">
                {lang === 'cn' ? '正在生成庆典图...' : lang === 'es' ? 'Generando imagen...' : 'Generating your celebration image…'}
              </p>
            )}
          </div>
        )}

        {/* Copy shareable link button */}
        {loadedPicks && (
          <button
            onClick={handleCopyLink}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              linkCopied
                ? 'bg-green-600 text-white'
                : 'bg-[#0c1526] border border-[#ffd700]/40 text-[#ffd700] hover:bg-[#ffd700]/10'
            }`}
          >
            {linkCopied
              ? (lang === 'cn' ? '✓ 链接已复制！' : lang === 'es' ? '✓ ¡Enlace copiado!' : '✓ Link Copied!')
              : (lang === 'cn' ? '🔗 复制分享链接' : lang === 'es' ? '🔗 Copiar enlace' : '🔗 Copy Shareable Link')}
          </button>
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
