"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle, AlertCircle, Settings, Shield, Zap } from 'lucide-react'

interface TestResult {
  endpoint: string
  status: 'success' | 'error' | 'testing'
  statusCode?: number
  message?: string
  responseTime?: number
  data?: any
}

export default function AdminPage() {
  const [isTestingV4, setIsTestingV4] = useState(false)
  const [v4Result, setV4Result] = useState<any>(null)
  const [isTestingAll, setIsTestingAll] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [apiKey, setApiKey] = useState('')
  const { toast } = useToast()

  const endpoints = [
    'https://astrologer.p.rapidapi.com/api/v4/birth-chart',
    'https://astrologer.p.rapidapi.com/natal-chart',
    'https://astrologer.p.rapidapi.com/api/natal-chart',
    'https://astrologer.p.rapidapi.com/api/v1/natal-chart',
    'https://astrologer.p.rapidapi.com/chart',
    'https://astrologer.p.rapidapi.com/birth-chart',
    'https://astrologer.p.rapidapi.com/horoscope/natal',
    'https://astrologer.p.rapidapi.com/v1/natal-chart'
  ]

  const testV4Endpoint = async () => {
    setIsTestingV4(true)
    setV4Result(null)

    try {
      const response = await fetch('/api/test-astrologer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'https://astrologer.p.rapidapi.com/api/v4/birth-chart',
          method: 'POST',
          payload: {
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
        })
      })

      const result = await response.json()
      setV4Result(result)

      toast({
        title: result.success ? "Teste V4 bem-sucedido!" : "Teste V4 falhou",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      })

    } catch (error) {
      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Erro de conexão',
        statusCode: 500
      }
      setV4Result(errorResult)

      toast({
        title: "Erro no teste",
        description: "Falha na conexão com a API",
        variant: "destructive"
      })
    } finally {
      setIsTestingV4(false)
    }
  }

  const testSingleEndpoint = async (endpoint: string): Promise<TestResult> => {
    const startTime = Date.now()
    
    try {
      const response = await fetch('/api/test-astrologer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint,
          payload: {
            name: "Test User",
            date: "1990-01-01",
            time: "12:00",
            latitude: 40.7128,
            longitude: -74.0060,
            timezone: -5
          },
          apiKey: apiKey || undefined
        })
      })

      const responseTime = Date.now() - startTime
      const data = await response.json()

      if (response.ok && data.success) {
        return {
          endpoint,
          status: 'success',
          statusCode: response.status,
          message: 'Endpoint funcionando!',
          responseTime,
          data: data.data
        }
      } else {
        return {
          endpoint,
          status: 'error',
          statusCode: data.statusCode || response.status,
          message: data.message || 'Erro desconhecido',
          responseTime
        }
      }
    } catch (error) {
      return {
        endpoint,
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro de conexão',
        responseTime: Date.now() - startTime
      }
    }
  }

  const testAllEndpoints = async () => {
    setIsTestingAll(true)
    setResults([])

    const initialResults: TestResult[] = endpoints.map(endpoint => ({
      endpoint,
      status: 'testing'
    }))
    setResults(initialResults)

    for (let i = 0; i < endpoints.length; i++) {
      const result = await testSingleEndpoint(endpoints[i])
      
      setResults(prev => prev.map((r, index) => 
        index === i ? result : r
      ))

      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsTestingAll(false)

    const successCount = results.filter(r => r.status === 'success').length
    toast({
      title: "Teste concluído",
      description: `${successCount} de ${endpoints.length} endpoints funcionando`,
      variant: successCount > 0 ? "default" : "destructive"
    })
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'testing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'testing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Painel de Administração
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Área restrita para testes e configurações da API Astrologer
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Teste Rápido V4 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Teste Rápido V4
              </CardTitle>
              <CardDescription>
                Teste o endpoint correto da API Astrologer v4 com o formato de payload atualizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Endpoint V4 Correto:</h4>
                <code className="text-sm bg-white px-2 py-1 rounded">
                  https://astrologer.p.rapidapi.com/api/v4/birth-chart
                </code>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Payload V4 (formato correto):</h4>
                <pre className="text-xs text-gray-600 overflow-auto max-h-40">
{`{
  "subject": {
    "year": 1990,
    "month": 1,
    "day": 1,
    "hour": 12,
    "minute": 0,
    "longitude": -74.0060,
    "latitude": 40.7128,
    "city": "New York",
    "nation": "US",
    "timezone": "America/New_York",
    "name": "Test User",
    "zodiac_type": "Tropic",
    "sidereal_mode": null,
    "perspective_type": "Apparent Geocentric",
    "houses_system_identifier": "P"
  },
  "theme": "classic",
  "language": "EN",
  "wheel_only": false
}`}
                </pre>
              </div>

              <Button 
                onClick={testV4Endpoint}
                disabled={isTestingV4}
                className="w-full"
              >
                {isTestingV4 ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testando V4...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Testar Endpoint V4
                  </>
                )}
              </Button>

              {v4Result && (
                <div className={`border rounded-lg p-4 ${
                  v4Result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {v4Result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {v4Result.success ? 'Sucesso!' : 'Erro'}
                      </span>
                    </div>
                    <Badge variant={v4Result.success ? "default" : "destructive"}>
                      {v4Result.statusCode}
                    </Badge>
                  </div>

                  <p className="text-sm mb-2">{v4Result.message}</p>

                  {v4Result.responseTime && (
                    <p className="text-xs text-gray-600">
                      Tempo de resposta: {v4Result.responseTime}ms
                    </p>
                  )}

                  {v4Result.success && v4Result.data && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-green-700">
                        Ver resposta da API V4
                      </summary>
                      <pre className="mt-2 text-xs bg-white p-3 rounded overflow-auto max-h-60">
                        {JSON.stringify(v4Result.data, null, 2)}
                      </pre>
                    </details>
                  )}

                  {!v4Result.success && v4Result.data && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-red-700">
                        Ver detalhes do erro
                      </summary>
                      <pre className="mt-2 text-xs bg-white p-3 rounded overflow-auto max-h-40">
                        {JSON.stringify(v4Result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuração de Testes */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração dos Testes</CardTitle>
              <CardDescription>
                Configure sua chave RapidAPI para testar todos os endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Chave RapidAPI (opcional - deixe vazio para usar variável de ambiente)
                </label>
                <input
                  type="password"
                  placeholder="Sua chave RapidAPI..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <Button 
                onClick={testAllEndpoints}
                disabled={isTestingAll}
                className="w-full"
                variant="destructive"
              >
                {isTestingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testando todos os endpoints...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Testar Todos os Endpoints
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultados dos Testes */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados dos Testes</CardTitle>
                <CardDescription>
                  Status de cada endpoint testado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {result.endpoint}
                          </code>
                        </div>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status === 'testing' ? 'Testando...' : 
                           result.status === 'success' ? 'Sucesso' : 'Erro'}
                        </Badge>
                      </div>

                      {result.message && (
                        <p className="text-sm text-gray-600 mb-2">
                          {result.message}
                        </p>
                      )}

                      <div className="flex gap-4 text-xs text-gray-500">
                        {result.statusCode && (
                          <span>Status: {result.statusCode}</span>
                        )}
                        {result.responseTime && (
                          <span>Tempo: {result.responseTime}ms</span>
                        )}
                      </div>

                      {result.data && result.status === 'success' && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm font-medium text-red-600">
                            Ver resposta da API
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Variáveis de Ambiente:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                  <p>RAPIDAPI_KEY: {process.env.RAPIDAPI_KEY ? '✅ Configurada' : '❌ Não configurada'}</p>
                  <p>GEMINI_API_KEY: {process.env.GEMINI_API_KEY ? '✅ Configurada' : '❌ Não configurada'}</p>
                  <p>NEXT_PUBLIC_NOMINATIM_EMAIL: {process.env.NEXT_PUBLIC_NOMINATIM_EMAIL ? '✅ Configurada' : '❌ Não configurada'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Endpoint Correto V4:</h4>
                <div className="bg-green-50 p-3 rounded text-sm">
                  <code>https://astrologer.p.rapidapi.com/api/v4/birth-chart</code>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Principais mudanças na V4:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Estrutura de payload completamente nova com objeto "subject"</li>
                  <li>Campos separados para year, month, day, hour, minute</li>
                  <li>Timezone no formato IANA (ex: "America/New_York")</li>
                  <li>Campo "nation" com código de 2 letras (ex: "US", "BR")</li>
                  <li>Configurações adicionais como zodiac_type, houses_system_identifier</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-yellow-800">💡 Dicas:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Use sua chave RapidAPI válida</li>
                  <li>• O endpoint v4 requer formato de payload específico</li>
                  <li>• Timezone deve ser no formato IANA (ex: "America/New_York")</li>
                  <li>• Nation deve ser código de 2 letras (ex: "US", "BR")</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
