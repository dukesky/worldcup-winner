'use client'
import { useEffect, useRef, useState } from 'react'
import { TEAMS } from '@/data/wc2026'
import { t } from '@/lib/i18n'
import type { Language, TeamId } from '@/lib/picks'

interface Props {
  champion: TeamId
  lang: Language
  onPhotoReady: (dataUrl: string | undefined) => void
}

export function ChampionReveal({ champion, lang, onPhotoReady }: Props) {
  const team = TEAMS[champion]
  const [photo, setPhoto] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    import('canvas-confetti').then(m => {
      if (cancelled) return
      m.default({
        particleCount: 150,
        spread: 80,
        colors: ['#ffd700', '#ff8c00', '#ffffff', '#4caf50'],
        origin: { y: 0.6 },
      })
    })
    return () => { cancelled = true }
  }, [])

  function handleFile(file: File) {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const maxSize = 800
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        } else {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
      URL.revokeObjectURL(url)
      setPhoto(dataUrl)
    }
    img.src = url
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="text-[#ffd700] text-xs font-bold tracking-[4px] uppercase mb-4">
        {t(lang, 'yourChampion')}
      </div>
      <div className="text-8xl mb-4">{team?.flag}</div>
      <h2 className="text-4xl font-black text-white mb-2">
        {lang === 'cn' ? team?.nameZh : lang === 'es' ? team?.nameEs : team?.name}
      </h2>
      <div className="text-[#ffd700] text-2xl mb-8">🏆</div>

      <div className="mb-8 w-full max-w-xs">
        <p className="text-white/70 text-sm mb-3">
          {lang === 'cn' ? '添加你的自拍（可选）' : lang === 'es' ? 'Añade tu selfie (opcional)' : 'Add your selfie (optional)'}
        </p>
        {photo && (
          <img
            src={photo}
            alt="selfie preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-[#ffd700] mx-auto mb-3"
          />
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => fileRef.current?.click()}
            className="bg-white/10 text-white text-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            📁 {lang === 'cn' ? '从相册上传' : lang === 'es' ? 'Subir foto' : 'Upload photo'}
          </button>
          <button
            onClick={() => cameraRef.current?.click()}
            className="bg-white/10 text-white text-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            📷 {lang === 'cn' ? '拍照' : lang === 'es' ? 'Tomar selfie' : 'Take selfie'}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>

      <button
        onClick={() => onPhotoReady(photo ?? undefined)}
        className="bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black text-lg px-10 py-4 rounded-xl hover:scale-105 transition-transform"
      >
        {lang === 'cn' ? '生成我的预测 →' : lang === 'es' ? 'Generar mi predicción →' : 'Generate My Bracket →'}
      </button>
    </div>
  )
}
