import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Shield, AlertCircle, CheckCircle, XCircle, Clock, Map as MapIcon, ChevronRight, ShieldAlert } from 'lucide-react'

interface CitizenReport {
  id: string
  type: string
  description: string
  severity: string
  status: string
  created_at: string
  location_name?: string
}

interface SOSAlert {
  id: string
  user_id: string
  location: { lat: number; lng: number }
  status: string
  battery_level?: number
  created_at: string
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<CitizenReport[]>([])
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
    fetchSOS()

    // Subscribe to reports
    const reportChannel = supabase
      .channel('admin_reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citizen_reports' }, () => {
        fetchReports()
      })
      .subscribe()

    // Subscribe to SOS (Broadcast + DB sync)
    const sosChannel = supabase
      .channel('emergency_signals')
      .on('broadcast', { event: 'sos_triggered' }, (payload) => {
        console.log('SOS BROADCAST RECEIVED:', payload)
        fetchSOS() // Re-fetch to get full DB state + new alert
        // Play sound if possible
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-emergency-alert-alarm-1007.mp3')
        audio.play().catch(() => {})
      })
      .subscribe()

    return () => {
      supabase.removeChannel(reportChannel)
      supabase.removeChannel(sosChannel)
    }
  }, [])

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('citizen_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setReports(data)
    }
  }

  const fetchSOS = async () => {
    const { data, error } = await supabase
      .from('sos_alerts')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (!error && data) {
      // PostGIS Point to {lat, lng} conversion would happen here or via RPC
      // For now we map the simplified version
      setSosAlerts(data.map((d: any) => ({
        ...d,
        location: { lat: 0, lng: 0 } // Placeholder for coordinates parsing
      })))
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('citizen_reports')
      .update({ status: newStatus })
      .eq('id', id)
    
    if (error) alert(`Error updating status: ${error.message}`)
  }

  const resolveSOS = async (id: string) => {
    const { error } = await supabase
      .from('sos_alerts')
      .update({ status: 'resolved' })
      .eq('id', id)
    
    if (!error) fetchSOS()
  }

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-100'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-100'
      default: return 'text-blue-600 bg-blue-50 border-blue-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'false_alarm': return <XCircle className="w-4 h-4 text-gray-400" />
      default: return <Clock className="w-4 h-4 text-amber-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-dark rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-dark">Command Center</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                Real-time Disaster Response & Verification
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-gray-600">Live Monitor</span>
            </div>
          </div>
        </div>

        {/* SOS Emergency Signals */}
        {sosAlerts.length > 0 && (
          <div className="bg-red-600 rounded-3xl p-6 shadow-2xl border-4 border-white/20 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <ShieldAlert className="w-8 h-8 text-white" />
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Active SOS Signals ({sosAlerts.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sosAlerts.map(sos => (
                <div key={sos.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-white flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">Distress Signal #{sos.id.slice(0, 4)}</p>
                    <p className="text-[10px] opacity-70 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(sos.created_at).toLocaleTimeString()}
                    </p>
                    {sos.battery_level && (
                      <p className="text-[10px] opacity-70 mt-1 font-medium">Battery: {sos.battery_level}%</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="bg-white border-0 text-red-600 hover:bg-gray-100" onClick={() => resolveSOS(sos.id)}>
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid (Mock for now) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Reports', value: reports.filter(r => r.status === 'pending').length, color: 'text-amber-600' },
            { label: 'Verified Today', value: reports.filter(r => r.status === 'verified').length, color: 'text-green-600' },
            { label: 'False Alarms', value: reports.filter(r => r.status === 'false_alarm').length, color: 'text-gray-500' },
            { label: 'Critical Alert', value: reports.filter(r => r.severity === 'critical').length, color: 'text-red-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-brand-dark">Incoming Citizen Reports</h2>
            <Button variant="ghost" size="sm" onClick={fetchReports} className="text-xs">Refresh</Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Report Details</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-brand-dark capitalize flex items-center gap-2">
                          {report.type}
                          {report.severity === 'critical' && <AlertCircle className="w-3 h-3 text-red-500" />}
                        </span>
                        <span className="text-xs text-gray-500 line-clamp-1">{report.description}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {new Date(report.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapIcon className="w-3.5 h-3.5 text-brand-blue" />
                        <span>Coordinates Captured</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getSeverityColor(report.severity)}`}>
                        {report.severity}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-medium capitalize">
                        {getStatusIcon(report.status)}
                        {report.status}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {report.status === 'pending' ? (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" className="h-8 px-2 text-[10px] border-green-200 text-green-600 hover:bg-green-50" onClick={() => updateStatus(report.id, 'verified')}>
                            Verify
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 px-2 text-[10px] border-gray-200 text-gray-500 hover:bg-gray-50" onClick={() => updateStatus(report.id, 'false_alarm')}>
                            Spam
                          </Button>
                        </div>
                      ) : (
                        <div className="text-[10px] text-gray-400 font-medium italic">Action Taken</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
