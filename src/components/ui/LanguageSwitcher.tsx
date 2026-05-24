import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, ChevronDown, Check } from 'lucide-react';

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
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
          variant === 'outline' 
            ? 'border border-glass-border bg-glass hover:border-accent-cyan/50 text-text-primary'
            : 'hover:bg-glass-heavy text-text-muted hover:text-text-primary'
        }`}
        aria-label="Select Language"
      >
        <Languages className="w-3.5 h-3.5" />
        <span>{currentLanguage.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute top-full right-0 mt-2 min-w-[140px] bg-bg-surface/90 backdrop-blur-xl border border-glass-border rounded-xl shadow-2xl z-[100] overflow-hidden"
          >
            <div className="p-1.5 flex flex-col gap-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    i18n.language === lang.code
                      ? 'bg-accent-cyan/10 text-accent-cyan font-semibold'
                      : 'text-text-muted hover:bg-glass hover:text-text-primary text-left'
                  }`}
                >
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[10px] opacity-50 uppercase tracking-tighter mb-0.5">{lang.label}</span>
                    <span className="font-medium">{lang.native}</span>
                  </div>
                  {i18n.language === lang.code && <Check className="w-4 h-4 ml-2" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
