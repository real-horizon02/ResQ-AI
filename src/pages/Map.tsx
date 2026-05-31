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

interface RainCity {
  name: string;
  lat: number;
  lng: number;
  rainIntensity: number;
  severity: string;
  isRaining: boolean;
  weatherDescription: string;
  weatherIcon: string;
  temp: number | null;
  humidity: number | null;
  windSpeed: number | null;
  updatedAt: string;
}

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

function makeRainIcon(city: RainCity): L.DivIcon {
  const isRaining = city.isRaining;
  const severity = city.severity;
  
  let color = '#8899BB'; // Default clear weather
  let pulseHtml = '';
  
  if (isRaining) {
    if (severity === 'critical') color = '#FF2D2D'; // Critical rain
    else if (severity === 'high') color = '#FF6B1A'; // High rain
    else if (severity === 'medium') color = '#00B0FF'; // Medium rain
    else color = '#00E5FF'; // Low rain

    pulseHtml = `
      <div style="
        position: absolute;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid ${color};
        animation: rain-pulse 1.8s infinite ease-out;
        pointer-events: none;
        top: -3px;
        left: -3px;
      "></div>
    `;
  }

  const iconSvg = isRaining 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${color}" style="animation: rain-bounce 1.5s infinite ease-in-out">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
       </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
       </svg>`;

  const html = `
    <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
      ${pulseHtml}
      ${iconSvg}
    </div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
}

// ─── Sidebar ────────────────────────────────────────────────────────────────
type SevFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';

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
        height: '100%',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'DM Sans', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A6A8A' }}>INCIDENTS</span>
        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,45,45,0.1)', border: '1px solid #FF2D2D', color: '#FF2D2D', fontWeight: 700, animation: 'pulse-dot 2s infinite' }}>● LIVE</span>
      </div>

      <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '3px 10px', borderRadius: 999, border: `1px solid ${filter === f ? '#C8A96E' : 'rgba(255,255,255,0.07)'}`, background: filter === f ? 'rgba(200,169,110,0.1)' : 'transparent', color: filter === f ? '#C8A96E' : '#5A6A8A', fontFamily: 'DM Sans', fontSize: 10, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Incident list */}
      <div
        data-lenis-prevent
        style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}
      >
        {list.map(inc => (
          <div key={inc.id} onClick={() => onSelect(inc.id)}
            style={{
              padding: '11px 13px',
              borderRadius: 10,
              background: activeId === inc.id ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
              borderStyle: 'solid',
              borderWidth: '1px',
              borderLeftWidth: '3px',
              borderTopColor: activeId === inc.id ? SEV_COLOR[inc.severity] + '55' : 'rgba(255,255,255,0.05)',
              borderRightColor: activeId === inc.id ? SEV_COLOR[inc.severity] + '55' : 'rgba(255,255,255,0.05)',
              borderBottomColor: activeId === inc.id ? SEV_COLOR[inc.severity] + '55' : 'rgba(255,255,255,0.05)',
              borderLeftColor: SEV_COLOR[inc.severity],
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#E8F0FE', lineHeight: 1.3, fontFamily: 'DM Sans' }}>{TYPE_EMOJIS[inc.type]} {inc.title.split('—')[0].trim()}</span>
              <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 999, background: SEV_COLOR[inc.severity] + '22', color: SEV_COLOR[inc.severity], fontWeight: 700, flexShrink: 0, marginLeft: 4 }}>{inc.severity}</span>
            </div>
            <p id={`sidebar-state-${inc.id}`} style={{ fontFamily: 'monospace', fontSize: 10, color: '#5A6A8A', margin: '0 0 2px' }}>{inc.state}</p>
            <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#5A6A8A', margin: 0 }}>👥 {(inc.peopleAffected ?? 0).toLocaleString()} affected</p>
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
  const rainMarkersRef = useRef<L.Marker[]>([]);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const highlightCircleRef = useRef<L.Circle | null>(null);
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [rainCities, setRainCities] = useState<RainCity[]>([]);
  const [showRainAlerts, setShowRainAlerts] = useState<boolean>(true);
  const [showRainRadar, setShowRainRadar] = useState<boolean>(false);

  // Fetch Disasters
  useEffect(() => {
    async function fetchDisasters() {
      try {
        const res = await fetch("http://localhost:5000/api/disasters");
        const data = await res.json();
        useAppStore.setState({ incidents: data });
      } catch (err) {
        console.error("Error fetching disasters:", err);
      }
    }

    fetchDisasters(); // initial load
    const interval = setInterval(fetchDisasters, 30000); // 30 sec refresh
    return () => clearInterval(interval);
  }, []);

  // Fetch Rain Alerts
  useEffect(() => {
    async function fetchRainAlerts() {
      try {
        const res = await fetch("http://localhost:5000/api/rain-alerts");
        const data = await res.json();
        if (data.success && data.cities) {
          setRainCities(data.cities);
        }
      } catch (err) {
        console.error("Error fetching rain alerts:", err);
      }
    }

    fetchRainAlerts();
    const interval = setInterval(fetchRainAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const online = volunteers.filter(v => v.status === 'available').length;
  const critical = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;

  // ── Initialize Leaflet map imperatively ─────────────────────────────────────
  useEffect(() => {
    if (!mapDivRef.current || leafletMapRef.current) return;

    const southWest = L.latLng(8.0, 68.0);
    const northEast = L.latLng(37.6, 97.5);
    const bounds = L.latLngBounds(southWest, northEast);

    // Init map
    const map = L.map(mapDivRef.current, {
      center: [22.5, 83],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      minZoom: 4,
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
      highlightCircleRef.current = null;
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
        <p id="popup-loc-${inc.id}" style="font-family:monospace;font-size:11px;color:#8899BB;margin:0 0 6px">📍 ${inc.location}</p>
        <p style="font-size:12px;color:#8899BB;line-height:1.5;margin:0 0 12px">${inc.description}</p>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:11px;color:#FF6B1A">👥 ${(inc.peopleAffected ?? 0).toLocaleString()} affected</span>
          <button id="dispatch-${inc.id}" style="padding:6px 14px;background:#00D4FF;color:#06090F;border:none;border-radius:8px;font-family:DM Sans,sans-serif;font-weight:700;font-size:12px;cursor:pointer">Dispatch →</button>
        </div>
      `;

      const popup = L.popup({ closeButton: false, className: 'resq-popup', maxWidth: 280 }).setContent(popupEl);

      // Dispatch button inside popup
      popup.on('add', () => {
        const btn = document.getElementById(`dispatch-${inc.id}`);
        if (btn) btn.onclick = () => navigate('/volunteer');

        // Fetch detailed address on-demand from our backend geocoder
        const locEl = document.getElementById(`popup-loc-${inc.id}`);
        if (locEl) {
          locEl.textContent = '📍 Fetching address...';
          fetch(`http://localhost:5000/api/geocode?lat=${inc.lat}&lng=${inc.lng}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.address) {
                locEl.textContent = `📍 ${data.address}`;

                // Update sidebar location text with a shorter version
                const sidebarStateEl = document.getElementById(`sidebar-state-${inc.id}`);
                if (sidebarStateEl) {
                  const shortLoc = data.address.split(',').slice(0, 3).join(', ').trim();
                  sidebarStateEl.textContent = shortLoc;
                }
              } else {
                locEl.textContent = '📍 Address unavailable';
              }
            })
            .catch(() => {
              locEl.textContent = '📍 Address unavailable';
            });
        }
      });

      marker.bindPopup(popup);
      marker.on('click', () => setActiveId(inc.id));

      markersRef.current.push(marker);
    });
  }, [incidents, navigate]);

  // ── Add/update rain markers dynamically ──────────────────────────────────────
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Clear old rain markers
    rainMarkersRef.current.forEach(m => m.remove());
    rainMarkersRef.current = [];

    if (!showRainAlerts) return;

    rainCities.forEach(city => {
      const marker = L.marker([city.lat, city.lng], { icon: makeRainIcon(city) })
        .addTo(map);

      // Weather Popup content
      const popupEl = document.createElement('div');
      popupEl.style.cssText = 'background:#0D1525;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px 16px;min-width:240px;font-family:DM Sans,sans-serif';
      
      const rainStatus = city.isRaining 
        ? `<span style="font-size:10px;padding:2px 8px;border-radius:999px;background:rgba(0,176,255,0.15);border:1px solid #00B0FF;color:#00B0FF;font-weight:700;white-space:nowrap">🌧️ Raining (${city.rainIntensity} mm/h)</span>`
        : `<span style="font-size:10px;padding:2px 8px;border-radius:999px;background:rgba(76,175,80,0.15);border:1px solid #4CAF50;color:#4CAF50;font-weight:700;white-space:nowrap">☀️ Clear</span>`;

      popupEl.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px">
          <span style="font-size:14px;font-weight:700;color:#fff">${city.name}</span>
          ${rainStatus}
        </div>
        <p style="font-size:12px;color:#8899BB;text-transform:capitalize;margin:0 0 10px">Condition: ${city.weatherDescription}</p>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px;color:#fff;background:rgba(255,255,255,0.03);padding:8px;border-radius:8px;margin-bottom:10px">
          <div>🌡️ Temp: <span style="font-weight:600;color:#00E676">${city.temp !== null ? `${city.temp}°C` : 'N/A'}</span></div>
          <div>💧 Humidity: <span style="font-weight:600;color:#00E5FF">${city.humidity !== null ? `${city.humidity}%` : 'N/A'}</span></div>
          <div style="grid-column:span 2">💨 Wind Speed: <span style="font-weight:600;color:#FFB300">${city.windSpeed !== null ? `${city.windSpeed} m/s` : 'N/A'}</span></div>
        </div>
        
        <div style="font-size:9px;color:#5A6A8A;text-align:right">Updated: ${new Date(city.updatedAt).toLocaleTimeString()}</div>
      `;

      const popup = L.popup({ closeButton: false, className: 'resq-popup', maxWidth: 280 }).setContent(popupEl);
      marker.bindPopup(popup);

      rainMarkersRef.current.push(marker);
    });
  }, [rainCities, showRainAlerts]);

  // ── Live RainViewer radar tile overlay ──────────────────────────────────────
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (showRainRadar) {
      let layer: L.TileLayer | null = null;
      
      const loadRadar = async () => {
        try {
          const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
          const data = await res.json();
          const latest = data.radar.past[data.radar.past.length - 1];
          const url = `https://tilecache.rainviewer.com/v2/radar/${latest.path}/256/{z}/{x}/{y}/2/1_1.png`;

          if (radarLayerRef.current) {
            map.removeLayer(radarLayerRef.current);
          }

          layer = L.tileLayer(url, {
            opacity: 0.65,
            zIndex: 400
          });
          layer.addTo(map);
          radarLayerRef.current = layer;
        } catch (err) {
          console.error("Failed to load RainViewer radar layer:", err);
        }
      };

      loadRadar();
      const interval = setInterval(loadRadar, 300000); // 5 mins refresh

      return () => {
        clearInterval(interval);
        if (radarLayerRef.current) {
          map.removeLayer(radarLayerRef.current);
          radarLayerRef.current = null;
        }
      };
    } else {
      if (radarLayerRef.current) {
        map.removeLayer(radarLayerRef.current);
        radarLayerRef.current = null;
      }
    }
  }, [showRainRadar]);

  // ── Pan map to active incident and highlight it ──────────────────────────────
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (highlightCircleRef.current) {
      highlightCircleRef.current.remove();
      highlightCircleRef.current = null;
    }

    if (!activeId) return;

    const inc = incidents.find(i => i.id === activeId);
    if (inc) {
      const c = SEV_COLOR[inc.severity] || '#5A6A8A';
      const circle = L.circle([inc.lat, inc.lng], {
        color: c,
        fillColor: c,
        fillOpacity: 0.15,
        radius: 15000,
        weight: 2,
        dashArray: '5, 5'
      }).addTo(map);

      highlightCircleRef.current = circle;
      map.flyTo([inc.lat, inc.lng], 9, { duration: 1.2 });
      
      const marker = markersRef.current.find(m => {
        const pos = m.getLatLng();
        return Math.abs(pos.lat - inc.lat) < 0.001 && Math.abs(pos.lng - inc.lng) < 0.001;
      });
      marker?.openPopup();
    }
  }, [activeId, incidents]);

  const handleFlyToCity = (city: RainCity) => {
    const map = leafletMapRef.current;
    if (!map) return;
    map.flyTo([city.lat, city.lng], 8, { duration: 1.2 });
    
    const marker = rainMarkersRef.current.find(m => {
      const pos = m.getLatLng();
      return Math.abs(pos.lat - city.lat) < 0.001 && Math.abs(pos.lng - city.lng) < 0.001;
    });
    if (marker) {
      setTimeout(() => marker.openPopup(), 1200);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#06090F', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <style>{`
        .rain-list-container::-webkit-scrollbar {
          width: 4px;
        }
        .rain-list-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .rain-list-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
        }
        @keyframes rain-pulse {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes rain-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

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

        {/* Leaflet container wrapper to absolute position overlay panels */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0, minHeight: 0 }}>
          <div
            ref={mapDivRef}
            data-cursor="map"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}

