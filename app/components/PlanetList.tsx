"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Planet, Aspect } from "../types/astrology"
import { getSignName, getPlanetSymbol, formatDegree } from "../utils/zodiac"
import { getAspectName, getAspectColor } from "../utils/aspects"

interface PlanetListProps {
  planets: Planet[]
  aspects: Aspect[]
}

export function PlanetList({ planets, aspects }: PlanetListProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Posições dos Planetas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {planets.map((planet) => (
              <div key={planet.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-bold">
                      {getPlanetSymbol(planet.name)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{planet.name}</div>
                    <div className="text-sm text-gray-600">
                      Casa {planet.house}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {getSignName(planet.signIndex)} {formatDegree(planet.degree)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDegree(planet.absDegree)}°
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aspectos Planetários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aspects.length > 0 ? (
              aspects.map((aspect, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{getPlanetSymbol(aspect.planetA)}</span>
                      <span className="text-gray-400">—</span>
                      <span className="font-semibold">{getPlanetSymbol(aspect.planetB)}</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        {aspect.planetA} - {aspect.planetB}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary"
                      style={{ backgroundColor: getAspectColor(aspect.type) }}
                      className="text-white"
                    >
                      {getAspectName(aspect.type)}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {formatDegree(aspect.orb)}°
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                Nenhum aspecto encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
