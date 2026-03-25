import { useState } from 'react'
import { Layers, AlertTriangle, Shield, Thermometer, ChevronDown } from 'lucide-react'

export interface LayerState {
  disasters: boolean
  safeZones: boolean
  heatmap: boolean
}

interface LayerFilterProps {
  layers: LayerState
  onToggle: (layer: keyof LayerState) => void
}

export default function LayerFilter({ layers, onToggle }: LayerFilterProps) {
  const [expanded, setExpanded] = useState(false)

  const layerItems = [
    { key: 'disasters' as const, label: 'Disaster Events', icon: AlertTriangle, color: 'text-brand-red', bg: 'bg-brand-red/10' },
    { key: 'safeZones' as const, label: 'Safe Zones', icon: Shield, color: 'text-brand-green', bg: 'bg-brand-green/10' },
    { key: 'heatmap' as const, label: 'Risk Heatmap', icon: Thermometer, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
  ]

  return (
    <div className="glass-card-solid overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-container-low transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sentinel-on-surface-variant" />
          <span className="text-xs font-bold text-sentinel-on-surface">Map Layers</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-sentinel-on-surface-variant transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-1 animate-entrance">
          {layerItems.map(item => {
            const Icon = item.icon
            const active = layers[item.key]
            return (
              <button
                key={item.key}
                onClick={() => onToggle(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  active 
                    ? `${item.bg} ${item.color}` 
                    : 'text-sentinel-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-bold flex-1">{item.label}</span>
                <div className={`w-8 h-5 rounded-full transition-colors flex items-center ${
                  active ? 'bg-current justify-end' : 'bg-gray-200 justify-start'
                }`}>
                  <div className={`w-4 h-4 rounded-full mx-0.5 transition-colors ${
                    active ? 'bg-white' : 'bg-gray-400'
                  }`} />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
