'use client'
import { useLanguage } from '@/hooks/useLanguage'
import { SharePage } from '@/components/share/SharePage'
export default function Share() {
  const { lang } = useLanguage()
  return <SharePage lang={lang} />
}
