"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Stars, Calendar, Clock, MapPin } from 'lucide-react'
import { LocationCombobox } from "./components/LocationCombobox"
import { ZodiacWheel } from "./components/ZodiacWheel"
import { PlanetList } from "./components/PlanetList"
import { Navigation } from "./components/Navigation"
import { ChatbotToggle } from "./components/ChatbotToggle"
import { AstrologicalChatbot } from "./components/AstrologicalChatbot"
import type { ChartData } from "./types/astrology"

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    place: ""
  })
  const [location, setLocation] = useState<{ lat: number; lon: number; display_name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [showChatbot, setShowChatbot] = useState(false)
  const { toast } = useToast()

  const handleLocationSelect = (placeName: string, coords: { lat: number; lon: number }) => {
    setLocation({
      display_name: placeName,
      lat: coords.lat,
      lon: coords.lon
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.date || !formData.time || !location) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          date: formData.date,
          time: formData.time,
          place: location.display_name,
          latitude: location.lat,
          longitude: location.lon
        })
      })

      const data = await response.json()

      if (response.ok) {
        setChartData(data)
        toast({
          title: "Mapa astral gerado!",
          description: "Seu mapa natal foi calculado com sucesso"
        })
      } else {
        throw new Error(data.error || 'Erro ao gerar mapa astral')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro ao gerar mapa",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Stars className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Gerador de Mapa Astral
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubra os segredos do seu nascimento através da astrologia. 
            Gere seu mapa natal personalizado e explore as influências cósmicas em sua vida.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!chartData ? (
            <Card>
              <CardHeader>
                <CardTitle>Dados de Nascimento</CardTitle>
                <CardDescription>
                  Preencha suas informações para gerar seu mapa astral personalizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <Stars className="w-4 h-4" />
                        Nome completo
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Data de nascimento
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Hora de nascimento
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Local de nascimento
                      </Label>
                      <LocationCombobox
                        onLocationSelect={handleLocationSelect}
                        placeholder="Digite sua cidade..."
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando mapa astral...
                      </>
                    ) : (
                      <>
                        <Stars className="w-4 h-4 mr-2" />
                        Gerar Mapa Astral
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Mapa Astral de {chartData.name}
                </h2>
                <p className="text-gray-600">
                  Nascido em {new Date(formData.date).toLocaleDateString('pt-BR')} às {formData.time} em {location?.display_name}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Roda Zodiacal</CardTitle>
                      <CardDescription>
                        Visualização das posições planetárias no momento do nascimento
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ZodiacWheel 
                        planets={chartData.planets}
                        houses={chartData.houses}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <PlanetList 
                    planets={chartData.planets}
                    houses={chartData.houses}
                    aspects={chartData.aspects}
                  />
                </div>
              </div>

              <div className="text-center">
                <Button 
                  onClick={() => {
                    setChartData(null)
                    setFormData({ name: "", date: "", time: "", place: "" })
                    setLocation(null)
                    setShowChatbot(false)
                  }}
                  variant="outline"
                >
                  Gerar Novo Mapa
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chatbot */}
      {chartData && (
        <>
          <ChatbotToggle 
            onClick={() => setShowChatbot(!showChatbot)}
            isOpen={showChatbot}
          />
          
          {showChatbot && (
            <AstrologicalChatbot 
              chartData={chartData}
              onClose={() => setShowChatbot(false)}
            />
          )}
        </>
      )}
    </div>
  )
}
