import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Map', href: '/map' },
  { label: 'Volunteer', href: '/volunteer' },
  { label: 'Admin', href: '/admin' },
  { label: 'Profile', href: '/profile' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="hidden md:flex">
          {NAV_LINKS.map(l => (
            <Link
              key={l.label}
              to={l.href}
              className="label-caps"
              style={{
                color: location.pathname === l.href ? 'var(--text-primary)' : 'var(--text-muted)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => navigate('/sos')}
            style={{
              fontSize: 12, padding: '8px 20px', borderRadius: 999,
              fontFamily: 'DM Sans', fontWeight: 700, letterSpacing: '0.05em',
              border: '1px solid var(--accent-red)', background: 'transparent',
              color: 'var(--accent-red)', cursor: 'none',
              boxShadow: '0 0 16px rgba(255,45,45,0.15)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              const t = e.currentTarget;
              t.style.background = 'var(--accent-red)';
              t.style.color = '#fff';
              t.style.boxShadow = '0 0 24px rgba(255,45,45,0.4)';
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget;
              t.style.background = 'transparent';
              t.style.color = 'var(--accent-red)';
              t.style.boxShadow = '0 0 16px rgba(255,45,45,0.15)';
            }}
          >
            🚨 SOS
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'none', padding: 4 }}
          className="md:hidden flex"
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 500,
              background: 'var(--bg)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 40,
            }}
          >
            <button
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'absolute', top: 24, right: 32,
                background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--text-muted)',
              }}
            >
              <X size={28} />
            </button>

            <div style={{ marginBottom: 40, display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 28, color: 'var(--text-primary)' }}>ResQ</span>
              <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 30, color: 'var(--accent-red)' }}>AI</span>
            </div>

            {NAV_LINKS.map((l, i) => (
              <motion.div
                key={l.label}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
              >
                <Link
                  to={l.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily: 'Playfair Display', fontStyle: 'italic',
                    fontSize: 'clamp(52px, 10vw, 80px)',
                    color: 'var(--text-primary)', textDecoration: 'none', lineHeight: 1.1,
                    display: 'block', textAlign: 'center',
                  }}
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { delay: 0.35 } }}
              onClick={() => { navigate('/sos'); setMenuOpen(false); }}
              className="btn-sos"
              style={{ fontSize: 16, padding: '14px 40px', marginTop: 16 }}
            >
              🚨 Send SOS
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
