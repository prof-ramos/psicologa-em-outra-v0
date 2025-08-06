"use client"

import { useState, useEffect, useCallback } from "react"
import { Check, ChevronsUpDown, MapPin } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"

interface Location {
  display_name: string
  lat: string
  lon: string
}

interface LocationComboboxProps {
  onLocationSelect: (place: string, coordinates: { lat: number; lon: number }) => void
  placeholder?: string
}

export function LocationCombobox({ onLocationSelect, placeholder = "Buscar localização..." }: LocationComboboxProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [query, setQuery] = useState("")
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const searchLocations = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setLocations([])
      return
    }

    setIsLoading(true)
    
    try {
      // Adicionar delay para respeitar rate limits do Nominatim
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AstralChartGenerator/1.0',
            'From': process.env.NEXT_PUBLIC_NOMINATIM_EMAIL || 'contact@example.com'
          }
        }
      )

      if (response.status === 429) {
        toast({
          title: "Muitas requisições",
          description: "Muitas requisições para geocodificação — tente novamente em instantes",
          variant: "destructive"
        })
        return
      }

      if (!response.ok) {
        throw new Error("Erro na busca de localização")
      }

      const data = await response.json()
      setLocations(data)
    } catch (error) {
      console.error("Erro na busca:", error)
      toast({
        title: "Erro",
        description: "Local não encontrado",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchLocations(query)
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [query, searchLocations])

  const handleSelect = (location: Location) => {
    setValue(location.display_name)
    setOpen(false)
    onLocationSelect(location.display_name, {
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon)
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {value || placeholder}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Digite cidade, estado, país..." 
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Buscando..." : "Nenhum local encontrado."}
            </CommandEmpty>
            <CommandGroup>
              {locations.map((location) => (
                <CommandItem
                  key={`${location.lat}-${location.lon}`}
                  value={location.display_name}
                  onSelect={() => handleSelect(location)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === location.display_name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm">{location.display_name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
