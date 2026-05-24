import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useNumberCounter } from '../hooks/useNumberCounter';
import { useStaggeredReveal } from '../hooks/useStaggeredReveal';

/* ── Hero Section ───────────────────────────────── */
function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Animated dot grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;
    let t = 0;
    function draw() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
      const cols = Math.ceil(canvas!.width / 36);
      const rows = Math.ceil(canvas!.height / 36);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const opacity = 0.08 + 0.06 * Math.sin(x * 0.4 + y * 0.3 + t);
          ctx!.beginPath();
          ctx!.arc(x * 36 + 18, y * 36 + 18, 1.5, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(0, 212, 255, ${opacity})`;
          ctx!.fill();
        }
      }
      t += 0.015;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', background: 'var(--bg)' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.6 }} />

      {/* Hero content */}
      <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(100px,12vh,160px) clamp(24px, 8vw, 96px) 60px' }}>
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
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', opacity: revealed ? 1 : 0, transition: 'opacity 0.6s ease 0.65s' }}>
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
  const { value: users, ref: r1 } = useNumberCounter(1247);
  const { value: incidents, ref: r2 } = useNumberCounter(392);
  const { value: cities, ref: r3 } = useNumberCounter(48);
  const { value: response, ref: r4 } = useNumberCounter(42);

  const stats = [
    { ref: r1, value: users, label: 'Active Users', suffix: '+' },
    { ref: r2, value: incidents, label: 'Resolved', suffix: '+' },
    { ref: r3, value: cities, label: 'Cities', suffix: '' },
    { ref: r4, value: response / 10, label: 'Avg Response', suffix: ' min' },
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
  return (
    <section style={{ padding: 'clamp(60px, 8vh, 80px) clamp(24px, 6vw, 64px)', background: 'var(--bg-surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(36px, 5vw, 72px)', color: 'var(--text-primary)', margin: '0 0 16px' }}>
          Real-time. Everywhere. Always.
        </h2>
        <span className="label-caps">[ COMMAND CENTER PREVIEW ]</span>
      </div>

      {/* Mock dashboard */}
      <div className="glass-card animate-float-drift" style={{ maxWidth: 960, margin: '0 auto', padding: 0, overflow: 'hidden' }}>
        {/* Header bar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)' }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-muted)' }}>ResQ AI Command Center — v2.4.1</span>
          <span className="badge-live">🟢 LIVE</span>
        </div>

        {/* Mock content */}
        <div style={{ display: 'flex', height: 280 }}>
          {/* Map area */}
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
            {/* Fake map grid */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, var(--glass-border) 0, var(--glass-border) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, var(--glass-border) 0, var(--glass-border) 1px, transparent 1px, transparent 40px)', opacity: 0.3 }} />
            {/* Fake markers */}
            {[{ x: '30%', y: '40%', c: 'var(--accent-red)' }, { x: '55%', y: '60%', c: 'var(--accent-orange)' }, { x: '70%', y: '30%', c: 'var(--accent-red)' }, { x: '20%', y: '70%', c: 'var(--accent-orange)' }].map((m, i) => (
              <div key={i} style={{ position: 'absolute', left: m.x, top: m.y, width: 12, height: 12, borderRadius: '50%', background: m.c, boxShadow: `0 0 16px ${m.c}`, animation: 'pulse-dot 2s ease infinite', animationDelay: `${i * 0.4}s` }} />
            ))}
            <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
              <span className="label-caps" style={{ color: 'var(--accent-cyan)' }}>[ MAP VIEW — INDIA ]</span>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ width: 200, borderLeft: '1px solid var(--glass-border)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="label-caps" style={{ marginBottom: 4 }}>RECENT ALERTS</span>
            {[
              { id: 'RSQ-001', label: 'Assam Flood', sev: 'critical' },
              { id: 'RSQ-003', label: 'Mumbai Collapse', sev: 'critical' },
              { id: 'RSQ-006', label: 'Puri Flood', sev: 'critical' },
            ].map(item => (
              <div key={item.id} className="glass-card-elevated" style={{ padding: '8px 10px', borderLeft: '3px solid var(--accent-red)' }}>
                <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>{item.id}</div>
                <div style={{ fontSize: 11, fontFamily: 'DM Sans', fontWeight: 500, color: 'var(--text-primary)', marginTop: 2 }}>{item.label}</div>
                <span className={`badge-${item.sev}`} style={{ marginTop: 4, display: 'inline-block' }}>{item.sev}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature pills */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
        {['⚡ Live Incident Feed', '🤖 AI Risk Heatmap', '📵 Offline-First'].map(f => (
          <div key={f} className="glass-card" style={{ padding: '10px 24px', borderRadius: 999 }}>
            <span style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'var(--text-primary)' }}>{f}</span>
          </div>
        ))}
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
    { icon: '📡', title: 'Real-Time Monitoring', desc: 'Live data from USGS, IMD, NASA FIRMS — updated every 5 minutes.' },
    { icon: '🚨', title: 'Sub-Second SOS', desc: 'One tap sends GPS location to NDRF + local volunteers instantly.' },
    { icon: '🤖', title: 'AI Risk Heatmaps', desc: 'XGBoost flood prediction overlays with confidence intervals.' },
    { icon: '📵', title: 'Offline-First', desc: 'Works without internet. Reports queue and sync on reconnect.' },
    { icon: '🛡️', title: 'Volunteer Network', desc: 'Verified first responders dispatched within 5km using PostGIS.' },
    { icon: '📊', title: 'Command Center', desc: 'Real-time incident management, resource allocation, alerts.' },
  ];

  return (
    <section style={{ padding: 'clamp(60px, 10vh, 100px) clamp(24px, 8vw, 96px)', background: 'var(--bg-surface)' }}>
      <div style={{ marginBottom: 48 }}>
        <span className="label-caps-gold">[ 002 — FEATURES ]</span>
        <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(32px, 4vw, 56px)', color: 'var(--text-primary)', margin: '12px 0 0' }}>
          purpose-built for crisis
        </h2>
      </div>
      <div
        ref={gridRef as React.RefObject<HTMLDivElement>}
        className="desktop-grid-2x3"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}
      >
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="glass-card"
            style={{ padding: 28, cursor: 'none', transition: 'transform 0.3s ease, border-color 0.3s ease' }}
            onMouseEnter={(e) => {
              const t = e.currentTarget;
              t.style.transform = 'translateY(-8px)';
              t.style.borderColor = 'rgba(0,212,255,0.25)';
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget;
              t.style.transform = 'translateY(0)';
              t.style.borderColor = 'var(--glass-border)';
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
            <h3 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 18, color: 'var(--text-primary)', margin: '0 0 10px' }}>{f.title}</h3>
            <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
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

/* ── Awards ─────────────────────────────────────── */
function AwardsSection() {
  const cardsRef = useStaggeredReveal(120);
  const AWARDS = [
    { icon: '🏆', title: 'Awwwards Nominee', sub: 'Site of the Day — 2024' },
    { icon: '🥇', title: '2× Hackathon Winner', sub: 'National Disaster Tech Challenge' },
    { icon: '🌟', title: '500+ Beta Users', sub: 'Across 12 Indian states' },
  ];
  return (
    <section style={{ padding: 'clamp(60px, 10vh, 100px) clamp(24px, 8vw, 96px)', background: 'var(--bg)' }}>
      <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(36px, 5vw, 72px)', color: 'var(--text-primary)', margin: '0 0 16px', textAlign: 'center' }}>
        built for impact
      </h2>
      <p style={{ fontFamily: 'DM Sans', fontSize: 18, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 56 }}>
        Recognized by the global design and disaster response community.
      </p>
      <div ref={cardsRef as React.RefObject<HTMLDivElement>} style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
        {AWARDS.map((a, i) => (
          <div key={i} className="glass-card" style={{ padding: '36px 40px', textAlign: 'center', maxWidth: 280, flex: '1 1 220px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{a.icon}</div>
            <h3 style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', margin: '0 0 8px' }}>{a.title}</h3>
            <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>{a.sub}</p>
          </div>
        ))}
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
      <AwardsSection />
      <StartMissionCTA />
    </div>
  );
}
