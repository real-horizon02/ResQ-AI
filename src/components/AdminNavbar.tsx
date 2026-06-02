import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Shield, LayoutDashboard, Users, FileText, Activity, Bell, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function AdminNavbar() {
  const location = useLocation();
  const { user, profile } = useAuthStore();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Volunteers', path: '/admin?tab=volunteers', icon: Users },
    { name: 'Requests', path: '/admin?tab=requests', icon: FileText },
    { name: 'Logs', path: '/admin?tab=logs', icon: Activity },
  ];

  return (
    <div style={{
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      background: '#040508',
      borderBottom: '1px solid #1a1e24',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Brand */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none' }}>
        <div style={{
          width: 32, height: 32,
          background: '#d4af37',
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#000'
        }}>
          <Shield size={18} fill="#000" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontFamily: 'Playfair Display',
            fontStyle: 'italic',
            fontSize: 24,
            color: '#fff',
            fontWeight: 700,
            letterSpacing: '0.02em'
          }}>
            ResQ AI
          </span>
          <span style={{
            fontFamily: 'JetBrains Mono',
            fontSize: 10,
            color: '#d4af37',
            border: '1px solid #d4af37',
            padding: '2px 8px',
            borderRadius: 999,
            fontWeight: 700,
            letterSpacing: '0.1em'
          }}>
            ADMIN
          </span>
        </div>
      </Link>

      {/* Navigation */}
      <nav style={{ display: 'flex', gap: 8 }}>
        {navLinks.map((link) => {
          const isActive = location.search ? location.search.includes(link.path.split('?')[1]) : link.path === '/admin';
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              to={link.path}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px',
                borderRadius: 8,
                color: isActive ? '#d4af37' : '#8892b0',
                background: isActive ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                textDecoration: 'none',
                fontFamily: 'DM Sans',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={14} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* User & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <button style={{
          background: 'transparent', border: '1px solid #1a1e24',
          width: 36, height: 36, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#8892b0', cursor: 'pointer'
        }}>
          <Bell size={16} />
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '6px 16px 6px 6px',
          border: '1px solid #1a1e24',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.02)'
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: '#d4af37', color: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 700
          }}>
            {profile?.full_name?.substring(0, 2).toUpperCase() || 'KC'}
          </div>
          <span style={{ fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
            {profile?.full_name?.split(' ')[0] || 'Kshitij'}
          </span>
        </div>

        <button
          onClick={handleSignOut}
          style={{
            background: 'transparent', border: '1px solid #1a1e24',
            width: 36, height: 36, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#8892b0', cursor: 'pointer'
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
