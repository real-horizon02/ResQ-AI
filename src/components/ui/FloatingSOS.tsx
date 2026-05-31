import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

const HOLD_DURATION = 3000; // ms

export function FloatingSOS() {
  const navigate = useNavigate();
  const location = useLocation();

  const [progress, setProgress] = useState(0);       // 0–100
  const [holding, setHolding] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const holdTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef      = useRef<number | null>(null);
  const startTime   = useRef<number | null>(null);
  const hasFired    = useRef(false);

  // ── ALL hooks must run before any conditional return ──────────────
  useEffect(() => {
    if (showPopup) {
      const t = setTimeout(() => setShowPopup(false), 5000);
      return () => clearTimeout(t);
    }
  }, [showPopup]);

  // Now safe to conditionally render nothing on the SOS page
  if (location.pathname === '/sos') return null;

  /* ── start hold ───────────────────────────────── */
  const startHold = () => {
    if (hasFired.current) return;
    hasFired.current = false;
    startTime.current = performance.now();
    setHolding(true);
    setProgress(0);

    // animate the circle progress
    const tick = (now: number) => {
      const elapsed = now - (startTime.current ?? now);
      const pct = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(pct);
      if (elapsed < HOLD_DURATION) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    holdTimer.current = setTimeout(() => {
      hasFired.current = true;
      setHolding(false);
      setProgress(0);
      setShowPopup(true);
    }, HOLD_DURATION);
  };

  /* ── cancel hold ──────────────────────────────── */
  const cancelHold = () => {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    if (rafRef.current)    { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (!hasFired.current) {
      setHolding(false);
      setProgress(0);
    }
  };

  /* ── click (short press) ──────────────────────── */
  const handleClick = (e: React.MouseEvent) => {
    if (hasFired.current) { hasFired.current = false; e.preventDefault(); return; }
    navigate('/sos');
  };

  /* ── close popup ──────────────────────────────── */
  const closePopup = () => setShowPopup(false);

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
        style={{ transform: holding ? 'scale(0.92)' : 'scale(1)', transition: 'transform 0.15s' }}
      >
        {/* SVG progress ring */}
        <svg
          className="sos-progress-ring"
          viewBox="0 0 80 80"
          aria-hidden="true"
        >
          {/* track */}
          <circle
            cx="40" cy="40" r={R}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="3"
          />
          {/* animated white arc */}
          <circle
            cx="40" cy="40" r={R}
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRC - dash}`}
            strokeDashoffset={CIRC / 4}   /* start from top */
            style={{ transition: 'stroke-dasharray 0.05s linear' }}
          />
        </svg>

        <AlertTriangle size={22} color="#fff" />
      </button>

      {/* ── SOS Sent Popup ──────────────────────── */}
      {showPopup && (
        <div className="sos-popup-overlay" onClick={closePopup} aria-modal="true" role="dialog">
          <div className="sos-popup-card" onClick={(e) => e.stopPropagation()}>
            {/* animated checkmark */}
            <div className="sos-popup-icon">
              <CheckCircle size={40} color="#00E676" strokeWidth={2} />
            </div>

            <p className="sos-popup-title">SOS Sent!</p>
            <p className="sos-popup-msg">
              SOS request has been sent to the admin.<br />
              We will rescue you soon. Stay safe 🙏
            </p>

            <button className="sos-popup-close" onClick={closePopup}>
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
