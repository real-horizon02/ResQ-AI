import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, Shield, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import { Logo } from './ui/Logo';
import { LanguageSwitcher } from './ui/LanguageSwitcher';

export function AdminNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuthStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const NAV_LINKS = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Volunteers', href: '/admin/volunteers' },
    { label: 'Incidents', href: '/admin/incidents' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

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
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || (user?.email?.[0] || 'A').toUpperCase();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: scrolled ? '1px solid var(--glass-border)' : 'none',
        backdropFilter: 'blur(10px)',
        padding: '16px clamp(24px,8vw,80px)',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo />
          <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>ResQ AI</span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              to={link.href}
              style={{
                textDecoration: 'none',
                fontFamily: 'DM Sans',
                fontSize: 13,
                fontWeight: 600,
                color: location.pathname === link.href ? 'var(--accent-cyan)' : 'var(--text-primary)',
                borderBottom: location.pathname === link.href ? '2px solid var(--accent-cyan)' : 'none',
                paddingBottom: location.pathname === link.href ? 4 : 0,
                transition: 'all 0.2s ease',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side - Language + Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LanguageSwitcher />

          {/* Profile Dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {initials}
              </div>
              <ChevronDown size={16} style={{ transition: 'transform 0.2s ease', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 8,
                    minWidth: 200,
                    background: 'var(--bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 12,
                    padding: '8px 0',
                    zIndex: 1000,
                  }}
                >
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--glass-border)' }}>
                    <p style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{profile?.full_name || user?.email}</p>
                    <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0' }}>👮 Admin</p>
                  </div>

                  <button
                    onClick={() => navigate(`/profile`)}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: 'DM Sans',
                      fontSize: 12,
                      color: 'var(--text-primary)',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <User size={14} style={{ marginRight: 8, display: 'inline' }} />
                    Profile
                  </button>

                  <button
                    onClick={handleSignOut}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: 'DM Sans',
                      fontSize: 12,
                      color: 'var(--accent-red)',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,45,45,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={14} style={{ marginRight: 8, display: 'inline' }} />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
