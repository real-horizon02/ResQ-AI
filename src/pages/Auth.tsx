import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { useAuthStore } from '../store/useAuthStore';
import { Logo } from '../components/ui/Logo';

type Mode = 'login' | 'signup';

const OAUTH_PROVIDERS = [
  { id: 'google' as const, label: 'Google', color: '#4285F4', cursorLabel: 'GOOGLE', icon: (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )},
  { id: 'facebook' as const, label: 'Facebook', color: '#1877F2', cursorLabel: 'FACEBOOK', icon: (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )},
  { id: 'twitter' as const, label: 'X (Twitter)', color: '#000000', cursorLabel: 'X / TWITTER', icon: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )},
];

function OAuthButton({ provider, onClick, loading }: { provider: typeof OAUTH_PROVIDERS[0]; onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      data-cursor-color={provider.color}
      data-cursor-label={provider.cursorLabel}
      className={`hover-flash-${provider.id}`}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        padding: '13px 20px', borderRadius: 12, width: '100%',
        background: 'var(--glass)', border: '1px solid var(--glass-border)',
        color: 'var(--text-primary)', fontFamily: 'DM Sans', fontWeight: 500, fontSize: 14,
        cursor: 'pointer', transition: 'all 0.4s ease', opacity: loading ? 0.6 : 1,
      }}
    >
      {provider.icon}
      Continue with {provider.label}
    </button>
  );
}

function AuthForm({ mode, onSwitch, redirectPath }: { mode: Mode; onSwitch: () => void; redirectPath: string }) {
  const navigate = useNavigate();
  const { signInWithEmail, signUp, signInWithOAuth, isLoggedIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'citizen' | 'volunteer'>('citizen');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn) navigate(redirectPath || '/');
  }, [isLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, pass);
      } else {
        await signUp(email, pass, name, role);
      }
      navigate(redirectPath || '/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'facebook' | 'twitter' | 'apple') => {
    setOauthLoading(provider);
    setError('');
    try {
      await signInWithOAuth(provider);
      // OAuth will redirect the page — no further action needed
    } catch (err: any) {
      const msg: string = err.message || '';
      if (msg.toLowerCase().includes('not enabled') || msg.includes('provider')) {
        setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in is not set up yet. Please use Email/Password below to sign in or create an account.`);
      } else {
        setError(msg || `${provider} login failed. Try email/password instead.`);
      }
      setOauthLoading(null);
    }
  };

  const ROLES = [
    { id: 'citizen', emoji: '👤', desc: 'Report incidents in my area' },
    { id: 'volunteer', emoji: '🦺', desc: 'Respond to emergencies' },
  ];

  return (
    <motion.div
      key={mode}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      {/* Header */}
      <div>
        <span className="label-caps-gold" style={{ display: 'block', marginBottom: 12 }}>
          [ {mode === 'login' ? 'SECURE LOGIN' : 'CREATE ACCOUNT'} ]
        </span>
        <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 48, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
          {mode === 'login' ? 'Welcome back' : 'Join ResQ AI'}
        </h2>
        <p style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--text-muted)', margin: '12px 0 0' }}>
          {mode === 'login' ? "Sign in to access your emergency dashboard." : "Become part of India's emergency response network."}
        </p>
      </div>

      {/* OAuth Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {OAUTH_PROVIDERS.map(p => (
          <OAuthButton
            key={p.id}
            provider={p}
            onClick={() => handleOAuth(p.id)}
            loading={oauthLoading === p.id}
          />
        ))}
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
        <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>OR WITH EMAIL</span>
        <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
      </div>

      {/* Email form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {mode === 'signup' && (
          <input className="input-underline" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
        )}
        <input className="input-underline" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        <input className="input-underline" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} type="password" required minLength={6} />

        {mode === 'signup' && (
          <div>
            <span className="label-caps" style={{ display: 'block', marginBottom: 12 }}>I am a —</span>
            <div style={{ display: 'flex', gap: 10 }}>
              {ROLES.map(r => (
                <button type="button" key={r.id} onClick={() => setRole(r.id as any)}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: `1px solid ${role === r.id ? 'var(--accent-gold)' : 'var(--glass-border)'}`, background: role === r.id ? 'rgba(200,169,110,0.08)' : 'transparent', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{r.emoji}</div>
                  <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 12, color: role === r.id ? 'var(--accent-gold)' : 'var(--text-muted)', textTransform: 'capitalize' }}>{r.id}</div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: 10, color: 'var(--text-dim)' }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(255,45,45,0.08)', border: '1px solid rgba(255,45,45,0.2)', borderRadius: 10 }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--accent-red)', margin: 0 }}>⚠ {error}</p>
          </div>
        )}

        <button type="submit" className="btn-sos" style={{ marginTop: 4, fontSize: 15, opacity: loading ? 0.8 : 1 }} disabled={loading}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" style={{ animation: 'radar-sweep 0.8s linear infinite' }}>
                <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                <path d="M9 2A7 7 0 0 1 16 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {mode === 'login' ? 'Signing in...' : 'Creating account...'}
            </span>
          ) : mode === 'login' ? 'Sign In →' : 'Create Account →'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
          <button type="button" onClick={onSwitch} style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--accent-cyan)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            {mode === 'login' ? 'Create an account →' : '← Sign in instead'}
          </button>
          <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
        </div>
      </form>
    </motion.div>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex' }}>
      <Navbar />

      {/* Left — Branding panel */}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '45vw', background: 'var(--bg-surface)', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '60px 60px 64px', overflow: 'hidden' }}
        className="mobile-hide">
        {/* Animated dots */}
        {[...Array(16)].map((_, i) => (
          <div key={i} style={{ position: 'absolute', width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-cyan)', opacity: 0.08 + (i % 4) * 0.04, left: `${((i % 4) + 1) * 20}%`, top: `${Math.floor(i / 4) * 22 + 8}%`, animation: `pulse-dot ${2 + (i % 3)}s ease infinite`, animationDelay: `${i * 0.3}s` }} />
        ))}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="flex items-center gap-4 mb-4">
              <Logo className="w-16 h-16" />
              <h1 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 64, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
                ResQ<span style={{ color: 'var(--accent-red)' }}>AI</span>
              </h1>
            </div>
            <p style={{ fontFamily: 'DM Sans', fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 360, margin: '0 0 40px' }}>
            "In a disaster, every second counts. ResQ AI ensures those seconds are not wasted."
          </p>
          <div style={{ display: 'flex', gap: 32 }}>
            {[['1247', 'Active Users'], ['48', 'Cities'], ['<5min', 'Avg Response']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 28, color: 'var(--text-primary)' }}>{v}</div>
                <div className="label-caps" style={{ marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div style={{ flex: 1, marginLeft: 'min(45vw, 45vw)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(100px,15vh,160px) clamp(32px,8vw,96px) 48px' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <AnimatePresence mode="wait">
            <AuthForm key={mode} mode={mode} onSwitch={() => setMode(m => m === 'login' ? 'signup' : 'login')} redirectPath={redirectPath} />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
