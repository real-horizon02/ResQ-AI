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
      if (dist < radius) {
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      }
    };
    const onLeave = () => {
      el.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
      el.style.transform = 'translate(0,0)';
    };
    const onEnter = () => {
      el.style.transition = 'transform 0.1s ease';
    };
    window.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('mouseenter', onEnter);
    return () => {
      window.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('mouseenter', onEnter);
    };
  }, [strength, radius]);
  return ref;
}
