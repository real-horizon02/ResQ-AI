import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { DisasterEventRow } from '../types'

export interface DisasterEvent {
  id: string
  type: 'flood' | 'earthquake' | 'landslide' | 'rainfall' | 'tsunami' | 'wildfire'
  severity: 'low' | 'medium' | 'high' | 'critical'
  location_name: string
  description: string
  coordinates: {
    lat: number
    lng: number
  }
  created_at: string
  status: 'active' | 'resolved'
}

export function useDisasters() {
  const [disasters, setDisasters] = useState<DisasterEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('disaster_events')
          .select('*')
          .eq('status', 'active')

        if (error) throw error

        const formattedData: DisasterEvent[] = data.map((d) => ({
          ...d,
          coordinates: d.location ? {
            lat: d.location.coordinates[1],
            lng: d.location.coordinates[0]
          } : { lat: 0, lng: 0 }
        }))

        setDisasters(formattedData)
        setLastUpdated(new Date())
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load disasters')
      } finally {
        setLoading(false)
      }
    }

    fetchDisasters()

    // Realtime subscription
    const subscription = supabase
      .channel('disaster_events_realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'disaster_events' 
      }, (payload) => {
        setLastUpdated(new Date())
        if (payload.eventType === 'INSERT') {
          const newEvent = payload.new as DisasterEventRow
          const formatted = {
            ...newEvent,
            coordinates: newEvent.location ? {
              lat: newEvent.location.coordinates[1],
              lng: newEvent.location.coordinates[0]
            } : { lat: 0, lng: 0 }
          }
          setDisasters((prev) => [...prev, formatted])
        } else if (payload.eventType === 'DELETE') {
          setDisasters((prev) => prev.filter(d => d.id !== payload.old.id))
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as DisasterEventRow
          const formatted = {
            ...updated,
            coordinates: updated.location ? {
              lat: updated.location.coordinates[1],
              lng: updated.location.coordinates[0]
            } : { lat: 0, lng: 0 }
          }
          setDisasters((prev) => prev.map(d => d.id === formatted.id ? formatted : d))
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { disasters, loading, error, lastUpdated }
}
