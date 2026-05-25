'use client'
import { useRef, useState } from 'react'
import { t } from '@/lib/i18n'
import type { Language } from '@/lib/picks'

interface Props {
  lang: Language
  onPhotoReady: (dataUrl: string | undefined) => void
}

export function PhotoCapture({ lang, onPhotoReady }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function handleFile(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      const url = e.target?.result as string
      setPreview(url)
      onPhotoReady(url)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-8 flex flex-col items-center gap-6">
      <h2 className="text-white text-xl font-bold text-center">{t(lang, 'addSelfie')}</h2>

      {preview && (
        <img src={preview} alt="Your photo" className="w-40 h-40 rounded-full object-cover border-4 border-[#ffd700]" />
      )}

      <div className="flex flex-col gap-3 w-full">
        {/* Upload from device */}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border border-[#ffd700] text-[#ffd700] font-bold py-3 rounded-xl hover:bg-[#ffd700]/10 transition-colors"
        >
          {t(lang, 'uploadPhoto')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />

        {/* Camera capture (mobile) */}
        <button
          onClick={() => cameraRef.current?.click()}
          className="w-full border border-[#ffd700] text-[#ffd700] font-bold py-3 rounded-xl hover:bg-[#ffd700]/10 transition-colors"
        >
          {t(lang, 'takePhoto')}
        </button>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />

        {/* Skip */}
        <button
          onClick={() => onPhotoReady(undefined)}
          className="w-full text-[#8a9bc0] text-sm py-2 underline hover:text-white transition-colors"
        >
          {t(lang, 'skipPhoto')}
        </button>
      </div>
    </div>
  )
}
