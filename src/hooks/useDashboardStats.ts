import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface DashboardStats {
  activeDisasters: number
  verifiedVolunteers: number
  sosResolvedRate: number
  pendingReports: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    activeDisasters: 0,
    verifiedVolunteers: 0,
    sosResolvedRate: 0,
    pendingReports: 0,          
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch active disasters count
        const { count: disasterCount } = await supabase
          .from('disaster_events')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')

        // Fetch verified volunteer count
        const { count: volunteerCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_volunteer', true)

        // Fetch SOS resolution rate
        const { count: totalSOS } = await supabase
          .from('sos_alerts')
          .select('*', { count: 'exact', head: true })

        const { count: resolvedSOS } = await supabase
          .from('sos_alerts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'resolved')

        // Fetch pending reports count
        const { count: pendingCount } = await supabase
          .from('citizen_reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        setStats({
          activeDisasters: disasterCount ?? 0,
          verifiedVolunteers: volunteerCount ?? 0,
          sosResolvedRate: totalSOS && totalSOS > 0
            ? Math.round(((resolvedSOS ?? 0) / totalSOS) * 100)
            : 0,
          pendingReports: pendingCount ?? 0,
        })
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30_000)
    return () => clearInterval(interval)
  }, [])

  return { stats, loading }
}
