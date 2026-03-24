import MapContainer from '../components/map/MapContainer'
import DisasterMarkers from '../components/map/DisasterMarkers'
import SafeZoneMarkers from '../components/map/SafeZoneMarkers'
import RiskHeatmap from '../components/map/RiskHeatmap'

export default function MapPage() {
  return (
    <div className="w-full h-full">
      <MapContainer>
        <DisasterMarkers />
        <SafeZoneMarkers />
        <RiskHeatmap />
      </MapContainer>
    </div>
  )
}
