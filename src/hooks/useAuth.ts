import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'

export function useAuth() {
  const { setAuth, setLoading } = useAuthStore()

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        setAuth(session.user, profile)
      } else {
        setAuth(null, null)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        setAuth(session.user, profile)
      } else {
        setAuth(null, null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])
}
