import { NextRequest, NextResponse } from 'next/server'
import { TEAMS } from '@/data/wc2026'
import type { Language, TeamId } from '@/lib/picks'

const PROMPT_TEMPLATES: Record<Language, (team: string) => string> = {
  en: (team) => `Cartoon anime-style illustration of a person joyfully celebrating with the ${team} national football team players. World Cup trophy, colorful confetti, packed stadium crowd in background, vibrant celebratory atmosphere. Person is prominently featured alongside the team.`,
  cn: (team) => `卡通动漫风格插画，一个人与${team}国家足球队球员一起欢庆，背景有世界杯奖杯、彩色纸屑和欢腾的球场观众，欢乐庆典氛围。`,
  es: (team) => `Ilustración estilo caricatura anime de una persona celebrando con los jugadores del equipo nacional de fútbol de ${team}. Trofeo de la Copa Mundial, confeti colorido, estadio lleno de fanáticos, atmósfera de celebración vibrante.`,
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body || typeof body.championTeam !== 'string') {
      return NextResponse.json({ error: 'Missing championTeam' }, { status: 400 })
    }

    const { photo, championTeam, language }: {
      photo?: string
      championTeam: TeamId
      language: Language
    } = body

    const team = TEAMS[championTeam]
    if (!team) return NextResponse.json({ error: 'Unknown team' }, { status: 400 })

    const lang: Language = (['en', 'cn', 'es'] as Language[]).includes(language) ? language : 'en'
    const teamName = lang === 'cn' ? team.nameZh : lang === 'es' ? team.nameEs : team.name
    const prompt = PROMPT_TEMPLATES[lang](teamName)

    // Use flux for text-to-image (no photo), gpt-image-1 for image editing (with photo)
    const model = photo ? 'openai/gpt-image-1' : 'black-forest-labs/flux-1.1-pro'

    const requestBody: Record<string, unknown> = {
      model,
      prompt,
      n: 1,
      size: '1024x1024',
    }

    // Include reference photo if provided
    if (photo) {
      requestBody.image = photo
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY not set')
      return NextResponse.json({ error: 'Image generation not configured' }, { status: 503 })
    }

    const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://worldcup2026.vercel.app',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenRouter error:', response.status, err)
      return NextResponse.json({ error: 'Image generation failed' }, { status: 502 })
    }

    const data = await response.json()
    const raw = data.data?.[0]
    const imageUrl: string | null =
      raw?.url ?? (raw?.b64_json ? `data:image/png;base64,${raw.b64_json}` : null)

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image returned' }, { status: 502 })
    }

    return NextResponse.json({ imageUrl })
  } catch (err) {
    console.error('Celebration generation error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
