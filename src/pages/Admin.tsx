import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { ACTIVITY_FEED_TEMPLATES, TYPE_EMOJIS } from '../data/mockData';

interface AdminRequest {
  id: string;
  user_id: string;
  status: string;
  requested_at: string;
  profiles: { full_name: string | null; email: string | null; role: string } | null;
}

const SEV_COLORS: Record<string, string> = {
  critical: 'var(--accent-red)', high: 'var(--accent-orange)', medium: '#F59E0B', low: 'var(--text-muted)', resolved: 'var(--accent-green)',
};

function KpiCard({ icon, value, label, trend }: { icon: string; value: string | number; label: string; trend?: string }) {
  return (
    <div className="glass-card-elevated" style={{ padding: 20, flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 36, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      <div className="label-caps" style={{ marginTop: 8 }}>{label}</div>
      {trend && <div style={{ fontSize: 11, color: 'var(--accent-green)', marginTop: 4, fontFamily: 'DM Sans' }}>{trend}</div>}
    </div>
  );
}

function DonutChart({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="var(--text-dim)" strokeWidth="6" />
        <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={`${circ}`} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 45 45)" style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
        <text x="45" y="52" textAnchor="middle" fill="var(--text-primary)" fontFamily="Playfair Display" fontStyle="italic" fontSize="16">{pct}%</text>
      </svg>
      <span className="label-caps">{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const MAP: Record<string, { cls: string; label: string }> = {
    pending: { cls: 'badge-medium', label: 'Pending' },
    verified: { cls: 'badge-live', label: 'Verified' },
    dispatched: { cls: 'badge-high', label: 'Dispatched' },
    resolved: { cls: 'badge-resolved', label: 'Resolved' },
  };
  const cfg = MAP[status] || { cls: 'badge-low', label: status };
  return <span className={cfg.cls}>{cfg.label}</span>;
}

const STATUS_OPTS = ['pending', 'verified', 'dispatched', 'resolved'];

export default function AdminPage() {
  const { incidents, updateIncidentStatus } = useAppStore();
  const { user } = useAuthStore();
  const [feed, setFeed] = useState(ACTIVITY_FEED_TEMPLATES);
  const [editing, setEditing] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);
  const [processingReq, setProcessingReq] = useState<string | null>(null);

  // Fetch pending admin requests
  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from('admin_requests')
        .select('*, profiles(full_name, email, role)')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });
      if (data) setAdminRequests(data as AdminRequest[]);
    };
    fetchRequests();
  }, [user]);

  const handleApproval = async (reqId: string, userId: string, approve: boolean) => {
    setProcessingReq(reqId);
    if (approve) {
      await supabase.from('profiles').update({ role: 'admin', admin_approved: true }).eq('id', userId);
    }
    await supabase.from('admin_requests').update({
      status: approve ? 'approved' : 'rejected',
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', reqId);
    setAdminRequests(r => r.filter(x => x.id !== reqId));
    setProcessingReq(null);
  };

  // Simulate live feed entries at intervals
  useEffect(() => {
    const msgs = [
      '⚡ AI model flagged RSQ-010 for escalation — M5.4 aftershock',
      '🟢 Volunteer Ankita Roy accepted task RSQ-009',
      '📡 USGS stream: 3 micro-seismic events in last 10 min',
    ];
    let idx = 0;
    const timer = setInterval(() => {
      setFeed(f => [
        { id: `live-${Date.now()}`, type: 'data', message: msgs[idx % msgs.length], timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
        ...f.slice(0, 9),
      ]);
      idx++;
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const total = incidents.length;
  const critical = incidents.filter(i => i.severity === 'critical');
  const resolved = incidents.filter(i => i.status === 'resolved');
  const dispatched = incidents.filter(i => i.status === 'dispatched');

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 100, paddingLeft: 'clamp(24px,4vw,48px)', paddingRight: 'clamp(24px,4vw,48px)', paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 'clamp(40px,6vw,80px)', color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>command</h1>
            <div style={{ fontFamily: 'DM Sans', fontWeight: 300, fontSize: 'clamp(32px,4vw,56px)', color: 'var(--text-muted)', lineHeight: 1 }}>center</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', animation: 'pulse-dot 2s infinite' }} />
            <span className="label-caps" style={{ color: 'var(--accent-green)' }}>All Systems Nominal</span>
          </div>
        </div>

        {/* KPI row */}
        <div className="kpi-row" style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <KpiCard icon="🚨" value={total} label="Total Incidents" trend="+2 this hour" />
          <KpiCard icon="🔴" value={critical.length} label="Critical Active" />
          <KpiCard icon="⚡" value={dispatched.length} label="Dispatched" trend="4 en route" />
          <KpiCard icon="✅" value={resolved.length} label="Resolved" trend="+1 today" />
          <KpiCard icon="👥" value="4" label="Volunteers Available" />
          <KpiCard icon="⏱️" value="4.2m" label="Avg Response" trend="↓ from 5.1m" />
        </div>

        {/* Main content */}
        <div className="admin-grid" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Left: Incident table */}
          <div style={{ flex: '0 0 62%', minWidth: 0 }}>
            <div className="glass-card-elevated" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="label-caps">INCIDENT QUEUE</span>
                <span className="badge-live" style={{ animation: 'pulse-dot 2s infinite' }}>● LIVE</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      {['ID', 'Incident', 'Location', 'Severity', 'Status', 'Affected'].map(h => (
                        <th key={h} style={{ padding: '8px 16px', fontFamily: 'DM Sans', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((inc) => (
                      <motion.tr key={inc.id} layout
                        style={{ borderBottom: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'background 0.15s ease' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{inc.id}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 4, height: 36, borderRadius: 2, background: SEV_COLORS[inc.severity], flexShrink: 0 }} />
                            <span style={{ fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                              {TYPE_EMOJIS[inc.type]} {inc.title.split('—')[0].trim()}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{inc.state}</td>
                        <td style={{ padding: '12px 16px' }}><span className={`badge-${inc.severity}`}>{inc.severity}</span></td>
                        <td style={{ padding: '12px 16px' }}>
                          {editing === inc.id ? (
                            <select
                              value={inc.status}
                              onChange={(e) => { updateIncidentStatus(inc.id, e.target.value as any); setEditing(null); }}
                              onBlur={() => setEditing(null)}
                              autoFocus
                              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 6, padding: '4px 8px', color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: 11, cursor: 'pointer' }}
                            >
                              {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          ) : (
                            <div onClick={() => setEditing(inc.id)} style={{ cursor: 'pointer' }}>
                              <StatusBadge status={inc.status} />
                              <span style={{ fontSize: 9, color: 'var(--text-dim)', marginLeft: 4 }}>✎</span>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--accent-orange)', whiteSpace: 'nowrap' }}>👥 {inc.peopleAffected.toLocaleString()}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Donut charts */}
            <div className="glass-card" style={{ padding: 24, marginTop: 24, display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
              <DonutChart pct={Math.round((critical.length / total) * 100)} color="var(--accent-red)" label="Critical" />
              <DonutChart pct={Math.round((dispatched.length / total) * 100)} color="var(--accent-orange)" label="Active" />
              <DonutChart pct={Math.round((resolved.length / total) * 100)} color="var(--accent-green)" label="Resolved" />
              <DonutChart pct={87} color="var(--accent-cyan)" label="AI Accuracy" />
            </div>
          </div>

          {/* Right: Live activity feed */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="glass-card-elevated" style={{ height: 520, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="label-caps">LIVE ACTIVITY</span>
                <span className="badge-live" style={{ animation: 'pulse-dot 2s infinite' }}>● LIVE</span>
              </div>
              <div ref={feedRef} style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {feed.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '10px 12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 10 }}
                  >
                    <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.4 }}>{entry.message}</p>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-dim)' }}>{entry.timestamp}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Approval Queue */}
        {adminRequests.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div className="glass-card-elevated" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="label-caps">Admin Access Requests</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(200,169,110,0.1)', color: 'var(--accent-gold)', border: '1px solid rgba(200,169,110,0.2)' }}>{adminRequests.length} pending</span>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {adminRequests.map(req => (
                  <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 12, gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 14, color: 'var(--bg)' }}>
                          {req.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                        </span>
                      </div>
                      <div>
                        <p style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>{req.profiles?.full_name || 'Unknown'}</p>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-muted)', margin: '3px 0 0' }}>{req.profiles?.email} · <span style={{ textTransform: 'capitalize' }}>{req.profiles?.role || 'citizen'}</span></p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                      <button
                        onClick={() => handleApproval(req.id, req.user_id, true)}
                        disabled={processingReq === req.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: 'rgba(0,230,118,0.1)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleApproval(req.id, req.user_id, false)}
                        disabled={processingReq === req.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: 'rgba(255,45,45,0.08)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
