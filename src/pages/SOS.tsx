import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';

type IncidentType = 'flood' | 'earthquake' | 'fire' | 'medical' | 'landslide' | 'cyclone';
type Severity = 'critical' | 'high' | 'medium' | 'low';

const INCIDENT_TYPES: { type: IncidentType; emoji: string; label: string }[] = [
  { type: 'flood', emoji: '🌊', label: 'Flood' },
  { type: 'earthquake', emoji: '🏚️', label: 'Earthquake' },
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'medical', emoji: '🏥', label: 'Medical' },
  { type: 'landslide', emoji: '⛰️', label: 'Landslide' },
  { type: 'cyclone', emoji: '🌀', label: 'Cyclone' },
];

const SEVERITY_OPTS: { value: Severity; color: string }[] = [
  { value: 'critical', color: 'var(--accent-red)' },
  { value: 'high', color: 'var(--accent-orange)' },
  { value: 'medium', color: '#F59E0B' },
  { value: 'low', color: 'var(--text-muted)' },
];

function StepIndicator({ step }: { step: number }) {
  const labels = ['Incident Type', 'Location & Details', 'Contact & Submit'];
  return (
    <div style={{ padding: '0 clamp(24px,8vw,96px) 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', maxWidth: 560 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: i <= step ? 'var(--accent-gold)' : 'var(--text-dim)', boxShadow: i <= step ? '0 0 12px rgba(200,169,110,0.5)' : 'none', transition: 'all 0.3s ease', flexShrink: 0 }} />
            {i < 2 && (
              <div style={{ flex: 1, height: 2, background: 'var(--text-dim)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'var(--accent-red)', transform: `scaleX(${i < step ? 1 : 0})`, transformOrigin: 'left', transition: 'transform 0.4s ease' }} />
              </div>
            )}
          </div>
        ))}
      </div>
      <p style={{ marginTop: 10, fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-muted)' }}>
        Step {step + 1} of 3 — {labels[step]}
      </p>
    </div>
  );
}

function Step1({ onNext }: { onNext: (type: string, severity: string) => void }) {
  const [type, setType] = useState('');
  const [sev, setSev] = useState('');
  return (
    <div>
      <h2 style={{ fontFamily: 'DM Sans', fontWeight: 300, fontSize: 24, color: 'var(--text-muted)', marginBottom: 24 }}>What type of emergency?</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
        {INCIDENT_TYPES.map(it => (
          <button key={it.type} onClick={() => setType(it.type)}
            style={{ padding: '20px 12px', background: type === it.type ? 'rgba(200,169,110,0.1)' : 'var(--glass)', border: `1px solid ${type === it.type ? 'var(--accent-gold)' : 'var(--glass-border)'}`, borderRadius: 12, cursor: 'pointer', transform: type === it.type ? 'scale(1.04)' : 'scale(1)', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 32 }}>{it.emoji}</span>
            <span style={{ fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, color: type === it.type ? 'var(--accent-gold)' : 'var(--text-primary)' }}>{it.label}</span>
          </button>
        ))}
      </div>
      <h3 style={{ fontFamily: 'DM Sans', fontWeight: 300, fontSize: 18, color: 'var(--text-muted)', marginBottom: 16 }}>Severity level:</h3>
      <div style={{ display: 'flex', gap: 10, marginBottom: 40, flexWrap: 'wrap' }}>
        {SEVERITY_OPTS.map(s => (
          <button key={s.value} onClick={() => setSev(s.value)}
            style={{ padding: '8px 20px', borderRadius: 999, border: `1px solid ${sev === s.value ? s.color : 'var(--glass-border)'}`, background: sev === s.value ? `${s.color}20` : 'transparent', color: sev === s.value ? s.color : 'var(--text-muted)', fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all 0.2s ease' }}>
            {s.value}
          </button>
        ))}
      </div>
      <button disabled={!type || !sev} onClick={() => onNext(type, sev)} className="btn-sos"
        style={{ opacity: type && sev ? 1 : 0.4, fontSize: 15, padding: '12px 32px' }}>
        Next Step →
      </button>
    </div>
  );
}

function Step2({ onNext, onBack }: { onNext: (d: any) => void; onBack: () => void }) {
  const [loc, setLoc] = useState('');
  const [locLoading, setLocLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [desc, setDesc] = useState('');
  const [people, setPeople] = useState(1);

  const getLocation = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocLoading(false); },
      () => setLocLoading(false),
      { timeout: 8000 }
    );
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'DM Sans', fontWeight: 300, fontSize: 24, color: 'var(--text-muted)', marginBottom: 24 }}>Where & What happened?</h2>
      <button onClick={getLocation} className="btn-outline-cyan" style={{ marginBottom: 20, fontSize: 14, padding: '10px 24px' }}>
        {locLoading ? '⏳ Detecting...' : coords ? '✅ Location Detected' : '📍 Auto-Detect Location'}
      </button>
      {coords && (
        <div className="glass-card" style={{ padding: 12, marginBottom: 20, display: 'inline-flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--accent-green)' }}>
            ✓ {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
          </span>
        </div>
      )}
      <div style={{ marginBottom: 24 }}>
        <input className="input-underline" placeholder="Address or nearest landmark" value={loc} onChange={e => setLoc(e.target.value)} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <textarea className="input-underline" placeholder="Describe the emergency..." value={desc} onChange={e => setDesc(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
      </div>
      <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'var(--text-muted)' }}>People affected:</span>
        <button onClick={() => setPeople(p => Math.max(1, p - 1))} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>−</button>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 20, color: 'var(--text-primary)', minWidth: 48, textAlign: 'center' }}>{people}</span>
        <button onClick={() => setPeople(p => p + 1)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>+</button>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onBack} className="btn-outline-cyan" style={{ fontSize: 14, padding: '10px 24px' }}>← Back</button>
        <button onClick={() => onNext({ location: loc, coords, description: desc, peopleAffected: people })} className="btn-sos" style={{ fontSize: 14, padding: '12px 28px' }}>Next →</button>
      </div>
    </div>
  );
}

function Step3({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess(); }, 2000);
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'DM Sans', fontWeight: 300, fontSize: 24, color: 'var(--text-muted)', marginBottom: 24 }}>Your contact details</h2>
      <div style={{ marginBottom: 20 }}>
        <input className="input-underline" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div style={{ marginBottom: 40 }}>
        <input className="input-underline" placeholder="Phone number (+91)" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 0 }}>
        <button onClick={onBack} className="btn-outline-cyan" style={{ fontSize: 14, padding: '10px 24px' }}>← Back</button>
        <button onClick={handleSubmit} className="btn-sos" style={{ flex: 1, fontSize: 15, padding: '14px 24px', opacity: loading ? 0.7 : 1 }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation: 'radar-sweep 0.8s linear infinite' }}>
                <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                <path d="M9 2A7 7 0 0 1 16 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Sending SOS...
            </span>
          ) : '🚨 SEND EMERGENCY REPORT'}
        </button>
      </div>
    </div>
  );
}

function SuccessScreen() {
  const navigate = useNavigate();
  const reportId = `RSQ-2024-${Math.floor(10000 + Math.random() * 90000)}`;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 24 }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, type: 'spring' }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--accent-green)" strokeWidth="3" style={{ strokeDasharray: 290, strokeDashoffset: 290, animation: 'checkmark-draw 0.8s ease forwards' }} />
          <polyline points="28,52 44,68 72,36" fill="none" stroke="var(--accent-green)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 80, strokeDashoffset: 80, animation: 'checkmark-draw 0.6s ease 0.7s forwards' }} />
        </svg>
      </motion.div>
      <h1 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(36px,6vw,56px)', color: 'var(--text-primary)', margin: 0, textAlign: 'center' }}>Report Received</h1>
      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 15, color: 'var(--accent-cyan)', margin: 0 }}>{reportId}</p>
      <p style={{ fontFamily: 'DM Sans', fontSize: 16, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 400, lineHeight: 1.6, margin: 0 }}>
        Emergency services have been notified. First responders are en route. Please stay safe.
      </p>
      <div className="glass-card" style={{ padding: '16px 32px', textAlign: 'center' }}>
        <p className="label-caps">Estimated First Response</p>
        <p style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 36, color: 'var(--accent-red)', margin: '4px 0 0' }}>~4 min</p>
      </div>
      <button onClick={() => navigate('/')} style={{ marginTop: 8, fontFamily: 'DM Sans', fontSize: 14, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
        Return to Home
      </button>
    </div>
  );
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as any } },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.2 } }),
};

export default function SOSPage() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const goNext = (data: any) => { setDir(1); setFormData((d: any) => ({ ...d, ...data })); setStep(s => s + 1); };
  const goBack = () => { setDir(-1); setStep(s => s - 1); };

  if (success) return <SuccessScreen />;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      {/* Hero */}
      <div style={{ paddingTop: 100, paddingBottom: 16, paddingLeft: 'clamp(24px,8vw,96px)' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(52px,8vw,96px)', color: 'var(--accent-red)', margin: 0, lineHeight: 1 }}>emergency</h1>
        <div style={{ fontFamily: 'DM Sans', fontWeight: 300, fontSize: 'clamp(36px,5vw,72px)', color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>report</div>
      </div>
      <StepIndicator step={step} />

      <div style={{ padding: '24px clamp(24px,8vw,96px) 80px', maxWidth: 680 }}>
        <AnimatePresence mode="wait" custom={dir}>
          {step === 0 && (
            <motion.div key="s1" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
              <Step1 onNext={(type, sev) => goNext({ type, severity: sev })} />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="s2" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
              <Step2 onNext={goNext} onBack={goBack} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="s3" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
              <Step3 onSuccess={() => setSuccess(true)} onBack={goBack} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
