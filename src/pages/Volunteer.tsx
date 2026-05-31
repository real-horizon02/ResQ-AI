import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { useAppStore } from '../store/useAppStore';
import { useStaggeredReveal } from '../hooks/useStaggeredReveal';
import { VOLUNTEERS, TYPE_EMOJIS, Incident, Volunteer } from '../data/mockData';

type TaskState = 'idle' | 'accepted' | 'completed' | 'escalated';

const SEV_COLORS: Record<string, string> = {
  critical: 'var(--accent-red)', high: 'var(--accent-orange)', medium: '#F59E0B', low: 'var(--text-muted)',
};

const FILTER_TABS = ['Nearby (5km)', 'My Skills', 'Critical Only', 'All'];

const MOCK_DISTANCES = ['1.2km', '3.4km', '0.8km', '6.1km', '2.9km', '4.5km', '7.8km', '5.2km', '1.9km', '3.1km'];

function TaskCard({ incident, distance }: { incident: Incident; distance: string }) {
  const [state, setState] = useState<TaskState>('idle');
  const stateConfig = {
    idle: { border: SEV_COLORS[incident.severity] },
    accepted: { border: 'var(--accent-cyan)' },
    completed: { border: 'var(--accent-green)' },
    escalated: { border: 'var(--accent-orange)' },
  };

  return (
    <motion.div
      layout
      className="glass-card-elevated"
      style={{
        padding: '16px 18px',
        borderLeft: `3px solid ${stateConfig[state].border}`,
        opacity: state === 'completed' ? 0.5 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: state === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)', lineHeight: 1.3, flex: 1, textDecoration: state === 'completed' ? 'line-through' : 'none' }}>
          {TYPE_EMOJIS[incident.type]} {incident.title}
        </span>
        <AnimatePresence mode="wait">
          <motion.span key={state} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`badge-${state === 'accepted' ? 'live' : state === 'completed' ? 'resolved' : state === 'escalated' ? 'high' : incident.severity}`}>
            {state === 'idle' ? incident.severity : state}
          </motion.span>
        </AnimatePresence>
      </div>

      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', margin: '0 0 4px' }}>{incident.location}</p>
      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-dim)', margin: '0 0 10px' }}>~{distance} away · 👥 {(incident.peopleAffected ?? 0).toLocaleString()}</p>

      {/* Skills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {['First Aid', 'Search & Rescue'].map(s => (
          <span key={s} style={{ fontSize: 10, fontFamily: 'DM Sans', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(200,169,110,0.12)', color: 'var(--accent-gold)', border: '1px solid rgba(200,169,110,0.2)' }}>{s}</span>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setState('accepted')} disabled={state !== 'idle'}
          style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--accent-cyan)', background: state === 'accepted' ? 'var(--accent-cyan)' : 'transparent', color: state === 'accepted' ? 'var(--bg)' : 'var(--accent-cyan)', fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600, cursor: 'pointer', opacity: state !== 'idle' ? 0.4 : 1 }}>
          Accept →
        </button>
        <button onClick={() => setState('completed')} disabled={state !== 'accepted'}
          style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--accent-green)', background: state === 'completed' ? 'var(--accent-green)' : 'transparent', color: state === 'completed' ? 'var(--bg)' : 'var(--accent-green)', fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600, cursor: 'pointer', opacity: state !== 'accepted' ? 0.4 : 1 }}>
          Complete ✓
        </button>
        <button onClick={() => setState('escalated')} disabled={state === 'completed' || state === 'escalated'}
          style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--accent-orange)', background: state === 'escalated' ? 'var(--accent-orange)' : 'transparent', color: state === 'escalated' ? 'var(--bg)' : 'var(--accent-orange)', fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600, cursor: 'pointer', opacity: state === 'completed' || state === 'escalated' ? 0.4 : 1 }}>
          Escalate ↑
        </button>
      </div>
    </motion.div>
  );
}

function VolunteerProfile({ vol }: { vol: Volunteer }) {
  const [available, setAvailable] = useState(vol.status === 'available');
  return (
    <div className="glass-card" style={{ padding: 24, position: 'sticky', top: 100 }}>
      {/* Avatar */}
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 28, color: 'var(--bg)' }}>
          {vol.name.split(' ').map(n => n[0]).join('')}
        </span>
      </div>
      <h3 style={{ fontFamily: 'DM Sans', fontWeight: 500, fontSize: 18, color: 'var(--text-primary)', margin: '0 0 4px' }}>{vol.name}</h3>
      <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px' }}>{vol.city}, {vol.state}</p>

      {/* Availability toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span className="label-caps">Status</span>
        <div onClick={() => setAvailable(a => !a)} style={{ width: 64, height: 28, borderRadius: 999, background: available ? 'rgba(0,230,118,0.15)' : 'rgba(90,106,138,0.15)', border: `1px solid ${available ? 'var(--accent-green)' : 'var(--text-dim)'}`, cursor: 'pointer', position: 'relative', transition: 'all 0.3s ease' }}>
          <div style={{ position: 'absolute', top: 3, left: available ? 'calc(100% - 25px)' : 3, width: 20, height: 20, borderRadius: '50%', background: available ? 'var(--accent-green)' : 'var(--text-muted)', transition: 'left 0.3s ease, background 0.3s ease' }} />
        </div>
        <span style={{ fontFamily: 'DM Sans', fontSize: 12, fontWeight: 600, color: available ? 'var(--accent-green)' : 'var(--text-muted)' }}>
          {available ? 'Available' : 'Unavailable'}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Tasks', v: vol.tasksCompleted },
          { label: 'Rate', v: `${vol.responseRate}%` },
          { label: 'Rating', v: `${vol.rating}★` },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', background: 'var(--glass)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
            <div style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 24, color: 'var(--text-primary)' }}>{s.v}</div>
            <div className="label-caps" style={{ marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="label-caps" style={{ marginBottom: 10 }}>Skills</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {vol.skills.map(sk => (
          <span key={sk} style={{ fontSize: 11, fontFamily: 'DM Sans', fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: 'rgba(200,169,110,0.12)', color: 'var(--accent-gold)', border: '1px solid rgba(200,169,110,0.2)' }}>{sk}</span>
        ))}
      </div>
    </div>
  );
}

export default function VolunteerPage() {
  const { incidents } = useAppStore();
  const [activeTab, setActiveTab] = useState('All');
  const listRef = useStaggeredReveal(80);

  useEffect(() => {
    async function fetchDisasters() {
      try {
        const res = await fetch("http://localhost:5000/api/disasters");
        const data = await res.json();
        useAppStore.setState({ incidents: data });
      } catch (err) {
        console.error("Error fetching disasters in volunteer hub:", err);
      }
    }

    if (incidents.length === 0) {
      fetchDisasters();
    }
  }, []);

  const filtered = (() => {
    if (activeTab === 'Critical Only') return incidents.filter(i => i.severity === 'critical');
    if (activeTab === 'Nearby (5km)') return incidents.slice(0, 4);
    if (activeTab === 'My Skills') return incidents.filter(i => i.type === 'flood' || i.type === 'landslide');
    return incidents;
  })();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      {/* Hero */}
      <div style={{ paddingTop: 100, paddingBottom: 20, paddingLeft: 'clamp(24px,8vw,64px)', paddingRight: 'clamp(24px,8vw,64px)' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(48px,8vw,100px)', color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>volunteer</h1>
        <span style={{ fontFamily: 'DM Sans', fontWeight: 300, fontSize: 'clamp(32px,5vw,72px)', color: 'var(--text-muted)', display: 'block', lineHeight: 1 }}>hub</span>
      </div>

      {/* Filter tabs */}
      <div style={{ borderBottom: '1px solid var(--glass-border)', paddingLeft: 'clamp(24px,8vw,64px)', paddingRight: 'clamp(24px,8vw,64px)', display: 'flex', gap: 0 }}>
        {FILTER_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: 13, fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)', position: 'relative' }}>
            {tab}
            {activeTab === tab && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'var(--accent-gold)', animation: 'line-draw 0.3s ease forwards' }} />}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="desktop-two-col" style={{ display: 'flex', gap: 32, padding: '32px clamp(24px,8vw,64px) 80px', alignItems: 'flex-start' }}>
        {/* Task feed — 65% */}
        <div style={{ flex: '0 0 65%', minWidth: 0 }}>
          <div ref={listRef as React.RefObject<HTMLDivElement>} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((inc, i) => (
              <TaskCard key={inc.id} incident={inc} distance={MOCK_DISTANCES[i % MOCK_DISTANCES.length]} />
            ))}
          </div>
        </div>
        {/* Profile — 35% */}
        <div style={{ flex: 1 }}>
          <VolunteerProfile vol={VOLUNTEERS[0]} />
        </div>
      </div>
    </div>
  );
}
