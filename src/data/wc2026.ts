import type { Team, GroupId, TeamId, R32Slot, KnockoutStructureEntry, GroupMatch } from '@/lib/picks'

export const TEAMS: Readonly<Record<string, Team>> = {
  // Group A (Mexico hosts)
  MEX:  { id: 'MEX',  name: 'Mexico',               nameZh: '墨西哥',        nameEs: 'México',             flag: '🇲🇽', group: 'A' },
  ZAF:  { id: 'ZAF',  name: 'South Africa',          nameZh: '南非',          nameEs: 'Sudáfrica',          flag: '🇿🇦', group: 'A' },
  KOR:  { id: 'KOR',  name: 'South Korea',           nameZh: '韩国',          nameEs: 'Corea del Sur',      flag: '🇰🇷', group: 'A' },
  CZE:  { id: 'CZE',  name: 'Czechia',               nameZh: '捷克',          nameEs: 'Chequia',            flag: '🇨🇿', group: 'A' },
  // Group B (Canada hosts)
  CAN:  { id: 'CAN',  name: 'Canada',                nameZh: '加拿大',        nameEs: 'Canadá',             flag: '🇨🇦', group: 'B' },
  BIH:  { id: 'BIH',  name: 'Bosnia-Herzegovina',    nameZh: '波黑',          nameEs: 'Bosnia y Herz.',     flag: '🇧🇦', group: 'B' },
  QAT:  { id: 'QAT',  name: 'Qatar',                 nameZh: '卡塔尔',        nameEs: 'Catar',              flag: '🇶🇦', group: 'B' },
  SUI:  { id: 'SUI',  name: 'Switzerland',           nameZh: '瑞士',          nameEs: 'Suiza',              flag: '🇨🇭', group: 'B' },
  // Group C
  BRA:  { id: 'BRA',  name: 'Brazil',                nameZh: '巴西',          nameEs: 'Brasil',             flag: '🇧🇷', group: 'C' },
  MAR:  { id: 'MAR',  name: 'Morocco',               nameZh: '摩洛哥',        nameEs: 'Marruecos',          flag: '🇲🇦', group: 'C' },
  HAI:  { id: 'HAI',  name: 'Haiti',                 nameZh: '海地',          nameEs: 'Haití',              flag: '🇭🇹', group: 'C' },
  SCO:  { id: 'SCO',  name: 'Scotland',              nameZh: '苏格兰',        nameEs: 'Escocia',            flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'C' },
  // Group D (USA hosts)
  USA:  { id: 'USA',  name: 'United States',         nameZh: '美国',          nameEs: 'EE.UU.',             flag: '🇺🇸', group: 'D' },
  PAR:  { id: 'PAR',  name: 'Paraguay',              nameZh: '巴拉圭',        nameEs: 'Paraguay',           flag: '🇵🇾', group: 'D' },
  AUS:  { id: 'AUS',  name: 'Australia',             nameZh: '澳大利亚',      nameEs: 'Australia',          flag: '🇦🇺', group: 'D' },
  TUR:  { id: 'TUR',  name: 'Türkiye',               nameZh: '土耳其',        nameEs: 'Turquía',            flag: '🇹🇷', group: 'D' },
  // Group E
  GER:  { id: 'GER',  name: 'Germany',               nameZh: '德国',          nameEs: 'Alemania',           flag: '🇩🇪', group: 'E' },
  CUW:  { id: 'CUW',  name: 'Curaçao',               nameZh: '库拉索',        nameEs: 'Curazao',            flag: '🇨🇼', group: 'E' },
  CIV:  { id: 'CIV',  name: 'Ivory Coast',           nameZh: '科特迪瓦',      nameEs: 'Costa de Marfil',    flag: '🇨🇮', group: 'E' },
  ECU:  { id: 'ECU',  name: 'Ecuador',               nameZh: '厄瓜多尔',      nameEs: 'Ecuador',            flag: '🇪🇨', group: 'E' },
  // Group F
  NED:  { id: 'NED',  name: 'Netherlands',           nameZh: '荷兰',          nameEs: 'Países Bajos',       flag: '🇳🇱', group: 'F' },
  JPN:  { id: 'JPN',  name: 'Japan',                 nameZh: '日本',          nameEs: 'Japón',              flag: '🇯🇵', group: 'F' },
  SWE:  { id: 'SWE',  name: 'Sweden',                nameZh: '瑞典',          nameEs: 'Suecia',             flag: '🇸🇪', group: 'F' },
  TUN:  { id: 'TUN',  name: 'Tunisia',               nameZh: '突尼斯',        nameEs: 'Túnez',              flag: '🇹🇳', group: 'F' },
  // Group G
  BEL:  { id: 'BEL',  name: 'Belgium',               nameZh: '比利时',        nameEs: 'Bélgica',            flag: '🇧🇪', group: 'G' },
  EGY:  { id: 'EGY',  name: 'Egypt',                 nameZh: '埃及',          nameEs: 'Egipto',             flag: '🇪🇬', group: 'G' },
  IRN:  { id: 'IRN',  name: 'Iran',                  nameZh: '伊朗',          nameEs: 'Irán',               flag: '🇮🇷', group: 'G' },
  NZL:  { id: 'NZL',  name: 'New Zealand',           nameZh: '新西兰',        nameEs: 'Nueva Zelanda',      flag: '🇳🇿', group: 'G' },
  // Group H
  ESP:  { id: 'ESP',  name: 'Spain',                 nameZh: '西班牙',        nameEs: 'España',             flag: '🇪🇸', group: 'H' },
  CPV:  { id: 'CPV',  name: 'Cape Verde',            nameZh: '佛得角',        nameEs: 'Cabo Verde',         flag: '🇨🇻', group: 'H' },
  SAU:  { id: 'SAU',  name: 'Saudi Arabia',          nameZh: '沙特阿拉伯',    nameEs: 'Arabia Saudita',     flag: '🇸🇦', group: 'H' },
  URU:  { id: 'URU',  name: 'Uruguay',               nameZh: '乌拉圭',        nameEs: 'Uruguay',            flag: '🇺🇾', group: 'H' },
  // Group I
  FRA:  { id: 'FRA',  name: 'France',                nameZh: '法国',          nameEs: 'Francia',            flag: '🇫🇷', group: 'I' },
  SEN:  { id: 'SEN',  name: 'Senegal',               nameZh: '塞内加尔',      nameEs: 'Senegal',            flag: '🇸🇳', group: 'I' },
  IRQ:  { id: 'IRQ',  name: 'Iraq',                  nameZh: '伊拉克',        nameEs: 'Irak',               flag: '🇮🇶', group: 'I' },
  NOR:  { id: 'NOR',  name: 'Norway',                nameZh: '挪威',          nameEs: 'Noruega',            flag: '🇳🇴', group: 'I' },
  // Group J
  ARG:  { id: 'ARG',  name: 'Argentina',             nameZh: '阿根廷',        nameEs: 'Argentina',          flag: '🇦🇷', group: 'J' },
  ALG:  { id: 'ALG',  name: 'Algeria',               nameZh: '阿尔及利亚',    nameEs: 'Argelia',            flag: '🇩🇿', group: 'J' },
  AUT:  { id: 'AUT',  name: 'Austria',               nameZh: '奥地利',        nameEs: 'Austria',            flag: '🇦🇹', group: 'J' },
  JOR:  { id: 'JOR',  name: 'Jordan',                nameZh: '约旦',          nameEs: 'Jordania',           flag: '🇯🇴', group: 'J' },
  // Group K
  POR:  { id: 'POR',  name: 'Portugal',              nameZh: '葡萄牙',        nameEs: 'Portugal',           flag: '🇵🇹', group: 'K' },
  COD:  { id: 'COD',  name: 'DR Congo',              nameZh: '刚果（金）',    nameEs: 'Congo RD',           flag: '🇨🇩', group: 'K' },
  UZB:  { id: 'UZB',  name: 'Uzbekistan',            nameZh: '乌兹别克斯坦',  nameEs: 'Uzbekistán',         flag: '🇺🇿', group: 'K' },
  COL:  { id: 'COL',  name: 'Colombia',              nameZh: '哥伦比亚',      nameEs: 'Colombia',           flag: '🇨🇴', group: 'K' },
  // Group L
  ENG:  { id: 'ENG',  name: 'England',               nameZh: '英格兰',        nameEs: 'Inglaterra',         flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'L' },
  CRO:  { id: 'CRO',  name: 'Croatia',               nameZh: '克罗地亚',      nameEs: 'Croacia',            flag: '🇭🇷', group: 'L' },
  GHA:  { id: 'GHA',  name: 'Ghana',                 nameZh: '加纳',          nameEs: 'Ghana',              flag: '🇬🇭', group: 'L' },
  PAN:  { id: 'PAN',  name: 'Panama',                nameZh: '巴拿马',        nameEs: 'Panamá',             flag: '🇵🇦', group: 'L' },
}

export const GROUPS: { id: GroupId; teams: TeamId[] }[] = [
  { id: 'A', teams: ['MEX', 'ZAF', 'KOR', 'CZE'] },
  { id: 'B', teams: ['CAN', 'BIH', 'QAT', 'SUI'] },
  { id: 'C', teams: ['BRA', 'MAR', 'HAI', 'SCO'] },
  { id: 'D', teams: ['USA', 'PAR', 'AUS', 'TUR'] },
  { id: 'E', teams: ['GER', 'CUW', 'CIV', 'ECU'] },
  { id: 'F', teams: ['NED', 'JPN', 'SWE', 'TUN'] },
  { id: 'G', teams: ['BEL', 'EGY', 'IRN', 'NZL'] },
  { id: 'H', teams: ['ESP', 'CPV', 'SAU', 'URU'] },
  { id: 'I', teams: ['FRA', 'SEN', 'IRQ', 'NOR'] },
  { id: 'J', teams: ['ARG', 'ALG', 'AUT', 'JOR'] },
  { id: 'K', teams: ['POR', 'COD', 'UZB', 'COL'] },
  { id: 'L', teams: ['ENG', 'CRO', 'GHA', 'PAN'] },
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
    { home: 'MEX', away: 'ZAF', date: '2026-06-11', time: '19:00 CT', venue: 'Estadio Azteca, Mexico City' },
    { home: 'KOR', away: 'CZE', date: '2026-06-11', time: '16:00 CT', venue: 'Estadio Akron, Guadalajara' },
    { home: 'MEX', away: 'KOR', date: '2026-06-16', time: '19:00 CT', venue: 'Estadio Azteca, Mexico City' },
    { home: 'CZE', away: 'ZAF', date: '2026-06-16', time: '16:00 CT', venue: 'Estadio BBVA, Monterrey' },
    { home: 'MEX', away: 'CZE', date: '2026-06-22', time: '18:00 CT', venue: 'Estadio Azteca, Mexico City' },
    { home: 'ZAF', away: 'KOR', date: '2026-06-22', time: '18:00 CT', venue: 'Estadio Akron, Guadalajara' },
  ],
  B: [
    { home: 'CAN', away: 'BIH', date: '2026-06-12', time: '15:00 ET', venue: 'BMO Field, Toronto' },
    { home: 'QAT', away: 'SUI', date: '2026-06-12', time: '18:00 PT', venue: 'BC Place, Vancouver' },
    { home: 'CAN', away: 'QAT', date: '2026-06-17', time: '18:00 ET', venue: 'BMO Field, Toronto' },
    { home: 'SUI', away: 'BIH', date: '2026-06-17', time: '18:00 PT', venue: 'BC Place, Vancouver' },
    { home: 'CAN', away: 'SUI', date: '2026-06-23', time: '18:00 ET', venue: 'BMO Field, Toronto' },
    { home: 'BIH', away: 'QAT', date: '2026-06-23', time: '18:00 PT', venue: 'BC Place, Vancouver' },
  ],
  C: [
    { home: 'BRA', away: 'SCO', date: '2026-06-12', time: '20:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'MAR', away: 'HAI', date: '2026-06-12', time: '17:00 ET', venue: 'Hard Rock Stadium, Miami' },
    { home: 'BRA', away: 'MAR', date: '2026-06-18', time: '20:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'HAI', away: 'SCO', date: '2026-06-18', time: '17:00 ET', venue: 'Hard Rock Stadium, Miami' },
    { home: 'BRA', away: 'HAI', date: '2026-06-24', time: '17:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'MAR', away: 'SCO', date: '2026-06-24', time: '17:00 ET', venue: 'Hard Rock Stadium, Miami' },
  ],
  D: [
    { home: 'USA', away: 'PAR', date: '2026-06-13', time: '20:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'AUS', away: 'TUR', date: '2026-06-13', time: '17:00 CT', venue: 'AT&T Stadium, Arlington' },
    { home: 'USA', away: 'AUS', date: '2026-06-19', time: '17:00 PT', venue: 'Rose Bowl, Los Angeles' },
    { home: 'TUR', away: 'PAR', date: '2026-06-19', time: '17:00 CT', venue: 'NRG Stadium, Houston' },
    { home: 'USA', away: 'TUR', date: '2026-06-25', time: '17:00 PT', venue: 'Rose Bowl, Los Angeles' },
    { home: 'PAR', away: 'AUS', date: '2026-06-25', time: '17:00 CT', venue: 'AT&T Stadium, Arlington' },
  ],
  E: [
    { home: 'GER', away: 'ECU', date: '2026-06-13', time: '20:00 ET', venue: 'Mercedes-Benz Stadium, Atlanta' },
    { home: 'CIV', away: 'CUW', date: '2026-06-13', time: '17:00 ET', venue: 'Lincoln Financial Field, Philadelphia' },
    { home: 'GER', away: 'CIV', date: '2026-06-19', time: '20:00 ET', venue: 'Gillette Stadium, Boston' },
    { home: 'ECU', away: 'CUW', date: '2026-06-19', time: '17:00 ET', venue: 'Mercedes-Benz Stadium, Atlanta' },
    { home: 'GER', away: 'CUW', date: '2026-06-25', time: '17:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'ECU', away: 'CIV', date: '2026-06-25', time: '17:00 ET', venue: 'Lincoln Financial Field, Philadelphia' },
  ],
  F: [
    { home: 'NED', away: 'TUN', date: '2026-06-14', time: '17:00 PT', venue: 'Lumen Field, Seattle' },
    { home: 'JPN', away: 'SWE', date: '2026-06-14', time: '20:00 PT', venue: 'SoFi Stadium, Los Angeles' },
    { home: 'NED', away: 'JPN', date: '2026-06-20', time: '17:00 PT', venue: 'Lumen Field, Seattle' },
    { home: 'SWE', away: 'TUN', date: '2026-06-20', time: '17:00 PT', venue: 'SoFi Stadium, Los Angeles' },
    { home: 'NED', away: 'SWE', date: '2026-06-26', time: '17:00 PT', venue: "Levi's Stadium, San Francisco" },
    { home: 'TUN', away: 'JPN', date: '2026-06-26', time: '17:00 PT', venue: 'SoFi Stadium, Los Angeles' },
  ],
  G: [
    { home: 'BEL', away: 'IRN', date: '2026-06-14', time: '17:00 CT', venue: 'Arrowhead Stadium, Kansas City' },
    { home: 'EGY', away: 'NZL', date: '2026-06-14', time: '20:00 CT', venue: 'NRG Stadium, Houston' },
    { home: 'BEL', away: 'EGY', date: '2026-06-20', time: '17:00 CT', venue: 'AT&T Stadium, Arlington' },
    { home: 'NZL', away: 'IRN', date: '2026-06-20', time: '20:00 CT', venue: 'Arrowhead Stadium, Kansas City' },
    { home: 'BEL', away: 'NZL', date: '2026-06-26', time: '17:00 CT', venue: 'Arrowhead Stadium, Kansas City' },
    { home: 'IRN', away: 'EGY', date: '2026-06-26', time: '17:00 CT', venue: 'AT&T Stadium, Arlington' },
  ],
  H: [
    { home: 'ESP', away: 'URU', date: '2026-06-15', time: '17:00 PT', venue: 'Rose Bowl, Los Angeles' },
    { home: 'SAU', away: 'CPV', date: '2026-06-15', time: '20:00 PT', venue: "Levi's Stadium, San Francisco" },
    { home: 'ESP', away: 'SAU', date: '2026-06-21', time: '17:00 PT', venue: 'SoFi Stadium, Los Angeles' },
    { home: 'URU', away: 'CPV', date: '2026-06-21', time: '20:00 PT', venue: 'Rose Bowl, Los Angeles' },
    { home: 'ESP', away: 'CPV', date: '2026-06-27', time: '17:00 PT', venue: 'SoFi Stadium, Los Angeles' },
    { home: 'URU', away: 'SAU', date: '2026-06-27', time: '17:00 PT', venue: "Levi's Stadium, San Francisco" },
  ],
  I: [
    { home: 'FRA', away: 'IRQ', date: '2026-06-15', time: '17:00 ET', venue: 'Gillette Stadium, Boston' },
    { home: 'NOR', away: 'SEN', date: '2026-06-15', time: '20:00 ET', venue: 'Lincoln Financial Field, Philadelphia' },
    { home: 'FRA', away: 'NOR', date: '2026-06-21', time: '17:00 ET', venue: 'Mercedes-Benz Stadium, Atlanta' },
    { home: 'SEN', away: 'IRQ', date: '2026-06-21', time: '20:00 ET', venue: 'Hard Rock Stadium, Miami' },
    { home: 'FRA', away: 'SEN', date: '2026-06-27', time: '17:00 ET', venue: 'Gillette Stadium, Boston' },
    { home: 'IRQ', away: 'NOR', date: '2026-06-27', time: '17:00 ET', venue: 'Lincoln Financial Field, Philadelphia' },
  ],
  J: [
    { home: 'ARG', away: 'JOR', date: '2026-06-15', time: '20:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'ALG', away: 'AUT', date: '2026-06-15', time: '17:00 CT', venue: 'Arrowhead Stadium, Kansas City' },
    { home: 'ARG', away: 'ALG', date: '2026-06-21', time: '17:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'AUT', away: 'JOR', date: '2026-06-21', time: '20:00 CT', venue: 'Arrowhead Stadium, Kansas City' },
    { home: 'ARG', away: 'AUT', date: '2026-06-27', time: '17:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'JOR', away: 'ALG', date: '2026-06-27', time: '17:00 CT', venue: 'Arrowhead Stadium, Kansas City' },
  ],
  K: [
    { home: 'POR', away: 'COL', date: '2026-06-16', time: '17:00 ET', venue: 'Hard Rock Stadium, Miami' },
    { home: 'COD', away: 'UZB', date: '2026-06-16', time: '17:00 PT', venue: 'Lumen Field, Seattle' },
    { home: 'POR', away: 'COD', date: '2026-06-22', time: '17:00 ET', venue: 'Mercedes-Benz Stadium, Atlanta' },
    { home: 'COL', away: 'UZB', date: '2026-06-22', time: '17:00 CT', venue: 'NRG Stadium, Houston' },
    { home: 'POR', away: 'UZB', date: '2026-06-28', time: '17:00 ET', venue: 'Hard Rock Stadium, Miami' },
    { home: 'COL', away: 'COD', date: '2026-06-28', time: '17:00 ET', venue: 'Mercedes-Benz Stadium, Atlanta' },
  ],
  L: [
    { home: 'ENG', away: 'PAN', date: '2026-06-16', time: '20:00 ET', venue: 'Gillette Stadium, Boston' },
    { home: 'CRO', away: 'GHA', date: '2026-06-16', time: '20:00 ET', venue: 'Lincoln Financial Field, Philadelphia' },
    { home: 'ENG', away: 'CRO', date: '2026-06-22', time: '17:00 ET', venue: 'MetLife Stadium, New York' },
    { home: 'GHA', away: 'PAN', date: '2026-06-22', time: '20:00 ET', venue: 'Gillette Stadium, Boston' },
    { home: 'ENG', away: 'GHA', date: '2026-06-28', time: '17:00 ET', venue: 'Lincoln Financial Field, Philadelphia' },
    { home: 'PAN', away: 'CRO', date: '2026-06-28', time: '17:00 ET', venue: 'Gillette Stadium, Boston' },
  ],
}

// Approximate FIFA World Rankings used for auto-seeding groups
export const FIFA_RANK: Record<string, number> = {
  ARG: 1,   FRA: 2,   ENG: 3,   BRA: 4,   BEL: 5,
  POR: 6,   NED: 7,   ESP: 8,   GER: 9,   COL: 11,
  USA: 14,  MAR: 14,  JPN: 17,  URU: 19,  SUI: 21,
  KOR: 23,  AUS: 25,  CRO: 26,  SWE: 28,  IRN: 29,
  TUN: 30,  NOR: 34,  EGY: 35,  AUT: 36,  SCO: 38,
  SEN: 39,  TUR: 39,  CZE: 41,  ECU: 44,  ALG: 46,
  CAN: 47,  CIV: 48,  QAT: 55,  SAU: 56,  PAR: 57,
  BIH: 62,  GHA: 62,  ZAF: 68,  COD: 72,  PAN: 77,
  UZB: 83,  HAI: 84,  CPV: 90,  CUW: 90,  NZL: 95,
  JOR: 98,  MEX: 13,
}

export function getGroupFifaRanking(groupTeams: string[]): [string, string, string, string] {
  const sorted = [...groupTeams].sort((a, b) => (FIFA_RANK[a] ?? 999) - (FIFA_RANK[b] ?? 999))
  return sorted as [string, string, string, string]
}
