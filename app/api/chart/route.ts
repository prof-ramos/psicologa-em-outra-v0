import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getTimezoneOffset } from '@/app/utils/timezone'
import { signFromAbsDegree, absoluteDegree, ZODIAC_SIGNS } from '@/app/utils/zodiac'
import { calculateAspectType, calculateOrb } from '@/app/utils/aspects'
import type { ChartData, Planet, House, Aspect } from '@/app/types/astrology'

const ChartRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:mm'),
  place: z.string().min(1, 'Local é obrigatório'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ChartRequestSchema.parse(body)
    
    const { name, date, time, place, latitude, longitude } = validatedData

    // Calcular timezone IANA baseado na localização
    const timezoneIANA = await getTimezoneIANA(latitude, longitude)
    
    // Preparar dados para a API Astrologer v4
    const [year, month, day] = date.split('-').map(Number)
    const [hour, minute] = time.split(':').map(Number)

    const astrologerPayload = {
      subject: {
        year,
        month,
        day,
        hour,
        minute,
        longitude,
        latitude,
        city: place.split(',')[0] || place, // Primeira parte do local como cidade
        nation: "BR", // Padrão Brasil, pode ser melhorado
        timezone: timezoneIANA,
        name,
        zodiac_type: "Tropic",
        sidereal_mode: null,
        perspective_type: "Apparent Geocentric",
        houses_system_identifier: "P" // Placidus
      },
      theme: "classic",
      language: "EN",
      wheel_only: false
    }

    // Chamar API Astrologer v4
    const rapidApiKey = process.env.RAPIDAPI_KEY
    if (!rapidApiKey) {
      console.warn('RAPIDAPI_KEY não configurada, usando dados de demonstração')
      return NextResponse.json(generateMockChartData(validatedData))
    }

    console.log('Chamando API Astrologer v4 com payload:', JSON.stringify(astrologerPayload, null, 2))

    const astrologerResponse = await fetch('https://astrologer.p.rapidapi.com/api/v4/birth-chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'astrologer.p.rapidapi.com'
      },
      body: JSON.stringify(astrologerPayload)
    })

    if (!astrologerResponse.ok) {
      const errorText = await astrologerResponse.text()
      console.error('Erro da API Astrologer v4:', errorText)
      
      if (astrologerResponse.status === 401) {
        return NextResponse.json({
          ...generateMockChartData(validatedData),
          warning: 'Chave da API inválida. Usando dados de demonstração. Configure sua chave RapidAPI válida.'
        })
      }
      
      if (astrologerResponse.status === 429) {
        return NextResponse.json({
          ...generateMockChartData(validatedData),
          warning: 'Limite da API excedido. Usando dados de demonstração.'
        })
      }
      
      return NextResponse.json({
        ...generateMockChartData(validatedData),
        warning: 'Erro na API Astrologer. Usando dados de demonstração.'
      })
    }

    const astrologerData = await astrologerResponse.json()
    console.log('Resposta da API Astrologer v4:', JSON.stringify(astrologerData, null, 2))
    
    // Processar dados da resposta v4
    const chartData: ChartData = {
      name,
      birthDate: date,
      birthTime: time,
      birthPlace: place,
      planets: processPlanetsV4(astrologerData.data?.planets || astrologerData.planets || []),
      houses: processHousesV4(astrologerData.data?.houses || astrologerData.houses || []),
      aspects: processAspectsV4(astrologerData.data?.aspects || astrologerData.aspects || [])
    }

    return NextResponse.json(chartData)

  } catch (error) {
    console.error('Erro no processamento:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    // Retornar dados mock em caso de erro
    const fallbackData = generateMockChartData({
      name: 'Usuário',
      date: '1990-01-01',
      time: '12:00',
      place: 'Local desconhecido',
      latitude: 0,
      longitude: 0
    })

    return NextResponse.json({
      ...fallbackData,
      warning: 'Erro no processamento. Usando dados de demonstração.'
    })
  }
}

function processPlanetsV4(planetsData: any[]): Planet[] {
  const planetMapping: Record<string, string> = {
    'sun': 'Sun',
    'moon': 'Moon',
    'mercury': 'Mercury',
    'venus': 'Venus',
    'mars': 'Mars',
    'jupiter': 'Jupiter',
    'saturn': 'Saturn',
    'uranus': 'Uranus',
    'neptune': 'Neptune',
    'pluto': 'Pluto',
    'north_node': 'North Node',
    'south_node': 'South Node',
    'chiron': 'Chiron',
    'ascendant': 'Ascendant',
    'midheaven': 'Midheaven'
  }

  return planetsData.map((planet: any) => {
    const planetName = planetMapping[planet.name?.toLowerCase()] || planet.name || 'Unknown'
    const absDegree = planet.longitude || planet.degree || 0
    const { signIndex, degree } = signFromAbsDegree(absDegree)
    
    return {
      name: planetName,
      sign: planet.sign?.name || ZODIAC_SIGNS[signIndex] || '',
      signIndex,
      degree,
      absDegree,
      house: planet.house || 1
    }
  })
}

function processHousesV4(housesData: any[]): House[] {
  return housesData.map((house: any, index: number) => {
    const absDegree = house.longitude || house.degree || index * 30
    const { signIndex, degree } = signFromAbsDegree(absDegree)
    
    return {
      house: house.number || index + 1,
      sign: house.sign?.name || ZODIAC_SIGNS[signIndex] || '',
      signIndex,
      degree,
      absDegree
    }
  })
}

function processAspectsV4(aspectsData: any[]): Aspect[] {
  const aspectMapping: Record<string, string> = {
    'conjunction': 'conjunction',
    'sextile': 'sextile',
    'square': 'square',
    'trine': 'trine',
    'opposition': 'opposition'
  }

  return aspectsData.map((aspect: any) => ({
    planetA: aspect.first_planet?.name || aspect.planet1 || 'Unknown',
    planetB: aspect.second_planet?.name || aspect.planet2 || 'Unknown',
    type: aspectMapping[aspect.type?.toLowerCase()] || aspect.type || 'conjunction',
    orb: aspect.orb || 0,
    angle: aspect.angle || 0
  }))
}

async function getTimezoneIANA(latitude: number, longitude: number): Promise<string> {
  try {
    // Aproximação simples baseada na longitude
    // Em produção, use uma biblioteca como timezonefinder
    const offsetHours = Math.round(longitude / 15)
    
    // Mapeamento básico de timezones comuns
    const timezoneMap: Record<number, string> = {
      '-12': 'Pacific/Kwajalein',
      '-11': 'Pacific/Midway',
      '-10': 'Pacific/Honolulu',
      '-9': 'America/Anchorage',
      '-8': 'America/Los_Angeles',
      '-7': 'America/Denver',
      '-6': 'America/Chicago',
      '-5': 'America/New_York',
      '-4': 'America/Halifax',
      '-3': 'America/Sao_Paulo',
      '-2': 'Atlantic/South_Georgia',
      '-1': 'Atlantic/Azores',
      '0': 'Europe/London',
      '1': 'Europe/Paris',
      '2': 'Europe/Berlin',
      '3': 'Europe/Moscow',
      '4': 'Asia/Dubai',
      '5': 'Asia/Karachi',
      '6': 'Asia/Dhaka',
      '7': 'Asia/Bangkok',
      '8': 'Asia/Shanghai',
      '9': 'Asia/Tokyo',
      '10': 'Australia/Sydney',
      '11': 'Pacific/Norfolk',
      '12': 'Pacific/Auckland'
    }
    
    return timezoneMap[offsetHours.toString()] || 'UTC'
  } catch (error) {
    console.error('Erro ao calcular timezone IANA:', error)
    return 'UTC'
  }
}

function generateMockChartData(data: any): ChartData {
  // Dados mock para demonstração
  const mockPlanets: Planet[] = [
    { name: 'Sun', sign: 'Leão', signIndex: 4, degree: 15.5, absDegree: 135.5, house: 1 },
    { name: 'Moon', sign: 'Câncer', signIndex: 3, degree: 22.3, absDegree: 112.3, house: 12 },
    { name: 'Mercury', sign: 'Virgem', signIndex: 5, degree: 8.7, absDegree: 158.7, house: 2 },
    { name: 'Venus', sign: 'Libra', signIndex: 6, degree: 12.1, absDegree: 192.1, house: 3 },
    { name: 'Mars', sign: 'Escorpião', signIndex: 7, degree: 25.8, absDegree: 235.8, house: 4 },
    { name: 'Jupiter', sign: 'Sagitário', signIndex: 8, degree: 18.4, absDegree: 258.4, house: 5 },
    { name: 'Saturn', sign: 'Capricórnio', signIndex: 9, degree: 5.2, absDegree: 275.2, house: 6 },
    { name: 'Uranus', sign: 'Aquário', signIndex: 10, degree: 14.9, absDegree: 314.9, house: 7 },
    { name: 'Neptune', sign: 'Peixes', signIndex: 11, degree: 28.1, absDegree: 358.1, house: 8 },
    { name: 'Pluto', sign: 'Escorpião', signIndex: 7, degree: 3.6, absDegree: 213.6, house: 4 }
  ]

  const mockHouses: House[] = Array.from({ length: 12 }, (_, i) => ({
    house: i + 1,
    sign: ZODIAC_SIGNS[i % 12],
    signIndex: i % 12,
    degree: Math.random() * 30,
    absDegree: i * 30 + Math.random() * 30
  }))

  const mockAspects: Aspect[] = [
    { planetA: 'Sun', planetB: 'Moon', type: 'trine', orb: 2.1, angle: 120 },
    { planetA: 'Venus', planetB: 'Mars', type: 'conjunction', orb: 1.5, angle: 0 },
    { planetA: 'Mercury', planetB: 'Jupiter', type: 'sextile', orb: 3.2, angle: 60 },
    { planetA: 'Saturn', planetB: 'Uranus', type: 'square', orb: 4.1, angle: 90 },
    { planetA: 'Sun', planetB: 'Pluto', type: 'opposition', orb: 2.8, angle: 180 }
  ]

  return {
    name: data.name,
    birthDate: data.date,
    birthTime: data.time,
    birthPlace: data.place,
    planets: mockPlanets,
    houses: mockHouses,
    aspects: mockAspects
  }
}
