import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { AdminNavbar } from '../components/AdminNavbar';
import { AlertTriangle, Check, X, Shield, Activity, Terminal } from 'lucide-react';
import { toast } from '../components/ui/Toast';

type TabType = 'CMD_CENTER' | 'ACTIVE_RESCUES' | 'NETWORK_NODES' | 'ACCESS_LOGS' | 'INVITE_ADMIN' | 'AUDIT_TRAIL';

const TABS: TabType[] = ['CMD_CENTER', 'ACTIVE_RESCUES', 'NETWORK_NODES', 'ACCESS_LOGS', 'INVITE_ADMIN', 'AUDIT_TRAIL'];

const MOCK_ACCESS_LOGS = [
  { id: 1, time: '2026-06-02T16:55:01Z', user: 'system_auth', ip: '192.168.1.104', status: 'GRANTED', location: 'NODE_ALPHA' },
  { id: 2, time: '2026-06-02T16:42:12Z', user: 'admin_kshitij', ip: '10.0.4.22', status: 'GRANTED', location: 'HQ_SECURE' },
  { id: 3, time: '2026-06-02T16:15:33Z', user: 'unknown', ip: '45.22.11.9', status: 'DENIED', location: 'EXTERNAL' },
  { id: 4, time: '2026-06-02T15:30:00Z', user: 'vol_divya', ip: '172.16.0.5', status: 'GRANTED', location: 'FIELD_OP' },
];

const MOCK_AUDIT = [
  { id: 1, time: '2026-06-02T16:50:00Z', action: 'RLS_POLICY_UPDATE', entity: 'public.profiles', by: 'admin_kshitij' },
  { id: 2, time: '2026-06-02T16:45:22Z', action: 'STATUS_CHANGE', entity: 'RSQ-010', by: 'system_auto' },
  { id: 3, time: '2026-06-02T16:30:11Z', action: 'VOLUNTEER_DISPATCH', entity: 'RSQ-001 -> b787634d', by: 'admin_kshitij' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ACTIVE_RESCUES');
  const [volunteerApps, setVolunteerApps] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [appsError, setAppsError] = useState<string | null>(null);
  const [volsError, setVolsError] = useState<string | null>(null);
  const [processingReq, setProcessingReq] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');

  // Parse URL search params
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'volunteers') setActiveTab('NETWORK_NODES');
    else if (tab === 'requests') setActiveTab('ACTIVE_RESCUES');
    else if (tab === 'logs') setActiveTab('ACCESS_LOGS');
  }, [location.search]);

  const updateUrl = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'NETWORK_NODES') navigate('/admin?tab=volunteers', { replace: true });
    else if (tab === 'ACTIVE_RESCUES') navigate('/admin?tab=requests', { replace: true });
    else if (tab === 'ACCESS_LOGS') navigate('/admin?tab=logs', { replace: true });
    else navigate('/admin', { replace: true });
  };

  // Real-time Fetching
  useEffect(() => {
    const fetchApplications = async () => {
      const { data, error } = await supabase
        .from('volunteer_applications')
        .select('id, incident_id, status, applied_at, profiles(id, full_name, email)')
        .eq('status', 'pending')
        .order('applied_at', { ascending: false });
      if (error) setAppsError(error.message);
      else setVolunteerApps(data || []);
    };

    const fetchVolunteers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'volunteer');
      if (error) setVolsError(error.message);
      else setVolunteers(data || []);
    };

    fetchApplications();
    fetchVolunteers();

    // Setup Supabase Realtime Subscriptions
    const appsChannel = supabase.channel('volunteer_applications_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'volunteer_applications' }, () => {
        fetchApplications();
      })
      .subscribe();

    const profilesChannel = supabase.channel('profiles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchVolunteers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(appsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  const handleRescueApp = async (appId: string, status: 'approved' | 'rejected') => {
    setProcessingReq(appId);
    try {
      await supabase.from('volunteer_applications').update({ status }).eq('id', appId);
      toast.success(`Application ${status} successfully.`);
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
    setProcessingReq(null);
  };

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setProcessingReq('invite');
    
    try {
      await supabase.from('admin_requests').insert({
        status: 'invited',
        requested_at: new Date().toISOString()
      });
      toast.success(`Admin invitation dispatched to ${inviteEmail}`);
      setInviteEmail('');
    } catch (err) {
      toast.error('Failed to send invitation.');
    }
    
    setProcessingReq(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#040508',
      backgroundImage: `
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      color: '#e2e8f0',
      position: 'relative'
    }}>
      <AdminNavbar />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px' }}>
        
        {/* Terminal Sub-navigation */}
        <div style={{
          display: 'flex', gap: 40, borderBottom: '1px solid #1a1e24',
          overflowX: 'auto', paddingTop: 32, paddingBottom: 0
        }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => updateUrl(tab)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #d4af37' : '2px solid transparent',
                color: activeTab === tab ? '#d4af37' : '#475569',
                fontFamily: 'JetBrains Mono',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.05em',
                padding: '0 0 16px 0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              [{tab}]
            </button>
          ))}
        </div>

        {/* Header Section */}
        <div style={{ padding: '60px 0 40px', borderBottom: '1px solid #1a1e24' }}>
          <h1 style={{
            fontFamily: 'Playfair Display', fontStyle: 'italic',
            fontSize: 64, fontWeight: 700, color: '#fff', margin: 0,
            letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: 12
          }}>
            Operations.
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D4FF', display: 'inline-block' }} />
          </h1>
        </div>

        {/* Content Area */}
        <div style={{ padding: '40px 0' }}>
          
          <AnimatePresence mode="wait">
            {activeTab === 'ACTIVE_RESCUES' && (
              <motion.div
                key="rescues"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h2 style={{
                  fontFamily: 'DM Sans', fontSize: 18, color: '#d4af37',
                  fontWeight: 500, margin: '0 0 40px 0'
                }}>
                  Volunteer Rescue Applications
                </h2>

                {appsError ? (
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: '#ef4444' }}>
                    [DB_ERROR] {appsError}
                  </p>
                ) : volunteerApps.length === 0 ? (
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: '#475569' }}>
                    No volunteer applications pending.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#1a1e24' }}>
                    {/* Table Header */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr 100px', gap: 16,
                      background: '#040508', padding: '16px 0',
                      fontFamily: 'JetBrains Mono', fontSize: 11, color: '#8892b0', textTransform: 'uppercase'
                    }}>
                      <div>Ref ID</div>
                      <div>Incident</div>
                      <div>Volunteer</div>
                      <div>Time</div>
                      <div style={{ textAlign: 'right' }}>Actions</div>
                    </div>

                    {/* Rows */}
                    {volunteerApps.map((app: any) => (
                      <div key={app.id} style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr 100px', gap: 16, alignItems: 'center',
                        background: '#040508', padding: '16px 0', borderBottom: '1px solid #1a1e24',
                        fontFamily: 'DM Sans', fontSize: 14, color: '#e2e8f0'
                      }}>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#64748b' }}>
                          {app.id.split('-')[0]}
                        </div>
                        <div style={{ color: '#00D4FF', fontFamily: 'JetBrains Mono', fontSize: 13 }}>
                          {app.incident_id}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{app.profiles?.full_name || app.volunteerName || 'Unknown User'}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{app.profiles?.email || 'N/A'}</div>
                        </div>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#64748b' }}>
                          {app.applied_at ? new Date(app.applied_at).toLocaleTimeString() : '12:00 PM'}
                        </div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleRescueApp(app.id, 'approved')}
                            disabled={processingReq === app.id}
                            style={{
                              width: 32, height: 32, borderRadius: 0,
                              background: 'transparent', border: '1px solid #22c55e', color: '#22c55e',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => handleRescueApp(app.id, 'rejected')}
                            disabled={processingReq === app.id}
                            style={{
                              width: 32, height: 32, borderRadius: 0,
                              background: 'transparent', border: '1px solid #ef4444', color: '#ef4444',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'NETWORK_NODES' && (
              <motion.div
                key="nodes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h2 style={{
                  fontFamily: 'DM Sans', fontSize: 18, color: '#d4af37',
                  fontWeight: 500, margin: '0 0 40px 0'
                }}>
                  Network Nodes (Active Volunteers)
                </h2>

                {volsError ? (
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: '#ef4444' }}>
                    [DB_ERROR] {volsError}
                  </p>
                ) : volunteers.length === 0 ? (
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: '#475569' }}>
                    No registered volunteers found on the network.
                    <br /><br />
                    <span style={{ color: '#ef4444' }}>[ERR] Connection refused or RLS policy active. Run fix_profiles_rls.sql.</span>
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                    {volunteers.map((vol: any) => (
                      <div key={vol.id} style={{
                        padding: 24, border: '1px solid #1a1e24', background: 'rgba(4,5,8,0.8)',
                        display: 'flex', flexDirection: 'column', gap: 16
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontFamily: 'DM Sans', fontSize: 16, fontWeight: 600, color: '#fff' }}>
                              {vol.full_name || vol.name}
                            </div>
                            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#64748b', marginTop: 4 }}>
                              ID: {vol.id.split('-')[0]}
                            </div>
                          </div>
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
                            boxShadow: '0 0 10px #22c55e'
                          }} />
                        </div>
                        
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#cbd5e1' }}>
                          {vol.email}
                        </div>

                        {vol.skills && vol.skills.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 'auto' }}>
                            {vol.skills.map((skill: string) => (
                              <span key={skill} style={{
                                padding: '2px 8px', border: '1px solid #334155', color: '#94a3b8',
                                fontFamily: 'JetBrains Mono', fontSize: 10, textTransform: 'uppercase'
                              }}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'CMD_CENTER' && (
              <motion.div key="cmd" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 style={{ fontFamily: 'DM Sans', fontSize: 18, color: '#d4af37', fontWeight: 500, margin: '0 0 40px 0' }}>System Overview</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
                  <div style={{ padding: 24, border: '1px solid #1a1e24', background: '#040508' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#64748b', marginBottom: 16 }}>SYSTEM_STATUS</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#22c55e', fontFamily: 'JetBrains Mono', fontSize: 24 }}>
                      <Activity size={24} /> OPTIMAL
                    </div>
                  </div>
                  <div style={{ padding: 24, border: '1px solid #1a1e24', background: '#040508' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#64748b', marginBottom: 16 }}>ACTIVE_CONNECTIONS</div>
                    <div style={{ color: '#fff', fontFamily: 'JetBrains Mono', fontSize: 24 }}>1,024</div>
                  </div>
                  <div style={{ padding: 24, border: '1px solid #1a1e24', background: '#040508' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#64748b', marginBottom: 16 }}>THREAT_LEVEL</div>
                    <div style={{ color: '#d4af37', fontFamily: 'JetBrains Mono', fontSize: 24 }}>ELEVATED</div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'ACCESS_LOGS' && (
              <motion.div key="logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 style={{ fontFamily: 'DM Sans', fontSize: 18, color: '#d4af37', fontWeight: 500, margin: '0 0 40px 0' }}>Access Logs</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#1a1e24' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 16, background: '#040508', padding: '16px', fontFamily: 'JetBrains Mono', fontSize: 11, color: '#8892b0' }}>
                    <div>TIMESTAMP</div><div>USER</div><div>IP_ADDR</div><div>LOCATION</div><div>STATUS</div>
                  </div>
                  {MOCK_ACCESS_LOGS.map(log => (
                    <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 16, background: '#040508', padding: '16px', fontFamily: 'JetBrains Mono', fontSize: 12, color: '#e2e8f0', borderBottom: '1px solid #1a1e24' }}>
                      <div style={{ color: '#64748b' }}>{log.time}</div>
                      <div>{log.user}</div>
                      <div style={{ color: '#00D4FF' }}>{log.ip}</div>
                      <div>{log.location}</div>
                      <div style={{ color: log.status === 'GRANTED' ? '#22c55e' : '#ef4444' }}>[{log.status}]</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'AUDIT_TRAIL' && (
              <motion.div key="audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 style={{ fontFamily: 'DM Sans', fontSize: 18, color: '#d4af37', fontWeight: 500, margin: '0 0 40px 0' }}>Audit Trail</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#1a1e24' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, background: '#040508', padding: '16px', fontFamily: 'JetBrains Mono', fontSize: 11, color: '#8892b0' }}>
                    <div>TIMESTAMP</div><div>ACTION</div><div>ENTITY</div><div>EXECUTED_BY</div>
                  </div>
                  {MOCK_AUDIT.map(log => (
                    <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, background: '#040508', padding: '16px', fontFamily: 'JetBrains Mono', fontSize: 12, color: '#e2e8f0', borderBottom: '1px solid #1a1e24' }}>
                      <div style={{ color: '#64748b' }}>{log.time}</div>
                      <div style={{ color: '#d4af37' }}>{log.action}</div>
                      <div>{log.entity}</div>
                      <div style={{ color: '#00D4FF' }}>{log.by}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'INVITE_ADMIN' && (
              <motion.div key="invite" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 style={{ fontFamily: 'DM Sans', fontSize: 18, color: '#d4af37', fontWeight: 500, margin: '0 0 40px 0' }}>Grant Admin Access</h2>
                <div style={{ maxWidth: 600, padding: 32, border: '1px solid #1a1e24', background: '#040508' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, color: '#e2e8f0' }}>
                    <Shield size={24} color="#d4af37" />
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14 }}>AUTHORIZATION_REQUIRED</span>
                  </div>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
                    Enter the email address of the operative you wish to elevate to Level 4 (Admin) clearance. 
                    An encrypted invitation link will be dispatched via secure channels.
                  </p>
                  <form onSubmit={handleInviteAdmin} style={{ display: 'flex', gap: 16 }}>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="operative@resq.ai"
                      style={{
                        flex: 1, background: 'transparent', border: '1px solid #1a1e24',
                        padding: '12px 16px', color: '#fff', fontFamily: 'JetBrains Mono', fontSize: 14,
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={processingReq === 'invite'}
                      style={{
                        background: '#d4af37', color: '#000', border: 'none', padding: '0 24px',
                        fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8
                      }}
                    >
                      <Terminal size={16} />
                      {processingReq === 'invite' ? 'SENDING...' : 'DISPATCH'}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Floating SOS button */}
      <button style={{
        position: 'fixed', bottom: 40, right: 40,
        width: 64, height: 64, borderRadius: '50%',
        background: '#ef4444', border: '2px solid #fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', cursor: 'pointer',
        boxShadow: '0 0 40px rgba(239, 68, 68, 0.4)',
        zIndex: 100
      }}>
        <AlertTriangle size={24} strokeWidth={2.5} />
      </button>

    </div>
  );
}
