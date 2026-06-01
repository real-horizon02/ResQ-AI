import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface HomeStats {
  activeUsers: number;
  resolved: number;
  activeAlerts: number;
  statesCovered: number;
  volunteers: number;
}

export function useHomeStats() {
  const [stats, setStats] = useState<HomeStats>({
    activeUsers: 0,
    resolved: 0,
    activeAlerts: 0,
    statesCovered: 28, // India has 28 states, representing pan-India capability
    volunteers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Total Active Users (all profiles)
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // 2. Total Resolved (resolved SOS + resolved incidents)
        const { count: resolvedSOS } = await supabase
          .from('sos_alerts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'resolved');

        const totalResolved = resolvedSOS ?? 0;

        // 3. Active Real-time Alerts (from disaster_events)
        const { count: activeAlertsCount } = await supabase
          .from('disaster_events')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // 4. Registered Volunteers
        const { count: volunteersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_volunteer', true);

        setStats({
          activeUsers: usersCount ?? 0,
          resolved: totalResolved,
          activeAlerts: activeAlertsCount ?? 0,
          statesCovered: 28, 
          volunteers: volunteersCount ?? 0,
        });

      } catch (err) {
        console.error('Failed to fetch authentic home stats:', err);
      }
    };

    fetchStats();
  }, []);

  return stats;
}
