import { Marker, Popup } from 'react-leaflet'
import { useDisasters, DisasterEvent } from '../../hooks/useDisasters'
import L from 'leaflet'
import { ShieldAlert, Droplets, Activity, Mountain, CloudRain, Waves, Flame } from 'lucide-react'
import { renderToStaticMarkup } from 'react-dom/server'

const getIcon = (type: DisasterEvent['type'], severity: DisasterEvent['severity']) => {
  let Color = '#E63946' // Default red
  if (severity === 'low') Color = '#F1FAEE'
  if (severity === 'medium') Color = '#FFB703'
  if (severity === 'high') Color = '#FB8500'

  const IconComponent = () => {
    switch (type) {
      case 'flood': return <Droplets style={{ color: Color }} />
      case 'earthquake': return <Activity style={{ color: Color }} />
      case 'landslide': return <Mountain style={{ color: Color }} />
      case 'rainfall': return <CloudRain style={{ color: Color }} />
      case 'tsunami': return <Waves style={{ color: Color }} />
      case 'wildfire': return <Flame style={{ color: Color }} />
      default: return <ShieldAlert style={{ color: Color }} />
    }
  }

  return L.divIcon({
    html: renderToStaticMarkup(
      <div className="relative flex items-center justify-center">
        <div className={`absolute w-10 h-10 rounded-full animate-ping opacity-20`} style={{ backgroundColor: Color }}></div>
        <div className="bg-white p-2 rounded-full shadow-lg border-2" style={{ borderColor: Color }}>
          <IconComponent />
        </div>
      </div>
    ),
    className: 'custom-disaster-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

export default function DisasterMarkers({ visible = true }: { visible?: boolean }) {
  const { disasters, loading } = useDisasters()

  if (!visible || loading) return null

  return (
    <>
      {disasters.map((disaster) => (
        <Marker 
          key={disaster.id} 
          position={[disaster.coordinates.lat, disaster.coordinates.lng]}
          icon={getIcon(disaster.type, disaster.severity)}
        >
          <Popup className="custom-popup">
            <div className="p-2 min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  disaster.severity === 'critical' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600'
                }`}>
                  {disaster.severity} Risk
                </span>
                <span className="text-gray-400 text-[10px]">{new Date(disaster.created_at).toLocaleTimeString()}</span>
              </div>
              <h3 className="font-bold text-gray-900 capitalize text-sm">{disaster.type} Alert</h3>
              <p className="text-xs text-gray-600 mt-1 font-medium">{disaster.location_name}</p>
              <p className="text-[11px] text-gray-500 mt-2 line-clamp-2">{disaster.description}</p>
              <button className="w-full mt-3 bg-brand-red text-white py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors">
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}
