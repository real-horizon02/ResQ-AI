import { AlertTriangle, Map, Shield, Users, WifiOff, Activity, Heart } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useConnectionStatus } from '../hooks/useConnectionStatus'
import { Alert, AlertDescription } from '../components/ui/Alert'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { StatSkeleton } from '../components/ui/Skeleton'

export default function Home() {
  const { t } = useTranslation()
  const { isOnline, isSlow } = useConnectionStatus()
  const { stats, loading: statsLoading } = useDashboardStats()

  return (
    <div className="space-y-6">
      {(!isOnline || isSlow) && (
        <Alert variant={!isOnline ? "destructive" : "default"} className="bg-orange-50 border-orange-200">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 font-medium">
            {!isOnline 
              ? "You are offline. Reporting will be saved locally and synced later." 
              : "Slow connection detected. Low Bandwidth Mode is active."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Welcome Card */}
      <div className="lg:col-span-2 glass-card p-8 flex flex-col gap-6">
        <div className="flex items-center gap-4 text-brand-red">
          <AlertTriangle className="w-8 h-8" />
          <h2 className="text-2xl font-bold">{t('home.hero_title')}</h2>
        </div>
        <p className="text-gray-600 leading-relaxed">
          {t('home.hero_subtitle')}
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/map?layer=safezones">
            <Button variant="emergency" size="lg">
              {t('common.get_help')}
            </Button>
          </Link>
          <Link to="/map">
            <Button variant="outline" size="lg">
              {t('nav.map')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats / Quick Info */}
      <div className="glass-card p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="font-semibold text-brand-dark">{t('home.active_disasters')}</h3>
          <span className="bg-brand-red/10 text-brand-red px-2 py-1 rounded text-xs font-bold uppercase">
            {statsLoading ? '...' : `${stats.activeDisasters} LIVE`}
          </span>
        </div>
        <div className="py-4 space-y-4">
          {statsLoading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('home.verified_volunteers')}</span>
                <span className="font-bold">{stats.verifiedVolunteers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('home.sos_resolved')}</span>
                <span className="font-bold">{stats.sosResolvedRate}%</span>
              </div>
            </>
          )}
        </div>
        <Link to="/volunteer">
          <Button variant="secondary" className="w-full">
            {t('common.volunteer')}
          </Button>
        </Link>
      </div>

      {/* Feature Grid Item 1 */}
      <Link to="/map" className="glass-card p-6 flex items-start gap-4 hover:shadow-2xl transition-shadow cursor-pointer">
        <div className="bg-brand-blue/10 p-3 rounded-xl">
          <Map className="w-6 h-6 text-brand-blue" />
        </div>
        <div>
          <h4 className="font-bold">{t('nav.map')}</h4>
          <p className="text-xs text-gray-500 mt-1">Interactive risk zone visualization for all of India.</p>
        </div>
      </Link>

      {/* Feature Grid Item 2 */}
      <Link to="/map?layer=safezones" className="glass-card p-6 flex items-start gap-4 hover:shadow-2xl transition-shadow cursor-pointer">
        <div className="bg-brand-green/10 p-3 rounded-xl">
          <Shield className="w-6 h-6 text-brand-green" />
        </div>
        <div>
          <h4 className="font-bold">{t('nav.safe_zones')}</h4>
          <p className="text-xs text-gray-500 mt-1">Locate surgical hospitals, shelters, and relief camps near you.</p>
        </div>
      </Link>

      {/* Feature Grid Item 3 */}
      <Link to="/report" className="glass-card p-6 flex items-start gap-4 hover:shadow-2xl transition-shadow cursor-pointer">
        <div className="bg-brand-orange/10 p-3 rounded-xl">
          <Users className="w-6 h-6 text-brand-orange" />
        </div>
        <div>
          <h4 className="font-bold">{t('nav.reports')}</h4>
          <p className="text-xs text-gray-500 mt-1">Contribute to live incident reporting and verification.</p>
        </div>
      </Link>
      </div>
    </div>
  )
}
