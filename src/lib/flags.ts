export const FLAG_ISO: Record<string, string> = {
  MEX: 'mx',  ZAF: 'za',     KOR: 'kr',    CZE: 'cz',
  CAN: 'ca',  BIH: 'ba',     QAT: 'qa',    SUI: 'ch',
  BRA: 'br',  MAR: 'ma',     HAI: 'ht',    SCO: 'gb-sct',
  USA: 'us',  PAR: 'py',     AUS: 'au',    TUR: 'tr',
  GER: 'de',  CUW: 'cw',     CIV: 'ci',    ECU: 'ec',
  NED: 'nl',  JPN: 'jp',     SWE: 'se',    TUN: 'tn',
  BEL: 'be',  EGY: 'eg',     IRN: 'ir',    NZL: 'nz',
  ESP: 'es',  CPV: 'cv',     SAU: 'sa',    URU: 'uy',
  FRA: 'fr',  SEN: 'sn',     IRQ: 'iq',    NOR: 'no',
  ARG: 'ar',  ALG: 'dz',     AUT: 'at',    JOR: 'jo',
  POR: 'pt',  COD: 'cd',     UZB: 'uz',    COL: 'co',
  ENG: 'gb-eng', CRO: 'hr',  GHA: 'gh',    PAN: 'pa',
}

export async function fetchFlagImages(teamIds: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  await Promise.all(
    teamIds.map(async tid => {
      const code = FLAG_ISO[tid]
      if (!code) return
      try {
        const res = await fetch(`https://flagcdn.com/w40/${code}.png`)
        if (!res.ok) return
        const buf = await res.arrayBuffer()
        result[tid] = `data:image/png;base64,${Buffer.from(buf).toString('base64')}`
      } catch { /* skip — will render placeholder */ }
    })
  )
  return result
}
