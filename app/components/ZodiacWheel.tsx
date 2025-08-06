"use client"

import { useMemo } from "react"
import type { Planet, House } from "../types/astrology"
import { getSignName, getSignColor, getPlanetSymbol } from "../utils/zodiac"

interface ZodiacWheelProps {
  planets: Planet[]
  houses: House[]
}

export function ZodiacWheel({ planets, houses }: ZodiacWheelProps) {
  const wheelSize = 400
  const center = wheelSize / 2
  const outerRadius = 180
  const innerRadius = 120
  const planetRadius = 150

  // Criar setores dos signos
  const zodiacSigns = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const startAngle = i * 30 - 90 // Começar do Áries no topo
      const endAngle = startAngle + 30
      const midAngle = startAngle + 15
      
      return {
        index: i,
        name: getSignName(i),
        color: getSignColor(i),
        startAngle,
        endAngle,
        midAngle
      }
    })
  }, [])

  // Posicionar planetas
  const planetPositions = useMemo(() => {
    return planets.map(planet => {
      const angle = (planet.absDegree - 90) * (Math.PI / 180) // Converter para radianos
      const x = center + planetRadius * Math.cos(angle)
      const y = center + planetRadius * Math.sin(angle)
      
      return {
        ...planet,
        x,
        y,
        angle: planet.absDegree
      }
    })
  }, [planets, center, planetRadius])

  // Criar path do setor
  const createSectorPath = (startAngle: number, endAngle: number, innerR: number, outerR: number) => {
    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180
    
    const x1 = center + innerR * Math.cos(startAngleRad)
    const y1 = center + innerR * Math.sin(startAngleRad)
    const x2 = center + outerR * Math.cos(startAngleRad)
    const y2 = center + outerR * Math.sin(startAngleRad)
    
    const x3 = center + outerR * Math.cos(endAngleRad)
    const y3 = center + outerR * Math.sin(endAngleRad)
    const x4 = center + innerR * Math.cos(endAngleRad)
    const y4 = center + innerR * Math.sin(endAngleRad)
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
    
    return [
      `M ${x1} ${y1}`,
      `L ${x2} ${y2}`,
      `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
      `L ${x4} ${y4}`,
      `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
      'Z'
    ].join(' ')
  }

  return (
    <div className="flex justify-center">
      <svg width={wheelSize} height={wheelSize} className="border rounded-full bg-white shadow-lg">
        {/* Círculos de referência */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="2"
        />
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="2"
        />

        {/* Setores dos signos */}
        {zodiacSigns.map((sign) => (
          <g key={sign.index}>
            <path
              d={createSectorPath(sign.startAngle, sign.endAngle, innerRadius, outerRadius)}
              fill={sign.color}
              fillOpacity="0.1"
              stroke={sign.color}
              strokeWidth="1"
            />
            
            {/* Nome do signo */}
            <text
              x={center + (innerRadius + outerRadius) / 2 * Math.cos((sign.midAngle * Math.PI) / 180)}
              y={center + (innerRadius + outerRadius) / 2 * Math.sin((sign.midAngle * Math.PI) / 180)}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-semibold fill-gray-700"
            >
              {sign.name}
            </text>
          </g>
        ))}

        {/* Linhas das casas */}
        {houses.map((house, index) => {
          const angle = (house.absDegree - 90) * (Math.PI / 180)
          const x1 = center + innerRadius * Math.cos(angle)
          const y1 = center + innerRadius * Math.sin(angle)
          const x2 = center + outerRadius * Math.cos(angle)
          const y2 = center + outerRadius * Math.sin(angle)
          
          return (
            <g key={house.house}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#6b7280"
                strokeWidth="2"
              />
              
              {/* Número da casa */}
              <text
                x={center + (innerRadius - 15) * Math.cos(angle)}
                y={center + (innerRadius - 15) * Math.sin(angle)}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-bold fill-gray-600"
              >
                {house.house}
              </text>
            </g>
          )
        })}

        {/* Planetas */}
        {planetPositions.map((planet) => (
          <g key={planet.name}>
            <circle
              cx={planet.x}
              cy={planet.y}
              r="12"
              fill="white"
              stroke="#4f46e5"
              strokeWidth="2"
            />
            <text
              x={planet.x}
              y={planet.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-bold fill-indigo-600"
            >
              {getPlanetSymbol(planet.name)}
            </text>
          </g>
        ))}

        {/* Centro */}
        <circle
          cx={center}
          cy={center}
          r="4"
          fill="#4f46e5"
        />
      </svg>
    </div>
  )
}
