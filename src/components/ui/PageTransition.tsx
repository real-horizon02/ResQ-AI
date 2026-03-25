import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface Props { children: ReactNode; }

export function PageTransition({ children }: Props) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
