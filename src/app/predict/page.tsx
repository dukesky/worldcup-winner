'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePredictions } from '@/hooks/usePredictions'
import { useLanguage } from '@/hooks/useLanguage'
import { GroupStagePicker } from '@/components/group-stage/GroupStagePicker'
import { ChampionReveal } from '@/components/champion/ChampionReveal'
import { PhotoCapture } from '@/components/champion/PhotoCapture'
import { KnockoutOverview } from '@/components/knockout/KnockoutOverview'
import { QuadrantView } from '@/components/knockout/QuadrantView'
import { FinalFourView } from '@/components/knockout/FinalFourView'

type Step = 'groups' | 'knockout' | 'final-four' | 'champion' | 'photo'
type QuadrantId = 'UL' | 'LL' | 'UR' | 'LR'
type KnockoutView = 'overview' | QuadrantId

export default function PredictPage() {
  const [step, setStep] = useState<Step>('groups')
  const [knockoutView, setKnockoutView] = useState<KnockoutView>('overview')
  const { lang } = useLanguage()
  const router = useRouter()
  const {
    groups, knockout, r32Matchups, champion, wildcardSelections,
    setGroupRanking, setGroupScore, setKnockoutWinner, setKnockoutScore, setWildcardSelection,
  } = usePredictions()

  function handlePhotoReady(dataUrl: string | undefined) {
    sessionStorage.setItem('wc2026_picks', JSON.stringify({
      groups, knockout, language: lang, photoDataUrl: dataUrl, wildcardSelections,
    }))
    router.push('/share')
  }

  if (step === 'groups') {
    return (
      <GroupStagePicker
        picks={groups}
        lang={lang}
        onRankingChange={setGroupRanking}
        onScoreChange={setGroupScore}
        onComplete={() => { setStep('knockout'); setKnockoutView('overview') }}
        onBack={() => router.push('/')}
      />
    )
  }

  if (step === 'knockout') {
    if (knockoutView !== 'overview') {
      return (
        <QuadrantView
          quadrant={knockoutView as QuadrantId}
          r32Matchups={r32Matchups}
          knockoutPicks={knockout}
          wildcardSelections={wildcardSelections}
          lang={lang}
          onWinnerSelect={setKnockoutWinner}
          onScoreChange={setKnockoutScore}
          onWildcardSelect={setWildcardSelection}
          onBack={() => setKnockoutView('overview')}
        />
      )
    }
    return (
      <KnockoutOverview
        r32Matchups={r32Matchups}
        knockoutPicks={knockout}
        wildcardSelections={wildcardSelections}
        lang={lang}
        onSelectQuadrant={(q) => setKnockoutView(q)}
        onBack={() => setStep('groups')}
        onProceedFinalFour={() => setStep('final-four')}
      />
    )
  }

  if (step === 'final-four') {
    return (
      <FinalFourView
        knockoutPicks={knockout}
        wildcardSelections={wildcardSelections}
        r32Matchups={r32Matchups}
        lang={lang}
        onWinnerSelect={setKnockoutWinner}
        onBack={() => { setStep('knockout'); setKnockoutView('overview') }}
        onChampionSelected={() => setStep('champion')}
      />
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
