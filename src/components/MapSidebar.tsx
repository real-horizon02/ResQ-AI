import { useState, useMemo, useEffect } from 'react';
import { Incident } from '../data/mockData';

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

function IncidentCard({ inc, active, onClick }: { inc: Incident; active: boolean; onClick: () => void }) {
  const s = SEV[inc.severity] || SEV.low;
  const typeLabel = getIncidentLabel(inc);

  return (
    <div
      onClick={onClick}
      style={{
        padding: '16px 18px', cursor: 'pointer',
        borderBottom: '1px solid var(--glass-border)',
        background: active ? 'var(--glass)' : 'transparent',
        transition: 'background 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
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
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>
        <LocationDisplay lat={inc.lat} lng={inc.lng} defaultLoc={inc.location || inc.state || 'India'} />
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span>🧑‍🤝‍🧑</span>
        <span>{(inc.peopleAffected ?? 0).toLocaleString()} affected</span>
      </div>
    </div>
  );
}

type SevFilter = 'all' | 'critical' | 'high' | 'medium';

export function MapSidebar({ incidents, activeId, onSelect }: {
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
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--glass-border)',
      display: 'flex', flexDirection: 'column',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
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
                border: filter === key ? 'none' : '1px solid var(--glass-border)',
                background: filter === key ? 'var(--text-primary)' : 'transparent',
                color: filter === key ? 'var(--bg)' : 'var(--text-muted)',
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
          <div style={{ padding: 32, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-dim)' }}>
            NO ALERTS
          </div>
        )}
      </div>
    </div>
  );
}
