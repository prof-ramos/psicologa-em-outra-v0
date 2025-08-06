"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle, Zap } from 'lucide-react'

export function QuickTest() {
  const [isTestingV4, setIsTestingV4] = useState(false)
  const [v4Result, setV4Result] = useState<any>(null)
  const { toast } = useToast()

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

  return (
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
  )
}
