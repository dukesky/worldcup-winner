'use client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

export function LandingPage() {
  const router = useRouter()
  const { lang } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
      {/* Hero */}
      <div className="text-center max-w-lg">
        <div className="text-[#ffd700] text-xs font-bold tracking-[4px] uppercase mb-4">
          FIFA
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-2 leading-tight">
          {t(lang, 'appTitle')}
        </h1>
        <p className="text-[#8a9bc0] text-lg mb-10">
          {t(lang, 'appSubtitle')}
        </p>

        {/* Image teasers */}
        <div className="flex gap-3 justify-center mb-10">
          <div className="bg-[#0d1529] border border-[#1e2d50] rounded-lg p-3 text-left w-36">
            <div className="text-[#ffd700] text-[9px] font-bold mb-1">IMAGE 1</div>
            <div className="text-white text-[10px]">Your full bracket prediction</div>
          </div>
          <div className="bg-[#0d1529] border border-[#1e2d50] rounded-lg p-3 text-left w-36">
            <div className="text-[#ffd700] text-[9px] font-bold mb-1">IMAGE 2</div>
            <div className="text-white text-[10px]">You celebrating with the winners</div>
          </div>
        </div>

        <button
          onClick={() => router.push('/predict')}
          className="bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black font-black text-xl px-12 py-4 rounded-xl hover:scale-105 transition-transform shadow-lg"
        >
          {t(lang, 'start')}
        </button>
      </div>
    </div>
  )
}
