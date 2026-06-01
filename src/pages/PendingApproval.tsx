import { motion } from 'framer-motion';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export default function PendingApproval() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 80px)',
          padding: '0 24px',
          paddingTop: 80,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card"
          style={{
            maxWidth: 480,
            width: '100%',
            padding: '48px 32px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Glow */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 200,
              height: 200,
              background: 'var(--accent-gold)',
              filter: 'blur(100px)',
              opacity: 0.15,
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(200, 169, 110, 0.1)',
              border: '1px solid rgba(200, 169, 110, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px',
            }}
          >
            <ShieldAlert size={40} color="var(--accent-gold)" />
          </motion.div>

          <h1
            style={{
              fontFamily: 'Playfair Display',
              fontStyle: 'italic',
              fontSize: 32,
              color: 'var(--text-primary)',
              margin: '0 0 16px',
            }}
          >
            Application under review
          </h1>

          <p
            style={{
              fontFamily: 'DM Sans',
              fontSize: 16,
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              margin: '0 0 32px',
            }}
          >
            Thank you for stepping up to help. Your volunteer application has been securely sent to our administrators and is currently being verified.
            <br /><br />
            You will be granted access to the volunteer hub as soon as you are approved.
          </p>

          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--glass)',
              border: '1px solid var(--glass-border)',
              padding: '12px 24px',
              borderRadius: 999,
              fontFamily: 'DM Sans',
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-cyan)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--glass-border)';
            }}
          >
            Return to Home <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
