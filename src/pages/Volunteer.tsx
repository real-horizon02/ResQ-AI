import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { Incident, INCIDENTS } from '../data/mockData';
import { AnimatePresence, motion } from 'framer-motion';
import { MapSidebar } from '../components/MapSidebar';
import { toast } from '../components/ui/Toast';

// ── Configuration ─────────────────────────────────────────────────────────────
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

function makeDot(severity: string): L.DivIcon {
  const { color } = SEV[severity] || SEV.low;
  const pulse = severity === 'critical'
    ? `<div style="position:absolute;inset:-6px;border-radius:50%;border:1.5px solid ${color};animation:dot-ping 2s cubic-bezier(0,0,0.2,1) infinite;opacity:0.5;"></div>`
    : '';
  const html = `
    <div style="position:relative;width:14px;height:14px;display:flex;align-items:center;justify-content:center;">
      ${pulse}
      <div style="width:12px;height:12px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color}AA;"></div>
    </div>`;
  return L.divIcon({ html, className: '', iconSize: [14, 14], iconAnchor: [7, 7], popupAnchor: [0, -10] });
}

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
          clientGeoCache[key] = data.address;
          setAddress(data.address);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [lat, lng, key]);

  return <span style={{ display: 'block', marginTop: 4 }}>📍 {address}</span>;
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function VolunteerMap() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { incidents, applyForRescue } = useAppStore();
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const clusterGroup = useRef<L.MarkerClusterGroup | null>(null);
  const markersMap = useRef<Record<string, L.Marker>>({});

  const [activeId, setActiveId] = useState<string | null>(null);
  const [applyingFor, setApplyingFor] = useState<string | null>(null);
  const [appliedIncidents, setAppliedIncidents] = useState<string[]>([]);
  
  // 1. Fetch incidents and applications
  useEffect(() => {
    fetch("http://localhost:5000/api/disasters")
      .then(res => res.json())
      .then(data => useAppStore.setState({ incidents: data }))
      .catch(err => {
        console.error("Error fetching disasters:", err);
        if (useAppStore.getState().incidents.length === 0) {
          useAppStore.setState({ incidents: INCIDENTS });
        }
      });
  }, []);

  useEffect(() => {
    async function fetchApplications() {
      if (!profile) return;
      const { data } = await supabase
        .from('volunteer_applications')
        .select('incident_id')
        .eq('volunteer_id', profile.id);
      
      if (data) {
        setAppliedIncidents(data.map(d => d.incident_id));
      }
    }
    fetchApplications();
  }, [profile]);

  // Handle Apply
  const handleApply = async (id: string) => {
    if (!profile) {
      toast.error("Please login to apply");
      return;
    }
    setApplyingFor(id);
    
    try {
      const { error } = await supabase.from('volunteer_applications').insert({
        incident_id: id,
        volunteer_id: profile.id,
        status: 'pending'
      });

      if (error) {
        throw error;
      }

      toast.success('Rescue application sent to Admin for approval!');
      setAppliedIncidents(prev => [...prev, id]);
      setApplyingFor(null);
      setActiveId(null);
    } catch (err: any) {
      console.error("Failed to apply:", err);
      toast.error("Failed to apply: " + err.message);
      setApplyingFor(null);
    }
  };

  // 2. Init Leaflet
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const m = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([22.5937, 78.9629], 5);
    
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const tileUrl = isLight 
      ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      
    tileLayerRef.current = L.tileLayer(tileUrl, {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(m);

    L.control.zoom({ position: 'bottomright' }).addTo(m);

    const cg = L.markerClusterGroup({
      maxClusterRadius: 40,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:50%;font-family:DM Sans;font-size:12px;font-weight:700;backdrop-filter:blur(4px);">${count}</div>`,
          className: '',
          iconSize: [30, 30]
        });
      }
    });
    
    m.addLayer(cg);
    
    mapInstance.current = m;
    clusterGroup.current = cg;

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
      m.remove();
      mapInstance.current = null;
      clusterGroup.current = null;
    };
  }, []);

  // 3. Sync markers
  useEffect(() => {
    if (!mapInstance.current || !clusterGroup.current) return;
    const cg = clusterGroup.current;
    
    cg.clearLayers();
    markersMap.current = {};

    incidents.forEach(inc => {
      if (typeof inc.lat !== 'number' || typeof inc.lng !== 'number') return;
      const marker = L.marker([inc.lat, inc.lng], { icon: makeDot(inc.severity) });
      
      const s = SEV[inc.severity] || SEV.low;
      const popupEl = document.createElement('div');
      popupEl.style.cssText = `background:#09111E;border:1px solid rgba(255,255,255,0.08);border-top:2px solid ${s.color};border-radius:10px;padding:12px 14px;min-width:180px;font-family:'DM Sans',sans-serif;text-align:center;`;
      popupEl.innerHTML = `
        <div style="font-size:14px;font-weight:700;color:#F1F5F9;margin-bottom:12px">${getIncidentLabel(inc)}</div>
        <button id="apply-btn-${inc.id}" style="width:100%;padding:8px 12px;background:linear-gradient(135deg, #00D4FF 0%, #00A3CC 100%);color:#060910;border:none;border-radius:6px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;cursor:pointer;box-shadow:0 4px 12px rgba(0,212,255,0.2);">Apply for Rescue</button>
      `;
      const popup = L.popup({ closeButton: false, className: 'resq-popup', offset: [0, -10] }).setContent(popupEl);
      
      popup.on('add', () => {
        const btn = document.getElementById(`apply-btn-${inc.id}`);
        if (btn) btn.onclick = () => handleApply(inc.id);
      });

      marker.bindPopup(popup);

      marker.on('mouseover', () => {
        marker.openPopup();
      });
      
      marker.on('click', () => {
        setActiveId(inc.id);
        mapInstance.current?.flyTo([inc.lat, inc.lng], 9, { duration: 0.8 });
      });

      markersMap.current[inc.id] = marker;
      cg.addLayer(marker);
    });
  }, [incidents, profile]);

  const activeInc = useMemo(() => incidents.find(i => i.id === activeId), [activeId, incidents]);

  const highlightRef = useRef<L.Circle | null>(null);

  // Pan to active and draw radius
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    
    if (highlightRef.current) {
      highlightRef.current.remove();
      highlightRef.current = null;
    }
    
    if (!activeId) return;
    
    const inc = incidents.find(i => i.id === activeId);
    if (!inc) return;
    
    const col = SEV[inc.severity]?.color || '#64748B';
    
    // Calculate a dynamic radius based on affected people if possible, otherwise fixed 20km
    const radius = inc.peopleAffected ? Math.min(Math.max(inc.peopleAffected * 10, 10000), 50000) : 20000;
    
    highlightRef.current = L.circle([inc.lat, inc.lng], {
      color: col,
      fillColor: col,
      fillOpacity: 0.08,
      radius: radius,
      weight: 1,
      dashArray: '6,4',
    }).addTo(map);
    
    map.flyTo([inc.lat, inc.lng], 9, { duration: 0.8 });
  }, [activeId, incidents]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      
      {/* ── Top Bar ────────────────────────────────────────── */}
      <div style={{
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', background: 'var(--nav-bg)', borderBottom: '1px solid var(--glass-border)',
        backdropFilter: 'blur(10px)', zIndex: 1000,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: 14 }}>← Home</button>
          <div style={{ width: 1, height: 16, background: 'var(--glass-border)' }} />
          <h1 style={{ margin: 0, fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 20, color: 'var(--accent-cyan)' }}>
            Volunteer Mission Map
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-muted)' }}>
            Logged in as: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{profile?.full_name || 'Volunteer'}</span>
          </span>
        </div>
      </div>

      {/* ── Map Container ──────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', minHeight: 0 }}>
        
        {/* Sidebar */}
        <MapSidebar incidents={incidents} activeId={activeId} onSelect={setActiveId} />

        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%', background: 'var(--bg)' }} />

        {/* ── Disaster Detail Card (Overlay) ────────────────── */}
        <AnimatePresence>
          {activeInc && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'absolute', bottom: 40, left: 40, zIndex: 1000,
                width: 380, background: 'var(--bg-surface)', borderRadius: 20,
                border: '1px solid var(--glass-border)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.05)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{
                background: SEV[activeInc.severity]?.bg || SEV.low.bg,
                borderBottom: `1px solid ${SEV[activeInc.severity]?.color || 'var(--glass-border)'}22`,
                padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
              }}>
                <div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {getIncidentLabel(activeInc)}
                  </div>
                  <div style={{
                    display: 'inline-block', padding: '3px 8px', borderRadius: 4,
                    background: SEV[activeInc.severity]?.color || '#64748B',
                    color: '#060910', fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 800, letterSpacing: '0.05em'
                  }}>
                    {SEV[activeInc.severity]?.label || 'UNKNOWN'} SEVERITY
                  </div>
                </div>
                <button
                  onClick={() => setActiveId(null)}
                  style={{ background: 'var(--glass)', border: 'none', color: 'var(--text-muted)', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '24px' }}>
                <div style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 24 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Location</span>
                  <LocationDisplay lat={activeInc.lat} lng={activeInc.lng} defaultLoc={activeInc.location || activeInc.state || 'India'} />
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                  <div style={{ flex: 1, background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 18, color: 'var(--text-primary)', fontWeight: 700 }}>
                      {(activeInc.peopleAffected || 0).toLocaleString()}
                    </div>
                    <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Affected</div>
                  </div>
                  <div style={{ flex: 1, background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 18, color: 'var(--text-primary)', fontWeight: 700 }}>
                      {Math.floor(Math.random() * 8) + 2} km
                    </div>
                    <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Away from you</div>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => !appliedIncidents.includes(activeInc.id) && handleApply(activeInc.id)}
                  disabled={applyingFor === activeInc.id || appliedIncidents.includes(activeInc.id)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12,
                    background: appliedIncidents.includes(activeInc.id) ? 'rgba(0,230,118,0.1)' : applyingFor === activeInc.id ? 'rgba(0,212,255,0.2)' : 'linear-gradient(135deg, #00D4FF 0%, #00A3CC 100%)',
                    border: appliedIncidents.includes(activeInc.id) ? '1px solid var(--accent-green)' : 'none', 
                    color: appliedIncidents.includes(activeInc.id) ? 'var(--accent-green)' : applyingFor === activeInc.id ? '#00D4FF' : '#060910',
                    fontFamily: 'DM Sans', fontSize: 15, fontWeight: 800,
                    cursor: (applyingFor === activeInc.id || appliedIncidents.includes(activeInc.id)) ? 'not-allowed' : 'pointer',
                    boxShadow: (applyingFor === activeInc.id || appliedIncidents.includes(activeInc.id)) ? 'none' : '0 8px 24px rgba(0,212,255,0.25)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {appliedIncidents.includes(activeInc.id) 
                    ? '✓ Applied' 
                    : applyingFor === activeInc.id ? 'Sending Request...' : 'Apply for Rescue'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      <style>{`
        .leaflet-container { background: var(--bg) !important; }
        .leaflet-control-zoom { border: none !important; margin: 20px !important; box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important; }
        .leaflet-control-zoom a { background: var(--bg-elevated) !important; color: var(--text-primary) !important; border-color: var(--glass-border) !important; }
        .leaflet-control-zoom a:hover { background: var(--bg-surface) !important; }
        @keyframes dot-ping { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }
      `}</style>
    </div>
  );
}
