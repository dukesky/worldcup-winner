import type { Team, GroupId, TeamId, R32Slot, KnockoutStructureEntry, GroupMatch } from '@/lib/picks'

export const TEAMS: Readonly<Record<string, Team>> = {
  // Group A (USA hosts)
  USA:  { id: 'USA',  name: 'United States',  nameZh: '美国',        nameEs: 'EE.UU.',             flag: '🇺🇸', group: 'A' },
  PAN:  { id: 'PAN',  name: 'Panama',         nameZh: '巴拿马',      nameEs: 'Panamá',             flag: '🇵🇦', group: 'A' },
  BOL:  { id: 'BOL',  name: 'Bolivia',        nameZh: '玻利维亚',    nameEs: 'Bolivia',            flag: '🇧🇴', group: 'A' },
  JAM:  { id: 'JAM',  name: 'Jamaica',        nameZh: '牙买加',      nameEs: 'Jamaica',            flag: '🇯🇲', group: 'A' },
  // Group B
  MEX:  { id: 'MEX',  name: 'Mexico',         nameZh: '墨西哥',      nameEs: 'México',             flag: '🇲🇽', group: 'B' },
  FRA:  { id: 'FRA',  name: 'France',         nameZh: '法国',        nameEs: 'Francia',            flag: '🇫🇷', group: 'B' },
  SRB:  { id: 'SRB',  name: 'Serbia',         nameZh: '塞尔维亚',    nameEs: 'Serbia',             flag: '🇷🇸', group: 'B' },
  ALB:  { id: 'ALB',  name: 'Albania',        nameZh: '阿尔巴尼亚',  nameEs: 'Albania',            flag: '🇦🇱', group: 'B' },
  // Group C (Canada hosts)
  CAN:  { id: 'CAN',  name: 'Canada',         nameZh: '加拿大',      nameEs: 'Canadá',             flag: '🇨🇦', group: 'C' },
  ENG:  { id: 'ENG',  name: 'England',        nameZh: '英格兰',      nameEs: 'Inglaterra',         flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'C' },
  DEN:  { id: 'DEN',  name: 'Denmark',        nameZh: '丹麦',        nameEs: 'Dinamarca',          flag: '🇩🇰', group: 'C' },
  SVK:  { id: 'SVK',  name: 'Slovakia',       nameZh: '斯洛伐克',    nameEs: 'Eslovaquia',         flag: '🇸🇰', group: 'C' },
  // Group D
  NED:  { id: 'NED',  name: 'Netherlands',    nameZh: '荷兰',        nameEs: 'Países Bajos',       flag: '🇳🇱', group: 'D' },
  AUT:  { id: 'AUT',  name: 'Austria',        nameZh: '奥地利',      nameEs: 'Austria',            flag: '🇦🇹', group: 'D' },
  UKR:  { id: 'UKR',  name: 'Ukraine',        nameZh: '乌克兰',      nameEs: 'Ucrania',            flag: '🇺🇦', group: 'D' },
  ISL:  { id: 'ISL',  name: 'Iceland',        nameZh: '冰岛',        nameEs: 'Islandia',           flag: '🇮🇸', group: 'D' },
  // Group E
  BRA:  { id: 'BRA',  name: 'Brazil',         nameZh: '巴西',        nameEs: 'Brasil',             flag: '🇧🇷', group: 'E' },
  COL:  { id: 'COL',  name: 'Colombia',       nameZh: '哥伦比亚',    nameEs: 'Colombia',           flag: '🇨🇴', group: 'E' },
  SEN:  { id: 'SEN',  name: 'Senegal',        nameZh: '塞内加尔',    nameEs: 'Senegal',            flag: '🇸🇳', group: 'E' },
  PER:  { id: 'PER',  name: 'Peru',           nameZh: '秘鲁',        nameEs: 'Perú',               flag: '🇵🇪', group: 'E' },
  // Group F
  ITA:  { id: 'ITA',  name: 'Italy',          nameZh: '意大利',      nameEs: 'Italia',             flag: '🇮🇹', group: 'F' },
  SUI:  { id: 'SUI',  name: 'Switzerland',    nameZh: '瑞士',        nameEs: 'Suiza',              flag: '🇨🇭', group: 'F' },
  CMR:  { id: 'CMR',  name: 'Cameroon',       nameZh: '喀麦隆',      nameEs: 'Camerún',            flag: '🇨🇲', group: 'F' },
  GIN:  { id: 'GIN',  name: 'Guinea',         nameZh: '几内亚',      nameEs: 'Guinea',             flag: '🇬🇳', group: 'F' },
  // Group G (Mexico hosts)
  ESP:  { id: 'ESP',  name: 'Spain',          nameZh: '西班牙',      nameEs: 'España',             flag: '🇪🇸', group: 'G' },
  TUR:  { id: 'TUR',  name: 'Turkey',         nameZh: '土耳其',      nameEs: 'Turquía',            flag: '🇹🇷', group: 'G' },
  GEO:  { id: 'GEO',  name: 'Georgia',        nameZh: '格鲁吉亚',    nameEs: 'Georgia',            flag: '🇬🇪', group: 'G' },
  UZB:  { id: 'UZB',  name: 'Uzbekistan',     nameZh: '乌兹别克斯坦',nameEs: 'Uzbekistán',        flag: '🇺🇿', group: 'G' },
  // Group H
  POR:  { id: 'POR',  name: 'Portugal',       nameZh: '葡萄牙',      nameEs: 'Portugal',           flag: '🇵🇹', group: 'H' },
  CRO:  { id: 'CRO',  name: 'Croatia',        nameZh: '克罗地亚',    nameEs: 'Croacia',            flag: '🇭🇷', group: 'H' },
  CZE:  { id: 'CZE',  name: 'Czech Republic', nameZh: '捷克',        nameEs: 'República Checa',    flag: '🇨🇿', group: 'H' },
  TZA:  { id: 'TZA',  name: 'Tanzania',       nameZh: '坦桑尼亚',    nameEs: 'Tanzania',           flag: '🇹🇿', group: 'H' },
  // Group I
  GER:  { id: 'GER',  name: 'Germany',        nameZh: '德国',        nameEs: 'Alemania',           flag: '🇩🇪', group: 'I' },
  JPN:  { id: 'JPN',  name: 'Japan',          nameZh: '日本',        nameEs: 'Japón',              flag: '🇯🇵', group: 'I' },
  IDN:  { id: 'IDN',  name: 'Indonesia',      nameZh: '印度尼西亚',  nameEs: 'Indonesia',          flag: '🇮🇩', group: 'I' },
  VIE:  { id: 'VIE',  name: 'Vietnam',        nameZh: '越南',        nameEs: 'Vietnam',            flag: '🇻🇳', group: 'I' },
  // Group J
  ARG:  { id: 'ARG',  name: 'Argentina',      nameZh: '阿根廷',      nameEs: 'Argentina',          flag: '🇦🇷', group: 'J' },
  URU:  { id: 'URU',  name: 'Uruguay',        nameZh: '乌拉圭',      nameEs: 'Uruguay',            flag: '🇺🇾', group: 'J' },
  ECU:  { id: 'ECU',  name: 'Ecuador',        nameZh: '厄瓜多尔',    nameEs: 'Ecuador',            flag: '🇪🇨', group: 'J' },
  CHL:  { id: 'CHL',  name: 'Chile',          nameZh: '智利',        nameEs: 'Chile',              flag: '🇨🇱', group: 'J' },
  // Group K
  MAR:  { id: 'MAR',  name: 'Morocco',        nameZh: '摩洛哥',      nameEs: 'Marruecos',          flag: '🇲🇦', group: 'K' },
  AUS:  { id: 'AUS',  name: 'Australia',      nameZh: '澳大利亚',    nameEs: 'Australia',          flag: '🇦🇺', group: 'K' },
  TUN:  { id: 'TUN',  name: 'Tunisia',        nameZh: '突尼斯',      nameEs: 'Túnez',              flag: '🇹🇳', group: 'K' },
  SAU:  { id: 'SAU',  name: 'Saudi Arabia',   nameZh: '沙特阿拉伯',  nameEs: 'Arabia Saudita',     flag: '🇸🇦', group: 'K' },
  // Group L
  KOR:  { id: 'KOR',  name: 'South Korea',    nameZh: '韩国',        nameEs: 'Corea del Sur',      flag: '🇰🇷', group: 'L' },
  NGA:  { id: 'NGA',  name: 'Nigeria',        nameZh: '尼日利亚',    nameEs: 'Nigeria',            flag: '🇳🇬', group: 'L' },
  CRI:  { id: 'CRI',  name: 'Costa Rica',     nameZh: '哥斯达黎加',  nameEs: 'Costa Rica',         flag: '🇨🇷', group: 'L' },
  GHA:  { id: 'GHA',  name: 'Ghana',          nameZh: '加纳',        nameEs: 'Ghana',              flag: '🇬🇭', group: 'L' },
}

export const GROUPS: { id: GroupId; teams: TeamId[] }[] = [
  { id: 'A', teams: ['USA', 'PAN', 'BOL', 'JAM'] },
  { id: 'B', teams: ['MEX', 'FRA', 'SRB', 'ALB'] },
  { id: 'C', teams: ['CAN', 'ENG', 'DEN', 'SVK'] },
  { id: 'D', teams: ['NED', 'AUT', 'UKR', 'ISL'] },
  { id: 'E', teams: ['BRA', 'COL', 'SEN', 'PER'] },
  { id: 'F', teams: ['ITA', 'SUI', 'CMR', 'GIN'] },
  { id: 'G', teams: ['ESP', 'TUR', 'GEO', 'UZB'] },
  { id: 'H', teams: ['POR', 'CRO', 'CZE', 'TZA'] },
  { id: 'I', teams: ['GER', 'JPN', 'IDN', 'VIE'] },
  { id: 'J', teams: ['ARG', 'URU', 'ECU', 'CHL'] },
  { id: 'K', teams: ['MAR', 'AUS', 'TUN', 'SAU'] },
  { id: 'L', teams: ['KOR', 'NGA', 'CRI', 'GHA'] },
]

// Official FIFA 2026 R32 seeding — verified from official bracket
export const R32_SLOTS: R32Slot[] = [
  // LEFT SIDE (8 matches)
  { matchId: 'R32_L1', homeSlot: '1E',     awaySlot: '3ABCDF', side: 'left',  position: 1 },
  { matchId: 'R32_L2', homeSlot: '1I',     awaySlot: '3CDFGH', side: 'left',  position: 2 },
  { matchId: 'R32_L3', homeSlot: '2A',     awaySlot: '2B',     side: 'left',  position: 3 },
  { matchId: 'R32_L4', homeSlot: '1F',     awaySlot: '2C',     side: 'left',  position: 4 },
  { matchId: 'R32_L5', homeSlot: '2K',     awaySlot: '2L',     side: 'left',  position: 5 },
  { matchId: 'R32_L6', homeSlot: '1H',     awaySlot: '2J',     side: 'left',  position: 6 },
  { matchId: 'R32_L7', homeSlot: '1D',     awaySlot: '3BEFIJ', side: 'left',  position: 7 },
  { matchId: 'R32_L8', homeSlot: '1G',     awaySlot: '3AEHIJ', side: 'left',  position: 8 },
  // RIGHT SIDE (8 matches)
  { matchId: 'R32_R1', homeSlot: '1C',     awaySlot: '2F',     side: 'right', position: 1 },
  { matchId: 'R32_R2', homeSlot: '2E',     awaySlot: '2I',     side: 'right', position: 2 },
  { matchId: 'R32_R3', homeSlot: '1A',     awaySlot: '3CEFHI', side: 'right', position: 3 },
  { matchId: 'R32_R4', homeSlot: '1L',     awaySlot: '3EHIJK', side: 'right', position: 4 },
  { matchId: 'R32_R5', homeSlot: '1J',     awaySlot: '2H',     side: 'right', position: 5 },
  { matchId: 'R32_R6', homeSlot: '2D',     awaySlot: '2G',     side: 'right', position: 6 },
  { matchId: 'R32_R7', homeSlot: '1B',     awaySlot: '3EFGIJ', side: 'right', position: 7 },
  { matchId: 'R32_R8', homeSlot: '1K',     awaySlot: '3DEIJL', side: 'right', position: 8 },
]

export const KNOCKOUT_STRUCTURE: KnockoutStructureEntry[] = [
  // R16 (left side)
  { matchId: 'R16_L1', homeFeeder: 'R32_L1', awayFeeder: 'R32_L2' },
  { matchId: 'R16_L2', homeFeeder: 'R32_L3', awayFeeder: 'R32_L4' },
  { matchId: 'R16_L3', homeFeeder: 'R32_L5', awayFeeder: 'R32_L6' },
  { matchId: 'R16_L4', homeFeeder: 'R32_L7', awayFeeder: 'R32_L8' },
  // R16 (right side)
  { matchId: 'R16_R1', homeFeeder: 'R32_R1', awayFeeder: 'R32_R2' },
  { matchId: 'R16_R2', homeFeeder: 'R32_R3', awayFeeder: 'R32_R4' },
  { matchId: 'R16_R3', homeFeeder: 'R32_R5', awayFeeder: 'R32_R6' },
  { matchId: 'R16_R4', homeFeeder: 'R32_R7', awayFeeder: 'R32_R8' },
  // QF
  { matchId: 'QF_L1', homeFeeder: 'R16_L1', awayFeeder: 'R16_L2' },
  { matchId: 'QF_L2', homeFeeder: 'R16_L3', awayFeeder: 'R16_L4' },
  { matchId: 'QF_R1', homeFeeder: 'R16_R1', awayFeeder: 'R16_R2' },
  { matchId: 'QF_R2', homeFeeder: 'R16_R3', awayFeeder: 'R16_R4' },
  // SF
  { matchId: 'SF_L', homeFeeder: 'QF_L1', awayFeeder: 'QF_L2' },
  { matchId: 'SF_R', homeFeeder: 'QF_R1', awayFeeder: 'QF_R2' },
  // Final
  { matchId: 'FINAL', homeFeeder: 'SF_L', awayFeeder: 'SF_R' },
]

export const GROUP_MATCHES: Record<GroupId, GroupMatch[]> = {
  A: [
    { home: 'USA', away: 'PAN', date: '2026-06-11', time: '17:00 ET', venue: 'Rose Bowl, Los Angeles' },
    { home: 'BOL', away: 'JAM', date: '2026-06-11', time: '20:00 ET', venue: 'SoFi Stadium, Los Angeles' },
    { home: 'USA', away: 'BOL', date: '2026-06-16', time: '17:00 ET', venue: 'Lumen Field, Seattle' },
    { home: 'JAM', away: 'PAN', date: '2026-06-16', time: '20:00 ET', venue: "Levi's Stadium, San Francisco" },
    { home: 'USA', away: 'JAM', date: '2026-06-26', time: '17:00 ET', venue: 'Rose Bowl, Los Angeles' },
    { home: 'PAN', away: 'BOL', date: '2026-06-26', time: '17:00 ET', venue: "Levi's Stadium, San Francisco" },
  ],
  B: [
    { home: 'MEX', away: 'FRA', date: '2026-06-12', time: '18:00 CT', venue: 'Estadio Azteca, Mexico City' },
    { home: 'SRB', away: 'ALB', date: '2026-06-12', time: '21:00 ET', venue: 'AT&T Stadium, Arlington' },
    { home: 'MEX', away: 'SRB', date: '2026-06-17', time: '18:00 CT', venue: 'Estadio BBVA, Monterrey' },
    { home: 'ALB', away: 'FRA', date: '2026-06-17', time: '21:00 ET', venue: 'Hard Rock Stadium, Miami' },
    { home: 'MEX', away: 'ALB', date: '2026-06-25', time: '17:00 CT', venue: 'Estadio Azteca, Mexico City' },
    { home: 'FRA', away: 'SRB', date: '2026-06-25', time: '17:00 ET', venue: 'Mercedes-Benz Stadium, Atlanta' },
  ],
  C: [
    { home: 'CAN', away: 'ENG', date: '2026-06-12', time: '14:00 ET', venue: 'BMO Field, Toronto' },
    { home: 'DEN', away: 'SVK', date: '2026-06-12', time: '20:00 PT', venue: 'BC Place, Vancouver' },
    { home: 'CAN', away: 'DEN', date: '2026-06-17', time: '17:00 ET', venue: 'BMO Field, Toronto' },
    { home: 'SVK', away: 'ENG', date: '2026-06-17', time: '20:00 PT', venue: 'BC Place, Vancouver' },
    { home: 'CAN', away: 'SVK', date: '2026-06-27', time: '20:00 PT', venue: 'BC Place, Vancouver' },
    { home: 'ENG', away: 'DEN', date: '2026-06-27', time: '17:00 ET', venue: 'BMO Field, Toronto' },
  ],
  D: [
    { home: 'NED', away: 'AUT', date: '2026-06-13', time: '17:00 ET', venue: 'Lincoln Financial Field, Philadelphia' },
    { home: 'UKR', away: 'ISL', date: '2026-06-13', time: '20:00 ET', venue: 'Gillette Stadium, Boston' },
    { home: 'NED', away: 'UKR', date: '2026-06-18', time: '17:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'ISL', away: 'AUT', date: '2026-06-18', time: '20:00 ET', venue: 'Lincoln Financial Field, Philadelphia' },
    { home: 'NED', away: 'ISL', date: '2026-06-25', time: '17:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'AUT', away: 'UKR', date: '2026-06-25', time: '17:00 ET', venue: 'Gillette Stadium, Boston' },
  ],
  E: [
    { home: 'BRA', away: 'COL', date: '2026-06-13', time: '14:00 CT', venue: 'NRG Stadium, Houston' },
    { home: 'SEN', away: 'PER', date: '2026-06-13', time: '20:00 CT', venue: 'AT&T Stadium, Arlington' },
    { home: 'BRA', away: 'SEN', date: '2026-06-18', time: '14:00 ET', venue: 'Hard Rock Stadium, Miami' },
    { home: 'PER', away: 'COL', date: '2026-06-18', time: '20:00 CT', venue: 'NRG Stadium, Houston' },
    { home: 'BRA', away: 'PER', date: '2026-06-26', time: '14:00 ET', venue: 'Hard Rock Stadium, Miami' },
    { home: 'COL', away: 'SEN', date: '2026-06-26', time: '14:00 CT', venue: 'AT&T Stadium, Arlington' },
  ],
  F: [
    { home: 'ITA', away: 'SUI', date: '2026-06-14', time: '17:00 ET', venue: 'Mercedes-Benz Stadium, Atlanta' },
    { home: 'CMR', away: 'GIN', date: '2026-06-14', time: '20:00 CT', venue: 'Arrowhead Stadium, Kansas City' },
    { home: 'ITA', away: 'CMR', date: '2026-06-19', time: '17:00 PT', venue: 'Lumen Field, Seattle' },
    { home: 'GIN', away: 'SUI', date: '2026-06-19', time: '20:00 PT', venue: 'SoFi Stadium, Los Angeles' },
    { home: 'ITA', away: 'GIN', date: '2026-06-27', time: '17:00 ET', venue: 'Mercedes-Benz Stadium, Atlanta' },
    { home: 'SUI', away: 'CMR', date: '2026-06-27', time: '17:00 CT', venue: 'Arrowhead Stadium, Kansas City' },
  ],
  G: [
    { home: 'ESP', away: 'TUR', date: '2026-06-14', time: '18:00 CT', venue: 'Estadio Akron, Guadalajara' },
    { home: 'GEO', away: 'UZB', date: '2026-06-14', time: '21:00 CT', venue: 'Estadio BBVA, Monterrey' },
    { home: 'ESP', away: 'GEO', date: '2026-06-19', time: '18:00 CT', venue: 'Estadio Azteca, Mexico City' },
    { home: 'UZB', away: 'TUR', date: '2026-06-19', time: '21:00 CT', venue: 'Estadio Akron, Guadalajara' },
    { home: 'ESP', away: 'UZB', date: '2026-06-28', time: '17:00 CT', venue: 'Estadio Azteca, Mexico City' },
    { home: 'TUR', away: 'GEO', date: '2026-06-28', time: '17:00 CT', venue: 'Estadio Akron, Guadalajara' },
  ],
  H: [
    { home: 'POR', away: 'CRO', date: '2026-06-15', time: '17:00 PT', venue: "Levi's Stadium, San Francisco" },
    { home: 'CZE', away: 'TZA', date: '2026-06-15', time: '20:00 PT', venue: 'Rose Bowl, Los Angeles' },
    { home: 'POR', away: 'CZE', date: '2026-06-20', time: '17:00 PT', venue: 'SoFi Stadium, Los Angeles' },
    { home: 'TZA', away: 'CRO', date: '2026-06-20', time: '20:00 PT', venue: "Levi's Stadium, San Francisco" },
    { home: 'POR', away: 'TZA', date: '2026-06-29', time: '17:00 PT', venue: 'SoFi Stadium, Los Angeles' },
    { home: 'CRO', away: 'CZE', date: '2026-06-29', time: '17:00 PT', venue: 'Rose Bowl, Los Angeles' },
  ],
  I: [
    { home: 'GER', away: 'JPN', date: '2026-06-15', time: '14:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'IDN', away: 'VIE', date: '2026-06-15', time: '20:00 ET', venue: 'Gillette Stadium, Boston' },
    { home: 'GER', away: 'IDN', date: '2026-06-20', time: '14:00 ET', venue: 'Lincoln Financial Field, Philadelphia' },
    { home: 'VIE', away: 'JPN', date: '2026-06-20', time: '20:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'GER', away: 'VIE', date: '2026-06-29', time: '14:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'JPN', away: 'IDN', date: '2026-06-29', time: '14:00 ET', venue: 'Gillette Stadium, Boston' },
  ],
  J: [
    { home: 'ARG', away: 'URU', date: '2026-06-15', time: '21:00 CT', venue: 'NRG Stadium, Houston' },
    { home: 'ECU', away: 'CHL', date: '2026-06-15', time: '18:00 CT', venue: 'AT&T Stadium, Arlington' },
    { home: 'ARG', away: 'ECU', date: '2026-06-21', time: '17:00 CT', venue: 'Arrowhead Stadium, Kansas City' },
    { home: 'CHL', away: 'URU', date: '2026-06-21', time: '20:00 CT', venue: 'NRG Stadium, Houston' },
    { home: 'ARG', away: 'CHL', date: '2026-06-29', time: '17:00 CT', venue: 'NRG Stadium, Houston' },
    { home: 'URU', away: 'ECU', date: '2026-06-29', time: '17:00 CT', venue: 'AT&T Stadium, Arlington' },
  ],
  K: [
    { home: 'MAR', away: 'AUS', date: '2026-06-16', time: '14:00 PT', venue: 'BC Place, Vancouver' },
    { home: 'TUN', away: 'SAU', date: '2026-06-16', time: '20:00 ET', venue: 'BMO Field, Toronto' },
    { home: 'MAR', away: 'TUN', date: '2026-06-21', time: '14:00 CT', venue: 'Arrowhead Stadium, Kansas City' },
    { home: 'SAU', away: 'AUS', date: '2026-06-21', time: '20:00 ET', venue: 'Mercedes-Benz Stadium, Atlanta' },
    { home: 'MAR', away: 'SAU', date: '2026-06-28', time: '14:00 CT', venue: 'Arrowhead Stadium, Kansas City' },
    { home: 'AUS', away: 'TUN', date: '2026-06-28', time: '14:00 ET', venue: 'Mercedes-Benz Stadium, Atlanta' },
  ],
  L: [
    { home: 'KOR', away: 'NGA', date: '2026-06-16', time: '17:00 ET', venue: 'Hard Rock Stadium, Miami' },
    { home: 'CRI', away: 'GHA', date: '2026-06-16', time: '20:00 ET', venue: 'Lincoln Financial Field, Philadelphia' },
    { home: 'KOR', away: 'CRI', date: '2026-06-21', time: '17:00 PT', venue: 'Lumen Field, Seattle' },
    { home: 'GHA', away: 'NGA', date: '2026-06-21', time: '20:00 ET', venue: 'Hard Rock Stadium, Miami' },
    { home: 'KOR', away: 'GHA', date: '2026-06-28', time: '17:00 PT', venue: 'Lumen Field, Seattle' },
    { home: 'NGA', away: 'CRI', date: '2026-06-28', time: '17:00 ET', venue: 'Hard Rock Stadium, Miami' },
  ],
}
