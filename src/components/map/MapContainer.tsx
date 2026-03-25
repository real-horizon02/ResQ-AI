import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useCallback, useRef, useState } from 'react'
import L from 'leaflet'

// Fix for default marker icons in Leaflet + React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

const INDIA_CENTER: [number, number] = [20.5937, 78.9629]
const DEFAULT_ZOOM = 5

import DisasterMarkers from './DisasterMarkers'
import SafeZoneMarkers from './SafeZoneMarkers'
import RiskHeatmap from './RiskHeatmap'
import DataFreshness from './DataFreshness'
import MapSearch from './MapSearch'
import LayerFilter, { type LayerState } from './LayerFilter'
import { Crosshair, Loader2 } from 'lucide-react'

interface AppMapContainerProps {
  layers: LayerState
  onToggleLayer: (layer: keyof LayerState) => void
}

export default function AppMapContainer({ layers, onToggleLayer }: AppMapContainerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [locating, setLocating] = useState(false)

  const handleFlyTo = useCallback((lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 13, { duration: 1.5 })
    }
  }, [])

  const handleLocate = useCallback(() => {
    if (!mapRef.current) return
    setLocating(true)
    mapRef.current.locate({ setView: true, maxZoom: 13 })
    mapRef.current.once('locationfound', () => setLocating(false))
    mapRef.current.once('locationerror', () => {
      setLocating(false)
      console.warn("Location access denied or unavailable.")
    })
  }, [])

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
      <MapContainer
        center={INDIA_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        className="w-full h-full z-0"
        minZoom={4}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <DisasterMarkers visible={layers.disasters} />
        <SafeZoneMarkers visible={layers.safeZones} />
        <RiskHeatmap visible={layers.heatmap} />
      </MapContainer>
      
      {/* All overlay controls — OUTSIDE the Leaflet MapContainer */}
      <div className="absolute top-4 left-4 z-[1000] w-full max-w-xs pointer-events-none space-y-3">
        <div className="pointer-events-auto">
          <MapSearch onFlyTo={handleFlyTo} />
        </div>
        <div className="pointer-events-auto">
          <LayerFilter layers={layers} onToggle={onToggleLayer} />
        </div>
        <div className="pointer-events-auto">
          <DataFreshness />
        </div>
      </div>

      {/* Locate button */}
      <div className="absolute bottom-28 left-4 z-[1000]">
        <button
          onClick={handleLocate}
          disabled={locating}
          className="glass-card-solid p-3 flex items-center justify-center hover:bg-surface-container-low transition-colors"
          title="Find my location"
        >
          {locating 
            ? <Loader2 className="w-5 h-5 text-brand-blue animate-spin" />
            : <Crosshair className="w-5 h-5 text-sentinel-on-surface" />
          }
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-10 right-16 z-[1000]">
        <div className="glass-card-solid p-4">
          <h3 className="label-tactical mb-3">Map Legend</h3>
          <div className="space-y-2.5">
            {[
              { label: 'Critical Risk', color: '#E63946' },
              { label: 'High Risk', color: '#FB8500' },
              { label: 'Moderate Risk', color: '#FFB703' },
              { label: 'Safe Zone', color: '#457B9D' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-[11px] font-medium text-sentinel-on-surface">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
