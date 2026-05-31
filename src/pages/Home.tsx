import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  BellElectric,
  BarChart3,
  BrainCircuit,
  RadioTower,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useNumberCounter } from '../hooks/useNumberCounter';
import { useStaggeredReveal } from '../hooks/useStaggeredReveal';
import { useHomeStats } from '../hooks/useHomeStats';
import Radar from '../components/ui/Radar.tsx';

/* ── Hero Section ───────────────────────────────── */
function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', background: 'var(--bg)' }}>
      <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.8 }}>
        <Radar 
          speed={1.0}
          scale={0.5}
          ringCount={10}
          spokeCount={10}
          ringThickness={0.05}
          spokeThickness={0.01}
          sweepSpeed={1.0}
          sweepWidth={2.0}
          sweepLobes={1}
          color="#00d4ff"
          backgroundColor="#000000"
          falloff={2.0}
          brightness={1.0}
          enableMouseInteraction={true}
          mouseInfluence={0.1}
        />
      </div>

      {/* Hero content */}
      <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(100px,12vh,160px) clamp(24px, 8vw, 96px) 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Label */}
        <div className="label-caps-gold" style={{ marginBottom: 32, opacity: revealed ? 1 : 0, transition: 'opacity 0.6s ease 0.1s' }}>
          [ {t('home.hero_label')} ]
        </div>

        {/* Headline */}
        <div style={{ lineHeight: 1.05, marginBottom: 32 }}>
          <div style={{ fontFamily: 'DM Sans', fontWeight: 300, fontSize: 'clamp(40px, 6vw, 80px)', color: 'var(--text-muted)', opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s' }}>
            {t('home.hero_when')}
          </div>
          <div style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(72px, 12vw, 140px)', color: 'var(--text-primary)', lineHeight: 0.95, opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s' }}>
            {t('home.hero_seconds')}
          </div>
          <div style={{ fontFamily: 'DM Sans', fontWeight: 300, fontSize: 'clamp(40px, 6vw, 80px)', color: 'var(--text-muted)', opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s' }}>
            {t('home.hero_matter')}
          </div>
          <div style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(56px, 8vw, 100px)', lineHeight: 1, opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.45s' }}>
              <span style={{ color: 'var(--accent-red)' }}>{t('home.hero_data')}</span>
              <span style={{ color: 'var(--text-primary)' }}>{t('home.hero_saves')}</span>
          </div>
        </div>

        {/* Sub-copy */}
        <p style={{ fontFamily: 'DM Sans', fontSize: 18, color: 'var(--text-muted)', maxWidth: 520, lineHeight: 1.6, marginBottom: 40, opacity: revealed ? 1 : 0, transition: 'opacity 0.6s ease 0.55s' }}>
          {t('home.hero_subtitle')}
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', opacity: revealed ? 1 : 0, transition: 'opacity 0.6s ease 0.65s' }}>
          <button className="btn-sos" onClick={() => navigate('/sos')} data-cursor="sos" style={{ fontSize: 16 }}>
            {t('home.cta_sos')}
          </button>
          <button className="btn-outline-cyan" onClick={() => navigate('/map')} data-cursor="map" style={{ fontSize: 16 }}>
            {t('home.cta_map')}
          </button>
        </div>

        {/* Bottom labels */}
        <div style={{ position: 'absolute', bottom: 40, left: 'clamp(24px, 8vw, 96px)', opacity: revealed ? 0.5 : 0, transition: 'opacity 0.6s ease 0.8s' }}>
          <span className="label-caps">EST. 2024 — ANTIGRAVITY AI</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: revealed ? 0.5 : 0, transition: 'opacity 0.6s ease 1s' }}>
        <span className="label-caps">SCROLL</span>
        <div className="animate-bounce-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }} />
      </div>

      {/* Status ticker */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, overflow: 'hidden', borderTop: '1px solid var(--glass-border)', background: 'rgba(6,9,15,0.6)', padding: '10px 0' }}>
        <div className="animate-marquee" style={{ display: 'flex', gap: 80, width: 'max-content' }}>
          {[...Array(4)].map((_, i) => (
            <span key={i} style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              🟢 14 Volunteers Online &nbsp;·&nbsp; 🔴 3 Critical Incidents &nbsp;·&nbsp; ⚡ Avg Response: 4.2 min &nbsp;·&nbsp; 🇮🇳 Covering 48 Cities
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Mission Section ────────────────────────────── */
function MissionSection() {
  const { activeUsers, resolved, cities, avgResponse } = useHomeStats();

  const { value: users, ref: r1 } = useNumberCounter(activeUsers);
  const { value: incidents, ref: r2 } = useNumberCounter(resolved);
  const { value: citiesCount, ref: r3 } = useNumberCounter(cities);
  const { value: responseTime, ref: r4 } = useNumberCounter(avgResponse);

  const stats = [
    { ref: r1, value: users, label: 'Active Users', suffix: '+' },
    { ref: r2, value: incidents, label: 'Resolved', suffix: '+' },
    { ref: r3, value: citiesCount, label: 'Cities', suffix: '' },
    { ref: r4, value: responseTime / 10, label: 'Avg Response', suffix: ' min' },
  ];

  return (
    <section style={{ padding: 'clamp(60px, 10vh, 100px) clamp(24px, 8vw, 96px)', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', gap: 80, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 auto' }}>
          <span className="label-caps-gold">[ 001 — MISSION ]</span>
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <p style={{ fontFamily: 'DM Sans', fontSize: 'clamp(18px, 2vw, 26px)', lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: 48, maxWidth: 680 }}>
            ResQ AI was built on a single belief: in the chaos of disaster, the right information delivered at the right time saves lives. We combine satellite data, AI prediction, and human networks to create India's most responsive emergency coordination platform.
          </p>

          {/* Divider */}
          <div style={{ height: 1, marginBottom: 48, overflow: 'hidden', background: 'var(--glass-border)', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'var(--accent-gold)', animation: 'line-draw 2s ease forwards', animationDelay: '0.5s' }} />
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            {stats.map((s, i) => (
              <div key={i}>
                <div
                  ref={s.ref as React.RefObject<HTMLDivElement>}
                  style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(36px, 5vw, 56px)', color: 'var(--text-primary)', lineHeight: 1 }}
                >
                  {typeof s.value === 'number' && !Number.isInteger(s.value) ? s.value.toFixed(1) : s.value}{s.suffix}
                </div>
                <div className="label-caps" style={{ marginTop: 8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Platform Preview ───────────────────────────── */
function PlatformPreview() {
  const navigate = useNavigate();
  return (
    <section style={{ padding: 'clamp(60px, 8vh, 80px) clamp(24px, 6vw, 64px)', background: 'var(--bg-surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <span className="label-caps">[ 002 — PLATFORM ]</span>
        <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(36px, 5vw, 72px)', color: 'var(--text-primary)', margin: '16px 0 32px' }}>
          Real-time. Everywhere. Always.
        </h2>
        
        {/* Toggle buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 48, flexWrap: 'wrap' }}>
           <button style={{ background: 'transparent', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', padding: '8px 24px', borderRadius: 999, fontSize: 14, fontFamily: 'DM Sans' }}>Live Map</button>
           <button style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', padding: '8px 24px', borderRadius: 999, fontSize: 14, fontFamily: 'DM Sans' }}>SOS Engine</button>
           <button style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', padding: '8px 24px', borderRadius: 999, fontSize: 14, fontFamily: 'DM Sans' }}>Volunteers</button>
        </div>
      </div>

      {/* New specific card */}
      <div className="glass-card" style={{ maxWidth: 960, margin: '0 auto', padding: 32 }}>
        <span className="label-caps" style={{ color: 'var(--accent-cyan)', display: 'block', marginBottom: 24 }}>[ 001 — LIVE MAP ]</span>
        
        {/* Banner area */}
        <div style={{ position: 'relative', height: 220, borderRadius: 12, overflow: 'hidden', background: '#0a0d14', display: 'flex', alignItems: 'center', padding: '0 40px', marginBottom: 40, border: '1px solid var(--glass-border)' }}>
          {/* Background grid & gradients */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 30px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 30px)' }} />
          <div style={{ position: 'absolute', left: '0%', top: '0', bottom: '0', width: '35%', background: 'radial-gradient(circle at center, rgba(255,40,40,0.3) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', left: '35%', top: '0%', bottom: '0%', width: '30%', background: 'radial-gradient(circle at center, rgba(255,160,0,0.3) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', right: '0%', top: '0', bottom: '0', width: '35%', background: 'radial-gradient(circle at center, rgba(0,212,255,0.3) 0%, transparent 70%)' }} />
          
          <div style={{ position: 'absolute', top: 24, left: 40, fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-dim)' }}>
            GDACS_LIVE_STREAM
          </div>
          
          <div style={{ position: 'absolute', top: 24, right: 40, background: 'rgba(255,40,40,0.1)', border: '1px solid rgba(255,40,40,0.2)', color: 'var(--accent-red)', padding: '4px 12px', borderRadius: 999, fontSize: 10, fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-red)', animation: 'pulse-dot 2s ease infinite' }} />
            SYNCED
          </div>
          
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'baseline', gap: 24, marginTop: 32 }}>
            <div style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(56px, 8vw, 84px)', color: 'var(--text-primary)', lineHeight: 1 }}>
              14.2k
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>PEOPLE AFFECTED</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--accent-red)' }}>SEV_3 // RADIUS: 45KM</span>
            </div>
          </div>
        </div>

        {/* Text and Button area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <h3 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 32, color: 'var(--text-primary)', margin: '0 0 16px' }}>Incident Radius Map</h3>
            <p style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0, maxWidth: 640 }}>
              Every active disaster in India visualized as an impact radius — not a pin. The circle scales with the number of people affected and severity level, pulling live data from GDACS.
            </p>
          </div>
          <button className="btn-outline-cyan" onClick={() => navigate('/map')} style={{ flexShrink: 0, fontSize: 15, padding: '12px 28px' }}>
            View Live Map →
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ───────────────────────────────── */
function HowItWorks() {
  const STEPS = [
    { num: '01', name: 'Citizen Reports', desc: 'One-tap SOS with auto GPS location capture.' },
    { num: '02', name: 'AI Processing', desc: 'Severity classification and resource allocation AI.' },
    { num: '03', name: 'Admin Verify', desc: 'Command center confirms and escalates the incident.' },
    { num: '04', name: 'Dispatch', desc: 'Nearest volunteers dispatched via PostGIS spatial query.' },
    { num: '05', name: 'Resolved', desc: 'Incident closed, data logged, community notified.' },
  ];

  return (
    <section style={{ padding: 'clamp(60px, 10vh, 100px) clamp(24px, 8vw, 96px)', background: 'var(--bg)', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(36px, 5vw, 72px)', color: 'var(--text-primary)', margin: 0 }}>
          the rescue lifecycle
        </h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: 16 }}>
        {STEPS.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: 1, minWidth: 140 }}>
            <div style={{ flex: 1, paddingRight: i < STEPS.length - 1 ? 24 : 0 }}>
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 96, color: 'var(--text-dim)', position: 'absolute', top: -24, left: -8, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>{step.num}</span>
                <h3 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 22, color: 'var(--text-primary)', margin: 0, position: 'relative', paddingTop: 16 }}>{step.name}</h3>
              </div>
              <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ paddingTop: 24, flexShrink: 0 }}>
                <svg width="48" height="8" style={{ opacity: 0.3 }}>
                  <line x1="0" y1="4" x2="48" y2="4" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="5 3" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Features Grid ──────────────────────────────── */
function FeaturesGrid() {
  const gridRef = useStaggeredReveal(100);
  const FEATURES = [
    {
      Icon: RadioTower,
      code: 'LIVE-05',
      title: 'Real-Time Monitoring',
      desc: 'Live data from USGS, IMD, NASA FIRMS - refreshed every 5 minutes.',
      metric: '5m',
      tone: 'cyan',
    },
    {
      Icon: BellElectric,
      code: 'SOS-01',
      title: 'Sub-Second SOS',
      desc: 'One tap sends GPS location to NDRF and nearby volunteers instantly.',
      metric: '<1s',
      tone: 'red',
    },
    {
      Icon: BrainCircuit,
      code: 'RISK-ML',
      title: 'AI Risk Heatmaps',
      desc: 'XGBoost flood prediction overlays with confidence intervals.',
      metric: 'AI',
      tone: 'gold',
    },
    {
      Icon: WifiOff,
      code: 'OFF-NET',
      title: 'Offline-First',
      desc: 'Reports queue without internet, then sync cleanly on reconnect.',
      metric: '0G',
      tone: 'green',
    },
    {
      Icon: ShieldCheck,
      code: 'VOL-5K',
      title: 'Volunteer Network',
      desc: 'Verified first responders dispatched within 5km using PostGIS.',
      metric: '5km',
      tone: 'cyan',
    },
    {
      Icon: BarChart3,
      code: 'CMD-24',
      title: 'Command Center',
      desc: 'Live incident management, resource allocation, and alert routing.',
      metric: '24/7',
      tone: 'red',
    },
  ];

  return (
    <section style={{ padding: 'clamp(60px, 10vh, 100px) clamp(24px, 8vw, 96px)', background: 'var(--bg-surface)' }}>
      <div style={{ margin: '0 auto 48px', textAlign: 'center', maxWidth: 760 }}>
        <span className="label-caps-gold">[ 002 — FEATURES ]</span>
        <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(32px, 4vw, 56px)', color: 'var(--text-primary)', margin: '12px 0 0' }}>
          purpose-built for crisis
        </h2>
      </div>
      <div
        ref={gridRef as React.RefObject<HTMLDivElement>}
        className="features-stack"
      >
        {FEATURES.map((f, i) => (
          <div key={f.code} className={`feature-module feature-module--${f.tone}`}>
            <span className="feature-module__number" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="feature-module__main">
              <span className="feature-module__code">{f.code}</span>
              <div className="feature-module__icon">
                <f.Icon size={25} strokeWidth={1.8} />
              </div>
              <div className="feature-module__copy">
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
              <span className="feature-module__metric">{f.metric}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Data Sources Marquee ───────────────────────── */
function DataSourcesMarquee() {
  const row1 = 'USGS Earthquake API · IMD Weather · NDMA · OpenStreetMap · Supabase Realtime · ISRO Bhuvan · NASA FIRMS';
  const row2 = 'PostGIS · Supabase Edge Functions · GDACS · WHO Alerts · Copernicus Emergency · NRSC · ReliefWeb';
  return (
    <section style={{ padding: '48px 0', background: 'var(--bg)', overflow: 'hidden', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span className="label-caps">[ 003 — DATA SOURCES ]</span>
      </div>
      <div style={{ overflow: 'hidden', marginBottom: 16 }}>
        <div className="animate-marquee" style={{ display: 'flex', gap: 64, width: 'max-content' }}>
          {[row1, row1].map((r, i) => (
            <span key={i} style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{r}</span>
          ))}
        </div>
      </div>
      <div style={{ overflow: 'hidden' }}>
        <div className="animate-marquee-reverse" style={{ display: 'flex', gap: 64, width: 'max-content' }}>
          {[row2, row2].map((r, i) => (
            <span key={i} style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{r}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ─────────────────────────────────────────── */
function StartMissionCTA() {
  const navigate = useNavigate();
  const text = 'start a mission';
  const [hovered, setHovered] = useState(false);

  return (
    <section style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(60px, 10vh, 100px) clamp(24px, 8vw, 96px)', background: 'var(--bg-surface)', textAlign: 'center' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'none' }}
      >
        <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(44px, 8vw, 110px)', color: 'var(--text-primary)', margin: '0 0 32px', lineHeight: 1.1 }}>
          {text.split('').map((char, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                transition: 'transform 0.3s ease',
                transform: hovered && char !== ' ' ? `translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 12}px)` : 'none',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h2>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn-sos" onClick={() => navigate('/sos')} data-cursor="sos" style={{ fontSize: 16, padding: '16px 48px' }}>
          🚨 Send Emergency SOS
        </button>
        <button className="btn-outline-cyan" onClick={() => navigate('/auth')} style={{ fontSize: 16, padding: '16px 48px' }}>
          Create Account →
        </button>
      </div>
      <p style={{ marginTop: 48, fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-dim)' }}>
        ResQ AI • By Antigravity AI Team • India 🇮🇳
      </p>
    </section>
  );
}

/* ── Assemble ────────────────────────────────────── */
export default function Home() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      <MissionSection />
      <PlatformPreview />
      <HowItWorks />
      <FeaturesGrid />
      <DataSourcesMarquee />
      <StartMissionCTA />
    </div>
  );
}
