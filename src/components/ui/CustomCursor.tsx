import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const actual = useRef({ x: 0, y: 0 });
  const [hoverType, setHoverType] = useState<'default' | 'link' | 'sos' | 'map'>('default');
  const [label, setLabel] = useState('');

  useEffect(() => {
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

    let rafId: number;
    function animate() {
      actual.current.x = lerp(actual.current.x, pos.current.x, 0.1);
      actual.current.y = lerp(actual.current.y, pos.current.y, 0.1);
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${actual.current.x}px, ${actual.current.y}px)`;
      }
      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const size = hoverType === 'link' || hoverType === 'map' ? 52 : hoverType === 'sos' ? 44 : 10;
  const bg = hoverType === 'sos' ? 'var(--accent-red)' : 'var(--accent-cyan)';
  const blend = hoverType === 'link' ? 'difference' : 'normal';

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none',
        width: size, height: size, borderRadius: '50%',
        background: bg,
        mixBlendMode: blend as React.CSSProperties['mixBlendMode'],
        marginLeft: -size / 2, marginTop: -size / 2,
        transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1), height 0.3s cubic-bezier(0.16,1,0.3,1), background 0.3s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: hoverType === 'sos' ? 'pulse-dot 1s ease-in-out infinite' : 'none',
      }}
    >
      {label && (
        <span style={{ fontSize: 8, fontFamily: 'DM Sans', fontWeight: 700, letterSpacing: '0.1em', color: '#000', userSelect: 'none' }}>
          {label}
        </span>
      )}
    </div>
  );
}
