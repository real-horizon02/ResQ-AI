import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { Button } from '../ui/Button'
import { MapPin, Camera, AlertTriangle, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { outbox } from '../../lib/outbox'

const REPORT_TYPES = [
  { id: 'flood', label: 'Flood / बाढ़', icon: '🌊' },
  { id: 'fire', label: 'Fire / आग', icon: '🔥' },
  { id: 'medical', label: 'Medical / चिकित्सा', icon: '🚑' },
  { id: 'earthquake', label: 'Earthquake / भूकंप', icon: '⛰️' },
  { id: 'other', label: 'Other / अन्य', icon: '⚠️' }
]

export default function ReportForm() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('moderate')
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locating, setLocating] = useState(false)

  const getGeolocation = () => {
    setLocating(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setLocating(false)
      }, (error) => {
        console.error("Error getting location:", error)
        setLocating(false)
        alert("Please enable location permissions to report an incident.")
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !location || !type) return

    setLoading(true)
    try {
      const reportData = {
        user_id: user.id,
        type,
        description,
        severity,
        location: `POINT(${location.lng} ${location.lat})`,
        status: 'pending'
      }

      if (!navigator.onLine) {
        await outbox.saveReport(reportData)
        setSuccess(true)
        alert('Offline: Report saved locally. It will sync automatically when connection is restored.')
        return
      }

      const { error } = await supabase.from('citizen_reports').insert(reportData)

      if (error) throw error
      setSuccess(true)
    } catch (err: any) {
      alert(`Reporting failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="glass-card p-10 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-brand-dark">Report Submitted!</h2>
        <p className="text-gray-500">First responders have been notified. Stay safe.</p>
        <Button onClick={() => window.location.href = '/'} variant="secondary" className="mt-4">
          Return Home
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Selection */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider">Incident Type</label>
        <div className="grid grid-cols-2 gap-3">
          {REPORT_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                type === t.id ? 'border-brand-blue bg-brand-blue/5' : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="text-[10px] font-bold text-brand-dark leading-tight">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider">Details</label>
        <textarea
          placeholder="Describe the situation..."
          className="w-full h-32 bg-white border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-blue outline-none transition-all resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      {/* Location */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider">Incident Location</label>
        <Button
          type="button"
          variant={location ? 'outline' : 'default'}
          onClick={getGeolocation}
          disabled={locating}
          className="w-full h-14 rounded-2xl flex items-center justify-center gap-3"
        >
          {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
          {location ? `📍 Location Captured (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'Capture Current Location'}
        </Button>
        {location && (
          <p className="text-[10px] text-green-600 font-medium text-center italic">✓ Precisely geocoded for first responders</p>
        )}
      </div>

      <Button
        disabled={loading || !type || !location}
        type="submit"
        className="w-full h-16 rounded-2xl shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-3 text-lg font-bold"
      >
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
          <> <AlertTriangle className="w-5 h-5" /> Submit Emergency Report </>
        )}
      </Button>
    </form>
  )
}
