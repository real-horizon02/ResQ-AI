import React, { useState, useRef, useEffect } from 'react'
import { useSOS } from '../../hooks/useSOS'
import { Button } from '../ui/Button'
import { AlertCircle, ShieldAlert, Loader2, X } from 'lucide-react'

export default function SOSButton() {
  const { isSOSActive, loading, triggerSOS } = useSOS()
  const [pressStartTime, setPressStartTime] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const timerRef = useRef<number | null>(null)

  const HOLD_DURATION = 3000 // 3 seconds

  const startPress = () => {
    setPressStartTime(Date.now())
    timerRef.current = window.setInterval(() => {
      setProgress(p => Math.min(100, p + (100 / (HOLD_DURATION / 50))))
    }, 50)
  }

  const endPress = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPressStartTime(null)
    if (progress < 100) setProgress(0)
  }

  useEffect(() => {
    if (progress >= 100) {
      triggerSOS()
      setProgress(0)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [progress, triggerSOS])

  if (isSOSActive) {
    return (
      <div className="fixed bottom-24 right-6 left-6 md:left-auto md:w-80 bg-urgency-gradient text-white p-4 rounded-2xl shadow-emergency animate-bounce z-[100] ghost-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg leading-tight uppercase tracking-wide">SOS ACTIVE</p>
            <p className="text-[10px] opacity-80">Help is on the way. Keep your phone on.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        onMouseDown={startPress}
        onMouseUp={endPress}
        onTouchStart={startPress}
        onTouchEnd={endPress}
        className="fixed bottom-24 right-6 w-14 h-14 bg-urgency-gradient rounded-full shadow-emergency flex items-center justify-center z-[90] active:scale-95 transition-transform emergency-glow"
      >
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        {progress > 0 && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="transparent"
              stroke="white"
              strokeWidth="3"
              strokeDasharray={`${(progress / 100) * 150.8} 150.8`}
              className="transition-all duration-75"
            />
          </svg>
        )}
        <div className="flex flex-col items-center">
          {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <AlertCircle className="w-7 h-7 text-white" />}
          <span className="text-[7px] font-black text-white uppercase tracking-tighter mt-0.5">SOS</span>
        </div>
      </button>

      {/* Accidental click deterrent message */}
      {progress > 0 && progress < 100 && (
        <div className="fixed bottom-40 right-6 bg-sentinel-on-surface text-white px-4 py-2 rounded-xl text-xs font-bold animate-pulse z-[95] shadow-lg">
          HOLD TO TRIGGER SOS ({Math.ceil((100 - progress) / 33.3)}s)
        </div>
      )}
    </>
  )
}
