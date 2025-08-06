"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle, AlertCircle, Play, Download } from 'lucide-react'

interface ComprehensiveTestResult {
  endpoint: string
  method: string
  host: string
  payload: any
  status: 'success' | 'error' | 'testing' | 'pending'
  statusCode?: number
  message?: string
  responseTime?: number
  data?: any
}

export function ComprehensiveTest() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<ComprehensiveTestResult[]>([])
  const [progress, setProgress] = useState(0)
  const [currentTest, setCurrentTest] = useState('')
  const { toast } = useToast()

  // Lista expandida de endpoints
  const endpoints = [
    'https://astrologer.p.rapidapi.com/natal-chart',
    'https://astrologer.p.rapidapi.com/api/natal-chart',
    'https://astrologer.p.rapidapi.com/api/v1/natal-chart',
    'https://astrologer.p.rapidapi.com/chart',
    'https://astrologer.p.rapidapi.com/birth-chart',
    'https://astrologer.p.rapidapi.com/horoscope/natal',
    'https://astrologer.p.rapidapi.com/v1/natal-chart',
    'https://astrologer.p.rapidapi.com/astrology/natal',
    'https://astrologer.p.rapidapi.com/calculate/natal',
    'https://astrologer.p.rapidapi.com/generate/chart',
    'https://astrologer.p.rapidapi.com/natal',
    'https://astrologer.p.rapidapi.com/chart/natal',
    'https://astrologer.p.rapidapi.com/api/chart',
    'https://astrology-api.p.rapidapi.com/natal-chart',
    'https://astrology.p.rapidapi.com/natal-chart',
    'https://horoscope-api.p.rapidapi.com/natal-chart'
  ]

  // Diferentes variações de payload
  const payloads = [
    {
      name: "Standard Format",
      data: {
        name: "Test User",
        date: "1990-01-01",
        time: "12:00",
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: -5
      }
    },
    {
      name: "Alternative Format 1",
      data: {
        name: "Test User",
        birth_date: "1990-01-01",
        birth_time: "12:00",
        lat: 40.7128,
        lng: -74.0060,
        tz: -5
      }
    },
    {
      name: "Alternative Format 2",
      data: {
        name: "Test User",
        date: "1990-01-01",
        time: "12:00:00",
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        timezone: "America/New_York"
      }
    },
    {
      name: "Numeric Format",
      data: {
        year: 1990,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: -5
      }
    }
  ]

  const methods = ['POST', 'GET']

  const runComprehensiveTest = async () => {
    setIsRunning(true)
    setResults([])
    setProgress(0)

    // Gerar todas as combinações de teste
    const testCombinations: ComprehensiveTestResult[] = []
    
    endpoints.forEach(endpoint => {
      methods.forEach(method => {
        payloads.forEach(payload => {
          const host = new URL(endpoint).hostname
          testCombinations.push({
            endpoint,
            method,
            host,
            payload: payload.data,
            status: 'pending'
          })
        })
      })
    })

    setResults(testCombinations)
    const totalTests = testCombinations.length

    // Executar testes
    for (let i = 0; i < testCombinations.length; i++) {
      const test = testCombinations[i]
      setCurrentTest(`${test.method} ${test.endpoint}`)
      
      // Atualizar status para 'testing'
      setResults(prev => prev.map((r, index) => 
        index === i ? { ...r, status: 'testing' as const } : r
      ))

      try {
        const response = await fetch('/api/test-astrologer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: test.endpoint,
            method: test.method,
            host: test.host,
            payload: test.payload
          })
        })

        const result = await response.json()
        
        setResults(prev => prev.map((r, index) => 
          index === i ? {
            ...r,
            status: result.success ? 'success' as const : 'error' as const,
            statusCode: result.statusCode,
            message: result.message,
            responseTime: result.responseTime,
            data: result.data
          } : r
        ))

      } catch (error) {
        setResults(prev => prev.map((r, index) => 
          index === i ? {
            ...r,
            status: 'error' as const,
            message: error instanceof Error ? error.message : 'Erro de conexão'
          } : r
        ))
      }

      setProgress(((i + 1) / totalTests) * 100)
      
      // Pequena pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    setIsRunning(false)
    setCurrentTest('')

    // Mostrar resumo
    const successCount = results.filter(r => r.status === 'success').length
    toast({
      title: "Teste abrangente concluído",
      description: `${successCount} de ${totalTests} combinações funcionando`,
      variant: successCount > 0 ? "default" : "destructive"
    })
  }

  const exportResults = () => {
    const successfulTests = results.filter(r => r.status === 'success')
    const dataStr = JSON.stringify(successfulTests, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'astrologer-api-working-endpoints.json'
    link.click()
  }

  const getStatusIcon = (status: ComprehensiveTestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'testing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const successfulResults = results.filter(r => r.status === 'success')
  const errorResults = results.filter(r => r.status === 'error')
  const pendingResults = results.filter(r => r.status === 'pending' || r.status === 'testing')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste Abrangente da API</CardTitle>
          <CardDescription>
            Testa todas as combinações possíveis de endpoints, métodos e formatos de payload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {endpoints.length} endpoints × {methods.length} métodos × {payloads.length} formatos = {endpoints.length * methods.length * payloads.length} testes
            </div>
            <Button 
              onClick={runComprehensiveTest}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Executar Teste Completo
                </>
              )}
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progresso: {Math.round(progress)}%</span>
                <span className="text-gray-500">{currentTest}</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{successfulResults.length}</div>
                <div className="text-sm text-green-700">Sucessos</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{errorResults.length}</div>
                <div className="text-sm text-red-700">Erros</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{pendingResults.length}</div>
                <div className="text-sm text-blue-700">Pendentes</div>
              </div>
            </div>
          )}

          {successfulResults.length > 0 && (
            <Button 
              onClick={exportResults}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Endpoints Funcionais
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Resultados Bem-sucedidos */}
      {successfulResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">✅ Endpoints Funcionais ({successfulResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {successfulResults.map((result, index) => (
                <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <Badge variant="secondary">{result.method}</Badge>
                      <code className="text-sm bg-white px-2 py-1 rounded">
                        {result.endpoint}
                      </code>
                    </div>
                    <div className="text-sm text-gray-600">
                      {result.responseTime}ms
                    </div>
                  </div>
                  
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-green-700">
                      Ver payload e resposta
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <div className="text-xs font-medium text-gray-600">Payload:</div>
                        <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-20">
                          {JSON.stringify(result.payload, null, 2)}
                        </pre>
                      </div>
                      {result.data && (
                        <div>
                          <div className="text-xs font-medium text-gray-600">Resposta:</div>
                          <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-20">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo de Erros */}
      {errorResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">❌ Resumo de Erros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(
                errorResults.reduce((acc, result) => {
                  const key = `${result.statusCode} - ${result.message}`
                  acc[key] = (acc[key] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).map(([error, count]) => (
                <div key={error} className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm">{error}</span>
                  <Badge variant="destructive">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
