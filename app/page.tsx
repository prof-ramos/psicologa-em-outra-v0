"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Stars } from 'lucide-react'
import { LocationCombobox } from "./components/LocationCombobox"
import { ZodiacWheel } from "./components/ZodiacWheel"
import { PlanetList } from "./components/PlanetList"
import type { ChartData } from "./types/astrology"
import { Navigation } from "./components/Navigation"
import { AstrologicalChatbot } from "./components/AstrologicalChatbot"

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    place: "",
    coordinates: null as { lat: number; lon: number } | null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isChatbotVisible, setIsChatbotVisible] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.date || !formData.time || !formData.coordinates) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para gerar o mapa astral.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch("/api/chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          date: formData.date,
          time: formData.time,
          place: formData.place,
          latitude: formData.coordinates.lat,
          longitude: formData.coordinates.lon
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao gerar mapa astral")
      }

      const data = await response.json()
      setChartData(data)
      
      toast({
        title: data.warning ? "Mapa de demonstração gerado" : "Mapa astral gerado!",
        description: data.warning || `Mapa astral de ${formData.name} criado com sucesso.`,
        variant: data.warning ? "default" : "default"
      })
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao gerar mapa astral",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationSelect = (place: string, coordinates: { lat: number; lon: number }) => {
    setFormData(prev => ({
      ...prev,
      place,
      coordinates
    }))
  }

  const toggleChatbot = () => {
    setIsChatbotVisible(!isChatbotVisible)
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
            Descubra as posições dos planetas no momento do seu nascimento e explore sua personalidade astrológica
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Dados de Nascimento</CardTitle>
              <CardDescription>
                Preencha suas informações para gerar o mapa astral
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Data de nascimento</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Hora de nascimento</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Local de nascimento</Label>
                  <LocationCombobox
                    onLocationSelect={handleLocationSelect}
                    placeholder="Digite cidade, estado, país..."
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando mapa astral...
                    </>
                  ) : (
                    "Gerar Mapa Astral"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {chartData ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Mapa Astral - {chartData.name}</CardTitle>
                    <CardDescription>
                      {new Date(chartData.birthDate).toLocaleDateString('pt-BR')} às {chartData.birthTime} - {chartData.birthPlace}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ZodiacWheel 
                      planets={chartData.planets}
                      houses={chartData.houses}
                    />
                  </CardContent>
                </Card>

                <PlanetList 
                  planets={chartData.planets}
                  aspects={chartData.aspects}
                />
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-500">
                    <Stars className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Preencha o formulário para gerar seu mapa astral</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <AstrologicalChatbot
          chartData={chartData}
          isVisible={isChatbotVisible}
          onToggle={toggleChatbot}
        />
      </div>
    </div>
  )
}
