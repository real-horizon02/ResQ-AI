import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, Shield, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isAdmin, signOut } = useAuthStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const NAV_LINKS = [
    { label: 'Map', href: '/map' },
    { label: 'Volunteer', href: '/volunteer' },
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

  const handleSignOut = async () => {
    await signOut();
    setDropdownOpen(false);
    navigate('/');
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
          background: scrolled ? 'rgba(6,9,15,0.85)' : 'transparent',
          transition: 'padding 0.3s ease, background 0.3s ease, border 0.3s ease',
        }}
      >
        {/* Brand */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>ResQ</span>
          <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 24, color: 'var(--accent-red)', lineHeight: 1 }}>AI</span>
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

          {/* SOS button */}
          <button onClick={() => navigate('/sos')}
            style={{ fontSize: 12, padding: '8px 20px', borderRadius: 999, fontFamily: 'DM Sans', fontWeight: 700, letterSpacing: '0.05em', border: '1px solid var(--accent-red)', background: 'transparent', color: 'var(--accent-red)', cursor: 'pointer', boxShadow: '0 0 16px rgba(255,45,45,0.15)', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => { const t = e.currentTarget; t.style.background = 'var(--accent-red)'; t.style.color = '#fff'; }}
            onMouseLeave={(e) => { const t = e.currentTarget; t.style.background = 'transparent'; t.style.color = 'var(--accent-red)'; }}>
            🚨 SOS
          </button>

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
            <div style={{ marginBottom: 40, display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 28, color: 'var(--text-primary)' }}>ResQ</span>
              <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 30, color: 'var(--accent-red)' }}>AI</span>
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
    </>
  );
}
