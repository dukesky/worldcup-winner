import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync } from 'fs'
import path from 'path'
import { createElement } from 'react'
import { BracketImageTemplate } from '@/components/bracket-image/BracketImageTemplate'
import type { BracketPicks } from '@/lib/picks'

let fontData: ArrayBuffer | null = null
function getFont() {
  if (!fontData) {
    const fontPath = path.join(process.cwd(), 'public', 'Inter-Regular.ttf')
    fontData = readFileSync(fontPath).buffer as ArrayBuffer
  }
  return fontData
}

export async function POST(req: NextRequest) {
  try {
    const picks: BracketPicks = await req.json()

    const svg = await satori(
      createElement(BracketImageTemplate, { picks }),
      {
        width: 1400,
        height: 480,
        fonts: [{ name: 'Inter', data: getFont(), weight: 400 }],
      }
    )

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1400 } })
    const rendered = resvg.render()
    const pngBuffer = rendered.asPng()
    // Copy into a plain ArrayBuffer to satisfy strict BodyInit typings
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
