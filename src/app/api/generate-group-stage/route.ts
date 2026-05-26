import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync } from 'fs'
import path from 'path'
import { createElement } from 'react'
import { GroupStageImageTemplate } from '@/components/bracket-image/GroupStageImageTemplate'
import type { BracketPicks } from '@/lib/picks'
import { fetchFlagImages } from '@/lib/flags'
import { TEAMS } from '@/data/wc2026'

let fontData: ArrayBuffer | null = null
function getFont() {
  if (!fontData) {
    const fontPath = path.join(process.cwd(), 'public', 'Inter-Regular.ttf')
    const buf = readFileSync(fontPath)
    fontData = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
  }
  return fontData
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body || !Array.isArray(body.groups)) {
      return NextResponse.json({ error: 'Invalid picks payload' }, { status: 400 })
    }
    const picks = body as BracketPicks

    const flagImages = await fetchFlagImages(Object.keys(TEAMS))

    const svg = await satori(
      createElement(GroupStageImageTemplate, { picks, flagImages }),
      {
        width: 1200,
        height: 920,
        fonts: [{ name: 'Inter', data: getFont(), weight: 400 }],
      }
    )

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
    const rendered = resvg.render()
    const pngBuffer = rendered.asPng()
    const arrayBuffer = pngBuffer.buffer.slice(
      pngBuffer.byteOffset,
      pngBuffer.byteOffset + pngBuffer.byteLength
    ) as ArrayBuffer

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="wc2026-groups.png"',
      },
    })
  } catch (err) {
    console.error('Group stage generation error:', err)
    return NextResponse.json({ error: 'Failed to generate group stage image' }, { status: 500 })
  }
}
