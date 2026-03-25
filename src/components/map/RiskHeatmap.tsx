import React from 'react'
import { Circle, Popup } from 'react-leaflet'

interface RiskZone {
  id: string
  lat: number
  lng: number
  radius: number
  intensity: 'low' | 'medium' | 'high'
  reason: string
  prediction_window: string
}

const RISK_COLORS = {
  low: '#fbbf24',    // Amber
  medium: '#f97316', // Orange
  high: '#ef4444',   // Red
}

export default function RiskHeatmap({ visible = true }: { visible?: boolean }) {
  if (!visible) return null
  // In a real production scenario, this would fetch from a 'predicted_risks' table 
  // populated by a Python/Supabase AI worker. For this MVP, we use heuristic-based trends.
  const [risks, setRisks] = React.useState<RiskZone[]>([
    {
      id: 'r1',
      lat: 19.0760,
      lng: 72.8777,
      radius: 5000,
      intensity: 'high',
      reason: 'Predicted flash flood due to 80% rainfall intensity increase.',
      prediction_window: 'Next 3 hours'
    },
    {
      id: 'r2',
      lat: 28.6139,
      lng: 77.2090,
      radius: 3000,
      intensity: 'medium',
      reason: 'Seismic tremors detected; elevated landslide risk.',
      prediction_window: 'Next 6 hours'
    }
  ])

  return (
    <>
      {risks.map((risk) => (
        <Circle
          key={risk.id}
          center={[risk.lat, risk.lng]}
          radius={risk.radius}
          pathOptions={{
            fillColor: RISK_COLORS[risk.intensity],
            color: RISK_COLORS[risk.intensity],
            fillOpacity: 0.3,
            weight: 2,
            dashArray: '5, 10'
          }}
        >
          <Popup className="custom-popup">
            <div className="p-2">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full animate-pulse bg-${risk.intensity === 'high' ? 'red' : 'orange'}-500`} />
                <h3 className="font-bold text-brand-dark uppercase text-[10px] tracking-widest">AI Prediction</h3>
              </div>
              <p className="text-sm font-medium text-gray-800">{risk.reason}</p>
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-[10px] text-gray-400 font-bold">
                <span>INTENSITY: {risk.intensity.toUpperCase()}</span>
                <span>AVAILABILITY: {risk.prediction_window}</span>
              </div>
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  )
}
