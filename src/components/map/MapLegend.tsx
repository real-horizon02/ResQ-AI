import { useTranslation } from 'react-i18next'

export default function MapLegend() {
  const { t } = useTranslation()

  const legendItems = [
    { label: 'Critical Risk', color: '#E63946', type: 'disaster' },
    { label: 'High Risk', color: '#FB8500', type: 'disaster' },
    { label: 'Moderate Risk', color: '#FFB703', type: 'disaster' },
    { label: 'Safe Zone', color: '#457B9D', type: 'safezone' },
  ]

  return (
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: '40px', marginRight: '10px' }}>
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 pointer-events-auto">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Map Legend</h3>
        <div className="space-y-2.5">
          {legendItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div 
                className={`w-3 h-3 rounded-full ${item.type === 'disaster' ? 'animate-pulse' : ''}`} 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-[11px] font-medium text-brand-dark">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
