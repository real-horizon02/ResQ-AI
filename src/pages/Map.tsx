import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { Incident, INCIDENTS } from '../data/mockData';
import { AnimatePresence, motion } from 'framer-motion';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { MapSidebar } from '../components/MapSidebar';
import { supabase } from '../lib/supabase';
import { toast } from '../components/ui/Toast';

// ── Severity config ───────────────────────────────────────────────────────────
const SEV: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', label: 'CRITICAL' },
  high: { color: '#F97316', bg: 'rgba(249,115,22,0.12)', label: 'HIGH' },
  medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'MEDIUM' },
  low: { color: '#64748B', bg: 'rgba(100,116,139,0.12)', label: 'LOW' },
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
      .catch(() => { });
    return () => { mounted = false; };
  }, [lat, lng, key]);

  return <span>📍 {address}</span>;
}

// ── Top bar ───────────────────────────────────────────────────────────────────
function TopBar({ online, critical }: { online: number; critical: number }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div style={{
      height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', background: 'var(--bg)', borderBottom: '1px solid var(--glass-border)',
      flexShrink: 0, zIndex: 10, position: 'relative',
    }}>
      {/* Title */}
      <h1 style={{ margin: 0, display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          Live Incident Map
        </span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: 'normal', fontWeight: 300, fontSize: 13, color: 'var(--text-dim)' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LanguageSwitcher />
          <button
            onClick={() => navigate(user ? '/profile' : '/auth')}
            style={{ padding: '6px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#CBD5E1', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s ease' }}
          >
            {user ? 'Profile →' : 'Login →'}
          </button>
        </div>
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
        width: 280, background: 'var(--bg-surface)',
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
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              {TYPE_EMOJI[inc.type] || '⚠️'} {typeLabel}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', flexShrink: 0, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
          <LocationDisplay lat={inc.lat} lng={inc.lng} defaultLoc={inc.location || inc.state || 'India'} />
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 12px' }}>
          {inc.description?.substring(0, 120)}{(inc.description?.length ?? 0) > 120 ? '…' : ''}
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, background: 'var(--glass)', borderRadius: 7, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: 'var(--text-dim)', marginBottom: 3 }}>AFFECTED</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{(inc.peopleAffected ?? 0).toLocaleString()}</div>
          </div>
          <div style={{ flex: 1, background: 'var(--glass)', borderRadius: 7, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: 'var(--text-dim)', marginBottom: 3 }}>STATE</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{inc.state?.substring(0, 10) || '—'}</div>
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

// ── Dispatch Modal ────────────────────────────────────────────────────────────
function DispatchModal({ inc, onClose, onAssign }: { inc: Incident; onClose: () => void; onAssign: (volunteerId: string) => void }) {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVolunteers() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'volunteer');

        if (error) {
          console.error('[DispatchModal] Supabase error:', error);
          toast.error('Failed to load volunteers: ' + error.message);
        } else if (data) {
          setVolunteers(data);
        }
      } catch (err: any) {
        console.error('[DispatchModal] Exception:', err);
        toast.error('Exception loading volunteers');
      } finally {
        setLoading(false);
      }
    }
    fetchVolunteers();
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          width: 400, background: 'var(--bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: 12, padding: 24,
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
        }}
      >
        <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Assign Volunteer</h2>
        <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 24px' }}>
          Assign a volunteer to <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{getIncidentLabel(inc)}</span>
        </p>

        <div data-lenis-prevent="true" style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 24 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#64748B', fontFamily: 'DM Sans', fontSize: 13, padding: 20 }}>
              Loading volunteers...
            </div>
          ) : volunteers.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748B', fontFamily: 'DM Sans', fontSize: 13, padding: 20 }}>
              No available volunteers.
            </div>
          ) : (
            volunteers.map(v => (
              <div
                key={v.id}
                onClick={() => setSelected(v.id)}
                style={{
                  padding: '16px',
                  border: '1px solid',
                  borderColor: selected === v.id ? 'var(--accent-cyan)' : 'var(--glass-border)',
                  background: selected === v.id ? 'rgba(0,212,255,0.05)' : 'rgba(255,255,255,0.02)',
                  borderRadius: 12,
                  marginBottom: 10,
                  cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {v.full_name || 'Volunteer'}
                  </div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-muted)' }}>
                    {v.city || v.state || 'Unknown Location'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 700 }}>
                  ★ {v.reputation_score > 0 ? v.reputation_score : 'New'}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 10, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={() => { if (selected) onAssign(selected); }}
            disabled={!selected}
            style={{
              flex: 1, padding: 12, background: selected ? 'linear-gradient(135deg, #00D4FF 0%, #00A3CC 100%)' : 'rgba(255,255,255,0.05)',
              border: 'none', borderRadius: 8, color: selected ? '#060910' : '#64748B', fontFamily: 'DM Sans', fontWeight: 700, fontSize: 13,
              cursor: selected ? 'pointer' : 'not-allowed',
            }}
          >
            Assign
          </button>
        </div>
      </motion.div>
    </div>
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
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const highlightRef = useRef<L.Circle | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dispatchModalIncId, setDispatchModalIncId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { dispatchVolunteer } = useAppStore();

  const handleAssign = (volunteerId: string) => {
    if (dispatchModalIncId) {
      dispatchVolunteer(dispatchModalIncId, volunteerId);
      toast.success('Volunteer successfully dispatched!');
    }
    setDispatchModalIncId(null);
  };

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
      } catch {
        if (useAppStore.getState().incidents.length === 0) {
          useAppStore.setState({ incidents: INCIDENTS });
        }
      }
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

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const tileUrl = isLight
      ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      subdomains: 'abcd', maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: '© OSM contributors · © CARTO' }).addTo(map);
    leafletMapRef.current = map;

    // Observe theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === 'data-theme' && tileLayerRef.current) {
          const newTheme = document.documentElement.getAttribute('data-theme');
          tileLayerRef.current.setUrl(newTheme === 'light'
            ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          );
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    return () => {
      observer.disconnect();
      map.remove();
      leafletMapRef.current = null;
    };
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
        if (btn) btn.onclick = () => setDispatchModalIncId(inc.id);
        const locEl = document.getElementById(`popup-loc-${inc.id}`);
        if (locEl) {
          fetch(`http://localhost:5000/api/geocode?lat=${inc.lat}&lng=${inc.lng}`)
            .then(res => res.json())
            .then(data => { if (data.address) locEl.textContent = '📍 ' + data.address.split(',').slice(0, 3).join(', '); })
            .catch(() => { });
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
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
        @keyframes dot-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: transparent !important; box-shadow: none !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-control-zoom a { background: var(--bg-surface) !important; border-color: var(--glass-border) !important; color: var(--text-muted) !important; font-size: 14px !important; width: 28px !important; height: 28px !important; line-height: 28px !important; }
        .leaflet-control-zoom a:hover { background: var(--bg-elevated) !important; color: var(--text-primary) !important; }
        .leaflet-control-zoom { border: 1px solid var(--glass-border) !important; border-radius: 8px !important; overflow: hidden; }
        .leaflet-control-attribution { background: var(--nav-bg) !important; color: var(--text-dim) !important; font-size: 9px !important; padding: 2px 6px !important; font-family: 'JetBrains Mono', monospace !important; }
        .leaflet-control-attribution a { color: var(--text-muted) !important; }
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
        <MapSidebar incidents={displayed} activeId={activeId} onSelect={setActiveId} />

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />

          {/* Last synced */}
          <div style={{ position: 'absolute', bottom: 6, right: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'var(--text-dim)', background: 'var(--nav-bg)', padding: '3px 7px', borderRadius: 4, zIndex: 500 }}>
            ● {lastUpdated.toLocaleTimeString()}
          </div>

          {/* Incident panel */}
          <AnimatePresence>
            {activeInc && (
              <IncidentPanel
                key={activeInc.id}
                inc={activeInc}
                onClose={() => setActiveId(null)}
                onDispatch={() => setDispatchModalIncId(activeInc.id)}
              />
            )}
          </AnimatePresence>

          {/* Dispatch Modal */}
          <AnimatePresence>
            {dispatchModalIncId && (
              <DispatchModal
                key="dispatch-modal"
                inc={incidents.find(i => i.id === dispatchModalIncId)!}
                onClose={() => setDispatchModalIncId(null)}
                onAssign={handleAssign}
              />
            )}
          </AnimatePresence>
          {/* Global FloatingSOS component handles the SOS button now */}
        </div>
      </div>
    </div>
  );
}
