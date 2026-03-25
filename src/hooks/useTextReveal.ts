import { useEffect, useRef } from 'react';

export function useTextReveal() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = (el.textContent || '').split(' ');
    el.innerHTML = words.map(w =>
      `<span style="display:inline-block;overflow:hidden;vertical-align:bottom;"><span class="word-inner" style="display:inline-block;transform:translateY(100%);transition:transform 0.8s cubic-bezier(0.16,1,0.3,1)">${w}</span></span>`
    ).join(' ');
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const spans = el.querySelectorAll<HTMLElement>('.word-inner');
        spans.forEach((s, i) => {
          setTimeout(() => { s.style.transform = 'translateY(0)'; }, i * 70);
        });
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}
