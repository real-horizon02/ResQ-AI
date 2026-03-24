import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'

export function useSOS() {
  const { user } = useAuthStore()
  const [isSOSActive, setIsSOSActive] = useState(false)
  const [loading, setLoading] = useState(false)

  const triggerSOS = useCallback(async () => {
    if (!user) return
    setLoading(true)

    try {
      // 1. Get location
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
      })

      const { latitude: lat, longitude: lng } = pos.coords

      // 2. Create SOS alert in DB
      const { data, error } = await supabase.from('sos_alerts').insert({
        user_id: user.id,
        location: `POINT(${lng} ${lat})`,
        status: 'active',
        battery_level: (navigator as any).getBattery ? await (navigator as any).getBattery().then((b: any) => Math.round(b.level * 100)) : null
      }).select().single()

      if (error) throw error

      // 3. Broadcast SOS instantly via Realtime Channel
      await supabase.channel('emergency_signals').send({
        type: 'broadcast',
        event: 'sos_triggered',
        payload: {
          id: data.id,
          user_id: user.id,
          userName: (user as any).full_name || 'Anonymous User',
          location: { lat, lng },
          timestamp: new Date().toISOString()
        }
      })

      setIsSOSActive(true)
      return true
    } catch (err: any) {
      console.error('SOS Trigger Error:', err)
      alert('Failed to trigger SOS. Call emergency services immediately!')
      return false
    } finally {
      setLoading(false)
    }
  }, [user])

  const resolveSOS = useCallback(async (sosId: string) => {
    const { error } = await supabase
      .from('sos_alerts')
      .update({ status: 'resolved' })
      .eq('id', sosId)
    
    if (!error) setIsSOSActive(false)
  }, [])

  return { isSOSActive, loading, triggerSOS, resolveSOS }
}
