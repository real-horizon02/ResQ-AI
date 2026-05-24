import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/useAuthStore'
import { Button } from '../ui/Button'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { Shield, Menu, X, MapPin, FileText, User, LogOut, ChevronRight, Zap, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { Logo } from '../ui/Logo'

export default function Header() {
  const { t } = useTranslation()
  const { user, profile, signOut } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: '/', label: t('header.dashboard'), icon: Zap },
    { path: '/map', label: t('header.liveMap'), icon: MapPin },
    { path: '/report', label: t('header.report'), icon: FileText },
  ]

  const dashboardPath = profile?.role === 'admin' ? '/admin' : profile?.role === 'volunteer' ? '/volunteer' : null

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl ghost-border border-b">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <Logo className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-black text-sentinel-on-surface tracking-tight">
              ResQ<span className="text-brand-red"> AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive(item.path)
                      ? 'bg-brand-red/10 text-brand-red'
                      : 'text-sentinel-on-surface-variant hover:text-sentinel-on-surface hover:bg-surface-container'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
            {dashboardPath && (
              <Link
                to={dashboardPath}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive(dashboardPath)
                    ? 'bg-brand-blue/10 text-brand-blue'
                    : 'text-sentinel-on-surface-variant hover:text-sentinel-on-surface hover:bg-surface-container'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {profile?.role === 'admin' ? t('header.commandCenter') : t('header.myTasks')}
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher variant="ghost" />
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile-setup">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-sentinel-on-surface-variant hover:text-sentinel-on-surface hover:bg-surface-container transition-all">
                    <User className="w-4 h-4" />
                    {t('header.profile')}
                  </button>
                </Link>
                <button
                  onClick={() => { signOut(); navigate('/') }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-sentinel-on-surface-variant hover:text-brand-red hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="rounded-xl font-bold bg-brand-red hover:bg-brand-red/90 px-5">
                  {t('header.signIn')}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-surface-container transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-card-elevated mx-4 mb-4 p-4 space-y-1 animate-entrance">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive(item.path) ? 'bg-brand-red/10 text-brand-red' : 'text-sentinel-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="flex items-center gap-3"><Icon className="w-4 h-4" />{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </Link>
            )
          })}
          {dashboardPath && (
            <Link
              to={dashboardPath}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-sentinel-on-surface-variant hover:bg-surface-container transition-all"
            >
              <span className="flex items-center gap-3"><LayoutDashboard className="w-4 h-4" />{profile?.role === 'admin' ? t('header.commandCenter') : t('header.myTasks')}</span>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </Link>
          )}
          <div className="pt-3 border-t border-sentinel-outline-variant/20 mt-2">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile-setup" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full rounded-xl font-bold">
                    <User className="w-4 h-4 mr-2" /> {t('header.profile')}
                  </Button>
                </Link>
                <button
                  onClick={() => { signOut(); navigate('/'); setMobileOpen(false) }}
                  className="p-2.5 rounded-xl text-brand-red hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/auth" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full rounded-xl font-bold bg-brand-red hover:bg-brand-red/90">
                  {t('header.signIn')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
