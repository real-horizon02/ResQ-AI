import React from 'react'
import ReportForm from '../components/reports/ReportForm'
import { ShieldAlert } from 'lucide-react'

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-brand-light/30 pb-20">
      <div className="max-w-xl mx-auto px-6 py-12 space-y-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-brand-red/10 rounded-3xl flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-8 h-8 text-brand-red" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight">Citizen Reporting</h1>
            <p className="text-sm text-gray-500 mt-1">Your report can save lives. Provide accurate details.</p>
          </div>
        </div>

        <div className="glass-card p-6 md:p-8">
          <ReportForm />
        </div>
        
        <div className="bg-brand-blue/5 p-6 rounded-3xl border border-brand-blue/10 flex items-start gap-4">
          <div className="p-2 bg-brand-blue/10 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-brand-blue" />
          </div>
          <p className="text-xs text-brand-dark leading-relaxed">
            <strong>Pro-tip:</strong> Be specific about landmarks if reporting from a moving vehicle or poor GPS area.
          </p>
        </div>
      </div>
    </div>
  )
}
