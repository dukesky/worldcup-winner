'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePredictions } from '@/hooks/usePredictions'
import { useLanguage } from '@/hooks/useLanguage'
import { GroupStagePicker } from '@/components/group-stage/GroupStagePicker'
import { KnockoutBracket } from '@/components/knockout/KnockoutBracket'
import { ChampionReveal } from '@/components/champion/ChampionReveal'
import { PhotoCapture } from '@/components/champion/PhotoCapture'

type Step = 'groups' | 'knockout' | 'champion' | 'photo'

export default function PredictPage() {
  const [step, setStep] = useState<Step>('groups')
  const { lang } = useLanguage()
  const router = useRouter()
  const {
    groups, knockout, r32Matchups, champion,
    setGroupRanking, setGroupScore, setKnockoutWinner, setKnockoutScore,
    setPhotoDataUrl,
  } = usePredictions()

  async function handlePhotoReady(dataUrl: string | undefined) {
    setPhotoDataUrl(dataUrl)
    // Navigate to share page, passing picks via sessionStorage
    sessionStorage.setItem('wc2026_picks', JSON.stringify({ groups, knockout, language: lang, photoDataUrl: dataUrl }))
    router.push('/share')
  }

  if (step === 'groups') {
    return (
      <GroupStagePicker
        picks={groups}
        lang={lang}
        onRankingChange={setGroupRanking}
        onScoreChange={setGroupScore}
        onComplete={() => setStep('knockout')}
      />
    )
  }

  if (step === 'knockout') {
    return (
      <div className="py-6 px-2">
        <div className="text-center mb-6">
          <h2 className="text-[#ffd700] text-lg font-bold">Knockout Bracket</h2>
          <p className="text-[#8a9bc0] text-sm mt-1">Pick the winner of each match. Select the Final winner to complete your bracket.</p>
        </div>
        <KnockoutBracket
          r32Matchups={r32Matchups}
          knockoutPicks={knockout}
          lang={lang}
          championTeamId={champion}
          onWinnerSelect={(matchId, winner) => {
            setKnockoutWinner(matchId, winner)
            if (matchId === 'FINAL') setStep('champion')
          }}
        />
      </div>
    )
  }

  if (step === 'champion' && champion) {
    return <ChampionReveal champion={champion} lang={lang} onContinue={() => setStep('photo')} />
  }

  if (step === 'photo') {
    return <PhotoCapture lang={lang} onPhotoReady={handlePhotoReady} />
  }

  return null
}
