export interface Planet {
  name: string
  sign: string
  signIndex: number
  degree: number
  absDegree: number
  house: number
}

export interface House {
  house: number
  sign: string
  signIndex: number
  degree: number
  absDegree: number
}

export interface Aspect {
  planetA: string
  planetB: string
  type: string
  orb: number
  angle: number
}

export interface ChartData {
  name: string
  birthDate: string
  birthTime: string
  birthPlace: string
  planets: Planet[]
  houses: House[]
  aspects: Aspect[]
}

export interface ChartRequest {
  name: string
  date: string
  time: string
  place: string
  latitude: number
  longitude: number
}
