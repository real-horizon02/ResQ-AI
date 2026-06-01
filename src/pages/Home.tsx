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
import { useDisasters } from '../hooks/useDisasters';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTextReveal } from '../hooks/useTextReveal';
import Radar from '../components/ui/Radar.tsx';

/* ── Hero Section ───────────────────────────────── */
function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);
  const [showTicker, setShowTicker] = useState(false);
  const { volunteers, activeAlerts, statesCovered } = useHomeStats();

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowTicker(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', background: 'var(--bg)' }}>
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
      <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(24px, 8vw, 96px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '100%' }}>
        {/* Label */}
        <div className="label-caps-gold" style={{ marginBottom: 40, opacity: revealed ? 1 : 0, transition: 'opacity 0.6s ease 0.1s' }}>
          [ {t('home.hero_label')} ]
        </div>

        {/* Headline */}
        <div style={{ lineHeight: 1, marginBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '900px' }}>
          {/* when */}
          <div style={{ fontFamily: 'DM Sans', fontWeight: 300, fontSize: 'clamp(32px, 5vw, 64px)', color: 'var(--text-muted)', opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s' }}>
            {t('home.hero_when')}
          </div>
          
          {/* seconds */}
          <div style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(64px, 10vw, 120px)', color: 'var(--text-primary)', lineHeight: 0.9, opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s' }}>
            {t('home.hero_seconds')}
          </div>
          
          {/* matter, data */}
          <div style={{ fontFamily: 'DM Sans', fontWeight: 300, fontSize: 'clamp(32px, 5vw, 64px)', color: 'var(--text-muted)', opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s', display: 'flex', alignItems: 'baseline', gap: '0.3em', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span>{t('home.hero_matter')}</span>
            <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(56px, 8vw, 100px)', lineHeight: 1, color: 'var(--accent-red)' }}>
              {t('home.hero_data')}
            </span>
          </div>
          
          {/* saves lives */}
          <div style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(56px, 8vw, 100px)', lineHeight: 1, color: 'var(--text-primary)', opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.45s' }}>
            {t('home.hero_saves')}
          </div>
        </div>

        {/* Sub-copy */}
        <p style={{ fontFamily: 'DM Sans', fontSize: 16, color: 'var(--text-muted)', maxWidth: 600, lineHeight: 1.6, marginBottom: 48, opacity: revealed ? 1 : 0, transition: 'opacity 0.6s ease 0.55s' }}>
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
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: revealed ? 0.5 : 0, transition: 'opacity 0.6s ease 1s' }}>
        <span className="label-caps">SCROLL</span>
        <div className="animate-bounce-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }} />
      </div>

      {/* Status ticker */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        overflow: 'hidden', 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        background: 'rgba(6,9,15,0.85)', 
        backdropFilter: 'blur(10px)', 
        padding: '12px 0',
        marginTop: '20px',
        transform: showTicker ? 'translateY(0)' : 'translateY(100%)',
        opacity: showTicker ? 1 : 0,
        transition: 'transform 0.4s ease, opacity 0.4s ease'
      }}>
        <div className="animate-marquee" style={{ display: 'flex', gap: 60, width: 'max-content' }}>
          {[...Array(3)].map((_, i) => (
            <span key={i} style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 60 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)', opacity: 0.8 }} />
                Platform in Development
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-gold)', opacity: 0.8 }} />
                Integrating USGS & IMD APIs
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', opacity: 0.8 }} />
                Built for India's Emergency Response
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-red)', opacity: 0.8 }} />
                Open Source Project
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Mission Section ────────────────────────────── */
function MissionSection() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal(0.15);
  const label = useTextReveal(0.1, 0);
  const text = useTextReveal(0.1, 0.1);
  const divider = useTextReveal(0.1, 0.2);
  const { value: v1, ref: r1 } = useNumberCounter(6);
  const { value: v2, ref: r2 } = useNumberCounter(15); // 15 / 10 = 1.5s
  const { value: v3, ref: r3 } = useNumberCounter(5);
  const { value: v4, ref: r4 } = useNumberCounter(100);

  const stats = [
    { ref: r1, value: v1, label: 'GDACS DATA SYNC', suffix: ' min' },
    { ref: r2, value: v2 / 10, label: 'SOS ACTIVATION HOLD', suffix: 's' },
    { ref: r3, value: v3, label: 'SPATIAL ROUTING RADIUS', suffix: ' km' },
    { ref: r4, value: v4, label: 'OFFLINE QUEUING', suffix: '%' },
  ];

  const stat1 = useTextReveal(0.1, 0.3);
  const stat2 = useTextReveal(0.1, 0.4);
  const stat3 = useTextReveal(0.1, 0.5);
  const stat4 = useTextReveal(0.1, 0.6);
  const statReveals = [stat1, stat2, stat3, stat4];

  return (
    <section 
      ref={ref}
      style={{ 
        padding: 'clamp(60px, 10vh, 100px) clamp(24px, 8vw, 96px)', 
        background: 'var(--bg)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(60px)',
        transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ display: 'flex', gap: 80, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 auto' }}>
          <span ref={label.ref} className="label-caps-gold" style={label.style}>[ 001 — {t('home.mission_label')} ]</span>
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <p ref={text.ref} style={{ ...text.style, fontFamily: 'DM Sans', fontSize: 'clamp(18px, 2vw, 26px)', lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: 48, maxWidth: 680 }}>
            {t('home.mission_text')}
          </p>

          {/* Divider */}
          <div ref={divider.ref} style={{ ...divider.style, height: 1, marginBottom: 48, overflow: 'hidden', background: 'var(--glass-border)', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'var(--accent-gold)', animation: 'line-draw 2s ease forwards', animationDelay: '0.5s' }} />
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            {stats.map((s, i) => (
              <div key={i} ref={statReveals[i].ref} style={statReveals[i].style}>
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollReveal(0.15);
  const label = useTextReveal(0.1, 0);
  const title = useTextReveal(0.1, 0.1);
  const tabs = useTextReveal(0.1, 0.2);
  const [activeTab, setActiveTab] = useState('map');
  const { disasters } = useDisasters();

  const severities = { critical: 4, high: 3, medium: 2, low: 1 };
  const sortedDisasters = [...disasters].sort((a, b) => severities[b.severity] - severities[a.severity]);
  const topDisaster = sortedDisasters[0];
  const activeCount = disasters.length;
  const isDemo = activeCount === 0;

  const estimatedAffected = isDemo ? 14200 : disasters.reduce((acc, d) => {
    if (d.severity === 'critical') return acc + 84200;
    if (d.severity === 'high') return acc + 14500;
    if (d.severity === 'medium') return acc + 2300;
    return acc + 400;
  }, 0);

  const { value: affectedValue, ref: affectedRef } = useNumberCounter(estimatedAffected, 2500);
  const formattedAffected = affectedValue >= 1000 
    ? (affectedValue / 1000).toFixed(1) + 'k' 
    : affectedValue.toString();

  const maxSeverityNum = isDemo ? 3 : (topDisaster ? severities[topDisaster.severity] : 0);
  const radiusKm = isDemo ? 45 : (topDisaster ? severities[topDisaster.severity] * 15 : 0);

  return (
    <section 
      ref={ref}
      style={{ 
        padding: 'clamp(60px, 8vh, 80px) clamp(24px, 6vw, 64px)', 
        background: 'var(--bg-surface)', 
        position: 'relative', 
        overflow: 'hidden',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(60px)',
        transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <span ref={label.ref} className="label-caps" style={label.style}>[ 002 — {t('home.platform_label')} ]</span>
        <h2 ref={title.ref} style={{ ...title.style, fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(36px, 5vw, 72px)', color: 'var(--text-primary)', margin: '16px 0 32px' }}>
          {t('home.platform_title')}
        </h2>
        
        {/* Toggle buttons */}
        <div ref={tabs.ref} style={{ ...tabs.style, display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 48, flexWrap: 'wrap' }}>
           <button 
             onClick={() => setActiveTab('map')}
             style={{ 
               background: activeTab === 'map' ? 'var(--accent-cyan)' : 'transparent', 
               border: `1px solid ${activeTab === 'map' ? 'var(--accent-cyan)' : 'var(--glass-border)'}`, 
               color: activeTab === 'map' ? '#000' : 'var(--text-muted)', 
               padding: '8px 24px', 
               borderRadius: 999, 
               fontSize: 14, 
               fontFamily: 'DM Sans',
               cursor: 'pointer',
               transition: 'all 0.3s ease',
               fontWeight: activeTab === 'map' ? 600 : 400
             }}
           >
             {t('home.platform_live_map')}
           </button>
           <button 
             onClick={() => setActiveTab('sos')}
             style={{ 
               background: activeTab === 'sos' ? 'var(--accent-red)' : 'transparent', 
               border: `1px solid ${activeTab === 'sos' ? 'var(--accent-red)' : 'var(--glass-border)'}`, 
               color: activeTab === 'sos' ? '#fff' : 'var(--text-muted)', 
               padding: '8px 24px', 
               borderRadius: 999, 
               fontSize: 14, 
               fontFamily: 'DM Sans',
               cursor: 'pointer',
               transition: 'all 0.3s ease',
               fontWeight: activeTab === 'sos' ? 600 : 400
             }}
           >
             {t('home.platform_sos_engine')}
           </button>
           <button 
             onClick={() => setActiveTab('volunteers')}
             style={{ 
               background: activeTab === 'volunteers' ? 'var(--accent-green)' : 'transparent', 
               border: `1px solid ${activeTab === 'volunteers' ? 'var(--accent-green)' : 'var(--glass-border)'}`, 
               color: activeTab === 'volunteers' ? '#000' : 'var(--text-muted)', 
               padding: '8px 24px', 
               borderRadius: 999, 
               fontSize: 14, 
               fontFamily: 'DM Sans',
               cursor: 'pointer',
               transition: 'all 0.3s ease',
               fontWeight: activeTab === 'volunteers' ? 600 : 400
             }}
           >
             {t('home.platform_volunteers')}
           </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'map' && (
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
            <div ref={affectedRef as React.RefObject<HTMLDivElement>} style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(56px, 8vw, 84px)', color: 'var(--text-primary)', lineHeight: 1 }}>
              {formattedAffected}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>PEOPLE AFFECTED</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--accent-red)' }}>
                SEV_{maxSeverityNum} // RADIUS: {radiusKm}KM
              </span>
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
      )}

      {activeTab === 'sos' && (
      <div className="glass-card" style={{ maxWidth: 960, margin: '0 auto', padding: 32 }}>
        <span className="label-caps" style={{ color: 'var(--accent-red)', display: 'block', marginBottom: 24 }}>[ 002 — SOS ENGINE ]</span>
        
        <div style={{ position: 'relative', height: 220, borderRadius: 12, overflow: 'hidden', background: '#0a0d14', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40, border: '1px solid rgba(255,45,45,0.2)' }}>
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <div style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(56px, 8vw, 84px)', color: 'var(--accent-red)', lineHeight: 1, marginBottom: 16 }}>
              &lt;1.5s
            </div>
            <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              AVERAGE RESPONSE TIME
            </div>
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(255,45,45,0.2) 0%, transparent 70%)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <h3 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 32, color: 'var(--text-primary)', margin: '0 0 16px' }}>Emergency Alert System</h3>
            <p style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0, maxWidth: 640 }}>
              One-tap SOS button sends GPS location to NDRF and nearby volunteers instantly. Hold for 1.5 seconds to activate, preventing accidental triggers while ensuring rapid response.
            </p>
          </div>
          <button className="btn-sos" onClick={() => navigate('/sos')} style={{ flexShrink: 0, fontSize: 15, padding: '12px 28px' }}>
            Try SOS System →
          </button>
        </div>
      </div>
      )}

      {activeTab === 'volunteers' && (
      <div className="glass-card" style={{ maxWidth: 960, margin: '0 auto', padding: 32 }}>
        <span className="label-caps" style={{ color: 'var(--accent-green)', display: 'block', marginBottom: 24 }}>[ 003 — VOLUNTEER NETWORK ]</span>
        
        <div style={{ position: 'relative', height: 220, borderRadius: 12, overflow: 'hidden', background: '#0a0d14', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40, border: '1px solid rgba(0,230,118,0.2)' }}>
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <div style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(56px, 8vw, 84px)', color: 'var(--accent-green)', lineHeight: 1, marginBottom: 16 }}>
              5km
            </div>
            <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              DISPATCH RADIUS
            </div>
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(0,230,118,0.2) 0%, transparent 70%)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <h3 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 32, color: 'var(--text-primary)', margin: '0 0 16px' }}>Verified First Responders</h3>
            <p style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0, maxWidth: 640 }}>
              PostGIS-powered spatial routing dispatches the nearest verified volunteers within 5km. Real-time location tracking and skill-based matching ensure the right help arrives fast.
            </p>
          </div>
          <button className="btn-outline-cyan" onClick={() => navigate('/auth')} style={{ flexShrink: 0, fontSize: 15, padding: '12px 28px', background: 'var(--accent-green)', borderColor: 'var(--accent-green)', color: '#000' }}>
            Join as Volunteer →
          </button>
        </div>
      </div>
      )}
    </section>
  );
}

/* ── How It Works ───────────────────────────────── */
function HowItWorks() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal(0.15);
  const title = useTextReveal(0.1, 0);
  const step1 = useTextReveal(0.1, 0.1);
  const step2 = useTextReveal(0.1, 0.2);
  const step3 = useTextReveal(0.1, 0.3);
  const step4 = useTextReveal(0.1, 0.4);
  const step5 = useTextReveal(0.1, 0.5);
  const stepReveals = [step1, step2, step3, step4, step5];
  
  const STEPS = [
    { num: '01', name: t('home.lifecycle_step1_title'), desc: t('home.lifecycle_step1_desc') },
    { num: '02', name: t('home.lifecycle_step2_title'), desc: t('home.lifecycle_step2_desc') },
    { num: '03', name: t('home.lifecycle_step3_title'), desc: t('home.lifecycle_step3_desc') },
    { num: '04', name: t('home.lifecycle_step4_title'), desc: t('home.lifecycle_step4_desc') },
    { num: '05', name: t('home.lifecycle_step5_title'), desc: t('home.lifecycle_step5_desc') },
  ];

  return (
    <section 
      ref={ref}
      style={{ 
        padding: 'clamp(60px, 10vh, 100px) clamp(24px, 8vw, 96px)', 
        background: 'var(--bg)', 
        overflow: 'hidden',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(60px)',
        transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div ref={title.ref} style={{ ...title.style, textAlign: 'center', marginBottom: 64 }}>
        <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(36px, 5vw, 72px)', color: 'var(--text-primary)', margin: 0 }}>
          {t('home.lifecycle_title')}
        </h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: 16 }}>
        {STEPS.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: 1, minWidth: 140 }}>
            <div ref={stepReveals[i].ref} style={{ ...stepReveals[i].style, flex: 1, paddingRight: i < STEPS.length - 1 ? 24 : 0 }}>
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
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal(0.15);
  const label = useTextReveal(0.1, 0);
  const title = useTextReveal(0.1, 0.1);
  const card1 = useTextReveal(0.1, 0.2);
  const card2 = useTextReveal(0.1, 0.3);
  const card3 = useTextReveal(0.1, 0.4);
  const card4 = useTextReveal(0.1, 0.5);
  const card5 = useTextReveal(0.1, 0.6);
  const card6 = useTextReveal(0.1, 0.7);
  const cardReveals = [card1, card2, card3, card4, card5, card6];
  
  const FEATURES = [
    { Icon: RadioTower, num: 1, accent: 'cyan' },
    { Icon: BellElectric, num: 2, accent: 'red' },
    { Icon: BrainCircuit, num: 3, accent: 'gold' },
    { Icon: WifiOff, num: 4, accent: 'green' },
    { Icon: ShieldCheck, num: 5, accent: 'cyan' },
    { Icon: BarChart3, num: 6, accent: 'red' },
  ];

  return (
    <section 
      ref={ref}
      style={{ 
        padding: 'clamp(80px, 12vh, 140px) clamp(24px, 8vw, 96px)', 
        background: 'var(--bg-surface)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(60px)',
        transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: 1200, margin: '0 auto 80px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 60, flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 auto' }}>
            <span ref={label.ref} className="label-caps-gold" style={label.style}>[ 003 — {t('home.features_label')} ]</span>
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h2 ref={title.ref} style={{ 
              ...title.style,
              fontFamily: 'Playfair Display', 
              fontStyle: 'italic', 
              fontSize: 'clamp(36px, 5vw, 64px)', 
              color: 'var(--text-primary)', 
              margin: 0,
              lineHeight: 1.1
            }}>
              {t('home.features_title')}
            </h2>
          </div>
        </div>
      </div>
      
      {/* Features - Editorial Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1px', background: 'var(--glass-border)', border: '1px solid var(--glass-border)' }}>
        {FEATURES.map((f, idx) => (
          <div 
            key={f.num}
            ref={cardReveals[idx].ref}
            style={{
              ...cardReveals[idx].style,
              background: 'var(--bg)',
              padding: '40px 32px',
              position: 'relative',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-surface)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Top: Number + Metric */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <span style={{
                fontFamily: 'JetBrains Mono',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-dim)',
                letterSpacing: '0.1em'
              }}>
                {String(f.num).padStart(2, '0')}
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono',
                fontSize: 13,
                fontWeight: 700,
                color: `var(--accent-${f.accent})`,
                letterSpacing: '0.05em'
              }}>
                {t(`home.feature_${f.num}_metric`)}
              </span>
            </div>

            {/* Icon */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                width: 56,
                height: 56,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1.5px solid var(--accent-${f.accent})`,
                borderRadius: 8,
                color: `var(--accent-${f.accent})`
              }}>
                <f.Icon size={28} strokeWidth={1.5} />
              </div>
            </div>
            
            {/* Title */}
            <h3 style={{
              fontFamily: 'Playfair Display',
              fontStyle: 'italic',
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 12px',
              lineHeight: 1.2
            }}>
              {t(`home.feature_${f.num}_title`)}
            </h3>
            
            {/* Description */}
            <p style={{
              fontFamily: 'DM Sans',
              fontSize: 14,
              color: 'var(--text-muted)',
              lineHeight: 1.7,
              margin: 0
            }}>
              {t(`home.feature_${f.num}_desc`)}
            </p>

            {/* Accent line */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              background: `var(--accent-${f.accent})`,
              opacity: 0.15
            }} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Data Sources Marquee ───────────────────────── */
function DataSourcesMarquee() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const row1 = 'USGS Earthquake API · IMD Weather · NDMA · OpenStreetMap · Supabase Realtime · ISRO Bhuvan · NASA FIRMS';
  const row2 = 'PostGIS · Supabase Edge Functions · GDACS · WHO Alerts · Copernicus Emergency · NRSC · ReliefWeb';
  return (
    <section 
      ref={ref}
      style={{ 
        padding: '48px 0', 
        background: 'var(--bg)', 
        overflow: 'hidden', 
        borderTop: '1px solid var(--glass-border)', 
        borderBottom: '1px solid var(--glass-border)',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
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
  const { ref, isVisible } = useScrollReveal(0.15);
  const titleReveal = useTextReveal(0.1, 0);
  const buttonsReveal = useTextReveal(0.1, 0.2);
  const navigate = useNavigate();
  const text = 'start a mission';
  const [hovered, setHovered] = useState(false);

  return (
    <section 
      ref={ref}
      style={{ 
        minHeight: '60vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 'clamp(60px, 10vh, 100px) clamp(24px, 8vw, 96px)', 
        background: 'var(--bg-surface)', 
        textAlign: 'center',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(60px)',
        transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div
        ref={titleReveal.ref}
        style={titleReveal.style}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
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
      <div ref={buttonsReveal.ref} style={{ ...buttonsReveal.style, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn-sos" onClick={() => navigate('/sos')} data-cursor="sos" style={{ fontSize: 16, padding: '16px 48px' }}>
          🚨 Send Emergency SOS
        </button>
        <button className="btn-outline-cyan" onClick={() => navigate('/auth')} style={{ fontSize: 16, padding: '16px 48px' }}>
          Create Account →
        </button>
      </div>
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
