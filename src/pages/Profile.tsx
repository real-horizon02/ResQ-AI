import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import type { VolunteerSkill } from '../data/mockData';

const ALL_SKILLS: VolunteerSkill[] = ['First Aid', 'Firefighting', 'Search & Rescue', 'Swimming', 'Medical', 'HAM Radio', 'Logistics', 'Counseling', 'Driving'];
const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Uttarakhand', 'Uttar Pradesh', 'West Bengal'];

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as any } },
  exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.2 } }),
};

function StepDots({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: i <= step ? 'var(--accent-gold)' : 'var(--text-dim)', boxShadow: i <= step ? '0 0 12px rgba(200,169,110,0.5)' : 'none', transition: 'all 0.3s ease' }} />
          {i < 2 && (
            <div style={{ flex: 1, height: 1, background: 'var(--glass-border)', position: 'relative', margin: '0 8px' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'var(--accent-gold)', transform: `scaleX(${i < step ? 1 : 0})`, transformOrigin: 'left', transition: 'transform 0.4s ease' }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, initialized } = useAuthStore();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // Form state — pre-filled from existing profile
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [role, setRole] = useState<'citizen' | 'volunteer'>('citizen');
  const [selectedSkills, setSelectedSkills] = useState<VolunteerSkill[]>([]);
  const [notifToggles, setNotifToggles] = useState({ push: true, sms: false, email: true, critical: true });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (initialized && !user) navigate('/auth?redirect=/profile');
  }, [initialized, user]);

  // Pre-fill from profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCity(profile.city || '');
      setState(profile.state || '');
      setRole((profile.role as any) === 'admin' ? 'volunteer' : (profile.role as any) || 'citizen');
      setSelectedSkills((profile.skills as VolunteerSkill[]) || []);
    }
  }, [profile]);

  const goNext = () => { setDir(1); setStep(s => s + 1); };
  const goBack = () => { setDir(-1); setStep(s => s - 1); };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      full_name: fullName,
      city, state,
      role: profile?.role === 'admin' ? 'admin' : role,
      skills: selectedSkills,
    });
    setSaving(false);
    setDone(true);
    setTimeout(() => navigate('/'), 2000);
  };

  const toggleSkill = (sk: VolunteerSkill) =>
    setSelectedSkills(s => s.includes(sk) ? s.filter(x => x !== sk) : [...s, sk]);

  if (!initialized || !user) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: 'radar-sweep 0.8s linear infinite', marginRight: 12 }}>
          <circle cx="10" cy="10" r="8" stroke="var(--accent-cyan)" strokeWidth="2" opacity="0.3" />
          <path d="M10 2A8 8 0 0 1 18 10" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-muted)' }}>LOADING...</span>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>✅</div>
          <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 48, color: 'var(--text-primary)', margin: '0 0 16px' }}>Profile Saved!</h2>
          <p style={{ fontFamily: 'DM Sans', fontSize: 18, color: 'var(--text-muted)' }}>Redirecting to home...</p>
        </motion.div>
      </div>
    );
  }

  const ROLE_OPTS = [
    { id: 'citizen', emoji: '👤', desc: 'Report incidents in my area' },
    { id: 'volunteer', emoji: '🦺', desc: 'Respond to emergencies' },
  ];

  const EXP_LABELS = ['First time', '< 1 year', '1–3 years', '3–7 years', '7+ years'];
  const NOTIF_OPTS = [
    { key: 'push', label: 'Push Notifications', desc: 'Instant browser alerts for nearby incidents' },
    { key: 'sms', label: 'SMS Alerts', desc: 'Text message for critical emergencies only' },
    { key: 'email', label: 'Email Digest', desc: 'Daily incident summary to your inbox' },
    { key: 'critical', label: 'Critical Only Mode', desc: 'Only receive critical severity alerts' },
  ];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      {/* Header */}
      <div style={{ paddingTop: 100, paddingBottom: 8, paddingLeft: 'clamp(24px,10vw,120px)', paddingRight: 'clamp(24px,10vw,120px)', maxWidth: 680, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 52, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          {profile?.full_name?.split(' ')[0] || 'Your'} <span style={{ color: 'var(--text-muted)', fontWeight: 300 }}>profile</span>
        </h1>
        <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'var(--text-muted)', margin: '0 0 40px' }}>{profile?.email}</p>
      </div>

      <div style={{ paddingBottom: 80, paddingLeft: 'clamp(24px,10vw,120px)', paddingRight: 'clamp(24px,10vw,120px)', maxWidth: 680, margin: '0 auto' }}>
        <StepDots step={step} />
        <AnimatePresence mode="wait" custom={dir}>
          {/* Step 0: Identity */}
          {step === 0 && (
            <motion.div key="s0" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
              <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 36, color: 'var(--text-primary)', margin: '0 0 8px' }}>Identity</h2>
              <p style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--text-muted)', marginBottom: 32 }}>Your name and location help dispatch nearby tasks to you.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 36 }}>
                <input className="input-underline" placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} />
                <div style={{ display: 'flex', gap: 16 }}>
                  <input className="input-underline" placeholder="City" value={city} onChange={e => setCity(e.target.value)} style={{ flex: 1 }} />
                  <select value={state} onChange={e => setState(e.target.value)}
                    style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid var(--glass-border)', color: state ? 'var(--text-primary)' : 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: 16, padding: '12px 0', outline: 'none', cursor: 'pointer' }}>
                    <option value="" disabled style={{ background: '#0D1525' }}>State</option>
                    {STATES.map(s => <option key={s} value={s} style={{ background: '#0D1525' }}>{s}</option>)}
                  </select>
                </div>
              </div>

              {profile?.role !== 'admin' && (
                <div style={{ marginBottom: 36 }}>
                  <span className="label-caps" style={{ display: 'block', marginBottom: 12 }}>My role —</span>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {ROLE_OPTS.map(r => (
                      <button key={r.id} type="button" onClick={() => setRole(r.id as any)}
                        style={{ flex: 1, padding: '14px 16px', borderRadius: 12, border: `1px solid ${role === r.id ? 'var(--accent-gold)' : 'var(--glass-border)'}`, background: role === r.id ? 'rgba(200,169,110,0.08)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease' }}>
                        <div style={{ fontSize: 22, marginBottom: 6 }}>{r.emoji}</div>
                        <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: role === r.id ? 'var(--accent-gold)' : 'var(--text-muted)', textTransform: 'capitalize' }}>{r.id}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={goNext} className="btn-sos" style={{ fontSize: 15, padding: '12px 32px' }}>Next →</button>
            </motion.div>
          )}

          {/* Step 1: Skills */}
          {step === 1 && (
            <motion.div key="s1" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
              <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 36, color: 'var(--text-primary)', margin: '0 0 8px' }}>Skills</h2>
              <p style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--text-muted)', marginBottom: 28 }}>Select all that apply. We use these to match you to the right tasks.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
                {ALL_SKILLS.map(sk => {
                  const active = selectedSkills.includes(sk);
                  return (
                    <button key={sk} onClick={() => toggleSkill(sk)} type="button"
                      style={{ padding: '9px 18px', borderRadius: 999, border: `1px solid ${active ? 'var(--accent-cyan)' : 'var(--glass-border)'}`, background: active ? 'rgba(0,212,255,0.1)' : 'transparent', color: active ? 'var(--accent-cyan)' : 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s ease', transform: active ? 'scale(1.05)' : 'scale(1)' }}>
                      {sk}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={goBack} className="btn-outline-cyan" style={{ fontSize: 14, padding: '10px 24px' }}>← Back</button>
                <button onClick={goNext} className="btn-sos" style={{ fontSize: 14, padding: '12px 28px' }}>Next →</button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Notifications + Save */}
          {step === 2 && (
            <motion.div key="s2" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
              <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 36, color: 'var(--text-primary)', margin: '0 0 8px' }}>Alerts</h2>
              <p style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--text-muted)', marginBottom: 28 }}>Choose how ResQ AI reaches you during emergencies.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
                {NOTIF_OPTS.map(opt => (
                  <div key={opt.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 3 }}>{opt.label}</div>
                      <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-muted)' }}>{opt.desc}</div>
                    </div>
                    <div onClick={() => setNotifToggles(t => ({ ...t, [opt.key]: !t[opt.key as keyof typeof t] }))}
                      style={{ width: 56, height: 28, borderRadius: 999, background: notifToggles[opt.key as keyof typeof notifToggles] ? 'rgba(0,230,118,0.15)' : 'rgba(90,106,138,0.15)', border: `1px solid ${notifToggles[opt.key as keyof typeof notifToggles] ? 'var(--accent-green)' : 'var(--text-dim)'}`, cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'all 0.3s ease' }}>
                      <div style={{ position: 'absolute', top: 3, left: notifToggles[opt.key as keyof typeof notifToggles] ? 'calc(100% - 25px)' : 3, width: 20, height: 20, borderRadius: '50%', background: notifToggles[opt.key as keyof typeof notifToggles] ? 'var(--accent-green)' : 'var(--text-muted)', transition: 'all 0.3s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={goBack} className="btn-outline-cyan" style={{ fontSize: 14, padding: '10px 24px' }}>← Back</button>
                <button onClick={handleSave} className="btn-sos" style={{ flex: 1, fontSize: 15, padding: '14px 24px', opacity: saving ? 0.8 : 1 }} disabled={saving}>
                  {saving ? '⏳ Saving...' : '💾 Save Profile'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
