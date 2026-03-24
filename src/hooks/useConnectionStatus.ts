import { useState, useEffect } from 'react'

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSlow, setIsSlow] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check Network Information API (if available)
    if ('connection' in navigator) {
      const conn = (navigator as any).connection
      const updateConnection = () => {
        // saveData: true or effectiveType: '2g' / '3g'
        setIsSlow(conn.saveData || ['slow-2g', '2g', '3g'].includes(conn.effectiveType))
      }
      conn.addEventListener('change', updateConnection)
      updateConnection()
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        conn.removeEventListener('change', updateConnection)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, isSlow }
}
