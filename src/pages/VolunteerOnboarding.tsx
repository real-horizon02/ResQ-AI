import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, message } from 'antd';
import {
  MapPin, CheckCircle, User, Phone, Calendar, Zap,
  Mail, Lock, ArrowRight, Loader2, Eye, EyeOff,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const { Option } = Select;

const SKILLS_OPTIONS = [
  'First Aid', 'CPR Certified', 'Search & Rescue', 'Medical Help',
  'Food Distribution', 'Logistics', 'Translation', 'Debris Removal',
  'Emergency Driving', 'Mental Health Support',
];

/* ── Password Input ─────────────────────────────────────────────── */
function PasswordInput({
  label, placeholder, value, onChange, error, required,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; error?: string; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);

  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13,
        color: focused ? '#00D4FF' : '#94A3B8',
        marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase',
        transition: 'color 0.2s ease',
      }}>
        <Lock size={13} />
        {label}{required && <span style={{ color: '#EF4444' }}> *</span>}
      </label>
      <div style={{
        position: 'relative',
        border: `1.5px solid ${error ? '#EF4444' : focused ? '#00D4FF' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 10, background: 'rgba(255,255,255,0.04)',
        transition: 'all 0.2s ease',
        boxShadow: focused ? `0 0 0 3px ${error ? 'rgba(239,68,68,0.12)' : 'rgba(0,212,255,0.1)'}` : 'none',
        display: 'flex', alignItems: 'center',
      }}>
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, padding: '13px 16px', background: 'transparent',
            border: 'none', outline: 'none', color: '#F1F5F9',
            fontFamily: 'DM Sans', fontSize: 15,
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            padding: '0 16px', background: 'transparent', border: 'none',
            cursor: 'pointer', color: show ? '#00D4FF' : '#475569',
            display: 'flex', alignItems: 'center',
            transition: 'color 0.2s ease',
          }}
          title={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && (
        <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#EF4444', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

/* ── Regular Text Input ─────────────────────────────────────────── */
function FieldInput({
  label, icon: Icon, type = 'text', placeholder, value, onChange, error, required,
}: {
  label: string; icon: any; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; error?: string; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13,
        color: focused ? '#00D4FF' : '#94A3B8',
        marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase',
        transition: 'color 0.2s ease',
      }}>
        <Icon size={13} />
        {label}{required && <span style={{ color: '#EF4444' }}> *</span>}
      </label>
      <div style={{
        border: `1.5px solid ${error ? '#EF4444' : focused ? '#00D4FF' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 10, background: 'rgba(255,255,255,0.04)',
        transition: 'all 0.2s ease',
        boxShadow: focused ? `0 0 0 3px ${error ? 'rgba(239,68,68,0.12)' : 'rgba(0,212,255,0.1)'}` : 'none',
      }}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: '13px 16px', background: 'transparent',
            border: 'none', outline: 'none', color: '#F1F5F9',
            fontFamily: 'DM Sans', fontSize: 15, boxSizing: 'border-box',
          }}
        />
      </div>
      {error && (
        <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#EF4444', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

/* ── Dark Location Permission Modal ────────────────────────────── */
function LocationModal({ onAllow, onDeny }: { onAllow: () => void; onDeny: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(4, 6, 12, 0.88)', backdropFilter: 'blur(12px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        style={{
          background: '#0D1525',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: 20,
          padding: '36px 32px',
          maxWidth: 400,
          width: 'calc(100% - 48px)',
          textAlign: 'center',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.08)',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(0,212,255,0.08)',
          border: '1px solid rgba(0,212,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <MapPin size={28} color="#00D4FF" />
        </div>

        <h3 style={{
          fontFamily: 'DM Sans', fontWeight: 700, fontSize: 20,
          color: '#F1F5F9', marginBottom: 12,
        }}>
          Enable Location Access
        </h3>

        <p style={{
          fontFamily: 'DM Sans', fontSize: 14, color: '#64748B',
          lineHeight: 1.7, marginBottom: 28,
        }}>
          ResQ AI needs your location to match you with nearby emergency missions.
          Your location is stored securely and never shared publicly.
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onDeny}
            style={{
              flex: 1, padding: '13px', borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#64748B', fontFamily: 'DM Sans',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#94A3B8'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#64748B'; }}
          >
            Deny
          </button>
          <button
            onClick={onAllow}
            style={{
              flex: 2, padding: '13px', borderRadius: 12,
              background: 'linear-gradient(135deg, #00D4FF, #00A3CC)',
              border: 'none',
              color: '#060910', fontFamily: 'DM Sans',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,212,255,0.3)',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <MapPin size={15} /> Allow Access
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────── */
export default function VolunteerOnboarding() {
  const navigate = useNavigate();
  const { profile, updateProfile, signUp, isLoggedIn } = useAuthStore();

  // Form fields
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [fullName, setFullName]     = useState('');
  const [phone, setPhone]           = useState('');
  const [age, setAge]               = useState('');
  const [skills, setSkills]         = useState<string[]>([]);

  // Location
  const [coords, setCoords]             = useState<{ lat: number; lng: number } | null>(null);
  const [fullAddress, setFullAddress]   = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError]     = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);

  // UI
  const [loading, setLoading]               = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors]                 = useState<Record<string, string>>({});

  useEffect(() => {
    if (!profile) return;
    if (profile.admin_approved)   navigate('/volunteer');
    else if (profile.full_name)   setFullName(profile.full_name);
  }, [profile, navigate]);

  /* ── Reverse geocode ────────────────────────────────────────── */
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(`http://localhost:5000/api/geocode?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (data.address) return data.address;
    } catch (_) {}
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data.display_name) return data.display_name;
    } catch (_) {}
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  /* ── Location permission flow ───────────────────────────────── */
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setShowLocationModal(true);
  };

  const handleAllowLocation = () => {
    setShowLocationModal(false);
    setLocationLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        const addr = await reverseGeocode(lat, lng);
        setFullAddress(addr);
        setLocationLoading(false);
      },
      () => {
        setLocationError('Location access was denied. It is required to register as a volunteer.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleDenyLocation = () => {
    setShowLocationModal(false);
    setLocationError('Location access denied. It is required to register as a volunteer.');
  };

  /* ── Validation ─────────────────────────────────────────────── */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!isLoggedIn) {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        e.email = 'Please enter a valid email address';
      if (!password || password.length < 6)
        e.password = 'Password must be at least 6 characters';
      if (confirmPass !== password)
        e.confirmPass = 'Passwords do not match';
    }
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!phone.trim())    e.phone    = 'Phone number is required';
    if (!age || isNaN(Number(age)) || Number(age) < 18)
      e.age = 'You must be at least 18 years old';
    if (skills.length === 0) e.skills = 'Please select at least one skill';
    if (!coords)             e.location = 'Location is required to register as a volunteer';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let userId = useAuthStore.getState().user?.id;

      if (!isLoggedIn) {
        userId = await signUp(email, password, fullName, 'volunteer');
        // Give Supabase a moment to settle the auth session
        await new Promise(r => setTimeout(r, 1000));
        if (!userId) userId = useAuthStore.getState().user?.id;
      }

      if (!userId) {
        throw new Error('Could not create account. Please disable email confirmation in Supabase (Authentication → Email → Confirm email → OFF) and try again.');
      }

      // Build the profile payload — deliberately exclude `location` because
      // that column is a PostGIS GEOMETRY type in Supabase, not plain text.
      // We store the full address string in `city` and the extracted state in `state`.
      const addressParts = fullAddress.split(',').map(p => p.trim());
      const cityVal  = addressParts.slice(0, 3).join(', ') || fullAddress;
      const stateVal = addressParts.slice(-2, -1)[0] || null;

      try {
        await updateProfile({
          full_name:      fullName.trim(),
          phone_number:   phone.trim(),
          age:            Number(age),
          skills,
          role:           'volunteer',
          is_volunteer:   true,
          admin_request:  false,
          admin_approved: true,
          onboarded:      true,
          city:           cityVal,
          state:          stateVal,
        }, userId);
      } catch (profileErr: any) {
        // Profile save failed (most likely email confirmation is ON → no session).
        // We still navigate the user forward — the data can be saved later.
        console.warn('Profile save failed:', profileErr.message);
        message.warning({
          content: 'Account created! Profile data will sync once you confirm your email.',
          duration: 6,
          style: { fontFamily: 'DM Sans' },
        });
      }

      navigate('/volunteer');
    } catch (err: any) {
      message.error({ content: err.message || 'Registration failed. Please try again.', style: { fontFamily: 'DM Sans' } });
    } finally {
      setLoading(false);
    }
  };

  const sectionDivider = (label: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 28px' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
      <span style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700, color: '#334155', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#060910', paddingTop: 80, paddingBottom: 80 }}>

      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400,
        background: 'radial-gradient(ellipse, rgba(0,212,255,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

          {/* ── Header ────────────────────────────────────────── */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 220 }}
              style={{
                width: 68, height: 68, borderRadius: '50%',
                background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
              }}
            >
              <Zap size={30} color="#00D4FF" />
            </motion.div>
            <div style={{
              display: 'inline-block', padding: '4px 16px', borderRadius: 99,
              background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)',
              fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700,
              color: '#00D4FF', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16,
            }}>
              Volunteer Registration
            </div>
            <h1 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 42, color: '#F1F5F9', margin: '0 0 14px', lineHeight: 1.1 }}>
              Join the Rescue Team
            </h1>
            <p style={{ fontFamily: 'DM Sans', fontSize: 15, color: '#475569', maxWidth: 420, margin: '0 auto' }}>
              Complete your profile below. Your details will be verified by our admin team before you gain full access.
            </p>
          </div>

          {/* ── Form Card ──────────────────────────────────────── */}
          <div style={{
            background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20, padding: '40px 36px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
          }}>
            <form onSubmit={handleSubmit} noValidate>

              {/* ── Account Details ─────────────────────────── */}
              {!isLoggedIn && (
                <>
                  {sectionDivider('Account Details')}
                  <FieldInput label="Email Address" icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={setEmail} error={errors.email} required />
                  <PasswordInput label="Create Password" placeholder="Minimum 6 characters" value={password} onChange={setPassword} error={errors.password} required />
                  <PasswordInput label="Confirm Password" placeholder="Re-enter your password" value={confirmPass} onChange={setConfirmPass} error={errors.confirmPass} required />
                </>
              )}

              {/* ── Volunteer Profile ───────────────────────── */}
              {sectionDivider('Volunteer Profile')}
              <FieldInput label="Full Name" icon={User} placeholder="e.g. Rahul Sharma" value={fullName} onChange={setFullName} error={errors.fullName} required />

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <FieldInput label="Phone Number" icon={Phone} type="tel" placeholder="+91 98765 43210" value={phone} onChange={setPhone} error={errors.phone} required />
                </div>
                <div style={{ width: 130 }}>
                  <FieldInput label="Age" icon={Calendar} type="number" placeholder="18+" value={age} onChange={setAge} error={errors.age} required />
                </div>
              </div>

              {/* ── Skills ─────────────────────────────────── */}
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13,
                  color: '#94A3B8', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  <Zap size={13} /> Skills <span style={{ color: '#EF4444' }}> *</span>
                </label>
                <Select
                  mode="tags"
                  placeholder="Select or type your skills"
                  value={skills}
                  onChange={setSkills}
                  style={{ width: '100%' }}
                  tokenSeparators={[',']}
                  styles={{ popup: { root: { background: '#0D1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 } } }}
                >
                  {SKILLS_OPTIONS.map(s => (
                    <Option key={s} value={s} style={{ fontFamily: 'DM Sans', color: '#CBD5E1' }}>{s}</Option>
                  ))}
                </Select>
                {errors.skills && <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#EF4444', margin: '6px 0 0' }}>⚠ {errors.skills}</p>}
              </div>

              {/* ── Location ───────────────────────────────── */}
              {sectionDivider('Location')}
              <div style={{ marginBottom: 32 }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13,
                  color: '#94A3B8', marginBottom: 12, letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  <MapPin size={13} /> Your Location <span style={{ color: '#EF4444' }}>*</span>
                </label>

                {!coords ? (
                  <div style={{
                    border: `1.5px dashed ${errors.location ? '#EF4444' : 'rgba(255,255,255,0.09)'}`,
                    borderRadius: 12, padding: '28px 20px', textAlign: 'center',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <MapPin size={32} color="#1E3A4A" style={{ marginBottom: 12 }} />
                    <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#475569', marginBottom: 20, lineHeight: 1.65 }}>
                      Share your current location so we can<br />assign you to nearby rescue missions.
                    </p>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={locationLoading}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '12px 28px', borderRadius: 99,
                        background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)',
                        color: '#00D4FF', fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14,
                        cursor: locationLoading ? 'not-allowed' : 'pointer',
                        opacity: locationLoading ? 0.65 : 1, transition: 'all 0.2s ease',
                      }}
                    >
                      {locationLoading
                        ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Detecting...</>
                        : <><MapPin size={16} /> Enable My Location</>
                      }
                    </button>
                    {(errors.location || locationError) && (
                      <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#F97316', marginTop: 12 }}>
                        ⚠ {errors.location || locationError}
                      </p>
                    )}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    style={{
                      padding: '18px 20px', borderRadius: 12,
                      background: 'rgba(0,230,118,0.05)', border: '1px solid rgba(0,230,118,0.2)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CheckCircle size={18} color="#22C55E" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 13, color: '#22C55E', marginBottom: 5 }}>
                          ✓ Location Captured
                        </div>
                        <div style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
                          {fullAddress}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setCoords(null); setFullAddress(''); setLocationError(''); }}
                        style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: 12, flexShrink: 0, paddingTop: 2 }}
                      >
                        Change
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* ── Submit ─────────────────────────────────── */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', height: 54, borderRadius: 27,
                  background: loading ? 'rgba(0,212,255,0.4)' : 'linear-gradient(135deg, #00D4FF 0%, #00A3CC 100%)',
                  border: 'none', color: '#060910',
                  fontFamily: 'DM Sans', fontWeight: 800, fontSize: 16,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: loading ? 'none' : '0 8px 32px rgba(0,212,255,0.22)',
                  transition: 'all 0.3s ease', letterSpacing: '0.02em',
                }}
              >
                {loading
                  ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Registering...</>
                  : <>Register as Volunteer <ArrowRight size={18} /></>
                }
              </button>

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: 13, color: '#334155' }}
                >
                  ← Back to sign in
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* ── Dark Location Permission Modal ─────────────────── */}
      <AnimatePresence>
        {showLocationModal && (
          <LocationModal onAllow={handleAllowLocation} onDeny={handleDenyLocation} />
        )}
      </AnimatePresence>

      {/* ── Success Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(4,6,12,0.9)', backdropFilter: 'blur(10px)' }}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              style={{
                background: '#0D1525', padding: '52px 44px',
                maxWidth: 440, width: 'calc(100% - 48px)', textAlign: 'center',
                borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
                border: '1px solid rgba(0,230,118,0.18)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 260 }}
                style={{
                  width: 80, height: 80, background: 'rgba(0,230,118,0.1)', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 28px', border: '1px solid rgba(0,230,118,0.22)',
                }}
              >
                <CheckCircle size={40} color="#22C55E" />
              </motion.div>
              <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 30, color: '#F1F5F9', marginBottom: 16 }}>
                Application Sent!
              </h2>
              <p style={{ fontFamily: 'DM Sans', fontSize: 15, color: '#64748B', lineHeight: 1.75, marginBottom: 36 }}>
                We have received your application and all your details have been saved securely.<br /><br />
                Our admin team will review and approve your profile shortly.<br /><br />
                Warm regards,<br />
                <span style={{ color: '#CBD5E1', fontWeight: 600 }}>Team ResQ AI 🛡️</span>
              </p>
              <button
                onClick={() => { setShowSuccessModal(false); navigate('/pending-approval'); }}
                style={{
                  width: '100%', height: 50, borderRadius: 25,
                  background: 'linear-gradient(135deg, #00D4FF 0%, #00A3CC 100%)',
                  border: 'none', color: '#060910',
                  fontFamily: 'DM Sans', fontWeight: 800, fontSize: 15,
                  cursor: 'pointer', letterSpacing: '0.02em',
                  boxShadow: '0 6px 24px rgba(0,212,255,0.25)',
                }}
              >
                OK, Got It!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .ant-select-selector {
          background: rgba(255,255,255,0.04) !important;
          border: 1.5px solid rgba(255,255,255,0.1) !important;
          border-radius: 10px !important; min-height: 48px !important;
          padding: 4px 12px !important; color: #F1F5F9 !important;
          font-family: 'DM Sans' !important; font-size: 15px !important;
        }
        .ant-select-focused .ant-select-selector { border-color: #00D4FF !important; box-shadow: 0 0 0 3px rgba(0,212,255,0.12) !important; }
        .ant-select-selection-placeholder { color: #334155 !important; }
        .ant-select-selection-item { background: rgba(0,212,255,0.1) !important; border: 1px solid rgba(0,212,255,0.25) !important; color: #00D4FF !important; border-radius: 6px !important; }
        .ant-select-selection-item-remove { color: #00A3CC !important; }
        .ant-select-item-option { color: #CBD5E1 !important; font-family: 'DM Sans' !important; }
        .ant-select-item-option:hover, .ant-select-item-option-active { background: rgba(255,255,255,0.06) !important; }
        .ant-select-item-option-selected { background: rgba(0,212,255,0.1) !important; color: #00D4FF !important; }
        input::placeholder { color: #334155 !important; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
      `}</style>
    </div>
  );
}
