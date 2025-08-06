import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { endpoint, payload, apiKey, method = 'POST', host } = await request.json()
    
    const rapidApiKey = apiKey || process.env.RAPIDAPI_KEY
    
    if (!rapidApiKey) {
      return NextResponse.json({
        success: false,
        message: 'Chave RapidAPI não configurada',
        statusCode: 401
      })
    }

    // Usar endpoint v4 se não especificado
    const testEndpoint = endpoint || 'https://astrologer.p.rapidapi.com/api/v4/birth-chart'
    
    // Payload padrão para v4 se não especificado
    const testPayload = payload || {
      subject: {
        year: 1990,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
        longitude: -74.0060,
        latitude: 40.7128,
        city: "New York",
        nation: "US",
        timezone: "America/New_York",
        name: "Test User",
        zodiac_type: "Tropic",
        sidereal_mode: null,
        perspective_type: "Apparent Geocentric",
        houses_system_identifier: "P"
      },
      theme: "classic",
      language: "EN",
      wheel_only: false
    }

    // Extrair host do endpoint ou usar o fornecido
    const apiHost = host || 'astrologer.p.rapidapi.com'

    console.log(`Testando endpoint: ${testEndpoint}`)
    console.log(`Host: ${apiHost}`)
    console.log(`Método: ${method}`)
    console.log(`Payload:`, JSON.stringify(testPayload, null, 2))

    const startTime = Date.now()
    
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': apiHost
      }
    }

    // Adicionar body apenas para POST
    if (method === 'POST' && testPayload) {
      fetchOptions.body = JSON.stringify(testPayload)
    }

    const response = await fetch(testEndpoint, fetchOptions)
    const responseTime = Date.now() - startTime
    const responseText = await response.text()
    
    console.log(`Status: ${response.status}`)
    console.log(`Response: ${responseText.substring(0, 1000)}...`)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = responseText
    }

    if (response.ok) {
      return NextResponse.json({
        success: true,
        data: responseData,
        statusCode: response.status,
        responseTime,
        message: 'Endpoint v4 funcionando corretamente!',
        method,
        host: apiHost,
        endpoint: testEndpoint
      })
    } else {
      let errorMessage = 'Erro desconhecido'
      
      if (response.status === 401) {
        errorMessage = 'Chave da API inválida ou não autorizada'
      } else if (response.status === 403) {
        errorMessage = 'Acesso negado - verifique permissões da API'
      } else if (response.status === 404) {
        errorMessage = 'Endpoint não encontrado'
      } else if (response.status === 405) {
        errorMessage = `Método ${method} não permitido`
      } else if (response.status === 429) {
        errorMessage = 'Limite de requisições excedido'
      } else if (response.status >= 500) {
        errorMessage = 'Erro interno do servidor da API'
      } else if (responseData && typeof responseData === 'object') {
        errorMessage = responseData.message || responseData.error || errorMessage
      }

      return NextResponse.json({
        success: false,
        message: errorMessage,
        statusCode: response.status,
        responseTime,
        data: responseData,
        method,
        host: apiHost,
        endpoint: testEndpoint
      })
    }

  } catch (error) {
    console.error('Erro no teste da API:', error)
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro de conexão',
      statusCode: 500
    })
  }
}
