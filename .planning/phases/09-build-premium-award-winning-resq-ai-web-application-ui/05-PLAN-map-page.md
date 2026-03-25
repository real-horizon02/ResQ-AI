---
wave: 3
depends_on: [01-PLAN-design-system, 02-PLAN-global-components, 03-PLAN-mock-data-store]
files_modified:
  - src/pages/Map.tsx
  - src/components/map/DarkLeafletMap.tsx
  - src/components/map/IncidentSidebar.tsx
  - src/components/map/CustomMarker.tsx
  - src/components/map/MarkerPopup.tsx
  - src/components/map/HeatmapToggle.tsx
  - src/components/map/MapStatusBar.tsx
autonomous: true
requirements_addressed: [UI-02]
---

# Plan 05: Live Command Map Page

## Objective
Build the `/map` page: dark Leaflet map with CartoDB dark tiles, custom incident markers, glassmorphic sidebar, popups, heatmap toggle. All 10 mock India incidents rendered as interactive markers.

## must_haves
- [ ] CartoDB dark_all tiles loading correctly
- [ ] All 10 incidents rendered as custom color-coded SVG pin markers
- [ ] Critical incidents have triple-ring CSS pulse animation
- [ ] Glassmorphic left sidebar (300px) with filter chips and scrollable incident list
- [ ] Sidebar slides in from left on page load (0.6s)
- [ ] Clicking a marker opens a glassmorphic popup with incident details
- [ ] Heatmap toggle button (top-right floating) adds red/orange overlay
- [ ] Float status bar at top of map: live volunteer/incident counts
- [ ] Map center: India (22°N, 82°E), initial zoom 5

## Tasks

### Task 1: Dark Leaflet Map component

<read_first>
- src/components/map/ (check existing map components)
- src/data/mockData.ts (check Incident interface and INCIDENTS data)
- package.json (confirm leaflet and react-leaflet versions)
</read_first>

<action>
Create `src/components/map/DarkLeafletMap.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../../store/useAppStore';
import { CustomMarker } from './CustomMarker';
import { MapStatusBar } from './MapStatusBar';

// Remove Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;

const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const DARK_TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors &copy; <a href="https://carto.com">CARTO</a>';

function HeatmapOverlay({ active }: { active: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!active) return;
    // Render semi-transparent red zones over critical incident areas
    const circles: L.Circle[] = [];
    // Critical areas
    [[26.14, 91.74], [19.07, 72.87], [20.29, 85.82], [27.53, 88.51]].forEach(([lat, lng]) => {
      const c = L.circle([lat, lng], { radius: 80000, color: '#FF2D2D', fillColor: '#FF2D2D', fillOpacity: 0.15, weight: 0 }).addTo(map);
      circles.push(c);
    });
    // High areas
    [[30.06, 79.01], [13.08, 80.27], [10.85, 76.27], [25.09, 85.31]].forEach(([lat, lng]) => {
      const c = L.circle([lat, lng], { radius: 60000, color: '#FF6B1A', fillColor: '#FF6B1A', fillOpacity: 0.12, weight: 0 }).addTo(map);
      circles.push(c);
    });
    return () => { circles.forEach(c => c.remove()); };
  }, [map, active]);
  return null;
}

export function DarkLeafletMap() {
  const [heatmapActive, setHeatmapActive] = useState(false);
  const { incidents } = useAppStore();

  return (
    <div style={{ position: 'relative', flex: 1, height: '100%' }}>
      <MapStatusBar />
      {/* Heatmap toggle */}
      <button
        onClick={() => setHeatmapActive(v => !v)}
        style={{
          position: 'absolute', top: 16, right: 16, zIndex: 200,
          background: heatmapActive ? 'rgba(255,45,45,0.2)' : 'var(--glass)',
          border: `1px solid ${heatmapActive ? 'var(--accent-red)' : 'var(--glass-border)'}`,
          backdropFilter: 'blur(12px)', borderRadius: 8, padding: '8px 16px',
          color: heatmapActive ? 'var(--accent-red)' : 'var(--text-muted)',
          fontFamily: 'DM Sans', fontSize: 12, fontWeight: 600, cursor: 'none',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}
      >
        🔥 AI Heatmap {heatmapActive ? 'ON' : 'OFF'}
      </button>

      <MapContainer
        center={[22, 82]}
        zoom={5}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url={DARK_TILE_URL} attribution={DARK_TILE_ATTR} />
        <ZoomControl position="topleft" />
        <HeatmapOverlay active={heatmapActive} />
        {incidents.map(incident => (
          <CustomMarker key={incident.id} incident={incident} />
        ))}
      </MapContainer>
    </div>
  );
}
```
</action>

<acceptance_criteria>
- `src/components/map/DarkLeafletMap.tsx` contains `cartocdn.com/dark_all`
- File contains `heatmapActive` state toggle
- File contains `incidents.map` to render all markers
- File contains `center={[22, 82]}` India center
- File contains `zoomControl={false}` (using custom styled zoom)
</acceptance_criteria>

---

### Task 2: Custom marker + popup

<read_first>
- src/data/mockData.ts (Incident interface, Severity type)
- src/index.css (badge classes, glass-card)
</read_first>

<action>
Create `src/components/map/CustomMarker.tsx`:
```tsx
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Incident } from '../../data/mockData';
import { MarkerPopup } from './MarkerPopup';

const severityColors: Record<string, string> = {
  critical: '#FF2D2D', high: '#FF6B1A', medium: '#F59E0B', low: '#5A6A8A',
};

function createSVGIcon(severity: string, isCritical: boolean) {
  const color = severityColors[severity] || '#5A6A8A';
  const pulseStyle = isCritical ? `
    <circle cx="12" cy="8" r="12" fill="none" stroke="${color}" stroke-width="2" opacity="0.6">
      <animate attributeName="r" from="12" to="22" dur="1.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="12" cy="8" r="12" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.4">
      <animate attributeName="r" from="12" to="28" dur="1.5s" begin="0.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" begin="0.5s" repeatCount="indefinite"/>
    </circle>
  ` : '';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">
      ${pulseStyle}
      <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 24 14 24S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="14" r="6" fill="rgba(0,0,0,0.4)"/>
    </svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [28, 38], iconAnchor: [14, 38] });
}

export function CustomMarker({ incident }: { incident: Incident }) {
  return (
    <Marker position={[incident.lat, incident.lng]} icon={createSVGIcon(incident.severity, incident.severity === 'critical')}>
      <Popup closeButton={false} className="resq-popup">
        <MarkerPopup incident={incident} />
      </Popup>
    </Marker>
  );
}
```

Create `src/components/map/MarkerPopup.tsx`:
```tsx
import { useNavigate } from 'react-router-dom';
import { Incident } from '../../data/mockData';

export function MarkerPopup({ incident }: { incident: Incident }) {
  const navigate = useNavigate();
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 16, minWidth: 260, fontFamily: 'DM Sans' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{incident.title}</span>
        <span className={`badge-${incident.severity}`}>{incident.severity}</span>
      </div>
      <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', marginBottom: 8 }}>{incident.location} · {incident.lat.toFixed(2)}°N, {incident.lng.toFixed(2)}°E</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>{incident.description}</p>
      <button onClick={() => navigate('/volunteer')}
        style={{ width: '100%', padding: '8px 16px', background: 'var(--accent-cyan)', color: 'var(--bg)', border: 'none', borderRadius: 8, fontFamily: 'DM Sans', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
        Dispatch Volunteer →
      </button>
    </div>
  );
}
```

Add Leaflet popup CSS override to `src/index.css` (append):
```css
/* Leaflet popup override */
.leaflet-popup-content-wrapper { background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 12px !important; padding: 0 !important; }
.leaflet-popup-content { margin: 0 !important; }
.leaflet-popup-tip-container { display: none; }
```
</action>

<acceptance_criteria>
- `src/components/map/CustomMarker.tsx` contains SVG with `<animate` elements for pulse
- `src/components/map/CustomMarker.tsx` contains `severityColors` map with all 4 levels
- `src/components/map/MarkerPopup.tsx` contains `Dispatch Volunteer` button
- `src/index.css` contains `.leaflet-popup-content-wrapper`
</acceptance_criteria>

---

### Task 3: Incident sidebar

<read_first>
- src/data/mockData.ts
- src/store/useAppStore.ts
- src/index.css
</read_first>

<action>
Create `src/components/map/IncidentSidebar.tsx`:
- Fixed 300px left sidebar in glassmorphic style
- Header: `🔴 LIVE` pulsing badge + incident count
- Filter chips: All / Critical / High / Medium / Low — toggle fill to `--accent-gold` when active
- Type filter pills: Flood / Earthquake / Fire / Medical / Landslide / Cyclone
- Scrollable incident list:
  - Each card: glassmorphic, left border colored by severity (4px), title + type emoji, location in JetBrains Mono 12px, time-ago string
  - On hover: card lifts (translateY -2px) + left border brightens
- Sidebar animates in from left on page load: `motion.div` with `x: -300 → 0, opacity: 0 → 1, duration: 0.6s`

Severity border colors:
- critical: `var(--accent-red)`, high: `var(--accent-orange)`, medium: `#F59E0B`, low: `var(--text-muted)`

Type emojis: flood=🌊, earthquake=🏚️, fire=🔥, medical=🏥, landslide=⛰️, cyclone=🌀, collapse=🏗️, gas-leak=☢️, heatwave=☀️

Status map to human labels: pending=Pending, verified=Verified, dispatched=Dispatched, resolved=Resolved
</action>

<acceptance_criteria>
- `src/components/map/IncidentSidebar.tsx` contains filter chip toggle logic
- File contains `x: -300` slide-in animation
- File contains left border colored by severity
- File contains JetBrains Mono for location text
- Scrollable container does not overflow the page height
</acceptance_criteria>

---

### Task 4: Map status bar & assemble page

<read_first>
- src/store/useAppStore.ts
</read_first>

<action>
Create `src/components/map/MapStatusBar.tsx`:
```tsx
import { useAppStore } from '../../store/useAppStore';

export function MapStatusBar() {
  const { incidents, volunteers } = useAppStore();
  const online = volunteers.filter(v => v.status === 'available').length;
  const critical = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
  return (
    <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 200, display: 'flex', gap: 24, background: 'var(--glass)', backdropFilter: 'blur(24px)', border: '1px solid var(--glass-border)', borderRadius: 999, padding: '8px 24px' }}>
      <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: 'var(--accent-green)' }}>🟢 {online} Volunteers</span>
      <span style={{ color: 'var(--text-dim)' }}>·</span>
      <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: 'var(--accent-red)' }}>🔴 {critical} Critical</span>
      <span style={{ color: 'var(--text-dim)' }}>·</span>
      <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}>⚡ Synced: just now</span>
    </div>
  );
}
```

Create/replace `src/pages/Map.tsx`:
```tsx
import { Navbar } from '../components/Navbar';
import { DarkLeafletMap } from '../components/map/DarkLeafletMap';
import { IncidentSidebar } from '../components/map/IncidentSidebar';

export default function MapPage() {
  return (
    <div style={{ background: 'var(--bg)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      {/* 30vh hero strip */}
      <div style={{ paddingTop: 80, paddingBottom: 40, paddingLeft: 64, background: 'var(--bg)' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(56px,8vw,100px)', color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>command</h1>
        <p className="label-caps" style={{ marginTop: 12 }}>[ LIVE INCIDENT MONITORING — INDIA ]</p>
      </div>
      {/* Map + Sidebar */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        <IncidentSidebar />
        <DarkLeafletMap />
      </div>
    </div>
  );
}
```
</action>

<acceptance_criteria>
- `src/components/map/MapStatusBar.tsx` contains volunteer count derived from `useAppStore`
- `src/pages/Map.tsx` renders `<Navbar />`, hero strip, `<IncidentSidebar />`, `<DarkLeafletMap />`
- Map page has `height: '100vh'` so it fills the screen
- Hero strip contains Playfair "command" heading
</acceptance_criteria>

## Verification

```bash
# All map components exist
ls src/components/map/DarkLeafletMap.tsx
ls src/components/map/CustomMarker.tsx
ls src/components/map/IncidentSidebar.tsx
ls src/components/map/MapStatusBar.tsx

# Dark tile URL present
grep "cartocdn.com/dark_all" src/components/map/DarkLeafletMap.tsx

# Build check
npx tsc --noEmit 2>&1 | grep -v "node_modules" | head -20
```
