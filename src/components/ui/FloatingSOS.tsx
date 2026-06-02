import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from './Toast';

const HOLD_DURATION = 3000; // ms

export function FloatingSOS() {
  const navigate = useNavigate();
  const location = useLocation();

  const [progress, setProgress] = useState(0);       // 0–100
  const [holding, setHolding] = useState(false);

  const holdInterval  = useRef<number | null>(null);
  const holdTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFired    = useRef(false);

  // Now safe to conditionally render nothing on the SOS page
  if (location.pathname === '/sos') return null;

  /* ── start hold ───────────────────────────────── */
  const startHold = () => {
    if (hasFired.current) return;
    hasFired.current = false;
    setHolding(true);
    setProgress(0);

    // animate the circle progress with interval
    const intervalTime = 50;
    holdInterval.current = window.setInterval(() => {
      setProgress(p => {
        const next = p + (100 / (HOLD_DURATION / intervalTime));
        return Math.min(next, 100);
      });
    }, intervalTime);

    holdTimer.current = setTimeout(() => {
      hasFired.current = true;
      if (holdInterval.current) { clearInterval(holdInterval.current); holdInterval.current = null; }
      setHolding(false);
      setProgress(0);
      navigate('/sos');
    }, HOLD_DURATION);
  };

  /* ── cancel hold ──────────────────────────────── */
  const cancelHold = () => {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    if (holdInterval.current) { clearInterval(holdInterval.current); holdInterval.current = null; }
    if (!hasFired.current) {
      setHolding(false);
      setProgress(0);
    }
  };

  /* ── click (short press) ──────────────────────── */
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasFired.current) { hasFired.current = false; return; }
    // If it's a short press, tell them to hold
    toast.error('Hold the SOS button for 3 seconds to activate.');
  };

  /* ── SVG ring values ──────────────────────────── */
  const R = 36;           // radius of progress ring
  const CIRC = 2 * Math.PI * R;
  const dash = (progress / 100) * CIRC;

  return (
    <>
      {/* ── Floating button ─────────────────────── */}
      <button
        className="floating-sos"
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={(e) => { e.preventDefault(); startHold(); }}
        onTouchEnd={cancelHold}
        onTouchCancel={cancelHold}
        onClick={handleClick}
        data-cursor="sos"
        aria-label="Send SOS Emergency Report"
        style={{ transform: holding ? 'scale(0.95)' : 'scale(1)', transition: 'transform 0.1s' }}
      >
        {/* SVG progress ring */}
        <svg
          className="sos-progress-ring"
          viewBox="0 0 80 80"
          aria-hidden="true"
          style={{ transform: 'rotate(-90deg)', opacity: holding ? 1 : 0, transition: 'opacity 0.2s' }}
        >
          {/* track */}
          <circle
            cx="40" cy="40" r={R}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="4"
          />
          {/* animated white arc */}
          <circle
            cx="40" cy="40" r={R}
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRC - dash}`}
          />
        </svg>

        <AlertTriangle size={22} color="#fff" />
      </button>
    </>
  );
}
