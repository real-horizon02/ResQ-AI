import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { Incident } from '../data/mockData';
import { AnimatePresence, motion } from 'framer-motion';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';

// ── Severity config ───────────────────────────────────────────────────────────
const SEV: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', label: 'CRITICAL' },
  high:     { color: '#F97316', bg: 'rgba(249,115,22,0.12)', label: 'HIGH' },
  medium:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'MEDIUM' },
  low:      { color: '#64748B', bg: 'rgba(100,116,139,0.12)', label: 'LOW' },
};

const TYPE_LABEL: Record<string, string> = {
  flood: 'Flood', earthquake: 'Earthquake', landslide: 'Landslide',
  cyclone: 'Cyclone', tsunami: 'Tsunami', wildfire: 'Fire',
  fire: 'Fire', 'building-collapse': 'Building Collapse',
  'gas-leak': 'Gas Leak', drought: 'Drought', heatwave: 'Heatwave',
};

function getIncidentLabel(inc: Incident): string {
  if (inc.type === 'rainfall') {
    if (inc.severity === 'critical' || inc.severity === 'high') return 'Heavy Rain';
    if (inc.severity === 'medium') return 'Moderate Rain';
    return 'Light Rain';
  }
  return TYPE_LABEL[inc.type] || inc.type || 'Incident';
}

// ── Dot marker ────────────────────────────────────────────────────────────────
function makeDot(severity: string): L.DivIcon {
  const { color } = SEV[severity] || SEV.low;
  const pulse = severity === 'critical'
    ? `<div style="position:absolute;inset:-6px;border-radius:50%;border:1.5px solid ${color};animation:dot-ping 2s cubic-bezier(0,0,0.2,1) infinite;opacity:0.5;"></div>`
    : severity === 'high'
    ? `<div style="position:absolute;inset:-4px;border-radius:50%;border:1px solid ${color};animation:dot-ping 2.5s cubic-bezier(0,0,0.2,1) infinite;opacity:0.35;"></div>`
    : '';
  const html = `
    <div style="position:relative;width:12px;height:12px;display:flex;align-items:center;justify-content:center;">
      ${pulse}
      <div style="width:10px;height:10px;border-radius:50%;background:${color};box-shadow:0 0 6px ${color}88;"></div>
    </div>`;
  return L.divIcon({ html, className: '', iconSize: [12, 12], iconAnchor: [6, 6], popupAnchor: [0, -10] });
}

// ── Type to emoji map ─────────────────────────────────────────────────────────
const TYPE_EMOJI: Record<string, string> = {
  flood: '🌊', earthquake: '🌍', landslide: '⛰️', cyclone: '🌀', tsunami: '🌊',
  wildfire: '🔥', fire: '🔥', rainfall: '🌧️', 'building-collapse': '🏚️',
  'gas-leak': '⚗️', drought: '☀️', heatwave: '🌡️',
};

// ── Smart Location Geocoder Component ─────────────────────────────────────────
const clientGeoCache: Record<string, string> = {};

function LocationDisplay({ lat, lng, defaultLoc }: { lat: number; lng: number; defaultLoc: string }) {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const [address, setAddress] = useState(clientGeoCache[key] || defaultLoc);

  useEffect(() => {
    if (clientGeoCache[key]) return;
    let mounted = true;
    fetch(`http://localhost:5000/api/geocode?lat=${lat}&lng=${lng}`)
      .then(res => res.json())
      .then(data => {
        if (mounted && data.address) {
          const shortAddr = data.address.split(',').slice(0, 3).join(', ');
          clientGeoCache[key] = shortAddr;
          setAddress(shortAddr);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [lat, lng, key]);

  return <span>📍 {address}</span>;
}

// ── Top bar ───────────────────────────────────────────────────────────────────
function TopBar({ online, critical }: { online: number; critical: number }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [dark, setDark] = useState(true);
  const toggle = () => setDark(!dark);

  return (
    <div style={{
      height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', background: '#090C12', borderBottom: '1px solid rgba(255,255,255,0.06)',
      flexShrink: 0, zIndex: 10, position: 'relative',
    }}>
      {/* Title */}
      <h1 style={{ margin: 0, display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: 22, fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.01em' }}>
          Live Incident Map
        </span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: 'normal', fontWeight: 300, fontSize: 13, color: '#475569' }}>
          — India
        </span>
      </h1>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginRight: 8 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#22C55E', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            {online} Volunteers Online
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
            {critical} Critical Incidents
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => navigate(user ? '/profile' : '/auth')}
            style={{ padding: '6px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#CBD5E1', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s ease' }}
          >
            {user ? 'Profile →' : 'Login →'}
          </button>
          
          <LanguageSwitcher />

          <button
            onClick={toggle}
            style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, color: '#64748B' }}
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar card ──────────────────────────────────────────────────────────────
function IncidentCard({ inc, active, onClick }: { inc: Incident; active: boolean; onClick: () => void }) {
  const s = SEV[inc.severity] || SEV.low;
  const typeLabel = getIncidentLabel(inc);

  return (
    <div
      onClick={onClick}
      style={{
        padding: '16px 18px', cursor: 'pointer',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: active ? 'rgba(255,255,255,0.04)' : 'transparent',
        transition: 'background 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: '#F1F5F9', lineHeight: 1.2 }}>
          {typeLabel}
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700,
          padding: '3px 8px', borderRadius: 4, letterSpacing: '0.06em',
          background: s.bg, color: s.color,
          border: `1px solid ${s.color}33`,
        }}>
          {s.label}
        </span>
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#64748B', marginBottom: 5 }}>
        <LocationDisplay lat={inc.lat} lng={inc.lng} defaultLoc={inc.location || inc.state || 'India'} />
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span>🧑‍🤝‍🧑</span>
        <span>{(inc.peopleAffected ?? 0).toLocaleString()} affected</span>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
type SevFilter = 'all' | 'critical' | 'high' | 'medium';

function Sidebar({ incidents, activeId, onSelect }: {
  incidents: Incident[]; activeId: string | null; onSelect: (id: string) => void;
}) {
  const [filter, setFilter] = useState<SevFilter>('all');
  const displayed = useMemo(() => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    const base = filter === 'all' ? incidents : incidents.filter(i => i.severity === filter);
    return [...base].sort((a, b) => {
      const s = (order[a.severity as keyof typeof order] ?? 3) - (order[b.severity as keyof typeof order] ?? 3);
      return s !== 0 ? s : (b.peopleAffected ?? 0) - (a.peopleAffected ?? 0);
    });
  }, [incidents, filter]);

  const FILTERS: { key: SevFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'critical', label: 'Critical' },
    { key: 'high', label: 'High' },
    { key: 'medium', label: 'Medium' },
  ];

  return (
    <div style={{
      width: 300, flexShrink: 0,
      background: '#09111E',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: '#E2E8F0' }}>
            Incidents
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#EF4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', padding: '3px 8px', borderRadius: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#EF4444', display: 'inline-block', animation: 'pulse-dot 1.5s infinite' }} />
            Live
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '5px 11px', borderRadius: 999, fontSize: 11,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: 'pointer',
                border: filter === key ? 'none' : '1px solid rgba(255,255,255,0.1)',
                background: filter === key ? '#F1F5F9' : 'transparent',
                color: filter === key ? '#0F172A' : '#64748B',
                transition: 'all 0.15s ease',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Incident list */}
      <div data-lenis-prevent style={{ flex: 1, overflowY: 'auto' }}>
        {displayed.map(inc => (
          <IncidentCard key={inc.id} inc={inc} active={activeId === inc.id} onClick={() => onSelect(inc.id)} />
        ))}
        {displayed.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#334155' }}>
            NO ALERTS
          </div>
        )}
      </div>
    </div>
  );
}

// ── Incident popup panel ──────────────────────────────────────────────────────
function IncidentPanel({ inc, onClose, onDispatch }: { inc: Incident; onClose: () => void; onDispatch: () => void }) {
  const { isAdmin } = useAuthStore();
  const s = SEV[inc.severity] || SEV.low;
  const typeLabel = getIncidentLabel(inc);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'absolute', bottom: 24, left: 24,
        width: 280, background: '#09111E',
        border: `1px solid ${s.color}33`,
        borderTop: `2px solid ${s.color}`,
        borderRadius: 10,
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        zIndex: 900, overflow: 'hidden',
      }}
    >
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: s.color, letterSpacing: '0.08em', marginBottom: 4 }}>
              ● {s.label} · {typeLabel.toUpperCase()}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#F1F5F9' }}>
              {TYPE_EMOJI[inc.type] || '⚠️'} {typeLabel}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#475569', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', flexShrink: 0, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#64748B', marginBottom: 6 }}>
          <LocationDisplay lat={inc.lat} lng={inc.lng} defaultLoc={inc.location || inc.state || 'India'} />
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#64748B', lineHeight: 1.6, margin: '0 0 12px' }}>
          {inc.description?.substring(0, 120)}{(inc.description?.length ?? 0) > 120 ? '…' : ''}
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 7, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: '#334155', marginBottom: 3 }}>AFFECTED</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#F1F5F9' }}>{(inc.peopleAffected ?? 0).toLocaleString()}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 7, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: '#334155', marginBottom: 3 }}>STATE</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#F1F5F9' }}>{inc.state?.substring(0, 10) || '—'}</div>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={onDispatch}
            style={{ width: '100%', padding: '9px', border: 'none', borderRadius: 7, background: s.color, color: '#fff', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer', letterSpacing: '0.03em' }}
          >
            Dispatch Volunteers →
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Map Page ──────────────────────────────────────────────────────────────────
export default function MapPage() {
  const { incidents, volunteers } = useAppStore();
  const { isAdmin, profile, initialized } = useAuthStore();
  const navigate = useNavigate();

  // Volunteers have their own dashboard — redirect them away from citizen map
  useEffect(() => {
    if (initialized && profile?.role === 'volunteer') {
      navigate('/volunteer', { replace: true });
    }
  }, [initialized, profile, navigate]);

  const mapDivRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const highlightRef = useRef<L.Circle | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const online = volunteers.filter(v => v.status === 'available').length;
  const criticalCount = useMemo(() => incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length, [incidents]);
  const activeInc = incidents.find(i => i.id === activeId) || null;

  // Filter out noisy zero-affected fire alerts and low rainfall
  const displayed = useMemo(() => incidents.filter(inc => {
    // 1. Strictly filter out non-heavy rainfall before any other checks
    if (inc.type === 'rainfall') {
      return inc.severity === 'critical' || inc.severity === 'high';
    }

    // 2. Default logic for other incidents
    if (inc.severity === 'critical' || inc.severity === 'high') return true;
    if ((inc.peopleAffected ?? 0) > 0) return true;
    if (inc.type !== 'fire') return true;
    return false;
  }), [incidents]);

  // Fetch disasters
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/disasters');
        const data = await res.json();
        useAppStore.setState({ incidents: data });
        setLastUpdated(new Date());
      } catch {}
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  // Init map
  useEffect(() => {
    if (!mapDivRef.current || leafletMapRef.current) return;
    const map = L.map(mapDivRef.current, {
      center: [22.5, 83], zoom: 5,
      zoomControl: false, attributionControl: false,
      minZoom: 4, maxZoom: 18,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: '© OSM contributors · © CARTO' }).addTo(map);
    leafletMapRef.current = map;
    return () => { map.remove(); leafletMapRef.current = null; };
  }, []);

  // Cluster markers
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (clusterRef.current) map.removeLayer(clusterRef.current);

    const group = (L as unknown as { markerClusterGroup: (opts: object) => L.MarkerClusterGroup }).markerClusterGroup({
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (c: L.MarkerCluster) => {
        const markers = c.getAllChildMarkers();
        let worst = 'low';
        markers.forEach(m => {
          const sv = (m.options as unknown as { severity: string }).severity;
          if (sv === 'critical') worst = 'critical';
          else if (sv === 'high' && worst !== 'critical') worst = 'high';
          else if (sv === 'medium' && worst === 'low') worst = 'medium';
        });
        const col = SEV[worst]?.color || '#64748B';
        const n = c.getChildCount();
        return L.divIcon({
          html: `<div style="width:30px;height:30px;border-radius:50%;background:${col}1A;border:1.5px solid ${col}55;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;color:${col}">${n}</div>`,
          className: '', iconSize: [30, 30], iconAnchor: [15, 15],
        });
      },
    });

    displayed.forEach(inc => {
      const marker = L.marker([inc.lat, inc.lng], { icon: makeDot(inc.severity) });
      (marker.options as unknown as { severity: string }).severity = inc.severity;

      const s = SEV[inc.severity] || SEV.low;
      const typeLabel = getIncidentLabel(inc);
      const popupEl = document.createElement('div');
      popupEl.style.cssText = `background:#09111E;border:1px solid rgba(255,255,255,0.08);border-top:2px solid ${s.color};border-radius:10px;padding:12px 14px;min-width:200px;font-family:'DM Sans',sans-serif`;
      popupEl.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px">
          <span style="font-size:15px;font-weight:700;color:#F1F5F9">${TYPE_EMOJI[inc.type] || '⚠️'} ${typeLabel}</span>
          <span style="font-size:9px;padding:2px 7px;border-radius:4px;background:${s.bg};color:${s.color};font-weight:700;font-family:'JetBrains Mono',monospace;white-space:nowrap;flex-shrink:0">${s.label}</span>
        </div>
        <p id="popup-loc-${inc.id}" style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#475569;margin:0 0 5px">📍 ${inc.state || 'India'}</p>
        <p style="font-size:11px;color:#64748B;line-height:1.5;margin:0 0 10px">${inc.description?.substring(0, 80) || ''}${(inc.description?.length ?? 0) > 80 ? '…' : ''}</p>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:11px;color:#94A3B8">🧑‍🤝‍🧑 ${(inc.peopleAffected ?? 0).toLocaleString()} affected</span>
          ${isAdmin ? `<button id="dispatch-${inc.id}" style="padding:5px 12px;background:${s.color};color:#fff;border:none;border-radius:6px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:11px;cursor:pointer">Dispatch →</button>` : ''}
        </div>`;
      const popup = L.popup({ closeButton: false, className: 'resq-popup', maxWidth: 260 }).setContent(popupEl);
      popup.on('add', () => {
        const btn = document.getElementById(`dispatch-${inc.id}`);
        if (btn) btn.onclick = () => navigate('/volunteer');
        const locEl = document.getElementById(`popup-loc-${inc.id}`);
        if (locEl) {
          fetch(`http://localhost:5000/api/geocode?lat=${inc.lat}&lng=${inc.lng}`)
            .then(res => res.json())
            .then(data => { if (data.address) locEl.textContent = '📍 ' + data.address.split(',').slice(0, 3).join(', '); })
            .catch(() => {});
        }
      });
      marker.bindPopup(popup);
      marker.on('click', () => setActiveId(inc.id));
      group.addLayer(marker);
    });

    map.addLayer(group);
    clusterRef.current = group;
  }, [displayed, navigate]);

  // Pan to active
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (highlightRef.current) { highlightRef.current.remove(); highlightRef.current = null; }
    if (!activeId) return;
    const inc = incidents.find(i => i.id === activeId);
    if (!inc) return;
    const col = SEV[inc.severity]?.color || '#64748B';
    highlightRef.current = L.circle([inc.lat, inc.lng], {
      color: col, fillColor: col, fillOpacity: 0.08,
      radius: 20000, weight: 1, dashArray: '6,4',
    }).addTo(map);
    map.flyTo([inc.lat, inc.lng], 9, { duration: 1.0 });
  }, [activeId, incidents]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#09111E', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
        @keyframes dot-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: transparent !important; box-shadow: none !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-control-zoom a { background: #09111E !important; border-color: rgba(255,255,255,0.1) !important; color: #64748B !important; font-size: 14px !important; width: 28px !important; height: 28px !important; line-height: 28px !important; }
        .leaflet-control-zoom a:hover { background: #0F172A !important; color: #94A3B8 !important; }
        .leaflet-control-zoom { border: 1px solid rgba(255,255,255,0.08) !important; border-radius: 8px !important; overflow: hidden; }
        .leaflet-control-attribution { background: rgba(9,12,18,0.8) !important; color: #334155 !important; font-size: 9px !important; padding: 2px 6px !important; font-family: 'JetBrains Mono', monospace !important; }
        .leaflet-control-attribution a { color: #475569 !important; }
        .marker-cluster { background: transparent !important; }
        .marker-cluster div { background: transparent !important; border: none !important; box-shadow: none !important; }
        [data-lenis-prevent]::-webkit-scrollbar { width: 3px; }
        [data-lenis-prevent]::-webkit-scrollbar-track { background: transparent; }
        [data-lenis-prevent]::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 2px; }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      {/* Top bar */}
      <TopBar online={online} critical={criticalCount} />

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Sidebar */}
        <Sidebar incidents={displayed} activeId={activeId} onSelect={setActiveId} />

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />

          {/* Last synced */}
          <div style={{ position: 'absolute', bottom: 6, right: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#334155', background: 'rgba(9,12,18,0.75)', padding: '3px 7px', borderRadius: 4, zIndex: 500 }}>
            ● {lastUpdated.toLocaleTimeString()}
          </div>

          {/* Incident panel */}
          <AnimatePresence>
            {activeInc && (
              <IncidentPanel
                key={activeInc.id}
                inc={activeInc}
                onClose={() => setActiveId(null)}
                onDispatch={() => navigate('/volunteer')}
              />
            )}
          </AnimatePresence>

          {/* Floating SOS Button */}
          <button
            onClick={() => navigate('/sos')}
            style={{
              position: 'absolute', bottom: 32, right: 32, zIndex: 1000,
              width: 64, height: 64, borderRadius: '50%',
              background: '#FF2D2D', border: '2px solid rgba(255,255,255,0.15)',
              color: '#fff', fontSize: 24, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 32px rgba(255,45,45,0.5)',
            }}
          >
            <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '1px solid #FF2D2D', animation: 'dot-ping 2s infinite' }} />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <path d="M12 9v4"/><path d="M12 17h.01"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
