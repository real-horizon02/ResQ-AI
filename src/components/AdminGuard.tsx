import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, profile, isAdmin, initialized, requestAdminAccess } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (initialized && !user) {
      navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}`);
    }
  }, [initialized, user]);

  if (!initialized) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: 'radar-sweep 0.8s linear infinite' }}>
            <circle cx="10" cy="10" r="8" stroke="var(--accent-cyan)" strokeWidth="2" opacity="0.3" />
            <path d="M10 2A8 8 0 0 1 18 10" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-muted)' }}>AUTHENTICATING...</span>
        </div>
      </div>
    );
  }

  if (!user) return null; // Will redirect

  if (!isAdmin) {
    const hasRequested = profile?.admin_request;
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}
        >
          {/* Icon */}
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,45,45,0.08)', border: '1px solid rgba(255,45,45,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
            <Lock size={32} color="var(--accent-red)" />
          </div>

          <span className="label-caps-gold" style={{ display: 'block', marginBottom: 16 }}>[ RESTRICTED ACCESS ]</span>
          <h1 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 48, color: 'var(--text-primary)', margin: '0 0 16px', lineHeight: 1 }}>
            Admin Only
          </h1>
          <p style={{ fontFamily: 'DM Sans', fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 40 }}>
            The Command Center is restricted to verified administrators. 
            Request access below — an existing admin will review your request.
          </p>

          {/* User info */}
          <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 16, color: 'var(--bg)' }}>
                  {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                </span>
              </div>
              <div>
                <p style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', margin: 0 }}>{profile?.full_name}</p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{profile?.email} · <span style={{ textTransform: 'capitalize' }}>{profile?.role}</span></p>
              </div>
            </div>
          </div>

          {hasRequested ? (
            <div style={{ padding: '16px 24px', background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <Shield size={16} color="var(--accent-gold)" />
                <span style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'var(--accent-gold)', fontWeight: 600 }}>Request pending — awaiting admin approval</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={requestAdminAccess}
                className="btn-sos"
                style={{ fontSize: 15, padding: '14px 32px', background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', boxShadow: '0 0 24px rgba(200,169,110,0.15)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,169,110,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Shield size={16} style={{ marginRight: 8 }} />
                Request Admin Access
              </button>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
                ← Back to Home
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
