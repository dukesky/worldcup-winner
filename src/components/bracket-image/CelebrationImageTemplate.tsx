import { TEAMS } from '@/data/wc2026'
import type { TeamId, Language } from '@/lib/picks'
import { getTeamName } from '@/lib/i18n'

const GOLD = '#ffd700'
const DARK = '#060b18'

interface Props {
  champion: TeamId
  lang: Language
  flagImages: Record<string, string>
  photoDataUrl?: string
}

export function CelebrationImageTemplate({ champion, lang, flagImages, photoDataUrl }: Props) {
  const team = TEAMS[champion]
  const name = team ? getTeamName(team, lang) : champion
  const flagSrc = champion ? (flagImages[champion] ?? '') : ''

  const subtitle =
    lang === 'cn' ? '我的世界杯冠军预测' :
    lang === 'es' ? 'MI PREDICCIÓN DE CAMPEÓN' :
    'MY WORLD CUP CHAMPION PICK'

  const tagline =
    lang === 'cn' ? '2026 FIFA 世界杯 · 截图存证' :
    lang === 'es' ? 'FIFA COPA MUNDIAL 2026' :
    'FIFA WORLD CUP 2026'

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(160deg, #060b18 0%, #0d1a30 40%, #060b18 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter',
      position: 'relative',
    }}>
      {/* Decorative corner stars */}
      <div style={{ position: 'absolute', top: 20, left: 20, fontSize: 24, display: 'flex', opacity: 0.4 }}>⭐</div>
      <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 24, display: 'flex', opacity: 0.4 }}>⭐</div>
      <div style={{ position: 'absolute', bottom: 20, left: 20, fontSize: 24, display: 'flex', opacity: 0.4 }}>⭐</div>
      <div style={{ position: 'absolute', bottom: 20, right: 20, fontSize: 24, display: 'flex', opacity: 0.4 }}>⭐</div>

      {/* Gold border frame */}
      <div style={{
        position: 'absolute',
        top: 12, left: 12, right: 12, bottom: 12,
        border: `2px solid ${GOLD}30`,
        borderRadius: 20,
        display: 'flex',
      }} />

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, padding: '40px 60px' }}>

        {/* Trophy emoji */}
        <div style={{ fontSize: 64, display: 'flex', marginBottom: 10 }}>🏆</div>

        {/* Title */}
        <div style={{
          color: GOLD,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 5,
          textAlign: 'center',
          marginBottom: 32,
          display: 'flex',
        }}>
          {tagline}
        </div>

        {/* Photo + Flag row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 32 }}>
          {photoDataUrl && (
            <div style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              overflow: 'hidden',
              border: `3px solid ${GOLD}`,
              display: 'flex',
              flexShrink: 0,
            }}>
              <img src={photoDataUrl} width={120} height={120} style={{ objectFit: 'cover' }} />
            </div>
          )}
          {flagSrc ? (
            <img src={flagSrc} width={180} height={120} style={{ borderRadius: 10, objectFit: 'cover', border: `4px solid ${GOLD}` }} />
          ) : (
            <div style={{ width: 180, height: 120, background: '#1a2847', borderRadius: 10, border: `4px solid ${GOLD}` , display: 'flex'}} />
          )}
        </div>

        {/* Champion name */}
        <div style={{
          color: '#ffffff',
          fontSize: 64,
          fontWeight: 800,
          textAlign: 'center',
          lineHeight: 1.1,
          marginBottom: 16,
          display: 'flex',
        }}>
          {name}
        </div>

        {/* Subtitle */}
        <div style={{
          color: GOLD,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 4,
          textAlign: 'center',
          display: 'flex',
        }}>
          {subtitle}
        </div>

        {/* Divider */}
        <div style={{
          width: 200,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${GOLD}80, transparent)`,
          marginTop: 20,
          display: 'flex',
        }} />

        {/* Footer */}
        <div style={{ color: '#3a4a6a', fontSize: 12, marginTop: 16, letterSpacing: 2, display: 'flex' }}>
          worldcup2026.app
        </div>
      </div>
    </div>
  )
}
