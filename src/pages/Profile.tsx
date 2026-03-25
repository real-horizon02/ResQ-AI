import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { toast } from '../components/ui/Toast';
import type { VolunteerSkill } from '../data/mockData';

const ALL_SKILLS: VolunteerSkill[] = ['First Aid', 'Firefighting', 'Search & Rescue', 'Swimming', 'Medical', 'HAM Radio', 'Logistics', 'Counseling', 'Driving'];
const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Uttarakhand', 'Uttar Pradesh', 'West Bengal'];

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as any } },
  exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.2 } }),
};

function StepDots({ step }: { step: number }) {
  const labels = ['Role & Location', 'Skills & Experience', 'Notifications'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: i <= step ? 'var(--accent-gold)' : 'var(--text-dim)', boxShadow: i <= step ? '0 0 12px rgba(200,169,110,0.5)' : 'none', transition: 'all 0.3s ease' }} />
          </div>
          {i < 2 && (
            <div style={{ flex: 1, height: 1, background: 'var(--glass-border)', position: 'relative', overflow: 'hidden', margin: '0 8px' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'var(--accent-gold)', transform: `scaleX(${i < step ? 1 : 0})`, transformOrigin: 'left', transition: 'transform 0.4s ease' }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Step1Profile({ onNext }: { onNext: (d: any) => void }) {
  const [role, setRole] = useState('volunteer');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const ROLES = [{ id: 'citizen', emoji: '👤', desc: 'I report incidents in my area' }, { id: 'volunteer', emoji: '🦺', desc: 'I respond to emergencies' }, { id: 'admin', emoji: '🏛️', desc: 'I manage and coordinate' }];
  return (
    <div>
      <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 40, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1 }}>Who are you?</h2>
      <p style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--text-muted)', marginBottom: 32 }}>Tell us your role in the ResQ network.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {ROLES.map(r => (
          <button key={r.id} onClick={() => setRole(r.id)} type="button"
            style={{ padding: '16px 20px', borderRadius: 12, border: `1px solid ${role === r.id ? 'var(--accent-gold)' : 'var(--glass-border)'}`, background: role === r.id ? 'rgba(200,169,110,0.08)' : 'var(--glass)', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left' }}>
            <span style={{ fontSize: 28 }}>{r.emoji}</span>
            <div>
              <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 15, color: role === r.id ? 'var(--accent-gold)' : 'var(--text-primary)', textTransform: 'capitalize' }}>{r.id}</div>
              <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-muted)' }}>{r.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <input className="input-underline" placeholder="City" value={city} onChange={e => setCity(e.target.value)} style={{ flex: 1, minWidth: 120 }} />
        <select value={state} onChange={e => setState(e.target.value)}
          style={{ flex: 1, minWidth: 140, background: 'transparent', border: 'none', borderBottom: '1px solid var(--glass-border)', color: state ? 'var(--text-primary)' : 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: 16, padding: '12px 0', outline: 'none', cursor: 'pointer' }}>
          <option value="" disabled>State</option>
          {STATES.map(s => <option key={s} value={s} style={{ background: '#0D1525' }}>{s}</option>)}
        </select>
      </div>

      <button onClick={() => onNext({ role, city, state })} className="btn-sos" style={{ fontSize: 15, padding: '12px 32px' }}>
        Next →
      </button>
    </div>
  );
}

function Step2Skills({ onNext, onBack }: { onNext: (d: any) => void; onBack: () => void }) {
  const [selected, setSelected] = useState<VolunteerSkill[]>([]);
  const [experience, setExperience] = useState(0);
  const EXP_LABELS = ['First time', '< 1 year', '1–3 years', '3–7 years', '7+ years'];

  const toggle = (sk: VolunteerSkill) => setSelected(s => s.includes(sk) ? s.filter(x => x !== sk) : [...s, sk]);

  return (
    <div>
      <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 40, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1 }}>Your skills</h2>
      <p style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--text-muted)', marginBottom: 28 }}>Select all that apply to dispatch the right tasks to you.</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
        {ALL_SKILLS.map(sk => {
          const active = selected.includes(sk);
          return (
            <button key={sk} onClick={() => toggle(sk)} type="button"
              style={{ padding: '9px 18px', borderRadius: 999, border: `1px solid ${active ? 'var(--accent-cyan)' : 'var(--glass-border)'}`, background: active ? 'rgba(0,212,255,0.1)' : 'transparent', color: active ? 'var(--accent-cyan)' : 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s ease', transform: active ? 'scale(1.05)' : 'scale(1)' }}>
              {sk}
            </button>
          );
        })}
      </div>

      <div style={{ marginBottom: 36 }}>
        <div className="label-caps" style={{ marginBottom: 16 }}>Experience: <span style={{ color: 'var(--text-primary)' }}>{EXP_LABELS[experience]}</span></div>
        <input type="range" min={0} max={4} value={experience} onChange={e => setExperience(+e.target.value)}
          style={{ width: '100%', accentColor: 'var(--accent-gold)', cursor: 'pointer', height: 4 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {EXP_LABELS.map((l, i) => (
            <span key={l} style={{ fontSize: 10, fontFamily: 'DM Sans', color: i === experience ? 'var(--accent-gold)' : 'var(--text-dim)', transition: 'color 0.2s' }}>{i === 0 ? 'None' : i === 4 ? 'Expert' : ''}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onBack} className="btn-outline-cyan" style={{ fontSize: 14, padding: '10px 24px' }}>← Back</button>
        <button onClick={() => onNext({ skills: selected, experience: EXP_LABELS[experience] })} className="btn-sos" style={{ fontSize: 14, padding: '12px 28px' }}>Next →</button>
      </div>
    </div>
  );
}

function Step3Notifications({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [toggles, setToggles] = useState({ push: true, sms: false, email: true, critical: true });
  const OPTS = [
    { key: 'push', label: 'Push Notifications', desc: 'Instant browser alerts for nearby incidents' },
    { key: 'sms', label: 'SMS Alerts', desc: 'Text message for critical emergencies only' },
    { key: 'email', label: 'Email Digest', desc: 'Daily incident summary to your inbox' },
    { key: 'critical', label: 'Critical Only Mode', desc: 'Only receive critical severity alerts' },
  ];

  return (
    <div>
      <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 40, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1 }}>Stay informed</h2>
      <p style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--text-muted)', marginBottom: 32 }}>Choose how ResQ AI notifies you of emergencies.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
        {OPTS.map(opt => (
          <div key={opt.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 12 }}>
            <div>
              <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>{opt.label}</div>
              <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-muted)' }}>{opt.desc}</div>
            </div>
            <div
              onClick={() => setToggles(t => ({ ...t, [opt.key]: !t[opt.key as keyof typeof t] }))}
              style={{ width: 56, height: 28, borderRadius: 999, background: toggles[opt.key as keyof typeof toggles] ? 'rgba(0,230,118,0.15)' : 'rgba(90,106,138,0.15)', border: `1px solid ${toggles[opt.key as keyof typeof toggles] ? 'var(--accent-green)' : 'var(--text-dim)'}`, cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'all 0.3s ease' }}
            >
              <div style={{ position: 'absolute', top: 3, left: toggles[opt.key as keyof typeof toggles] ? 'calc(100% - 25px)' : 3, width: 20, height: 20, borderRadius: '50%', background: toggles[opt.key as keyof typeof toggles] ? 'var(--accent-green)' : 'var(--text-muted)', transition: 'all 0.3s ease' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onBack} className="btn-outline-cyan" style={{ fontSize: 14, padding: '10px 24px' }}>← Back</button>
        <button onClick={onComplete} className="btn-sos" style={{ flex: 1, fontSize: 15, padding: '14px 24px' }}>
          🎉 Complete Profile
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState({});
  const [done, setDone] = useState(false);

  const goNext = (d: any) => { setDir(1); setData(x => ({ ...x, ...d })); setStep(s => s + 1); };
  const goBack = () => { setDir(-1); setStep(s => s - 1); };
  const onComplete = () => {
    setDone(true);
    toast.success('Profile setup complete! Welcome to ResQ AI 🚀');
    setTimeout(() => navigate('/'), 2000);
  };

  if (done) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>🎉</div>
          <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 48, color: 'var(--text-primary)', margin: '0 0 16px' }}>You're All Set!</h2>
          <p style={{ fontFamily: 'DM Sans', fontSize: 18, color: 'var(--text-muted)' }}>Redirecting to home...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 100, paddingBottom: 80, paddingLeft: 'clamp(24px,10vw,120px)', paddingRight: 'clamp(24px,10vw,120px)', maxWidth: 640, margin: '0 auto' }}>
        <StepDots step={step} />
        <AnimatePresence mode="wait" custom={dir}>
          {step === 0 && (
            <motion.div key="p1" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
              <Step1Profile onNext={goNext} />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="p2" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
              <Step2Skills onNext={goNext} onBack={goBack} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="p3" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
              <Step3Notifications onComplete={onComplete} onBack={goBack} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
