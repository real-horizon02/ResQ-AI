import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (msg: string) => useToastStore.getState().addToast('success', msg),
  error: (msg: string) => useToastStore.getState().addToast('error', msg),
  warning: (msg: string) => useToastStore.getState().addToast('warning', msg),
  info: (msg: string) => useToastStore.getState().addToast('info', msg),
};

const typeConfig = {
  success: { icon: CheckCircle, color: 'var(--accent-green)', bg: 'rgba(0,230,118,0.08)', border: 'rgba(0,230,118,0.25)' },
  error: { icon: XCircle, color: 'var(--accent-red)', bg: 'rgba(255,45,45,0.08)', border: 'rgba(255,45,45,0.25)' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  info: { icon: Info, color: 'var(--accent-cyan)', bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.25)' },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 600, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
      <AnimatePresence>
        {toasts.map((t) => {
          const cfg = typeConfig[t.type];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={t.id}
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 80, opacity: 0, transition: { duration: 0.2 } }}
              style={{
                pointerEvents: 'all', display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 18px',
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderRadius: 12,
                backdropFilter: 'blur(24px)',
                minWidth: 280, maxWidth: 380,
              }}
            >
              <Icon size={18} color={cfg.color} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, fontFamily: 'DM Sans', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {t.message}
              </span>
              <button
                onClick={() => removeToast(t.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex' }}
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
