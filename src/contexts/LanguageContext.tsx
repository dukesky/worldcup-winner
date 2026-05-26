'use client'
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Language } from '@/lib/picks'

const STORAGE_KEY = 'wc2026_lang'

interface LanguageContextValue {
  lang: Language
  setLang: (l: Language) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en'
    const stored = localStorage.getItem(STORAGE_KEY)
    return (stored === 'en' || stored === 'cn' || stored === 'es') ? stored : 'en'
  })

  const setLang = useCallback((l: Language) => {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
