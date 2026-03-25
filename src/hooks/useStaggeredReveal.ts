import { useEffect, useRef } from 'react';

export function useStaggeredReveal(staggerMs = 80) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const parent = ref.current;
    if (!parent) return;
    const children = Array.from(parent.children) as HTMLElement[];
    children.forEach(child => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(60px)';
      child.style.transition = `opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)`;
    });
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        children.forEach((child, i) => {
          setTimeout(() => {
            child.style.opacity = '1';
            child.style.transform = 'translateY(0)';
          }, i * staggerMs);
        });
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(parent);
    return () => observer.disconnect();
  }, [staggerMs]);
  return ref;
}
