'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Language } from '@/lib/picks'

const STORAGE_KEY = 'wc2026_lang'

export function useLanguage() {
  const [lang, setLangState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null
    if (saved && ['en', 'cn', 'es'].includes(saved)) setLangState(saved)
  }, [])

  const setLang = useCallback((l: Language) => {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }, [])

  return { lang, setLang }
}
