import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export function FloatingSOS() {
  const navigate = useNavigate();
  const location = useLocation();
  if (location.pathname === '/sos') return null;
  return (
    <button
      className="floating-sos"
      onClick={() => navigate('/sos')}
      data-cursor="sos"
      aria-label="Send SOS Emergency Report"
    >
      <AlertTriangle size={22} color="#fff" />
    </button>
  );
}
