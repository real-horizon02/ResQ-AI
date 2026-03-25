---
wave: 2
depends_on: [01-PLAN-design-system]
files_modified:
  - src/components/ui/CustomCursor.tsx
  - src/components/ui/PageTransition.tsx
  - src/components/ui/Toast.tsx
  - src/components/ui/FloatingSOS.tsx
  - src/components/ui/OfflineBanner.tsx
  - src/hooks/useLenis.ts
  - src/hooks/useMagneticButton.ts
  - src/hooks/useTextReveal.ts
  - src/hooks/useNumberCounter.ts
  - src/hooks/useStaggeredReveal.ts
  - src/main.tsx
  - src/App.tsx
autonomous: true
requirements_addressed: [ANIM-01, ANIM-02, ANIM-04, ANIM-08, COMP-01, COMP-02, COMP-03]
---

# Plan 02: Global Components & Animation Infrastructure

## Objective
Build all reusable global components and animation hooks. These underpin every page. Must be complete and functional before page work begins.

## must_haves
- [ ] Custom cursor component renders on all pages (desktop only, hidden on touch)
- [ ] Page transition overlay works on route change (dark panel slides + red line)
- [ ] Lenis smooth scroll initialized and running
- [ ] Toast system works (4 types, slide from right, auto-dismiss 4s)
- [ ] Floating SOS button renders on all pages except /sos, routes to /sos
- [ ] Offline banner appears/disappears based on `navigator.onLine`
- [ ] Magnetic button hook works (30% cursor offset within 80px)
- [ ] Text reveal hook splits words and triggers on IntersectionObserver

## Tasks

### Task 1: Install Lenis

<read_first>
- package.json
</read_first>

<action>
Run: `npm install @studio-freight/lenis`
Then create `src/hooks/useLenis.ts`:
```tsx
import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.075, smoothWheel: true });
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
}
```
</action>

<acceptance_criteria>
- `package.json` contains `@studio-freight/lenis`
- `src/hooks/useLenis.ts` exists and contains `new Lenis`
</acceptance_criteria>

---

### Task 2: Custom Cursor component

<read_first>
- src/index.css
</read_first>

<action>
Create `src/components/ui/CustomCursor.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const actual = useRef({ x: 0, y: 0 });
  const [hoverType, setHoverType] = useState<'default' | 'link' | 'sos' | 'map'>('default');
  const [label, setLabel] = useState('');

  useEffect(() => {
    // Disable on touch devices
    if ('ontouchstart' in window) return;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      const target = e.target as HTMLElement;
      if (target.closest('[data-cursor="sos"]')) { setHoverType('sos'); setLabel(''); }
      else if (target.closest('[data-cursor="map"]')) { setHoverType('map'); setLabel('EXPLORE'); }
      else if (target.closest('a, button, [role="button"]')) { setHoverType('link'); setLabel(''); }
      else { setHoverType('default'); setLabel(''); }
    };

    window.addEventListener('mousemove', onMouseMove);

    let raf: number;
    function animate() {
      actual.current.x = lerp(actual.current.x, pos.current.x, 0.1);
      actual.current.y = lerp(actual.current.y, pos.current.y, 0.1);
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${actual.current.x}px, ${actual.current.y}px)`;
      }
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const size = hoverType === 'link' || hoverType === 'map' ? 52 : 10;
  const bg = hoverType === 'sos' ? 'var(--accent-red)' : 'var(--accent-cyan)';
  const blend = hoverType === 'link' ? 'difference' : 'normal';

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none',
        width: size, height: size, borderRadius: '50%',
        background: bg, mixBlendMode: blend as any,
        marginLeft: -size / 2, marginTop: -size / 2,
        transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1), height 0.3s cubic-bezier(0.16,1,0.3,1), background 0.3s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: hoverType === 'sos' ? 'pulse-dot 1s ease-in-out infinite' : 'none',
      }}
    >
      {label && <span style={{ fontSize: 9, fontFamily: 'DM Sans', fontWeight: 700, letterSpacing: '0.1em', color: '#000', userSelect: 'none' }}>{label}</span>}
    </div>
  );
}
```
</action>

<acceptance_criteria>
- `src/components/ui/CustomCursor.tsx` exists
- File contains `lerp(` function for smooth movement
- File contains `ontouchstart` touch device check
- File contains `hoverType === 'sos'` check
</acceptance_criteria>

---

### Task 3: Page Transition component (Framer Motion)

<read_first>
- src/App.tsx
- package.json
</read_first>

<action>
Create `src/components/ui/PageTransition.tsx`:
```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface Props { children: ReactNode; }

const overlayVariants = {
  initial: { y: '-100%' },
  animate: { y: '0%', transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] } },
  exit: { y: '100%', transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] } },
};

const contentVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export function PageTransition({ children }: Props) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname}>
        {/* Dark overlay with red racing line */}
        <motion.div
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 500, pointerEvents: 'none' }}
        >
          <motion.div
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={{ scaleX: 1, transition: { duration: 0.4, ease: 'linear', delay: 0.1 } }}
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
```
</action>

<acceptance_criteria>
- `src/components/ui/PageTransition.tsx` exists
- File contains `AnimatePresence` import
- File contains `y: '-100%'` for overlay slide
- File contains `AccentRed` racing line (`var(--accent-red)` + `scaleX`)
</acceptance_criteria>

---

### Task 4: Toast notification system

<read_first>
- src/index.css (check animation classes)
</read_first>

<action>
Create `src/components/ui/Toast.tsx`:
```tsx
import { create } from 'zustand';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast { id: string; type: ToastType; message: string; }

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
  success: { icon: CheckCircle, color: '#00E676', bg: 'rgba(0,230,118,0.1)' },
  error: { icon: XCircle, color: '#FF2D2D', bg: 'rgba(255,45,45,0.1)' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  info: { icon: Info, color: '#00D4FF', bg: 'rgba(0,212,255,0.1)' },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 600, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <AnimatePresence>
        {toasts.map((t) => {
          const cfg = typeConfig[t.type];
          const Icon = cfg.icon;
          return (
            <motion.div key={t.id}
              initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: cfg.bg, border: `1px solid ${cfg.color}40`, borderRadius: 12, backdropFilter: 'blur(24px)', minWidth: 280, maxWidth: 380 }}
            >
              <Icon size={18} color={cfg.color} />
              <span style={{ flex: 1, fontSize: 14, fontFamily: 'DM Sans', color: 'var(--text-primary)' }}>{t.message}</span>
              <button onClick={() => removeToast(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
```
</action>

<acceptance_criteria>
- `src/components/ui/Toast.tsx` exists
- File contains `useToastStore` Zustand store
- File contains `addToast` with `setTimeout` 4000ms
- File contains `AnimatePresence` for slide-in animation
- File exports `toast.success`, `toast.error`, `toast.warning`, `toast.info`
</acceptance_criteria>

---

### Task 5: Floating SOS button

<read_first>
- src/index.css (check .floating-sos class)
</read_first>

<action>
Create `src/components/ui/FloatingSOS.tsx`:
```tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export function FloatingSOS() {
  const navigate = useNavigate();
  const location = useLocation();
  if (location.pathname === '/sos') return null;
  return (
    <button className="floating-sos" onClick={() => navigate('/sos')} data-cursor="sos" aria-label="Send SOS Emergency Report">
      <AlertTriangle size={24} color="#fff" />
    </button>
  );
}
```
</action>

<acceptance_criteria>
- `src/components/ui/FloatingSOS.tsx` exists
- File contains `location.pathname === '/sos'` guard
- File contains `data-cursor="sos"` attribute
- File contains `navigate('/sos')`
</acceptance_criteria>

---

### Task 6: Offline banner

<read_first>
- src/index.css
</read_first>

<action>
Create `src/components/ui/OfflineBanner.tsx`:
```tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div initial={{ y: -60 }} animate={{ y: 0 }} exit={{ y: -60 }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 450, background: 'rgba(245,158,11,0.15)', borderBottom: '1px solid rgba(245,158,11,0.3)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '10px 24px' }}
        >
          <WifiOff size={16} color="#F59E0B" />
          <span style={{ fontSize: 13, fontFamily: 'DM Sans', fontWeight: 500, color: '#F59E0B' }}>
            📵 Offline — ResQ AI running in resilient mode
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```
</action>

<acceptance_criteria>
- `src/components/ui/OfflineBanner.tsx` exists
- File contains `navigator.onLine`
- File contains `window.addEventListener('online'` and `'offline'`
- File contains `y: -60` slide animation
</acceptance_criteria>

---

### Task 7: Animation hooks (text reveal, number counter, staggered reveal, magnetic button)

<read_first>
- src/hooks/ (check existing hooks)
</read_first>

<action>
Create `src/hooks/useTextReveal.ts`:
```ts
import { useEffect, useRef } from 'react';

export function useTextReveal() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Split inner text into word spans
    const words = el.textContent?.split(' ') || [];
    el.innerHTML = words.map(w =>
      `<span style="display:inline-block;overflow:hidden;vertical-align:bottom;"><span class="word-inner" style="display:inline-block;transform:translateY(100%);transition:transform 0.8s cubic-bezier(0.16,1,0.3,1)">${w}</span></span>`
    ).join(' ');
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const spans = el.querySelectorAll<HTMLElement>('.word-inner');
        spans.forEach((s, i) => { setTimeout(() => { s.style.transform = 'translateY(0)'; }, i * 70); });
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}
```

Create `src/hooks/useNumberCounter.ts`:
```ts
import { useEffect, useRef, useState } from 'react';

function easeOutExpo(t: number) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

export function useNumberCounter(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const observed = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !observed.current) {
        observed.current = true;
        const start = performance.now();
        function tick(now: number) {
          const t = Math.min((now - start) / duration, 1);
          setValue(Math.round(easeOutExpo(t) * target));
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);
  return { value, ref };
}
```

Create `src/hooks/useStaggeredReveal.ts`:
```ts
import { useEffect, useRef } from 'react';

export function useStaggeredReveal(staggerMs = 80) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const parent = ref.current;
    if (!parent) return;
    const children = Array.from(parent.children) as HTMLElement[];
    children.forEach(child => { child.style.opacity = '0'; child.style.transform = 'translateY(60px)'; child.style.transition = `opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)`; });
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        children.forEach((child, i) => setTimeout(() => { child.style.opacity = '1'; child.style.transform = 'translateY(0)'; }, i * staggerMs));
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(parent);
    return () => observer.disconnect();
  }, [staggerMs]);
  return ref;
}
```

Create `src/hooks/useMagneticButton.ts`:
```ts
import { useRef, useEffect } from 'react';

export function useMagneticButton(strength = 0.3, radius = 80) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || 'ontouchstart' in window) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) { el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`; }
    };
    const onLeave = () => { el.style.transform = 'translate(0,0)'; el.style.transition = 'transform 0.3s ease'; };
    const onEnter = () => { el.style.transition = 'transform 0.1s ease'; };
    window.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('mouseenter', onEnter);
    return () => { window.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); el.removeEventListener('mouseenter', onEnter); };
  }, [strength, radius]);
  return ref;
}
```
</action>

<acceptance_criteria>
- `src/hooks/useTextReveal.ts` exists and contains `IntersectionObserver`
- `src/hooks/useTextReveal.ts` contains `translateY(100%)` and `stagger`
- `src/hooks/useNumberCounter.ts` exists and contains `easeOutExpo`
- `src/hooks/useStaggeredReveal.ts` exists and contains `translateY(60px)`
- `src/hooks/useMagneticButton.ts` exists and contains `strength * dx`
</acceptance_criteria>

---

### Task 8: Wire global components into App.tsx

<read_first>
- src/App.tsx
- src/main.tsx
</read_first>

<action>
Update `src/App.tsx` to include all global components and wrap routes with PageTransition.
The App.tsx should:
1. Import and render `<CustomCursor />` (outside routes)
2. Import and render `<ToastContainer />` (outside routes)
3. Import and render `<FloatingSOS />` (outside routes)
4. Import and render `<OfflineBanner />` (outside routes)
5. Call `useLenis()` hook at top of App component
6. Wrap route content with `<PageTransition>`
7. Set `<Routes location={location}>` using `useLocation()` for AnimatePresence to work

Example structure:
```tsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { useLenis } from './hooks/useLenis';
import { CustomCursor } from './components/ui/CustomCursor';
import { PageTransition } from './components/ui/PageTransition';
import { ToastContainer } from './components/ui/Toast';
import { FloatingSOS } from './components/ui/FloatingSOS';
import { OfflineBanner } from './components/ui/OfflineBanner';
// ... page imports ...

export default function App() {
  useLenis();
  return (
    <>
      <CustomCursor />
      <OfflineBanner />
      <FloatingSOS />
      <ToastContainer />
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/sos" element={<SOSPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </PageTransition>
    </>
  );
}
```
Stub out any pages that don't exist yet with a simple placeholder component.
</action>

<acceptance_criteria>
- `src/App.tsx` contains `<CustomCursor />`
- `src/App.tsx` contains `<FloatingSOS />`
- `src/App.tsx` contains `<ToastContainer />`
- `src/App.tsx` contains `<OfflineBanner />`
- `src/App.tsx` contains `useLenis()`
- `src/App.tsx` contains `<PageTransition>`
- App has routes for `/`, `/map`, `/sos`, `/volunteer`, `/admin`, `/auth`, `/profile`
</acceptance_criteria>

## Verification

```bash
# Check all component files exist
ls src/components/ui/CustomCursor.tsx
ls src/components/ui/PageTransition.tsx
ls src/components/ui/Toast.tsx
ls src/components/ui/FloatingSOS.tsx
ls src/components/ui/OfflineBanner.tsx
ls src/hooks/useLenis.ts
ls src/hooks/useTextReveal.ts

# App builds
npm run build 2>&1 | tail -5
```
