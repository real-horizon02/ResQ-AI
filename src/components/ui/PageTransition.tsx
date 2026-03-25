import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface Props { children: ReactNode; }

const overlayVariants = {
  initial: { y: '-100%' },
  animate: { y: '0%', transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] } },
  exit: { y: '100%', transition: { duration: 0.35, ease: [0.76, 0, 0.24, 1] } },
};

const contentVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.35 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export function PageTransition({ children }: Props) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname}>
        {/* Dark overlay */}
        <motion.div
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 500, pointerEvents: 'none' }}
        >
          {/* Red racing line */}
          <motion.div
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={{ scaleX: 1, transition: { duration: 0.35, ease: 'linear', delay: 0.05 } }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--accent-red)' }}
          />
        </motion.div>
        {/* Page content */}
        <motion.div variants={contentVariants} initial="initial" animate="animate" exit="exit">
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
