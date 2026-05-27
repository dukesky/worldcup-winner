import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { createElement } from 'react'
import { BracketImageTemplate } from '@/components/bracket-image/BracketImageTemplate'
import type { BracketPicks } from '@/lib/picks'
import { fetchFlagImages } from '@/lib/flags'
import { TEAMS } from '@/data/wc2026'
import { loadInterFonts, makeSatoriFonts } from '@/lib/image-fonts'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body || !Array.isArray(body.groups) || !Array.isArray(body.knockout)) {
      return NextResponse.json({ error: 'Invalid picks payload' }, { status: 400 })
    }
    const picks = body as BracketPicks
    // Inter has no CJK glyphs — Chinese names render as boxes, so force English for 'cn'
    const imagePicks = picks.language === 'cn' ? { ...picks, language: 'en' as const } : picks

    const [flagImages, fonts] = await Promise.all([
      fetchFlagImages(Object.keys(TEAMS)),
      loadInterFonts(),
    ])

    const svg = await satori(
      createElement(BracketImageTemplate, { picks: imagePicks, flagImages }),
      {
        width: 3200,
        height: 1440,
        fonts: makeSatoriFonts(fonts),
      }
    )

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 3200 } })
    const rendered = resvg.render()
    const pngBuffer = rendered.asPng()
    const arrayBuffer = pngBuffer.buffer.slice(
      pngBuffer.byteOffset,
      pngBuffer.byteOffset + pngBuffer.byteLength
    ) as ArrayBuffer

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="wc2026-bracket.png"',
      },
    })
  } catch (err) {
    console.error('Bracket generation error:', err)
    return NextResponse.json({ error: 'Failed to generate bracket' }, { status: 500 })
  }
}
