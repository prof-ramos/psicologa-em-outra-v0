"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react'
import { ComprehensiveTest } from "./comprehensive-test"
import { QuickTest } from "./quick-test"

interface TestResult {
  endpoint: string
  status: 'success' | 'error' | 'testing'
  statusCode?: number
  message?: string
  responseTime?: number
  data?: any
}

export default function TestApiPage() {
  const [isTestingAll, setIsTestingAll] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [apiKey, setApiKey] = useState('')
  const { toast } = useToast()
  const [testMode, setTestMode] = useState<'quick' | 'simple' | 'comprehensive'>('quick')

  const endpoints = [
    // Endpoint V4 correto (prioritário)
    'https://astrologer.p.rapidapi.com/api/v4/birth-chart',
    
    // Outros endpoints para teste
    'https://astrologer.p.rapidapi.com/natal-chart',
    'https://astrologer.p.rapidapi.com/api/natal-chart',
    'https://astrologer.p.rapidapi.com/api/v1/natal-chart',
    'https://astrologer.p.rapidapi.com/chart',
    'https://astrologer.p.rapidapi.com/birth-chart',
    'https://astrologer.p.rapidapi.com/horoscope/natal',
    'https://astrologer.p.rapidapi.com/v1/natal-chart'
  ]

  const testPayload = {
    name: "Test User",
    date: "1990-01-01",
    time: "12:00",
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: -5
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
          payload: testPayload,
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

    // Inicializar resultados com status 'testing'
    const initialResults: TestResult[] = endpoints.map(endpoint => ({
      endpoint,
      status: 'testing'
    }))
    setResults(initialResults)

    // Testar cada endpoint
    for (let i = 0; i < endpoints.length; i++) {
      const result = await testSingleEndpoint(endpoints[i])
      
      setResults(prev => prev.map((r, index) => 
        index === i ? result : r
      ))

      // Pequena pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsTestingAll(false)

    // Mostrar resumo
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Settings className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Teste da API Astrologer V4
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Teste o endpoint correto da API Astrologer v4 com o formato de payload atualizado
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex gap-2 mb-4">
            <Button 
              variant={testMode === 'quick' ? 'default' : 'outline'}
              onClick={() => setTestMode('quick')}
            >
              Teste Rápido V4
            </Button>
            <Button 
              variant={testMode === 'simple' ? 'default' : 'outline'}
              onClick={() => setTestMode('simple')}
            >
              Teste Simples
            </Button>
            <Button 
              variant={testMode === 'comprehensive' ? 'default' : 'outline'}
              onClick={() => setTestMode('comprehensive')}
            >
              Teste Abrangente
            </Button>
          </div>

          {testMode === 'quick' && <QuickTest />}

          {testMode === 'simple' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Configuração do Teste</CardTitle>
                  <CardDescription>
                    Configure sua chave RapidAPI para testar os endpoints
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Dados de teste:</h4>
                    <pre className="text-sm text-gray-600">
      {JSON.stringify(testPayload, null, 2)}
                    </pre>
                  </div>

                  <Button 
                    onClick={testAllEndpoints}
                    disabled={isTestingAll}
                    className="w-full"
                  >
                    {isTestingAll ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testando endpoints...
                      </>
                    ) : (
                      "Testar Todos os Endpoints"
                    )}
                  </Button>
                </CardContent>
              </Card>

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
                              <summary className="cursor-pointer text-sm font-medium text-purple-600">
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
            </>
          )}

          {testMode === 'comprehensive' && <ComprehensiveTest />}

          <Card>
            <CardHeader>
              <CardTitle>Informações sobre a API V4</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div>
                <h4 className="font-medium mb-2">Variáveis de Ambiente:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>RAPIDAPI_KEY: {process.env.RAPIDAPI_KEY ? '✅ Configurada' : '❌ Não configurada'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
