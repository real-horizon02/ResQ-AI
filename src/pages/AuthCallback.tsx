/* OAuth callback handler — handles token from Supabase OAuth redirect */
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchProfile } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        navigate('/auth?error=oauth_failed');
        return;
      }
      if (session.user) {
        await fetchProfile(session.user.id);
      }
      const next = searchParams.get('next') || '/';
      navigate(next);
    };
    handleCallback();
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: 'radar-sweep 0.8s linear infinite' }}>
          <circle cx="10" cy="10" r="8" stroke="var(--accent-cyan)" strokeWidth="2" opacity="0.3" />
          <path d="M10 2A8 8 0 0 1 18 10" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--text-muted)' }}>COMPLETING LOGIN...</span>
      </div>
    </div>
  );
}
