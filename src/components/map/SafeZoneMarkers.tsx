import { Marker, Popup, useMap } from 'react-leaflet'
import { useSafeZones, SafeZone } from '../../hooks/useSafeZones'
import L from 'leaflet'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import { useEffect } from 'react'
import { Hospital, Home, ShieldCheck, MapPin } from 'lucide-react'
import { renderToStaticMarkup } from 'react-dom/server'

const getSafeZoneIcon = (type: SafeZone['type']) => {
  const Color = '#06D6A0' // Brand Green
  
  const IconComponent = () => {
    switch (type) {
      case 'hospital': return <Hospital className="w-5 h-5 text-white" />
      case 'shelter': return <Home className="w-5 h-5 text-white" />
      case 'rescue_station': return <ShieldCheck className="w-5 h-5 text-white" />
      default: return <MapPin className="w-5 h-5 text-white" />
    }
  }

  return L.divIcon({
    html: renderToStaticMarkup(
      <div className="bg-brand-blue p-1.5 rounded-lg shadow-md border-2 border-white">
        <IconComponent />
      </div>
    ),
    className: 'custom-safezone-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

export default function SafeZoneMarkers({ visible = true }: { visible?: boolean }) {
  const { safeZones, loading } = useSafeZones()
  const map = useMap()

  useEffect(() => {
    if (loading || !safeZones.length || !visible) return

    const mg = (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 50,
    })

    safeZones.forEach((sz) => {
      const marker = L.marker([sz.coordinates.lat, sz.coordinates.lng], {
        icon: getSafeZoneIcon(sz.type)
      })

      marker.bindPopup(renderToStaticMarkup(
        <div className="p-3 min-w-[220px] font-sans">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-brand-blue text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              {sz.type.replace('_', ' ')}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
              sz.status === 'full' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-brand-green'
            }`}>
              {sz.status}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 text-sm">{sz.name}</h3>
          <div className="mt-3 space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Capacity:</span>
              <span className="font-semibold">{sz.current_occupancy} / {sz.capacity}</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  (sz.current_occupancy / sz.capacity) > 0.8 ? 'bg-orange-500' : 'bg-brand-green'
                }`}
                style={{ width: `${(sz.current_occupancy / sz.capacity) * 100}%` }}
              ></div>
            </div>
            <p className="pt-2 text-[11px] italic">{sz.contact_info}</p>
          </div>
          <button className="w-full mt-4 bg-brand-blue text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
            Get Directions
          </button>
        </div>
      ))

      mg.addLayer(marker)
    })

    map.addLayer(mg)

    return () => {
      map.removeLayer(mg)
    }
  }, [loading, safeZones, map])

  return null
}
