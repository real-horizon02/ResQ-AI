import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type Role = 'admin' | 'volunteer';

interface RoleSelectionProps {
  onContinue?: (role: Role) => void;
  onSwitch?: () => void;
}

const ROLES: {
  id: Role;
  title: string;
  description: string;
  accentColor: string;
  glowColor: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'admin',
    title: 'Admin',
    description: 'Manage disasters and system',
    accentColor: '#C8A96E',
    glowColor: 'rgba(200, 169, 110, 0.18)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    id: 'volunteer',
    title: 'Volunteer',
    description: 'Help people during emergencies',
    accentColor: '#00E676',
    glowColor: 'rgba(0, 230, 118, 0.18)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];



export const RoleSelection: React.FC<RoleSelectionProps> = ({ onContinue, onSwitch }) => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleContinue = () => {
    if (selectedRole && onContinue) {
      onContinue(selectedRole);
    }
  };

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>


      {/* Cards Grid */}
      <motion.div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
          marginBottom: 40,
        }}
      >
        {ROLES.map((role, index) => {
          const isSelected = selectedRole === role.id;

          return (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedRole(role.id)}
              style={{
                all: 'unset',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '32px 24px',
                borderRadius: 20,
                background: isSelected
                  ? `linear-gradient(135deg, ${role.glowColor}, rgba(255,255,255,0.03))`
                  : 'var(--bg-elevated)',
                border: `1.5px solid ${isSelected ? role.accentColor : 'var(--glass-border)'}`,
                boxShadow: isSelected
                  ? `0 0 32px ${role.glowColor}, 0 8px 24px rgba(0,0,0,0.3)`
                  : '0 4px 16px rgba(0,0,0,0.2)',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Animated top bar on selected */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    key="topbar"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg, transparent, ${role.accentColor}, transparent)`,
                      transformOrigin: 'center',
                      borderRadius: '20px 20px 0 0',
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Check badge */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: role.accentColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#06090F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Icon */}
              <motion.div
                animate={{
                  color: isSelected ? role.accentColor : 'var(--text-muted)',
                  backgroundColor: isSelected ? `${role.glowColor}` : 'rgba(255,255,255,0.04)',
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  border: `1px solid ${isSelected ? role.accentColor + '40' : 'var(--glass-border)'}`,
                  transition: 'all 0.3s ease',
                }}
              >
                {role.icon}
              </motion.div>

              {/* Title */}
              <div
                style={{
                  fontFamily: 'DM Sans',
                  fontWeight: 700,
                  fontSize: 17,
                  color: isSelected ? role.accentColor : 'var(--text-primary)',
                  marginBottom: 8,
                  transition: 'color 0.3s ease',
                }}
              >
                {role.title}
              </div>

              {/* Description */}
              <div
                style={{
                  fontFamily: 'DM Sans',
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}
              >
                {role.description}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <motion.button
          onClick={handleContinue}
          disabled={!selectedRole}
          whileHover={selectedRole ? { scale: 1.03 } : {}}
          whileTap={selectedRole ? { scale: 0.97 } : {}}
          style={{
            fontFamily: 'DM Sans',
            fontWeight: 700,
            fontSize: 15,
            padding: '14px 48px',
            borderRadius: 999,
            border: 'none',
            cursor: selectedRole ? 'pointer' : 'not-allowed',
            background: selectedRole
              ? `linear-gradient(135deg, ${ROLES.find(r => r.id === selectedRole)?.accentColor || '#00D4FF'}, ${ROLES.find(r => r.id === selectedRole)?.accentColor || '#00D4FF'}aa)`
              : 'var(--bg-elevated)',
            color: selectedRole ? '#06090F' : 'var(--text-dim)',
            boxShadow: selectedRole
              ? `0 0 32px ${ROLES.find(r => r.id === selectedRole)?.glowColor || 'rgba(0,212,255,0.3)'}`
              : 'none',
            transition: 'all 0.3s ease',
            opacity: selectedRole ? 1 : 0.5,
          }}
        >
          Continue →
        </motion.button>

        <div style={{ marginTop: 20 }}>
          <span
            style={{
              fontFamily: 'DM Sans',
              fontSize: 13,
              color: 'var(--text-dim)',
            }}
          >
            Already have an account?{' '}
          </span>
          <button
            type="button"
            onClick={onSwitch}
            style={{
              fontFamily: 'DM Sans',
              fontSize: 13,
              color: 'var(--accent-cyan)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Sign in instead →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
