import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'hinglish', label: 'Hinglish', native: 'Hinglish' },
];

export function LanguageSwitcher({ variant = 'default' }: { variant?: 'default' | 'outline' | 'ghost' }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 999,
          fontFamily: 'DM Sans',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.02em',
          border: '1px solid var(--glass-border)',
          background: 'var(--glass)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-cyan)';
          e.currentTarget.style.background = 'var(--glass-heavy)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--glass-border)';
          e.currentTarget.style.background = 'var(--glass)';
        }}
        aria-label="Select Language"
      >
        <Globe size={16} strokeWidth={2} />
        <span>{currentLanguage.native}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              minWidth: 160,
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              zIndex: 500,
            }}
          >
            <div style={{ padding: '6px' }}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 8,
                    fontFamily: 'DM Sans',
                    fontSize: 13,
                    fontWeight: i18n.language === lang.code ? 600 : 400,
                    textAlign: 'left',
                    border: 'none',
                    background: i18n.language === lang.code ? 'var(--glass)' : 'transparent',
                    color: i18n.language === lang.code ? 'var(--accent-cyan)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (i18n.language !== lang.code) {
                      e.currentTarget.style.background = 'var(--glass)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (i18n.language !== lang.code) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{lang.native}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {lang.label}
                    </span>
                  </div>
                  {i18n.language === lang.code && (
                    <Check size={16} strokeWidth={2.5} style={{ color: 'var(--accent-cyan)' }} />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
