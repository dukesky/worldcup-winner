import { readFileSync } from 'fs'
import path from 'path'

interface FontSet {
  regular: ArrayBuffer
  bold: ArrayBuffer
}

let cachedFonts: FontSet | null = null

function bufToArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
}

async function fetchFontFromCDN(weight: 400 | 700): Promise<ArrayBuffer> {
  // Inter from jsDelivr @fontsource — served as woff2 (Satori ≥ 0.10 supports woff2)
  const url = weight === 700
    ? 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-700-normal.woff2'
    : 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-400-normal.woff2'
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`CDN font fetch failed: ${resp.status}`)
  return resp.arrayBuffer()
}

export async function loadInterFonts(): Promise<FontSet> {
  if (cachedFonts) return cachedFonts

  // Try local TTF first (the public/Inter-Regular.ttf bundled with the repo)
  try {
    const fontPath = path.join(process.cwd(), 'public', 'Inter-Regular.ttf')
    const buf = readFileSync(fontPath)
    // Sanity-check: valid Inter TTF should be at least 200 KB
    if (buf.byteLength > 200_000) {
      const data = bufToArrayBuffer(buf)
      cachedFonts = { regular: data, bold: data }
      return cachedFonts
    }
  } catch {
    // File missing or unreadable — fall through to CDN
  }

  // Fetch both weights from CDN
  const [regular, bold] = await Promise.all([
    fetchFontFromCDN(400),
    fetchFontFromCDN(700),
  ])
  cachedFonts = { regular, bold }
  return cachedFonts
}

export function makeSatoriFonts(fonts: FontSet) {
  return [
    { name: 'Inter', data: fonts.regular, weight: 400 as const },
    { name: 'Inter', data: fonts.bold,    weight: 500 as const },
    { name: 'Inter', data: fonts.bold,    weight: 600 as const },
    { name: 'Inter', data: fonts.bold,    weight: 700 as const },
    { name: 'Inter', data: fonts.bold,    weight: 800 as const },
  ]
}
