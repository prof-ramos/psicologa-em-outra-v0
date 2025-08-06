import { DateTime } from 'luxon'

export async function getTimezoneOffset(latitude: number, longitude: number, date: string, time: string): Promise<number> {
  try {
    // Para este exemplo, vamos usar uma aproximação baseada na longitude
    // Em produção, você deveria usar uma biblioteca como timezonefinder
    const estimatedTimezone = Math.round(longitude / 15)
    
    // Criar data/hora no timezone estimado
    const dateTime = DateTime.fromISO(`${date}T${time}`, {
      zone: `UTC${estimatedTimezone >= 0 ? '+' : ''}${estimatedTimezone}`
    })
    
    return dateTime.offset / 60 // Converter minutos para horas
  } catch (error) {
    console.error('Erro ao calcular timezone:', error)
    return 0 // Fallback para UTC
  }
}

export function convertToUTC(date: string, time: string, offsetHours: number): { date: string; time: string } {
  try {
    const dateTime = DateTime.fromISO(`${date}T${time}`)
    const utcDateTime = dateTime.minus({ hours: offsetHours })
    
    return {
      date: utcDateTime.toISODate() || date,
      time: utcDateTime.toFormat('HH:mm') || time
    }
  } catch (error) {
    console.error('Erro na conversão para UTC:', error)
    return { date, time }
  }
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
