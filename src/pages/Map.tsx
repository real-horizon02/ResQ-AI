import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navbar } from '../components/Navbar';
import { useAppStore } from '../store/useAppStore';
import { TYPE_EMOJIS, Incident } from '../data/mockData';
import { motion } from 'framer-motion';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#FF2D2D', high: '#FF6B1A', medium: '#F59E0B', low: '#5A6A8A',
};

function createSVGIcon(severity: string) {
  const color = SEVERITY_COLORS[severity] || '#5A6A8A';
  const isCritical = severity === 'critical';
  const pulse = isCritical ? `
    <circle cx="14" cy="12" r="14" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.7">
      <animate attributeName="r" from="14" to="26" dur="1.8s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.7" to="0" dur="1.8s" repeatCount="indefinite"/>
    </circle>
    <circle cx="14" cy="12" r="14" fill="none" stroke="${color}" stroke-width="1" opacity="0.4">
      <animate attributeName="r" from="14" to="30" dur="1.8s" begin="0.6s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.4" to="0" dur="1.8s" begin="0.6s" repeatCount="indefinite"/>
    </circle>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">${pulse}<path d="M16 0C7.16 0 0 7.16 0 16c0 10.56 16 26 16 26S32 26.56 32 16C32 7.16 24.84 0 16 0z" fill="${color}"/><circle cx="16" cy="16" r="7" fill="rgba(0,0,0,0.35)"/></svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [32, 42], iconAnchor: [16, 42] });
}

function MarkerPopup({ incident }: { incident: Incident }) {
  const navigate = useNavigate();
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 16, minWidth: 240, fontFamily: 'DM Sans' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{incident.title}</span>
        <span className={`badge-${incident.severity}`}>{incident.severity}</span>
      </div>
      <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', marginBottom: 8 }}>
        {incident.location} · {incident.lat.toFixed(2)}°N
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>{incident.description}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--accent-orange)' }}>👥 {incident.peopleAffected.toLocaleString()}</span>
        <button onClick={() => navigate('/volunteer')}
          style={{ padding: '7px 14px', background: 'var(--accent-cyan)', color: 'var(--bg)', border: 'none', borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
          Dispatch →
        </button>
      </div>
    </div>
  );
}

function MapStatusBar({ incidents, volunteers }: { incidents: any[]; volunteers: any[] }) {
  const online = volunteers.filter((v: any) => v.status === 'available').length;
  const critical = incidents.filter((i: any) => i.severity === 'critical' && i.status !== 'resolved').length;
  return (
    <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 200, display: 'flex', gap: 20, background: 'rgba(6,9,15,0.85)', backdropFilter: 'blur(24px)', border: '1px solid var(--glass-border)', borderRadius: 999, padding: '8px 24px', whiteSpace: 'nowrap' }}>
      <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--accent-green)' }}>🟢 {online} Volunteers</span>
      <span style={{ color: 'var(--text-dim)' }}>·</span>
      <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--accent-red)' }}>🔴 {critical} Critical</span>
      <span style={{ color: 'var(--text-dim)' }}>·</span>
      <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}>⚡ LIVE</span>
    </div>
  );
}

function IncidentSidebar({ incidents }: { incidents: Incident[] }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const FILTERS = ['all', 'critical', 'high', 'medium', 'low'];
  const filtered = activeFilter === 'all' ? incidents : incidents.filter(i => i.severity === activeFilter);

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mobile-hide"
      style={{ width: 300, height: '100%', background: 'var(--bg-surface)', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* Header */}
      <div style={{ padding: '16px 16px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="label-caps">INCIDENT QUEUE</span>
          <span className="badge-live">🔴 LIVE</span>
        </div>
        {/* Severity filters */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 12 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              style={{ padding: '4px 12px', borderRadius: 999, border: `1px solid ${activeFilter === f ? 'var(--accent-gold)' : 'var(--glass-border)'}`, background: activeFilter === f ? 'rgba(200,169,110,0.12)' : 'transparent', color: activeFilter === f ? 'var(--accent-gold)' : 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Incident list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(inc => (
          <div
            key={inc.id}
            className="glass-card-elevated"
            style={{ padding: '12px 14px', borderLeft: `3px solid ${SEVERITY_COLORS[inc.severity]}`, cursor: 'none', transition: 'transform 0.2s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{TYPE_EMOJIS[inc.type]} {inc.title.split('—')[0].trim()}</span>
              <span className={`badge-${inc.severity}`}>{inc.severity}</span>
            </div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', margin: '0 0 4px' }}>{inc.location}</p>
            <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>👥 {inc.peopleAffected.toLocaleString()} affected</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function MapPage() {
  const { incidents, volunteers } = useAppStore();
  const [heatmapActive, setHeatmapActive] = useState(false);

  return (
    <div style={{ background: 'var(--bg)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      {/* Hero strip */}
      <div style={{ paddingTop: 72, paddingBottom: 28, paddingLeft: 'clamp(24px, 8vw, 64px)', background: 'var(--bg)' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(48px, 8vw, 96px)', color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
          command
        </h1>
        <span className="label-caps">[ LIVE INCIDENT MONITORING — INDIA ]</span>
      </div>

      {/* Map + Sidebar */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        <IncidentSidebar incidents={incidents} />
        <div style={{ flex: 1, position: 'relative' }}>
          <MapStatusBar incidents={incidents} volunteers={volunteers} />
          {/* Heatmap toggle */}
          <button
            onClick={() => setHeatmapActive(v => !v)}
            style={{ position: 'absolute', top: 60, right: 12, zIndex: 200, background: heatmapActive ? 'rgba(255,45,45,0.15)' : 'rgba(6,9,15,0.85)', border: `1px solid ${heatmapActive ? 'var(--accent-red)' : 'var(--glass-border)'}`, backdropFilter: 'blur(12px)', borderRadius: 8, padding: '8px 14px', color: heatmapActive ? 'var(--accent-red)' : 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.06em' }}
          >
            🔥 Heatmap {heatmapActive ? 'ON' : 'OFF'}
          </button>

          <MapContainer center={[22, 82]} zoom={5} style={{ width: '100%', height: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap &copy; CARTO" />
            <ZoomControl position="bottomright" />

            {incidents.map(inc => (
              <Marker key={inc.id} position={[inc.lat, inc.lng]} icon={createSVGIcon(inc.severity)}>
                <Popup closeButton={false} className="resq-popup"><MarkerPopup incident={inc} /></Popup>
              </Marker>
            ))}

            {heatmapActive && incidents.filter(i => i.severity === 'critical').map(inc => (
              <Marker key={`h-${inc.id}`} position={[inc.lat, inc.lng]}
                icon={L.divIcon({ html: `<div style="width:120px;height:120px;border-radius:50%;background:radial-gradient(circle, rgba(255,45,45,0.35), transparent);transform:translate(-50%,-50%)"></div>`, className: '', iconSize: [1, 1], iconAnchor: [0, 0] })}
              />
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
