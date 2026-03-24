import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const { user } = useAuthStore()

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) return false
    
    const status = await Notification.requestPermission()
    setPermission(status)
    
    if (status === 'granted' && user) {
      // In a real app, we would get the FCM token here
      // For now, we'll store a mock token to enable testing the pipeline
      const mockToken = `mock_fcm_${Math.random().toString(36).substr(2, 9)}`
      
      const { error } = await supabase
        .from('profiles')
        .update({ fcm_token: mockToken })
        .eq('id', user.id)
        
      if (error) console.error('Error saving notification token:', error)
      return true
    }
    return false
  }

  return { permission, requestPermission }
}
