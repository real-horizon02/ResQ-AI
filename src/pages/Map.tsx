import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navbar } from '../components/Navbar';
import { useAppStore } from '../store/useAppStore';
import { TYPE_EMOJIS, Incident } from '../data/mockData';
import { motion } from 'framer-motion';

// Fix Leaflet default icon URLs for Vite
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SEV_COLOR: Record<string, string> = {
  critical: '#FF2D2D', high: '#FF6B1A', medium: '#F59E0B', low: '#5A6A8A',
};

function makeIcon(severity: string) {
  const color = SEV_COLOR[severity] || '#5A6A8A';
  const pulse = severity === 'critical'
    ? `<circle cx="16" cy="16" r="18" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.6"><animate attributeName="r" from="18" to="30" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" from="0.6" to="0" dur="1.8s" repeatCount="indefinite"/></circle>`
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">${pulse}<path d="M16 0C7.16 0 0 7.16 0 16c0 10.56 16 26 16 26S32 26.56 32 16C32 7.16 24.84 0 16 0z" fill="${color}"/><circle cx="16" cy="16" r="7" fill="rgba(0,0,0,0.35)"/></svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [32, 42], iconAnchor: [16, 42], popupAnchor: [0, -42] });
}

// Inner map components — must be rendered INSIDE MapContainer
function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 50);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

function IncidentMarkers({ incidents, onSelect }: { incidents: Incident[]; onSelect: (id: string) => void }) {
  const navigate = useNavigate();
  return (
    <>
      {incidents.map((inc) => (
        <Marker
          key={inc.id}
          position={[inc.lat, inc.lng]}
          icon={makeIcon(inc.severity)}
          eventHandlers={{ click: () => onSelect(inc.id) }}
        >
          <Popup closeButton={false} className="resq-popup">
            <div style={{ background: '#0D1525', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, minWidth: 240 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.3, fontFamily: 'DM Sans' }}>
                  {TYPE_EMOJIS[inc.type]} {inc.title}
                </span>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: SEV_COLOR[inc.severity] + '22', border: `1px solid ${SEV_COLOR[inc.severity]}`, color: SEV_COLOR[inc.severity], fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{inc.severity}</span>
              </div>
              <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#8899BB', marginBottom: 8 }}>{inc.location}</p>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#8899BB', lineHeight: 1.5, marginBottom: 12 }}>{inc.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#FF6B1A', fontFamily: 'DM Sans' }}>👥 {inc.peopleAffected.toLocaleString()} affected</span>
                <button
                  onClick={() => navigate('/volunteer')}
                  style={{ padding: '7px 14px', background: '#00D4FF', color: '#06090F', border: 'none', borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                >
                  Dispatch →
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

function Sidebar({ incidents, activeId, onSelect }: { incidents: Incident[]; activeId: string | null; onSelect: (id: string) => void }) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const filtered = filter === 'all' ? incidents : incidents.filter(i => i.severity === filter);

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mobile-hide"
      style={{ width: 280, background: '#0D1525', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'DM Sans', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A6A8A' }}>INCIDENTS</span>
        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,45,45,0.1)', border: '1px solid #FF2D2D', color: '#FF2D2D', fontWeight: 700 }}>● LIVE</span>
      </div>

      {/* Filters */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 6 }}>
        {(['all', 'critical', 'high', 'medium'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '4px 10px', borderRadius: 999, border: `1px solid ${filter === f ? '#C8A96E' : 'rgba(255,255,255,0.06)'}`, background: filter === f ? 'rgba(200,169,110,0.1)' : 'transparent', color: filter === f ? '#C8A96E' : '#5A6A8A', fontFamily: 'DM Sans', fontSize: 10, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase' }}>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(inc => (
          <div key={inc.id} onClick={() => onSelect(inc.id)}
            style={{ padding: '11px 13px', borderRadius: 10, background: activeId === inc.id ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${activeId === inc.id ? SEV_COLOR[inc.severity] + '55' : 'rgba(255,255,255,0.05)'}`, borderLeft: `3px solid ${SEV_COLOR[inc.severity]}`, cursor: 'pointer', transition: 'all 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#E8F0FE', lineHeight: 1.3, fontFamily: 'DM Sans' }}>{TYPE_EMOJIS[inc.type]} {inc.title.split('—')[0].trim()}</span>
              <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 999, background: SEV_COLOR[inc.severity] + '22', color: SEV_COLOR[inc.severity], fontWeight: 700, flexShrink: 0, marginLeft: 4 }}>{inc.severity}</span>
            </div>
            <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#5A6A8A', margin: '0 0 3px' }}>{inc.state}</p>
            <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#5A6A8A', margin: 0 }}>👥 {inc.peopleAffected.toLocaleString()} affected</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function MapPage() {
  const { incidents, volunteers } = useAppStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const online = volunteers.filter(v => v.status === 'available').length;
  const critical = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#06090F', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Sub-header */}
      <div style={{ paddingTop: 70, paddingBottom: 10, paddingLeft: 24, paddingRight: 24, background: '#06090F', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(24px, 4vw, 40px)', color: '#E8F0FE', margin: 0, lineHeight: 1 }}>
            Live Incident Map <span style={{ fontFamily: 'DM Sans', fontStyle: 'normal', fontWeight: 300, fontSize: 14, color: '#5A6A8A' }}>— India</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#00E676' }}>🟢 {online} volunteers online</span>
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#FF2D2D' }}>🔴 {critical} critical incidents</span>
        </div>
      </div>

      {/* Main content row — fills remaining space */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        <Sidebar incidents={incidents} activeId={activeId} onSelect={setActiveId} />

        {/* Map fills remaining width — MUST have position:relative and explicit dimensions */}
        <div
          data-cursor="map"
          style={{ flex: 1, position: 'relative', minWidth: 0, minHeight: 0 }}
        >
          <MapContainer
            center={[22.5, 83]}
            zoom={5}
            zoomControl={false}
            attributionControl={false}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          >
            <MapInvalidator />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="© OpenStreetMap contributors © CARTO"
            />
            <ZoomControl position="bottomright" />
            <IncidentMarkers incidents={incidents} onSelect={setActiveId} />
          </MapContainer>

          {/* Attribution overlay */}
          <div style={{ position: 'absolute', bottom: 6, left: 6, zIndex: 500, fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>
            © OpenStreetMap · © CARTO
          </div>
        </div>
      </div>
    </div>
  );
}
