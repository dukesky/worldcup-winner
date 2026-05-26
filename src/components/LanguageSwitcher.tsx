'use client'
import { useLanguage } from '@/hooks/useLanguage'
import type { Language } from '@/lib/picks'

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  return (
    <div className="flex gap-2">
      {(['en', 'cn', 'es'] as Language[]).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
            lang === l
              ? 'bg-[#ffd700] text-black'
              : 'text-[#ffd700] border border-[#ffd700] hover:bg-[#ffd700]/10'
          }`}
        >
          {l === 'en' ? 'EN' : l === 'cn' ? '中文' : 'ES'}
        </button>
      ))}
    </div>
  )
}
