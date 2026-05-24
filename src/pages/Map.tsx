import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navbar } from '../components/Navbar';
import { useAppStore } from '../store/useAppStore';
import { TYPE_EMOJIS, Incident } from '../data/mockData';
import { motion } from 'framer-motion';

// ─── Severity Palette ──────────────────────────────────────────────────────────
const SEV_COLOR: Record<string, string> = {
  critical: '#FF2D2D', high: '#FF6B1A', medium: '#F59E0B', low: '#5A6A8A',
};

function makePinIcon(severity: string): L.DivIcon {
  const c = SEV_COLOR[severity] || '#5A6A8A';
  const pulse = severity === 'critical'
    ? `<circle cx="16" cy="16" r="20" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.6">
         <animate attributeName="r" from="20" to="34" dur="1.8s" repeatCount="indefinite"/>
         <animate attributeName="opacity" from="0.6" to="0" dur="1.8s" repeatCount="indefinite"/>
       </circle>`
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
    ${pulse}
    <path d="M16 0C7.16 0 0 7.16 0 16c0 10.56 16 28 16 28S32 26.56 32 16C32 7.16 24.84 0 16 0z" fill="${c}"/>
    <circle cx="16" cy="16" r="7" fill="rgba(0,0,0,0.4)"/>
  </svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [32, 44], iconAnchor: [16, 44], popupAnchor: [0, -44] });
}

// ─── Sidebar ────────────────────────────────────────────────────────────────
type SevFilter = 'all' | 'critical' | 'high' | 'medium';

function Sidebar({
  incidents,
  activeId,
  onSelect,
}: {
  incidents: Incident[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const [filter, setFilter] = useState<SevFilter>('all');
  const list = filter === 'all' ? incidents : incidents.filter(i => i.severity === filter);

  return (
    <motion.div
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mobile-hide"
      style={{
        width: 280, flexShrink: 0, background: '#0D1525',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'DM Sans', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A6A8A' }}>INCIDENTS</span>
        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,45,45,0.1)', border: '1px solid #FF2D2D', color: '#FF2D2D', fontWeight: 700, animation: 'pulse-dot 2s infinite' }}>● LIVE</span>
      </div>

      {/* Filters */}
      <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {(['all', 'critical', 'high', 'medium'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '3px 10px', borderRadius: 999, border: `1px solid ${filter === f ? '#C8A96E' : 'rgba(255,255,255,0.07)'}`, background: filter === f ? 'rgba(200,169,110,0.1)' : 'transparent', color: filter === f ? '#C8A96E' : '#5A6A8A', fontFamily: 'DM Sans', fontSize: 10, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Incident list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {list.map(inc => (
          <div key={inc.id} onClick={() => onSelect(inc.id)}
            style={{ padding: '11px 13px', borderRadius: 10, background: activeId === inc.id ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${activeId === inc.id ? SEV_COLOR[inc.severity] + '55' : 'rgba(255,255,255,0.05)'}`, borderLeft: `3px solid ${SEV_COLOR[inc.severity]}`, cursor: 'pointer', transition: 'all 0.15s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#E8F0FE', lineHeight: 1.3, fontFamily: 'DM Sans' }}>{TYPE_EMOJIS[inc.type]} {inc.title.split('—')[0].trim()}</span>
              <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 999, background: SEV_COLOR[inc.severity] + '22', color: SEV_COLOR[inc.severity], fontWeight: 700, flexShrink: 0, marginLeft: 4 }}>{inc.severity}</span>
            </div>
            <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#5A6A8A', margin: '0 0 2px' }}>{inc.state}</p>
            <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#5A6A8A', margin: 0 }}>👥 {inc.peopleAffected.toLocaleString()} affected</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Map Page ────────────────────────────────────────────────────────────────
export default function MapPage() {
  const { incidents, volunteers } = useAppStore();
  const navigate = useNavigate();
  const mapDivRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const online = volunteers.filter(v => v.status === 'available').length;
  const critical = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;

  // ── Initialize Leaflet map imperatively ─────────────────────────────────────
  useEffect(() => {
    if (!mapDivRef.current || leafletMapRef.current) return;

    // Init map
    const map = L.map(mapDivRef.current, {
      center: [22.5, 83],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark CartoDB tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Attribution
    L.control.attribution({ position: 'bottomleft', prefix: '© OSM contributors · © CARTO' }).addTo(map);

    leafletMapRef.current = map;

    // Clean up on unmount
    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // ── Add/update markers whenever incidents change ─────────────────────────────
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    incidents.forEach(inc => {
      const marker = L.marker([inc.lat, inc.lng], { icon: makePinIcon(inc.severity) })
        .addTo(map);

      // Popup content
      const popupEl = document.createElement('div');
      popupEl.style.cssText = 'background:#0D1525;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px 16px;min-width:220px;font-family:DM Sans,sans-serif';
      popupEl.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;gap:8px">
          <span style="font-size:13px;font-weight:600;color:#fff;line-height:1.3">${TYPE_EMOJIS[inc.type] || ''} ${inc.title}</span>
          <span style="font-size:10px;padding:2px 8px;border-radius:999px;background:${SEV_COLOR[inc.severity]}22;border:1px solid ${SEV_COLOR[inc.severity]};color:${SEV_COLOR[inc.severity]};font-weight:700;white-space:nowrap;flex-shrink:0">${inc.severity}</span>
        </div>
        <p style="font-family:monospace;font-size:11px;color:#8899BB;margin:0 0 6px">${inc.location}</p>
        <p style="font-size:12px;color:#8899BB;line-height:1.5;margin:0 0 12px">${inc.description}</p>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:11px;color:#FF6B1A">👥 ${inc.peopleAffected.toLocaleString()} affected</span>
          <button id="dispatch-${inc.id}" style="padding:6px 14px;background:#00D4FF;color:#06090F;border:none;border-radius:8px;font-family:DM Sans,sans-serif;font-weight:700;font-size:12px;cursor:pointer">Dispatch →</button>
        </div>
      `;

      const popup = L.popup({ closeButton: false, className: 'resq-popup', maxWidth: 280 }).setContent(popupEl);

      // Dispatch button inside popup
      popup.on('add', () => {
        const btn = document.getElementById(`dispatch-${inc.id}`);
        if (btn) btn.onclick = () => navigate('/volunteer');
      });

      marker.bindPopup(popup);
      marker.on('click', () => setActiveId(inc.id));

      markersRef.current.push(marker);
    });
  }, [incidents, navigate]);

  // ── Pan map to active incident ───────────────────────────────────────────────
  useEffect(() => {
    if (!activeId || !leafletMapRef.current) return;
    const inc = incidents.find(i => i.id === activeId);
    if (inc) {
      leafletMapRef.current.flyTo([inc.lat, inc.lng], 9, { duration: 1.2 });
      const marker = markersRef.current.find(m => {
        const pos = m.getLatLng();
        return Math.abs(pos.lat - inc.lat) < 0.001 && Math.abs(pos.lng - inc.lng) < 0.001;
      });
      marker?.openPopup();
    }
  }, [activeId, incidents]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#06090F', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Sub-header */}
      <div style={{ paddingTop: 70, paddingBottom: 8, paddingLeft: 24, paddingRight: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#06090F' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(22px, 3.5vw, 36px)', color: '#E8F0FE', margin: 0, lineHeight: 1 }}>
            Live Incident Map
            <span style={{ fontFamily: 'DM Sans', fontStyle: 'normal', fontWeight: 300, fontSize: 13, color: '#5A6A8A', marginLeft: 12 }}>— India</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#00E676' }}>🟢 {online} volunteers online</span>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#FF2D2D' }}>🔴 {critical} critical</span>
        </div>
      </div>

      {/* Content row */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar incidents={incidents} activeId={activeId} onSelect={setActiveId} />

        {/* Leaflet container — needs explicit pixel dimensions */}
        <div
          ref={mapDivRef}
          data-cursor="map"
          style={{ flex: 1, minWidth: 0, minHeight: 0 }}
        />
      </div>
    </div>
  );
}
