export const ASPECT_TYPES = {
  CONJUNCTION: 'conjunction',
  SEXTILE: 'sextile',
  SQUARE: 'square',
  TRINE: 'trine',
  OPPOSITION: 'opposition'
}

export const ASPECT_NAMES: Record<string, string> = {
  [ASPECT_TYPES.CONJUNCTION]: 'Conjunção',
  [ASPECT_TYPES.SEXTILE]: 'Sextil',
  [ASPECT_TYPES.SQUARE]: 'Quadratura',
  [ASPECT_TYPES.TRINE]: 'Trígono',
  [ASPECT_TYPES.OPPOSITION]: 'Oposição'
}

export const ASPECT_COLORS: Record<string, string> = {
  [ASPECT_TYPES.CONJUNCTION]: '#ff6b6b',
  [ASPECT_TYPES.SEXTILE]: '#4ecdc4',
  [ASPECT_TYPES.SQUARE]: '#ff9f43',
  [ASPECT_TYPES.TRINE]: '#10ac84',
  [ASPECT_TYPES.OPPOSITION]: '#ee5a24'
}

export const ASPECT_ORBS: Record<string, number> = {
  [ASPECT_TYPES.CONJUNCTION]: 8,
  [ASPECT_TYPES.SEXTILE]: 6,
  [ASPECT_TYPES.SQUARE]: 8,
  [ASPECT_TYPES.TRINE]: 8,
  [ASPECT_TYPES.OPPOSITION]: 8
}

export function getAspectName(aspectType: string): string {
  return ASPECT_NAMES[aspectType] || aspectType
}

export function getAspectColor(aspectType: string): string {
  return ASPECT_COLORS[aspectType] || '#gray'
}

export function calculateAspectType(angleDifference: number): string | null {
  const normalizedAngle = Math.abs(angleDifference % 360)
  const angle = Math.min(normalizedAngle, 360 - normalizedAngle)
  
  if (angle <= ASPECT_ORBS[ASPECT_TYPES.CONJUNCTION]) {
    return ASPECT_TYPES.CONJUNCTION
  }
  if (Math.abs(angle - 60) <= ASPECT_ORBS[ASPECT_TYPES.SEXTILE]) {
    return ASPECT_TYPES.SEXTILE
  }
  if (Math.abs(angle - 90) <= ASPECT_ORBS[ASPECT_TYPES.SQUARE]) {
    return ASPECT_TYPES.SQUARE
  }
  if (Math.abs(angle - 120) <= ASPECT_ORBS[ASPECT_TYPES.TRINE]) {
    return ASPECT_TYPES.TRINE
  }
  if (Math.abs(angle - 180) <= ASPECT_ORBS[ASPECT_TYPES.OPPOSITION]) {
    return ASPECT_TYPES.OPPOSITION
  }
  
  return null
}

export function calculateOrb(angleDifference: number, aspectType: string): number {
  const normalizedAngle = Math.abs(angleDifference % 360)
  const angle = Math.min(normalizedAngle, 360 - normalizedAngle)
  
  const exactAngles: Record<string, number> = {
    [ASPECT_TYPES.CONJUNCTION]: 0,
    [ASPECT_TYPES.SEXTILE]: 60,
    [ASPECT_TYPES.SQUARE]: 90,
    [ASPECT_TYPES.TRINE]: 120,
    [ASPECT_TYPES.OPPOSITION]: 180
  }
  
  const exactAngle = exactAngles[aspectType] || 0
  return Math.abs(angle - exactAngle)
}
