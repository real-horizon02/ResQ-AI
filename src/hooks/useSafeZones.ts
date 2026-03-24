import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface SafeZone {
  id: string
  name: string
  type: 'hospital' | 'shelter' | 'rescue_station' | 'relief_camp'
  status: 'active' | 'full' | 'closed'
  capacity: number
  current_occupancy: number
  contact_info: string
  coordinates: {
    lat: number
    lng: number
  }
}

export function useSafeZones() {
  const [safeZones, setSafeZones] = useState<SafeZone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSafeZones = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('safe_zones')
          .select('*')

        if (error) throw error

        const formattedData: SafeZone[] = data.map((sz) => ({
          ...sz,
          coordinates: sz.location ? {
            lat: sz.location.coordinates[1],
            lng: sz.location.coordinates[0]
          } : { lat: 0, lng: 0 }
        }))

        setSafeZones(formattedData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSafeZones()
  }, [])

  return { safeZones, loading, error }
}
