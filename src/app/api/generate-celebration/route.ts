import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { createElement } from 'react'
import { TEAMS } from '@/data/wc2026'
import type { Language, TeamId } from '@/lib/picks'
import { fetchFlagImages } from '@/lib/flags'
import { loadInterFonts, makeSatoriFonts } from '@/lib/image-fonts'
import { CelebrationImageTemplate } from '@/components/bracket-image/CelebrationImageTemplate'

// Used when no photo is uploaded — pure text-to-image
const PROMPT_TEMPLATES: Record<Language, (team: string) => string> = {
  en: (team) => `Cartoon anime-style illustration of a fan joyfully celebrating with the ${team} national football team players. World Cup trophy, colorful confetti, packed stadium crowd in background, vibrant celebratory atmosphere.`,
  cn: (team) => `卡通动漫风格插画，一名球迷与${team}国家足球队球员一起欢庆，背景有世界杯奖杯、彩色纸屑和欢腾的球场观众，欢乐庆典氛围。`,
  es: (team) => `Ilustración estilo caricatura anime de un fanático celebrando con los jugadores del equipo nacional de fútbol de ${team}. Trofeo de la Copa Mundial, confeti colorido, estadio lleno de fanáticos.`,
}

// Used when a photo IS uploaded — instructs the model to use the uploaded subject
const PHOTO_PROMPT_TEMPLATES: Record<Language, (team: string) => string> = {
  en: (team) => `I'm providing an image. Take the main subject from that image (it could be a person, animal, or character — use exactly what's shown) and create a fun cartoon anime-style illustration of that subject joyfully celebrating alongside ${team} national football team players. World Cup trophy, colorful confetti, packed stadium in background. Keep the subject clearly recognizable and prominently featured.`,
  cn: (team) => `我提供了一张图片。请将图中的主体（可以是人、动物或角色——请使用图中实际显示的内容）融入一幅卡通动漫风格的插画中，展示该主体与${team}国家足球队球员一起欢庆的场景。背景有世界杯奖杯、彩色纸屑和欢腾的球场。请保持主体清晰可辨并突出展示。`,
  es: (team) => `Te proporciono una imagen. Toma el sujeto principal de esa imagen (puede ser una persona, animal o personaje — usa exactamente lo que se muestra) y crea una ilustración divertida estilo caricatura anime de ese sujeto celebrando junto a los jugadores del equipo nacional de fútbol de ${team}. Trofeo del Mundial, confeti, estadio lleno. Mantén el sujeto claramente reconocible y destacado.`,
}

// Supports text→image and photo editing via OpenRouter
const MODEL = 'google/gemini-3.1-flash-image-preview'

async function generateSatoriCelebration(
  champion: TeamId,
  lang: Language,
  photoDataUrl?: string
): Promise<string> {
  const [flagImages, fonts] = await Promise.all([
    fetchFlagImages(Object.keys(TEAMS)),
    loadInterFonts(),
  ])

  const svg = await satori(
    createElement(CelebrationImageTemplate, { champion, lang, flagImages, photoDataUrl }),
    {
      width: 750,
      height: 1000,
      fonts: makeSatoriFonts(fonts),
    }
  )

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 750 } })
  const rendered = resvg.render()
  const pngBuffer = rendered.asPng()
  const base64 = Buffer.from(pngBuffer).toString('base64')
  return `data:image/png;base64,${base64}`
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
    const prompt = photo
      ? PHOTO_PROMPT_TEMPLATES[lang](teamName)
      : PROMPT_TEMPLATES[lang](teamName)

    const apiKey = process.env.OPENROUTER_API_KEY

    if (apiKey) {
      try {
        type ContentPart =
          | { type: 'text'; text: string }
          | { type: 'image_url'; image_url: { url: string } }
        const content: ContentPart[] = []
        if (photo) {
          content.push({ type: 'image_url', image_url: { url: photo } })
        }
        content.push({ type: 'text', text: prompt })

        const requestBody = {
          model: MODEL,
          messages: [{ role: 'user', content: content.length === 1 ? prompt : content }],
          modalities: ['image'],
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://worldcup2026.app',
          },
          body: JSON.stringify(requestBody),
        })

        if (response.ok) {
          const data = await response.json()
          const msg = data.choices?.[0]?.message
          let imageUrl: string | null = null

          // Format 1: msg.images array (OpenRouter native)
          if (msg?.images?.[0]?.image_url?.url) {
            imageUrl = msg.images[0].image_url.url
          }
          // Format 2: content array with image_url type
          if (!imageUrl && Array.isArray(msg?.content)) {
            const part = msg.content.find((p: { type: string }) => p.type === 'image_url')
            if (part?.image_url?.url) imageUrl = part.image_url.url
          }
          // Format 3: content array with inline_data (Anthropic/Gemini native)
          if (!imageUrl && Array.isArray(msg?.content)) {
            const part = msg.content.find((p: { type: string }) => p.type === 'image')
            if (part?.source?.data) {
              imageUrl = `data:${part.source.media_type ?? 'image/png'};base64,${part.source.data}`
            }
          }

          if (imageUrl) {
            return NextResponse.json({ imageUrl })
          }
          console.error('Unexpected AI response shape:', JSON.stringify(data).slice(0, 400))
        } else {
          const err = await response.text()
          console.error('OpenRouter error:', response.status, err)
        }
      } catch (aiErr) {
        console.error('AI generation failed, using Satori fallback:', aiErr)
      }
    }

    // Satori fallback — always produces a result
    const imageUrl = await generateSatoriCelebration(championTeam, lang, photo)
    return NextResponse.json({ imageUrl })
  } catch (err) {
    console.error('Celebration generation error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
