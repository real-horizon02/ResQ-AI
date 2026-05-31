import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, Shield, ChevronDown, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import { Logo } from './ui/Logo';
import { LanguageSwitcher } from './ui/LanguageSwitcher';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isAdmin, signOut } = useAuthStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Navbar SOS hold state ──────────────────────────────────────────
  const [sosProgress, setSosProgress] = useState(0);
  const [sosHolding, setSosHolding] = useState(false);
  const [sosPopup, setSosPopup] = useState(false);
  const sosTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sosRaf   = useRef<number | null>(null);
  const sosStart = useRef<number | null>(null);
  const sosFired = useRef(false);

  const NAV_LINKS = [
    { label: t('nav.map'), href: '/map' },
    { label: t('nav.volunteer'), href: '/volunteer' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-dismiss SOS popup after 5s
  useEffect(() => {
    if (sosPopup) {
      const t = setTimeout(() => setSosPopup(false), 5000);
      return () => clearTimeout(t);
    }
  }, [sosPopup]);

  const handleSignOut = async () => {
    await signOut();
    setDropdownOpen(false);
    navigate('/');
  };

  // ── Navbar SOS hold handlers ───────────────────────────────────────
  const startSosHold = () => {
    if (sosFired.current) return;
    sosFired.current = false;
    sosStart.current = performance.now();
    setSosHolding(true);
    setSosProgress(0);
    const tick = (now: number) => {
      const elapsed = now - (sosStart.current ?? now);
      setSosProgress(Math.min((elapsed / 3000) * 100, 100));
      if (elapsed < 3000) sosRaf.current = requestAnimationFrame(tick);
    };
    sosRaf.current = requestAnimationFrame(tick);
    sosTimer.current = setTimeout(() => {
      sosFired.current = true;
      setSosHolding(false);
      setSosProgress(0);
      setSosPopup(true);
    }, 3000);
  };

  const cancelSosHold = () => {
    if (sosTimer.current) { clearTimeout(sosTimer.current); sosTimer.current = null; }
    if (sosRaf.current)   { cancelAnimationFrame(sosRaf.current); sosRaf.current = null; }
    if (!sosFired.current) { setSosHolding(false); setSosProgress(0); }
  };

  const handleSosClick = (e: React.MouseEvent) => {
    if (sosFired.current) { sosFired.current = false; e.preventDefault(); return; }
    navigate('/sos');
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || '??';

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 400,
          padding: scrolled ? '12px 40px' : '22px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--glass-border)' : 'none',
          background: scrolled ? 'var(--nav-bg)' : 'transparent',
          transition: 'padding 0.3s ease, background 0.3s ease, border 0.3s ease',
        }}
      >
        {/* Brand */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo className="w-8 h-8" />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>ResQ</span>
            <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 24, color: 'var(--accent-red)', lineHeight: 1 }}>AI</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {NAV_LINKS.map(l => (
            <Link key={l.label} to={l.href} className="label-caps"
              style={{ color: location.pathname === l.href ? 'var(--text-primary)' : 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s ease' }}>
              {l.label}
            </Link>
          ))}

          {/* Admin link — only for admins */}
          {isAdmin && (
            <Link to="/admin" className="label-caps"
              style={{ color: location.pathname === '/admin' ? 'var(--accent-gold)' : 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s ease', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={12} style={{ color: 'var(--accent-gold)' }} /> Admin
            </Link>
          )}

          {/* SOS button — hold 3s to send */}
          <button
            onMouseDown={startSosHold}
            onMouseUp={cancelSosHold}
            onMouseLeave={cancelSosHold}
            onTouchStart={(e) => { e.preventDefault(); startSosHold(); }}
            onTouchEnd={cancelSosHold}
            onTouchCancel={cancelSosHold}
            onClick={handleSosClick}
            style={{
              position: 'relative',
              overflow: 'hidden',
              fontSize: 12,
              padding: '8px 20px',
              borderRadius: 999,
              fontFamily: 'DM Sans',
              fontWeight: 700,
              letterSpacing: '0.05em',
              border: '1px solid var(--accent-red)',
              background: sosHolding ? 'rgba(255,45,45,0.1)' : 'transparent',
              color: 'var(--accent-red)',
              cursor: 'pointer',
              boxShadow: sosHolding ? '0 0 24px rgba(255,45,45,0.35)' : '0 0 16px rgba(255,45,45,0.15)',
              transition: 'background 0.2s ease, box-shadow 0.2s ease',
              userSelect: 'none',
              WebkitUserSelect: 'none' as const,
              transform: sosHolding ? 'scale(0.96)' : 'scale(1)',
            }}
          >
            {/* White sweep line */}
            <span style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${sosProgress}%`,
              background: 'rgba(255, 255, 255, 0.28)',
              borderRadius: 999,
              pointerEvents: 'none',
            }} />
            {/* Label */}
            <span style={{ position: 'relative', zIndex: 1 }}>🚨 SOS</span>
          </button>

          <LanguageSwitcher variant="outline" />

          {/* Auth area */}
          {user ? (
            /* Logged in: avatar dropdown */
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(d => !d)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 999, padding: '6px 12px 6px 6px', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                {/* Avatar circle */}
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: isAdmin ? 'var(--accent-gold)' : 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 11, color: 'var(--bg)' }}>{initials}</span>
                </div>
                <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-primary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.full_name?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown size={12} color="var(--text-muted)" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 220, background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', zIndex: 500 }}
                  >
                    {/* User info header */}
                    <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--glass-border)' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: isAdmin ? 'var(--accent-gold)' : 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                        <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 16, color: 'var(--bg)' }}>{initials}</span>
                      </div>
                      <p style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 2px' }}>{profile?.full_name || 'User'}</p>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{profile?.email || user?.email}</p>
                      {profile?.city && (
                        <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--text-dim)', margin: '4px 0 0' }}>📍 {profile.city}, {profile.state}</p>
                      )}
                      <div style={{ marginTop: 8 }}>
                        <span style={{ fontSize: 10, fontFamily: 'DM Sans', fontWeight: 700, padding: '2px 10px', borderRadius: 999, background: isAdmin ? 'rgba(200,169,110,0.15)' : 'rgba(0,212,255,0.1)', color: isAdmin ? 'var(--accent-gold)' : 'var(--accent-cyan)', border: `1px solid ${isAdmin ? 'rgba(200,169,110,0.3)' : 'rgba(0,212,255,0.2)'}`, textTransform: 'capitalize' }}>
                          {isAdmin ? '👑 Admin' : `${profile?.role || 'citizen'}`}
                        </span>
                      </div>
                    </div>

                    {/* Skills */}
                    {profile?.skills && profile.skills.length > 0 && (
                      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--glass-border)' }}>
                        <div className="label-caps" style={{ marginBottom: 6 }}>Skills</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {profile.skills.slice(0, 3).map(sk => (
                            <span key={sk} style={{ fontSize: 10, fontFamily: 'DM Sans', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(200,169,110,0.1)', color: 'var(--accent-gold)' }}>{sk}</span>
                          ))}
                          {profile.skills.length > 3 && <span style={{ fontSize: 10, fontFamily: 'DM Sans', color: 'var(--text-dim)' }}>+{profile.skills.length - 3}</span>}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ padding: '6px 0' }}>
                      <button onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                        style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 13, textAlign: 'left', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        <User size={14} style={{ color: 'var(--accent-cyan)' }} /> Edit Profile
                      </button>
                      {isAdmin && (
                        <button onClick={() => { navigate('/admin'); setDropdownOpen(false); }}
                          style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 13, textAlign: 'left', transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                          <Shield size={14} style={{ color: 'var(--accent-gold)' }} /> Command Center
                        </button>
                      )}
                      <div style={{ height: 1, background: 'var(--glass-border)', margin: '6px 0' }} />
                      <button onClick={handleSignOut}
                        style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-red)', fontFamily: 'DM Sans', fontSize: 13, textAlign: 'left', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,45,45,0.06)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Not logged in: Login button */
            <button onClick={() => navigate('/auth')}
              style={{ fontSize: 12, padding: '8px 20px', borderRadius: 999, fontFamily: 'DM Sans', fontWeight: 700, letterSpacing: '0.05em', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-cyan)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--glass-border)')}>
              Login →
            </button>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 4, display: 'none' }} className="md:hidden flex">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
            <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: 24, right: 32, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={28} />
            </button>
            <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Logo className="w-12 h-12" />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 28, color: 'var(--text-primary)' }}>ResQ</span>
                <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 30, color: 'var(--accent-red)' }}>AI</span>
              </div>
            </div>
            {[...NAV_LINKS, ...(isAdmin ? [{ label: 'Admin', href: '/admin' }] : [])].map((l, i) => (
              <motion.div key={l.label} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: i * 0.07 } }}>
                <Link to={l.href} onClick={() => setMenuOpen(false)}
                  style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(52px, 10vw, 80px)', color: 'var(--text-primary)', textDecoration: 'none', lineHeight: 1.1, display: 'block', textAlign: 'center' }}>
                  {l.label}
                </Link>
              </motion.div>
            ))}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.35 } }} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginTop: 16 }}>
              <button onClick={() => { navigate('/sos'); setMenuOpen(false); }} className="btn-sos" style={{ fontSize: 16, padding: '14px 40px' }}>🚨 Send SOS</button>
              {!user && <button onClick={() => { navigate('/auth'); setMenuOpen(false); }} style={{ background: 'none', border: '1px solid var(--glass-border)', borderRadius: 999, padding: '10px 28px', color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 14, cursor: 'pointer' }}>Login →</button>}
              {user && <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', fontFamily: 'DM Sans', fontSize: 14, cursor: 'pointer' }}>Sign Out</button>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SOS Sent Popup ──────────────────────────────────────────── */}
      {sosPopup && (
        <div className="sos-popup-overlay" onClick={() => setSosPopup(false)} aria-modal="true" role="dialog">
          <div className="sos-popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="sos-popup-icon">
              <CheckCircle size={40} color="#00E676" strokeWidth={2} />
            </div>
            <p className="sos-popup-title">SOS Sent!</p>
            <p className="sos-popup-msg">
              SOS request has been sent to the admin.<br />
              We will rescue you soon. Stay safe 🙏
            </p>
            <button className="sos-popup-close" onClick={() => setSosPopup(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
