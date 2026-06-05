import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { createElement } from 'react'
import { ChampionJourneyTemplate } from '@/components/bracket-image/ChampionJourneyTemplate'
import type { BracketPicks, GroupPick } from '@/lib/picks'
import { fetchFlagImages } from '@/lib/flags'
import { TEAMS, R32_SLOTS } from '@/data/wc2026'
import { loadInterFonts, makeSatoriFonts } from '@/lib/image-fonts'

// ---- Path resolution helpers ----

function resolveGroupSlot(slotStr: string, matchId: string, groups: GroupPick[], wildcardSelections: Record<string, string>): string | null {
  // '1E' style
  if (/^\d[A-L]$/.test(slotStr)) {
    const rank = parseInt(slotStr[0]) - 1
    const grp = groups.find(g => g.groupId === slotStr[1])
    return (grp?.ranking[rank] as string) || null
  }
  // wildcard like '3ABCDF'
  return (wildcardSelections[matchId] as string) || null
}

function getMatchParticipants(matchId: string, picks: BracketPicks): [string | null, string | null] {
  const { groups, knockout, wildcardSelections = {} } = picks

  if (matchId.startsWith('R32')) {
    const slot = R32_SLOTS.find(s => s.matchId === matchId)
    if (!slot) return [null, null]
    return [
      resolveGroupSlot(slot.homeSlot, matchId, groups, wildcardSelections),
      resolveGroupSlot(slot.awaySlot, matchId, groups, wildcardSelections),
    ]
  }

  const match = knockout.find(m => m.matchId === matchId)
  if (!match) return [null, null]
  const homeTeam = knockout.find(m => m.matchId === match.homeSlot)?.winner ?? null
  const awayTeam = knockout.find(m => m.matchId === match.awaySlot)?.winner ?? null
  return [homeTeam as string | null, awayTeam as string | null]
}

function getRoundLabel(matchId: string, lang: string): string {
  if (matchId.startsWith('R32')) return lang === 'cn' ? 'R32' : lang === 'es' ? 'OCTAVOS' : 'ROUND OF 32'
  if (matchId.startsWith('R16')) return lang === 'cn' ? 'R16' : lang === 'es' ? 'DIECISEISAVOS' : 'ROUND OF 16'
  if (matchId.startsWith('QF'))  return lang === 'cn' ? '四强' : lang === 'es' ? 'CUARTOS' : 'QUARTER-FINAL'
  if (matchId.startsWith('SF'))  return lang === 'cn' ? '半决赛' : lang === 'es' ? 'SEMIFINAL' : 'SEMI-FINAL'
  return lang === 'cn' ? '决赛' : lang === 'es' ? 'FINAL' : 'FINAL'
}

function getRoundOrder(matchId: string): number {
  if (matchId.startsWith('R32')) return 1
  if (matchId.startsWith('R16')) return 2
  if (matchId.startsWith('QF'))  return 3
  if (matchId.startsWith('SF'))  return 4
  return 5
}

function buildChampionPath(picks: BracketPicks) {
  const { knockout } = picks
  const champion = knockout.find(m => m.matchId === 'FINAL')?.winner
  if (!champion) return null

  const lang = picks.language === 'cn' ? 'cn' : picks.language === 'es' ? 'es' : 'en'

  const path = knockout
    .filter(m => m.winner === champion)
    .sort((a, b) => getRoundOrder(a.matchId) - getRoundOrder(b.matchId))
    .map(m => {
      const [homeTeam, awayTeam] = getMatchParticipants(m.matchId, picks)
      const isChampHome = homeTeam === champion
      const opponent = isChampHome ? awayTeam : homeTeam
      return {
        roundLabel: getRoundLabel(m.matchId, lang),
        opponent: opponent as string | null,
        isChampHome,
        score: m.score,
      }
    })

  return { champion: champion as string, path }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body || !Array.isArray(body.groups) || !Array.isArray(body.knockout)) {
      return NextResponse.json({ error: 'Invalid picks payload' }, { status: 400 })
    }
    const picks = body as BracketPicks
    const imagePicks = picks.language === 'cn' ? { ...picks, language: 'en' as const } : picks

    const resolved = buildChampionPath(imagePicks)
    if (!resolved) {
      return NextResponse.json({ error: 'No champion selected' }, { status: 400 })
    }

    const [flagImages, fonts] = await Promise.all([
      fetchFlagImages(Object.keys(TEAMS)),
      loadInterFonts(),
    ])

    const svg = await satori(
      createElement(ChampionJourneyTemplate, {
        champion: resolved.champion,
        path: resolved.path,
        lang: imagePicks.language,
        flagImages,
      }),
      { width: 750, height: 560, fonts: makeSatoriFonts(fonts) }
    )

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 750 } })
    const rendered = resvg.render()
    const pngBuffer = rendered.asPng()
    const arrayBuffer = pngBuffer.buffer.slice(
      pngBuffer.byteOffset,
      pngBuffer.byteOffset + pngBuffer.byteLength
    ) as ArrayBuffer

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="wc2026-journey.png"',
      },
    })
  } catch (err) {
    console.error('Journey generation error:', err)
    return NextResponse.json({ error: 'Failed to generate journey image' }, { status: 500 })
  }
}
