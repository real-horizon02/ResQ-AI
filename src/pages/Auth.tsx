import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { toast } from '../components/ui/Toast';

type Mode = 'login' | 'signup';

function AuthForm({ mode, onSwitch }: { mode: Mode; onSwitch: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('citizen');
  const [loading, setLoading] = useState(false);

  const ROLES = ['citizen', 'volunteer', 'admin'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(mode === 'login' ? `Welcome back! 👋` : `Account created! Welcome to ResQ AI.`);
      navigate(mode === 'signup' ? '/profile' : '/');
    }, 1800);
  };

  return (
    <motion.form
      key={mode}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <div>
        <span className="label-caps-gold" style={{ display: 'block', marginBottom: 12 }}>
          [ {mode === 'login' ? 'SECURE LOGIN' : 'CREATE ACCOUNT'} ]
        </span>
        <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 48, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
          {mode === 'login' ? 'Welcome back' : 'Join ResQ AI'}
        </h2>
        <p style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--text-muted)', margin: '12px 0 0' }}>
          {mode === 'login' ? 'Sign in to access your emergency dashboard.' : 'Become part of India\'s emergency response network.'}
        </p>
      </div>

      {mode === 'signup' && (
        <div style={{ position: 'relative', paddingTop: 4 }}>
          <input className="input-underline" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
      )}

      <div>
        <input className="input-underline" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
      </div>

      <div>
        <input className="input-underline" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} type="password" required minLength={6} />
      </div>

      {mode === 'signup' && (
        <div>
          <span className="label-caps" style={{ display: 'block', marginBottom: 12 }}>I am a —</span>
          <div style={{ display: 'flex', gap: 10 }}>
            {ROLES.map(r => (
              <button type="button" key={r} onClick={() => setRole(r)}
                style={{ padding: '8px 18px', borderRadius: 999, border: `1px solid ${role === r ? 'var(--accent-gold)' : 'var(--glass-border)'}`, background: role === r ? 'rgba(200,169,110,0.12)' : 'transparent', color: role === r ? 'var(--accent-gold)' : 'var(--text-muted)', fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s ease' }}>
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      <button type="submit" className="btn-sos" style={{ marginTop: 8, fontSize: 15, opacity: loading ? 0.8 : 1 }}>
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
        <button type="button" onClick={onSwitch}
          style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--accent-cyan)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {mode === 'login' ? 'Create an account →' : '← Sign in instead'}
        </button>
        <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
      </div>
    </motion.form>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex' }}>
      <Navbar />
      {/* Left panel — branding */}
      <div className="mobile-hide auth-split" style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '45vw', background: 'var(--bg-surface)', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '60px 60px 64px' }}>
        {/* Auth panel animated dot grid */}
        {[...Array(16)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-cyan)', opacity: 0.1 + (i % 4) * 0.05,
            left: `${((i % 4) + 1) * 20}%`, top: `${Math.floor(i / 4) * 22 + 8}%`,
            animation: `pulse-dot ${2 + (i % 3)}s ease infinite`, animationDelay: `${i * 0.3}s`
          }} />
        ))}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 64, color: 'var(--text-primary)', margin: '0 0 20px', lineHeight: 1 }}>
            resQ<span style={{ color: 'var(--accent-red)' }}>AI</span>
          </h1>
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

      {/* Right panel — form */}
      <div style={{ flex: 1, marginLeft: '45vw', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(100px,15vh,160px) clamp(32px,8vw,96px) 48px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <AnimatePresence mode="wait">
            <AuthForm key={mode} mode={mode} onSwitch={() => setMode(m => m === 'login' ? 'signup' : 'login')} />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
