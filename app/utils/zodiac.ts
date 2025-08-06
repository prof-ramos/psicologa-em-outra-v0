export const ZODIAC_SIGNS = [
  'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
]

export const ZODIAC_COLORS = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3',
  '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84', '#ee5a24'
]

export const PLANET_SYMBOLS: Record<string, string> = {
  'Sun': '☉',
  'Moon': '☽',
  'Mercury': '☿',
  'Venus': '♀',
  'Mars': '♂',
  'Jupiter': '♃',
  'Saturn': '♄',
  'Uranus': '♅',
  'Neptune': '♆',
  'Pluto': '♇',
  'North Node': '☊',
  'South Node': '☋',
  'Chiron': '⚷',
  'Ascendant': 'AC',
  'Midheaven': 'MC'
}

export function getSignName(signIndex: number): string {
  return ZODIAC_SIGNS[signIndex] || 'Desconhecido'
}

export function getSignColor(signIndex: number): string {
  return ZODIAC_COLORS[signIndex] || '#gray'
}

export function getPlanetSymbol(planetName: string): string {
  return PLANET_SYMBOLS[planetName] || planetName.charAt(0)
}

export function formatDegree(degree: number): string {
  const deg = Math.floor(degree)
  const min = Math.floor((degree - deg) * 60)
  return `${deg}°${min.toString().padStart(2, '0')}'`
}

export function absoluteDegree(signIndex: number, degreeInSign: number): number {
  return signIndex * 30 + degreeInSign
}

export function signFromAbsDegree(absDegree: number): { signIndex: number; degree: number } {
  const normalizedDegree = ((absDegree % 360) + 360) % 360
  const signIndex = Math.floor(normalizedDegree / 30)
  const degree = normalizedDegree % 30
  
  return { signIndex, degree }
}

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}
