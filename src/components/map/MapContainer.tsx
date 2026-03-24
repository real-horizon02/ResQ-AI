import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import L from 'leaflet'

// Fix for default marker icons in Leaflet + React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

const INDIA_CENTER: [number, number] = [20.5937, 78.9629]
const DEFAULT_ZOOM = 5

function LocateButton() {
  const map = useMap()
  const [locating, setLocating] = useState(false)

  const handleLocate = () => {
    setLocating(true)
    map.locate({ setView: true, maxZoom: 13 })
    map.on('locationfound', () => setLocating(false))
    map.on('locationerror', () => {
      setLocating(false)
      console.warn("Location access denied or unavailable.")
    })
  }

  return (
    <div className="leaflet-bottom leaflet-left" style={{ marginBottom: '100px', marginLeft: '10px' }}>
      <button
        onClick={handleLocate}
        disabled={locating}
        className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors flex items-center justify-center border border-gray-200"
        title="Find my location"
      >
        <svg 
          className={`w-6 h-6 ${locating ? 'text-brand-blue animate-pulse' : 'text-gray-700'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  )
}

import MapLegend from './MapLegend'
import DataFreshness from './DataFreshness'

export default function AppMapContainer({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
      <MapContainer
        center={INDIA_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        className="w-full h-full z-0"
        minZoom={4}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <LocateButton />
        <MapLegend />
        {children}
      </MapContainer>
      
      {/* Overlay controls - like search or filters can stay here */}
      <div className="absolute top-4 left-4 z-10 w-full max-w-xs pointer-events-none space-y-3">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 pointer-events-auto">
          <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-1">Live Monitor</h2>
          <p className="text-[10px] text-gray-500 leading-tight">Monitoring all regions of India for emergency events.</p>
        </div>
        <div className="pointer-events-auto">
          <DataFreshness />
        </div>
      </div>
    </div>
  )
}
