import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Shield, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { Logo } from './ui/Logo';
import { LanguageSwitcher } from './ui/LanguageSwitcher';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isAdmin, signOut } = useAuthStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    setDropdownOpen(false);
    navigate('/');
    await signOut();
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || '??';

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 400,
        padding: scrolled ? '16px 48px' : '24px 48px',
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

      {/* Right side - Language + Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <LanguageSwitcher variant="ghost" />

        {/* Auth area */}
        {user ? (
          /* Logged in: avatar dropdown */
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(d => !d)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10, 
                background: 'var(--glass)', 
                border: '1px solid var(--glass-border)', 
                borderRadius: 999, 
                padding: '8px 16px 8px 8px', 
                cursor: 'pointer', 
                transition: 'all 0.3s ease' 
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                e.currentTarget.style.background = 'var(--glass-heavy)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.background = 'var(--glass)';
              }}
            >
              {/* Avatar circle */}
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: isAdmin ? 'var(--accent-gold)' : 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 12, color: 'var(--bg)' }}>{initials}</span>
              </div>
              <span style={{ fontFamily: 'DM Sans', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.full_name?.split(' ')[0] || 'User'}
              </span>
              <ChevronDown size={14} color="var(--text-muted)" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
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
          /* Not logged in: Sign In button */
          <button 
            onClick={() => navigate('/auth')}
            style={{ 
              fontSize: 13, 
              fontWeight: 600,
              padding: '10px 24px', 
              borderRadius: 999, 
              fontFamily: 'DM Sans', 
              letterSpacing: '0.02em', 
              border: '1px solid var(--glass-border)', 
              background: 'var(--glass)', 
              color: 'var(--text-primary)', 
              cursor: 'pointer', 
              transition: 'all 0.3s ease' 
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent-cyan)';
              e.currentTarget.style.background = 'var(--glass-heavy)';
              e.currentTarget.style.color = 'var(--accent-cyan)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--glass-border)';
              e.currentTarget.style.background = 'var(--glass)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
