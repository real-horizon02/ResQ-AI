import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { message } from 'antd';
import { RoleSelection, Role } from '../components/RoleSelection';
import { useAuthStore } from '../store/useAuthStore';
import { Logo } from '../components/ui/Logo';

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const { user, createProfileWithRole } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleRoleSelection = async (selectedRole: Role) => {
    setLoading(true);
    try {
      await createProfileWithRole(selectedRole);
      
      if (selectedRole === 'volunteer') {
        // Redirect to volunteer onboarding
        navigate('/volunteer-onboarding');
      } else if (selectedRole === 'admin') {
        // Redirect to admin dashboard  
        navigate('/admin');
      } else {
        // Redirect to home for citizens
        navigate('/');
      }
    } catch (error: any) {
      message.error({
        content: error.message || 'Failed to create profile. Please try again.',
        style: { fontFamily: 'DM Sans' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToAuth = () => {
    navigate('/auth');
  };

  // If user is not logged in, redirect to auth
  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px 24px'
    }}>
      {/* Background gradient */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 20%, rgba(0,212,255,0.03) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--glass-border)',
          borderRadius: 24,
          padding: '48px 40px',
          maxWidth: 600,
          width: '100%',
          position: 'relative',
          boxShadow: '0 24px 80px rgba(0,0,0,0.12)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}
          >
            <Logo className="w-12 h-12" />
            <h1 style={{ 
              fontFamily: 'Playfair Display', 
              fontStyle: 'italic', 
              fontSize: 32, 
              color: 'var(--text-primary)', 
              margin: 0 
            }}>
              ResQ<span style={{ color: 'var(--accent-red)' }}>AI</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="label-caps-gold" style={{ display: 'block', marginBottom: 12 }}>
              [ CHOOSE YOUR ROLE ]
            </span>
            <h2 style={{ 
              fontFamily: 'Playfair Display', 
              fontStyle: 'italic', 
              fontSize: 36, 
              color: 'var(--text-primary)', 
              margin: '0 0 16px',
              lineHeight: 1.2
            }}>
              How do you want to help?
            </h2>
            <p style={{ 
              fontFamily: 'DM Sans', 
              fontSize: 15, 
              color: 'var(--text-muted)', 
              lineHeight: 1.6,
              maxWidth: 420,
              margin: '0 auto'
            }}>
              Choose your role to get started with India's emergency response network. 
              You can always update this later in your profile settings.
            </p>
          </motion.div>
        </div>

        {/* Role Selection Component */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}
        >
          <RoleSelection
            onContinue={handleRoleSelection}
            onSwitch={handleBackToAuth}
          />
        </motion.div>

        {/* Welcome message with user info */}
        {user?.email && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              marginTop: 32,
              padding: '16px 20px',
              background: 'rgba(0,212,255,0.04)',
              border: '1px solid rgba(0,212,255,0.1)',
              borderRadius: 12,
              textAlign: 'center'
            }}
          >
            <p style={{ 
              fontFamily: 'DM Sans', 
              fontSize: 13, 
              color: 'var(--text-muted)', 
              margin: 0 
            }}>
              Welcome, <span style={{ color: 'var(--accent-cyan)' }}>{user.email}</span>! 
              Your account has been created successfully.
            </p>
          </motion.div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(13, 21, 37, 0.8)',
            borderRadius: 24
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: 'radar-sweep 0.8s linear infinite' }}>
                <circle cx="10" cy="10" r="8" stroke="var(--accent-cyan)" strokeWidth="2" opacity="0.3" />
                <path d="M10 2A8 8 0 0 1 18 10" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'var(--text-muted)' }}>
                Setting up your profile...
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}