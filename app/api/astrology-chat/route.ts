import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ChartData } from '@/app/types/astrology'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { message, chartData, conversationHistory } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        response: "🔑 Para usar o chatbot astrológico, configure sua chave da API Gemini no arquivo .env.local:\n\nGEMINI_API_KEY=sua_chave_aqui\n\nObtenha sua chave gratuita em: https://makersuite.google.com/app/apikey"
      })
    }

    // Preparar contexto astrológico detalhado
    const astrologicalContext = generateAstrologicalContext(chartData)
    
    // Preparar histórico da conversa
    const conversationContext = conversationHistory
      .filter((msg: any) => !msg.isTyping)
      .map((msg: any) => `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`)
      .join('\n\n')

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `Você é um assistente astrológico especializado, amigável e sábio. Sua missão é interpretar mapas astrais e conversar sobre astrologia de forma acessível e envolvente.

INFORMAÇÕES DO MAPA ASTRAL DO USUÁRIO:
${astrologicalContext}

HISTÓRICO DA CONVERSA:
${conversationContext}

NOVA PERGUNTA DO USUÁRIO: "${message}"

INSTRUÇÕES PARA SUA RESPOSTA:
1. Seja caloroso, empático e encorajador
2. Use emojis relevantes para tornar a conversa mais envolvente
3. Baseie suas respostas nas informações específicas do mapa astral do usuário
4. Explique conceitos astrológicos de forma simples e compreensível
5. Ofereça insights práticos e aplicáveis à vida cotidiana
6. Mantenha um tom otimista e construtivo
7. Se a pergunta não for sobre astrologia, redirecione gentilmente para temas astrológicos
8. Use no máximo 200 palavras por resposta para manter a conversa fluida
9. Cite posições específicas do mapa quando relevante
10. Ofereça conselhos práticos baseados nas características astrológicas

Responda de forma personalizada e específica para este usuário:`;

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    return NextResponse.json({ response: text })

  } catch (error) {
    console.error('Erro no chat astrológico:', error)
    
    return NextResponse.json({
      response: "😔 Desculpe, tive um problema para processar sua pergunta. Como um bom astrólogo, às vezes preciso de um momento para consultar as estrelas! Pode tentar novamente?"
    })
  }
}

function generateAstrologicalContext(chartData: ChartData): string {
  if (!chartData) return "Nenhum mapa astral disponível."

  let context = `MAPA ASTRAL DE ${chartData.name.toUpperCase()}\n`
  context += `Data de Nascimento: ${chartData.birthDate}\n`
  context += `Hora: ${chartData.birthTime}\n`
  context += `Local: ${chartData.birthPlace}\n\n`

  // Planetas e suas posições
  context += "POSIÇÕES PLANETÁRIAS:\n"
  chartData.planets.forEach(planet => {
    context += `• ${planet.name}: ${planet.sign} ${Math.floor(planet.degree)}°${Math.floor((planet.degree % 1) * 60)}' (Casa ${planet.house})\n`
  })

  // Casas astrológicas
  context += "\nCASAS ASTROLÓGICAS:\n"
  chartData.houses.forEach(house => {
    context += `• Casa ${house.house}: ${house.sign} ${Math.floor(house.degree)}°${Math.floor((house.degree % 1) * 60)}'\n`
  })

  // Aspectos planetários
  if (chartData.aspects.length > 0) {
    context += "\nASPECTOS PLANETÁRIOS:\n"
    chartData.aspects.forEach(aspect => {
      context += `• ${aspect.planetA} ${getAspectSymbol(aspect.type)} ${aspect.planetB} (orbe: ${aspect.orb.toFixed(1)}°)\n`
    })
  }

  // Análise dos elementos e modalidades
  const elementCount = analyzeElements(chartData.planets)
  const modalityCount = analyzeModalities(chartData.planets)
  
  context += "\nDISTRIBUIÇÃO POR ELEMENTOS:\n"
  Object.entries(elementCount).forEach(([element, count]) => {
    context += `• ${element}: ${count} planetas\n`
  })

  context += "\nDISTRIBUIÇÃO POR MODALIDADES:\n"
  Object.entries(modalityCount).forEach(([modality, count]) => {
    context += `• ${modality}: ${count} planetas\n`
  })

  return context
}

function getAspectSymbol(aspectType: string): string {
  const symbols: Record<string, string> = {
    'conjunction': '☌',
    'sextile': '⚹',
    'square': '□',
    'trine': '△',
    'opposition': '☍'
  }
  return symbols[aspectType] || aspectType
}

function analyzeElements(planets: any[]): Record<string, number> {
  const elements: Record<string, number> = {
    'Fogo': 0,
    'Terra': 0,
    'Ar': 0,
    'Água': 0
  }

  const signElements: Record<number, string> = {
    0: 'Fogo', 1: 'Terra', 2: 'Ar', 3: 'Água',
    4: 'Fogo', 5: 'Terra', 6: 'Ar', 7: 'Água',
    8: 'Fogo', 9: 'Terra', 10: 'Ar', 11: 'Água'
  }

  planets.forEach(planet => {
    const element = signElements[planet.signIndex]
    if (element) elements[element]++
  })

  return elements
}

function analyzeModalities(planets: any[]): Record<string, number> {
  const modalities: Record<string, number> = {
    'Cardinal': 0,
    'Fixo': 0,
    'Mutável': 0
  }

  const signModalities: Record<number, string> = {
    0: 'Cardinal', 1: 'Fixo', 2: 'Mutável', 3: 'Cardinal',
    4: 'Fixo', 5: 'Mutável', 6: 'Cardinal', 7: 'Fixo',
    8: 'Mutável', 9: 'Cardinal', 10: 'Fixo', 11: 'Mutável'
  }

  planets.forEach(planet => {
    const modality = signModalities[planet.signIndex]
    if (modality) modalities[modality]++
  })

  return modalities
}
