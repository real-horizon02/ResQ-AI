import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { Bell, Menu, X } from 'lucide-react'
import { Logo } from '../ui/Logo'
import { Link, useNavigate } from 'react-router-dom'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    const langs = ['en', 'hi', 'hinglish']
    const nextIdx = (langs.indexOf(i18n.language) + 1) % langs.length
    i18n.changeLanguage(langs[nextIdx])
  }

  const getLangLabel = () => {
    switch (i18n.language) {
      case 'hi': return 'हिन्दी'
      case 'hinglish': return 'Hing'
      default: return 'EN'
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-brand-dark">{t('common.app_name')}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/map" className="text-sm font-medium hover:text-brand-red transition-colors">{t('nav.map')}</Link>
          <Link to="#" className="text-sm font-medium hover:text-brand-red transition-colors">{t('nav.safe_zones')}</Link>
          <Link to="/report" className="text-sm font-medium text-brand-red font-bold hover:opacity-80 transition-opacity">Report Incident</Link>
          <Link to="#" className="text-sm font-medium hover:text-brand-red transition-colors">{t('nav.reports')}</Link>
          <Link to="#" className="text-sm font-medium hover:text-brand-red transition-colors">{t('common.volunteer')}</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={toggleLanguage} className="font-bold w-12 text-xs">
            {getLangLabel()}
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="emergency" size="sm">
            {t('common.sos')}
          </Button>
          <Link to="/auth">
            <Button variant="default" size="sm">
              {t('common.sign_in')}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t bg-white p-4 flex flex-col gap-4 animate-in slide-in-from-top">
          <Link to="/map" className="text-lg font-medium p-2" onClick={() => setIsOpen(false)}>{t('nav.map')}</Link>
          <Link to="/report" className="text-lg font-bold text-brand-red p-2" onClick={() => setIsOpen(false)}>Report Incident</Link>
          <Link to="#" className="text-lg font-medium p-2" onClick={() => setIsOpen(false)}>{t('nav.safe_zones')}</Link>
          <Link to="#" className="text-lg font-medium p-2" onClick={() => setIsOpen(false)}>{t('nav.reports')}</Link>
          <Link to="#" className="text-lg font-medium p-2" onClick={() => setIsOpen(false)}>{t('common.volunteer')}</Link>
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="emergency" className="w-full">{t('common.sos')}</Button>
            <Link to="/auth" onClick={() => setIsOpen(false)}>
              <Button variant="default" className="w-full">{t('common.sign_in')}</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
