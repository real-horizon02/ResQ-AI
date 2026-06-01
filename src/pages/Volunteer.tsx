import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { Incident } from '../data/mockData';
import { AnimatePresence, motion } from 'framer-motion';
import { message } from 'antd';
import { supabase } from '../lib/supabase';

// ── Severity config ─────────────────────────────────────────────
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
    if (inc.severity === 'critical' || inc.severity === 'high') return 'Heavy Rainfall';
    if (inc.severity === 'medium') return 'Moderate Rain';
    return 'Light Rain';
  }
  return TYPE_LABEL[inc.type] || inc.type || 'Incident';
}

// Get radius in meters based on disaster type and severity
function getDisasterRadius(incident: Incident): number {
  const baseRadius = {
    earthquake: 50000,  // 50km
    cyclone: 100000,    // 100km
    tsunami: 80000,     // 80km
    flood: 25000,       // 25km
    wildfire: 15000,    // 15km
    fire: 5000,         // 5km
    landslide: 8000,    // 8km
    rainfall: 20000,    // 20km
    drought: 200000,    // 200km (large area)
    heatwave: 150000,   // 150km
    'building-collapse': 2000, // 2km
    'gas-leak': 3000,   // 3km
  };

  const severityMultiplier = {
    critical: 1.5,
    high: 1.2,
    medium: 1.0,
    low: 0.7,
  };

  const base = baseRadius[incident.type as keyof typeof baseRadius] || 10000;
  const multiplier = severityMultiplier[incident.severity as keyof typeof severityMultiplier] || 1.0;
  
  return base * multiplier;
}

function makeDot(severity: string): L.DivIcon {
  const { color } = SEV[severity] || SEV.low;
  const pulse = severity === 'critical'
    ? `<div style="position:absolute;inset:-6px;border-radius:50%;border:1.5px solid ${color};animation:vpulse 2s cubic-bezier(0,0,0.2,1) infinite;opacity:0.5;"></div>`
    : '';
  const html = `<div style="position:relative;width:14px;height:14px;display:flex;align-items:center;justify-content:center;">${pulse}<div style="width:12px;height:12px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color}AA;"></div></div>`;
  return L.divIcon({ html, className: '', iconSize: [14, 14], iconAnchor: [7, 7] });
}

const geoCache: Record<string, string> = {};
function LocationDisplay({ lat, lng, fallback }: { lat: number; lng: number; fallback: string }) {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const [addr, setAddr] = useState(geoCache[key] || fallback);
  useEffect(() => {
    if (geoCache[key]) return;
    let alive = true;
    fetch(`http://localhost:5000/api/geocode?lat=${lat}&lng=${lng}`)
      .then(r => r.json())
      .then(d => { if (alive && d.address) { geoCache[key] = d.address; setAddr(d.address); } })
      .catch(() => {});
    return () => { alive = false; };
  }, [lat, lng, key]);
  return <span>📍 {addr}</span>;
}

const ALL_SKILLS = [
  'First Aid', 'CPR', 'Search & Rescue', 'Firefighting', 'Swimming',
  'Medical', 'HAM Radio', 'Logistics', 'Counseling', 'Emergency Driving',
];

// ── Edit Profile Modal ──────────────────────────────────────────
function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { profile, updateProfile } = useAuthStore();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone]       = useState((profile as any)?.phone_number || '');
  const [age,   setAge]         = useState(String((profile as any)?.age || ''));
  const [city,  setCity]        = useState(profile?.city || '');
  const [state, setState]       = useState(profile?.state || '');
  const [gender, setGender]     = useState((profile as any)?.gender || '');
  const [skills, setSkills]     = useState<string[]>((profile?.skills as string[]) || []);
  const [saving, setSaving]     = useState(false);

  const toggle = (s: string) =>
    setSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const save = async () => {
    setSaving(true);
    try {
      let parsedAge: number | null = parseInt(age, 10);
      if (isNaN(parsedAge)) parsedAge = null;

      await updateProfile({ 
        full_name: fullName, 
        phone_number: phone, 
        age: parsedAge, 
        city, 
        state, 
        gender: gender || null,
        skills 
      } as any);
      
      try { message.success({ content: '✅ Profile updated!', style: { fontFamily: 'DM Sans' } }); } catch(e) {}
      onClose();
    } catch (error: any) {
      console.error(error);
      try { message.error({ content: error?.message || 'Save failed. Try again.', style: { fontFamily: 'DM Sans' } }); } catch(e) {}
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, val: string, set: (v: string) => void, placeholder: string, type = 'text') => (
    <div key={label}>
      <label style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={val}
        onChange={e => set(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#F1F5F9', fontFamily: 'DM Sans', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(4,6,12,0.92)', backdropFilter: 'blur(12px)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        style={{ background: '#0D1525', borderRadius: 20, padding: '36px 32px', width: '100%', maxWidth: 540, border: '1px solid rgba(0,212,255,0.2)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 26, color: '#F1F5F9', margin: 0 }}>Edit Profile</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94A3B8', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {field('Full Name', fullName, setFullName, 'e.g. Rahul Sharma')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 12 }}>
            {field('Phone Number', phone, setPhone, '+91 98765 43210', 'tel')}
            {field('Age', age, setAge, '18+', 'number')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {field('City', city, setCity, 'Your city')}
            {field('State', state, setState, 'Your state')}
          </div>

          {/* Gender Selection */}
          <div>
            <label style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Gender (for default avatar)</label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#F1F5F9', fontFamily: 'DM Sans', fontSize: 14, outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
            >
              <option value="" style={{ background: '#0D1525' }}>Prefer not to say</option>
              <option value="male" style={{ background: '#0D1525' }}>Male</option>
              <option value="female" style={{ background: '#0D1525' }}>Female</option>
              <option value="other" style={{ background: '#0D1525' }}>Other</option>
            </select>
          </div>

          <div>
            <label style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Skills</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ALL_SKILLS.map(s => {
                const active = skills.includes(s);
                return (
                  <button key={s} onClick={() => toggle(s)} type="button"
                    style={{ padding: '7px 14px', borderRadius: 999, border: `1px solid ${active ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.1)'}`, background: active ? 'rgba(0,212,255,0.1)' : 'transparent', color: active ? '#00D4FF' : '#64748B', fontFamily: 'DM Sans', fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s ease' }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={save} disabled={saving}
          style={{ width: '100%', height: 50, borderRadius: 25, marginTop: 28, background: saving ? 'rgba(0,212,255,0.4)' : 'linear-gradient(135deg,#00D4FF 0%,#00A3CC 100%)', border: 'none', color: '#060910', fontFamily: 'DM Sans', fontWeight: 800, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 6px 24px rgba(0,212,255,0.2)', transition: 'all 0.2s ease' }}
        >
          {saving ? '⏳ Saving...' : '💾 Save Changes'}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Gender-based Avatar Components ──────────────────────────────
function MaleAvatar({ size = 72 }: { size?: number }) {
  return (
    <div style={{ 
      width: size, 
      height: size, 
      borderRadius: '50%', 
      background: 'linear-gradient(135deg, #3B82F6, #1E40AF)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      border: '2px solid rgba(0,212,255,0.35)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Male figure */}
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        {/* Head */}
        <circle cx="12" cy="8" r="3" fill="white" opacity="0.9" />
        {/* Body */}
        <path d="M12 14c-4 0-6 2-6 4v2h12v-2c0-2-2-4-6-4z" fill="white" opacity="0.9" />
      </svg>
    </div>
  );
}

function FemaleAvatar({ size = 72 }: { size?: number }) {
  return (
    <div style={{ 
      width: size, 
      height: size, 
      borderRadius: '50%', 
      background: 'linear-gradient(135deg, #EC4899, #BE185D)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      border: '2px solid rgba(0,212,255,0.35)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Female figure */}
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        {/* Head */}
        <circle cx="12" cy="8" r="3" fill="white" opacity="0.9" />
        {/* Hair/longer style */}
        <path d="M9 6c0-1.5 1.5-3 3-3s3 1.5 3 3" stroke="white" strokeWidth="1" opacity="0.7" fill="none" />
        {/* Body */}
        <path d="M12 14c-4 0-6 2-6 4v2h12v-2c0-2-2-4-6-4z" fill="white" opacity="0.9" />
      </svg>
    </div>
  );
}

function DefaultAvatar({ gender, initials, size = 72 }: { gender?: string | null; initials: string; size?: number }) {
  if (gender === 'female') {
    return <FemaleAvatar size={size} />;
  } else if (gender === 'male') {
    return <MaleAvatar size={size} />;
  } else {
    // Fallback to initials for 'other' or null gender
    return (
      <div style={{ 
        width: size, 
        height: size, 
        borderRadius: '50%', 
        background: 'linear-gradient(135deg,#1E3A4A,#0D2535)', 
        border: '2px solid rgba(0,212,255,0.35)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontFamily: 'DM Sans', 
        fontWeight: 700, 
        fontSize: size * 0.3, 
        color: '#00D4FF' 
      }}>
        {initials}
      </div>
    );
  }
}

// ── Profile Picture Viewer Modal ────────────────────────────────
function ProfilePictureModal({ imageUrl, gender, initials, onClose }: { 
  imageUrl: string | null | undefined; 
  gender?: string | null; 
  initials: string; 
  onClose: () => void 
}) {
  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(4,6,12,0.95)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Profile Picture" 
            style={{ width: 'auto', height: 'auto', maxWidth: '90vw', maxHeight: '90vh', display: 'block', borderRadius: 16 }}
          />
        ) : (
          <div style={{ padding: 40, background: '#0D1525', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <DefaultAvatar gender={gender} initials={initials} size={200} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'DM Sans', fontSize: 18, color: '#F1F5F9', marginBottom: 8 }}>Default Avatar</div>
              <div style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#64748B' }}>
                {gender === 'male' ? 'Male Avatar' : gender === 'female' ? 'Female Avatar' : 'Generic Avatar'}
              </div>
            </div>
          </div>
        )}
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#F1F5F9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, backdropFilter: 'blur(8px)' }}
        >
          ✕
        </button>
        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
          <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#CBD5E1' }}>Press ESC or click outside to close</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Profile Sidebar ─────────────────────────────────────────────
function ProfileSidebar({ onEditOpen }: { onEditOpen: () => void }) {
  const { profile, user, updateProfile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showProfilePicture, setShowProfilePicture] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error({ content: '❌ File too large. Max 2MB.', style: { fontFamily: 'DM Sans' } });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      message.error({ content: '❌ Only JPG, PNG, WebP, GIF allowed.', style: { fontFamily: 'DM Sans' } });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const path = `avatars/${user.id}-${timestamp}.${ext}`;
      
      // Upload to Supabase storage
      const { error: upErr, data } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      
      if (upErr) {
        console.error('Upload error:', upErr);
        throw new Error(upErr.message || 'Upload failed. Check Supabase storage bucket permissions.');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      
      if (!publicUrl) {
        throw new Error('Failed to generate public URL');
      }

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl });
      message.success({ content: '✅ Photo updated!', style: { fontFamily: 'DM Sans' } });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      const errorMsg = error?.message || 'Upload failed. Please try again.';
      message.error({ content: `❌ ${errorMsg}`, style: { fontFamily: 'DM Sans' } });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setUploading(true);
    try {
      // Remove avatar URL from profile
      await updateProfile({ avatar_url: null });
      message.success({ content: '✅ Profile picture removed!', style: { fontFamily: 'DM Sans' } });
    } catch (error: any) {
      console.error('Remove avatar error:', error);
      message.error({ content: '❌ Failed to remove picture.', style: { fontFamily: 'DM Sans' } });
    } finally {
      setUploading(false);
    }
  };

  const initials = (profile?.full_name || 'V').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const skills = (profile?.skills as string[]) || [];
  const isApproved = profile?.admin_approved;
  const phone = (profile as any)?.phone_number;
  const age = (profile as any)?.age;

  const infoRow = (icon: string, label: string, value: string | null | undefined) => (
    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontSize: 15, flexShrink: 0, width: 22, textAlign: 'center' }}>{icon}</span>
      <div>
        <div style={{ fontFamily: 'DM Sans', fontSize: 9, fontWeight: 700, color: '#334155', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
        <div style={{ fontFamily: 'DM Sans', fontSize: 13, color: value ? '#CBD5E1' : '#334155', fontWeight: value ? 500 : 400 }}>{value || '—'}</div>
      </div>
    </div>
  );

  return (
    <div style={{ width: 270, flexShrink: 0, background: '#06090F', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }} data-lenis-prevent>

      {/* Avatar + Name */}
      <div style={{ background: 'linear-gradient(180deg,rgba(0,212,255,0.08) 0%,transparent 100%)', padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 14px' }}>
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="avatar" 
              onClick={() => setShowProfilePicture(true)}
              style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,212,255,0.35)', cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)'; }}
              title="Click to view full size"
            />
          ) : (
            <div style={{ cursor: 'pointer' }} onClick={() => setShowProfilePicture(true)} title="Click to view">
              {uploading ? (
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#1E3A4A,#0D2535)', border: '2px solid rgba(0,212,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans', fontWeight: 700, fontSize: 22, color: '#00D4FF' }}>
                  ⏳
                </div>
              ) : (
                <DefaultAvatar 
                  gender={(profile as any)?.gender} 
                  initials={initials} 
                  size={72} 
                />
              )}
            </div>
          )}
          
          {/* Avatar action buttons */}
          <div style={{ position: 'absolute', bottom: -2, right: -2, display: 'flex', gap: 4 }}>
            <button onClick={() => fileInputRef.current?.click()} title="Change photo"
              style={{ width: 24, height: 24, borderRadius: '50%', background: '#00D4FF', border: '2px solid #06090F', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, padding: 0 }}>
              📷
            </button>
            {profile?.avatar_url && (
              <button onClick={handleRemoveAvatar} title="Remove photo"
                style={{ width: 24, height: 24, borderRadius: '50%', background: '#EF4444', border: '2px solid #06090F', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, padding: 0 }}>
                🗑️
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 16, color: '#F1F5F9', marginBottom: 4 }}>
            {profile?.full_name || 'Volunteer'}
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#475569', marginBottom: 12, wordBreak: 'break-all' }}>
            {profile?.email}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 99, background: isApproved ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${isApproved ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isApproved ? '#22C55E' : '#F59E0B', display: 'inline-block', animation: isApproved ? 'none' : 'vpulse2 1.5s infinite' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700, color: isApproved ? '#22C55E' : '#F59E0B', letterSpacing: '0.06em' }}>
              {isApproved ? 'APPROVED' : 'PENDING APPROVAL'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { label: 'Skills', val: skills.length },
          { label: 'Missions', val: isApproved ? 'Active' : 'Pending' },
        ].map(({ label, val }) => (
          <div key={label} style={{ flex: 1, padding: '14px 10px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 18, color: '#00D4FF' }}>{val}</div>
            <div style={{ fontFamily: 'DM Sans', fontSize: 10, color: '#475569', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Profile Details */}
      <div style={{ padding: '14px 18px' }}>
        <div style={{ fontFamily: 'DM Sans', fontSize: 9, fontWeight: 700, color: '#334155', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>DETAILS</div>
        {infoRow('📞', 'Phone', phone)}
        {infoRow('🎂', 'Age', age ? `${age} years` : null)}
        {infoRow('🏙️', 'City', profile?.city)}
        {infoRow('🗺️', 'State', profile?.state)}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ padding: '0 18px 16px' }}>
          <div style={{ fontFamily: 'DM Sans', fontSize: 9, fontWeight: 700, color: '#334155', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>SKILLS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {skills.map(s => (
              <span key={s} style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)', fontFamily: 'DM Sans', fontSize: 11, color: '#00A3CC' }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onEditOpen}
          style={{ width: '100%', padding: '11px', borderRadius: 10, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF', fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s ease' }}>
          ✏️ Edit Profile
        </button>
        <button onClick={async () => { await signOut(); navigate('/auth'); }}
          style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.07)', color: '#475569', fontFamily: 'DM Sans', fontWeight: 500, fontSize: 12, cursor: 'pointer' }}>
          🌙 Sign Out
        </button>
      </div>

      {/* Profile Picture Modal */}
      <AnimatePresence>
        {showProfilePicture && (
          <ProfilePictureModal 
            imageUrl={profile?.avatar_url} 
            gender={(profile as any)?.gender}
            initials={initials}
            onClose={() => setShowProfilePicture(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Incident List Sidebar ──────────────────────────────────────
function IncidentListPanel({ incidents, activeId, onSelect }: { incidents: Incident[], activeId: string | null, onSelect: (id: string, lat: number, lng: number) => void }) {
  const [filter, setFilter] = useState('all');
  const filtered = useMemo(() => incidents.filter(i => filter === 'all' || i.severity === filter), [incidents, filter]);

  return (
    <div style={{ width: 320, flexShrink: 0, background: '#080C16', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 18, color: '#F1F5F9', margin: '0 0 14px' }}>Active Disasters</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'critical', 'high', 'medium'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 14px', borderRadius: 99, border: '1px solid', borderColor: filter === f ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.1)', background: filter === f ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)', color: filter === f ? '#00D4FF' : '#94A3B8', fontFamily: 'DM Sans', fontSize: 11, fontWeight: filter === f ? 700 : 500, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s' }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }} data-lenis-prevent>
        {filtered.length === 0 && (
          <div style={{ padding: 30, textAlign: 'center', fontFamily: 'DM Sans', fontSize: 13, color: '#64748B' }}>No incidents match this filter.</div>
        )}
        {filtered.map(inc => {
          const isActive = inc.id === activeId;
          const { color, bg } = SEV[inc.severity] || SEV.low;
          return (
            <div key={inc.id} onClick={() => onSelect(inc.id, inc.lat, inc.lng)}
              style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: isActive ? 'rgba(0,212,255,0.05)' : 'transparent', cursor: 'pointer', transition: 'background 0.2s', borderLeft: isActive ? '3px solid #00D4FF' : '3px solid transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontFamily: 'DM Sans', fontSize: 15, fontWeight: 700, color: isActive ? '#00D4FF' : '#F1F5F9' }}>
                  {getIncidentLabel(inc)}
                </span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: color, background: bg, padding: '3px 6px', borderRadius: 4, letterSpacing: '0.05em', border: `1px solid ${color}33` }}>
                  {SEV[inc.severity]?.label || 'LOW'}
                </span>
              </div>
              <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#94A3B8' }}>
                <LocationDisplay lat={inc.lat} lng={inc.lng} fallback={inc.location || inc.state || 'India'} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────
export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const { profile, user, initialized, isLoggedIn } = useAuthStore();
  const { incidents } = useAppStore();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance     = useRef<L.Map | null>(null);
  const clusterGroup    = useRef<any>(null);
  const activeCircle    = useRef<L.Circle | null>(null);

  const [activeId,    setActiveId]    = useState<string | null>(null);
  const [applyingFor, setApplyingFor] = useState<string | null>(null);
  const [showEdit,    setShowEdit]    = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [myApps,      setMyApps]      = useState<any[]>([]);
  const [mapLoaded,   setMapLoaded]   = useState(false);

  // Redirect if wrong role
  useEffect(() => {
    if (initialized && (!isLoggedIn || (profile && profile.role !== 'volunteer'))) {
      navigate('/auth');
    }
  }, [initialized, isLoggedIn, profile]);

  // Fetch incidents every 30 s
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/disasters');
        const data = await res.json();
        useAppStore.setState({ incidents: data });
        setLastUpdated(new Date());
      } catch {}
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  // Fetch my rescue applications
  useEffect(() => {
    if (!user) return;
    const fetchApps = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/rescue-applications');
        const data = await res.json();
        setMyApps(data.filter((a: any) => a.volunteerId === user.id));
      } catch {}
    };
    fetchApps();
    const t = setInterval(fetchApps, 15000);
    return () => clearInterval(t);
  }, [user]);

  // Init Leaflet — runs once
  useEffect(() => {
    const node = mapContainerRef.current;
    if (!node) return;
    // clear stale leaflet id
    (node as any)._leaflet_id = null;

    const m = L.map(node, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    }).setView([22.5937, 78.9629], 5);

    // Try multiple tile layer sources for better reliability
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      subdomains: ['a', 'b', 'c'],
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    });

    // Fallback to CartoDB if OSM fails
    tileLayer.on('tileerror', () => {
      console.log('Primary tiles failed, switching to CartoDB...');
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(m);
    });

    // Set map as loaded when tiles start loading
    tileLayer.on('loading', () => {
      console.log('Map tiles loading...');
    });

    tileLayer.on('load', () => {
      console.log('Map tiles loaded successfully');
      setMapLoaded(true);
    });

    tileLayer.addTo(m);

    L.control.zoom({ position: 'bottomright' }).addTo(m);

    const cg = (L as any).markerClusterGroup({
      maxClusterRadius: 40,
      iconCreateFunction: (cluster: any) => L.divIcon({
        html: `<div style="background:rgba(0,212,255,0.15);border:1px solid rgba(0,212,255,0.4);color:#00D4FF;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;font-family:'DM Sans';font-size:12px;font-weight:700;">${cluster.getChildCount()}</div>`,
        className: '',
        iconSize: [32, 32],
      }),
    });
    m.addLayer(cg);

    mapInstance.current  = m;
    clusterGroup.current = cg;

    // Use a window resize listener + a sequence of timeouts to handle all flexbox layout shifts safely
    const handleResize = () => {
      if (m) {
        m.invalidateSize();
        // Force redraw
        setTimeout(() => m.invalidateSize(), 100);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Multiple invalidation attempts to ensure map renders
    setTimeout(() => {
      handleResize();
      console.log('Map invalidated at 100ms');
    }, 100);
    setTimeout(() => {
      handleResize();
      console.log('Map invalidated at 500ms');
    }, 500);
    setTimeout(() => {
      handleResize();
      console.log('Map invalidated at 1500ms');
    }, 1500);
    setTimeout(() => {
      handleResize();
      console.log('Map invalidated at 3000ms');
      // Force show map even if tiles haven't loaded
      setMapLoaded(true);
    }, 3000);

    return () => {
      window.removeEventListener('resize', handleResize);
      // Clean up active circle
      if (activeCircle.current) {
        m.removeLayer(activeCircle.current);
        activeCircle.current = null;
      }
      m.remove();
      mapInstance.current  = null;
      clusterGroup.current = null;
    };
  }, []);

  // Sync markers whenever incidents change
  useEffect(() => {
    const cg = clusterGroup.current;
    const m  = mapInstance.current;
    if (!cg || !m) return;
    cg.clearLayers();
    incidents.forEach(inc => {
      if (typeof inc.lat !== 'number' || typeof inc.lng !== 'number') return;
      const marker = L.marker([inc.lat, inc.lng], { icon: makeDot(inc.severity) });
      marker.on('click', () => {
        setActiveId(inc.id);
        m.flyTo([inc.lat, inc.lng], 9, { duration: 0.7 });
      });
      cg.addLayer(marker);
    });
  }, [incidents]);

  // Handle active incident circle
  useEffect(() => {
    const m = mapInstance.current;
    if (!m) return;

    // Remove existing circle
    if (activeCircle.current) {
      m.removeLayer(activeCircle.current);
      activeCircle.current = null;
    }

    // Add circle for active incident
    if (activeId) {
      const activeInc = incidents.find(inc => inc.id === activeId);
      if (activeInc && typeof activeInc.lat === 'number' && typeof activeInc.lng === 'number') {
        const radius = getDisasterRadius(activeInc);
        const { color } = SEV[activeInc.severity] || SEV.low;
        
        const circle = L.circle([activeInc.lat, activeInc.lng], {
          radius: radius,
          fillColor: color,
          fillOpacity: 0.25,  // Increased from 0.1 to 0.25 for darker shadow
          color: color,
          weight: 2,
          opacity: 0.8,       // Increased from 0.6 to 0.8 for darker border
          dashArray: '5, 10',
        });
        
        circle.addTo(m);
        activeCircle.current = circle;
      }
    }
  }, [activeId, incidents]);

  const handleApply = useCallback(async (incId: string) => {
    setApplyingFor(incId);
    try {
      const response = await fetch('http://localhost:5000/api/rescue-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId: user?.id,
          incidentId: incId,
          details: {
            name:  profile?.full_name,
            phone: (profile as any)?.phone_number,
            city:  profile?.city,
          },
        }),
      });
      const data = await response.json();
      if (data.success && data.application) {
        setMyApps(prev => [...prev, data.application]);
      }
      message.success({ content: '✅ Rescue application sent! Admin will review shortly.', style: { fontFamily: 'DM Sans', marginTop: '10vh' } });
    } catch {
      message.error({ content: 'Failed to send application. Try again.', style: { fontFamily: 'DM Sans' } });
    }
    setApplyingFor(null);
  }, [user, profile]);

  const activeInc    = useMemo(() => incidents.find(i => i.id === activeId), [activeId, incidents]);
  const criticalCount = useMemo(() => incidents.filter(i => i.severity === 'critical').length, [incidents]);

  if (!initialized) {
    return (
      <div style={{ background: '#06090F', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#334155' }}>LOADING...</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#06090F', overflow: 'hidden' }}>
      <style>{`
        @keyframes vpulse {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes vpulse2 {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .leaflet-container { 
          background: #06090F !important; 
          width: 100% !important;
          height: 100% !important;
        }
        .leaflet-tile-pane { opacity: 1 !important; }
        .leaflet-tile { 
          filter: brightness(0.8) contrast(1.2) !important;
        }
        .leaflet-control-zoom {
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5) !important;
          margin: 12px !important;
        }
        .leaflet-control-zoom a {
          background: #0D1525 !important;
          color: #64748B !important;
          border-color: rgba(255,255,255,0.08) !important;
          width: 28px !important; height: 28px !important; line-height: 28px !important;
        }
        .leaflet-control-zoom a:hover { background: #1E293B !important; color: #F1F5F9 !important; }
        [data-lenis-prevent]::-webkit-scrollbar { width: 3px; }
        [data-lenis-prevent]::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>

      {/* ── Top Nav ─────────────────────────────────────── */}
      <div style={{ height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: '#06090F', borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 18, fontWeight: 700, color: '#00D4FF' }}>
            ResQ<span style={{ color: '#F1F5F9' }}>AI</span>
          </div>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#475569', fontWeight: 500 }}>Volunteer Dashboard</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', display: 'inline-block', animation: 'vpulse2 1.4s infinite' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#EF4444' }}>{criticalCount} CRITICAL</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#22C55E' }}>LIVE</span>
          </div>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#334155' }}>● {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* Profile sidebar */}
        <ProfileSidebar onEditOpen={() => setShowEdit(true)} />

        {/* List sidebar */}
        <IncidentListPanel 
          incidents={incidents} 
          activeId={activeId} 
          onSelect={(id, lat, lng) => {
            setActiveId(id);
            if (mapInstance.current) {
              mapInstance.current.flyTo([lat, lng], 9, { duration: 0.7 });
            }
          }} 
        />

        {/* Map area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>

          {/* Map header strip */}
          <div style={{ height: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', background: 'rgba(6,9,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 100 }}>
            <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 15, color: '#CBD5E1' }}>
              Live Rescue Map — India
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button 
                onClick={() => {
                  if (mapInstance.current) {
                    mapInstance.current.invalidateSize();
                    console.log('Map manually refreshed');
                  }
                }}
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF', padding: '4px 8px', borderRadius: 6, fontSize: 10, cursor: 'pointer', fontFamily: 'JetBrains Mono' }}
                title="Refresh map if not visible"
              >
                🔄 REFRESH
              </button>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#334155' }}>
                {incidents.length} incidents tracked
              </span>
            </div>
          </div>

          {/* Leaflet mount — fills remaining height */}
          <div 
            ref={mapContainerRef} 
            style={{ 
              flex: 1, 
              minHeight: 0, 
              width: '100%',
              height: '100%',
              position: 'relative',
              background: '#1a1a1a'
            }} 
          >
            {/* Map loading overlay */}
            {!mapLoaded && (
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'rgba(6,9,15,0.9)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                zIndex: 1000,
                flexDirection: 'column',
                gap: 12
              }}>
                <div style={{ 
                  width: 32, 
                  height: 32, 
                  border: '3px solid rgba(0,212,255,0.3)', 
                  borderTop: '3px solid #00D4FF', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }} />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#64748B' }}>
                  Loading map tiles...
                </span>
              </div>
            )}
          </div>

          {/* Severity legend */}
          <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 500, background: 'rgba(6,9,15,0.88)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: '#334155', letterSpacing: '0.08em', marginBottom: 8 }}>SEVERITY</div>
            {Object.entries(SEV).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.color, boxShadow: `0 0 5px ${v.color}88`, flexShrink: 0 }} />
                <span style={{ fontFamily: 'DM Sans', fontSize: 10, color: '#64748B' }}>{v.label}</span>
              </div>
            ))}
          </div>

          {/* Incident Detail Card */}
          <AnimatePresence>
            {activeInc && (
              <motion.div
                key={activeInc.id}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                style={{
                  position: 'absolute', bottom: 28, left: 20, zIndex: 600,
                  width: 340, background: '#0D1525', borderRadius: 18,
                  border: `1px solid ${SEV[activeInc.severity]?.color || '#fff'}33`,
                  borderTop: `2.5px solid ${SEV[activeInc.severity]?.color || '#64748B'}`,
                  boxShadow: '0 24px 72px rgba(0,0,0,0.75)',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div style={{ padding: '16px 18px', background: SEV[activeInc.severity]?.bg || 'rgba(100,116,139,0.08)', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: SEV[activeInc.severity]?.color, letterSpacing: '0.08em', marginBottom: 5 }}>
                        ● {SEV[activeInc.severity]?.label} · {getIncidentLabel(activeInc).toUpperCase()}
                      </div>
                      <div style={{ fontFamily: 'DM Sans', fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>
                        {getIncidentLabel(activeInc)}
                      </div>
                    </div>
                    <button onClick={() => setActiveId(null)}
                      style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#64748B', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
                      ✕
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '16px 18px' }}>
                  {/* Address */}
                  <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#64748B', marginBottom: 14 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#334155', display: 'block', marginBottom: 3 }}>LOCATION</span>
                    <LocationDisplay lat={activeInc.lat} lng={activeInc.lng} fallback={activeInc.location || activeInc.state || 'India'} />
                  </div>

                  {activeInc.description && (
                    <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#64748B', lineHeight: 1.6, margin: '0 0 14px' }}>
                      {activeInc.description.substring(0, 110)}{activeInc.description.length > 110 ? '…' : ''}
                    </p>
                  )}

                  {/* Radius indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', border: `2px dashed ${SEV[activeInc.severity]?.color}`, opacity: 0.7, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#64748B' }}>
                      Affected area shown on map
                    </span>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                    {[
                      { label: 'AFFECTED', val: (activeInc.peopleAffected || 0).toLocaleString() },
                      { label: 'RADIUS', val: `${(getDisasterRadius(activeInc) / 1000).toFixed(0)}km` },
                      { label: 'STATE', val: activeInc.state?.substring(0, 8) || '—' },
                    ].map(({ label, val }) => (
                      <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: '#334155', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontFamily: 'DM Sans', fontSize: 15, fontWeight: 700, color: label === 'RADIUS' ? SEV[activeInc.severity]?.color : '#F1F5F9' }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* ✅ Apply for Rescue button */}
                  {(() => {
                    const existingApp = myApps.find(a => a.incidentId === activeInc.id);
                    let btnText = 'Request Rescue';
                    let disabled = false;

                    if (applyingFor === activeInc.id) {
                      btnText = 'Sending Request…';
                      disabled = true;
                    } else if (existingApp) {
                      disabled = true;
                      if (existingApp.status === 'pending') {
                        btnText = 'Request sent to Admin';
                      } else if (existingApp.status === 'approved') {
                        btnText = 'Requested';
                      } else {
                        btnText = 'Request Rejected';
                      }
                    }

                    return (
                      <button
                        onClick={() => handleApply(activeInc.id)}
                        disabled={disabled}
                        style={{
                          width: '100%', padding: '14px', borderRadius: 12,
                          background: disabled
                            ? 'rgba(0,212,255,0.12)'
                            : 'linear-gradient(135deg,#00D4FF 0%,#0099BB 100%)',
                          border: disabled
                            ? '1px solid rgba(0,212,255,0.3)'
                            : 'none',
                          color: disabled ? '#00D4FF' : '#060910',
                          fontFamily: 'DM Sans', fontSize: 14, fontWeight: 800,
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          boxShadow: !disabled ? '0 6px 20px rgba(0,212,255,0.3)' : 'none',
                          transition: 'all 0.2s ease',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {btnText}
                      </button>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEdit && <EditProfileModal onClose={() => setShowEdit(false)} />}
      </AnimatePresence>
    </div>
  );
}
