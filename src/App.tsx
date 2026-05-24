import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useLenis } from './hooks/useLenis';
import { CustomCursor } from './components/ui/CustomCursor';
import { PageTransition } from './components/ui/PageTransition';
import { ToastContainer } from './components/ui/Toast';
import { FloatingSOS } from './components/ui/FloatingSOS';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { AdminGuard } from './components/AdminGuard';
import { useAuthStore } from './store/useAuthStore';
import { ThemeToggle } from './components/ui/ThemeToggle';
import Home from './pages/Home';
import MapPage from './pages/Map';
import SOSPage from './pages/SOS';
import VolunteerPage from './pages/Volunteer';
import AdminPage from './pages/Admin';
import AuthPage from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import ProfilePage from './pages/Profile';

function AppInner() {
  useLenis();
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <CustomCursor />
      <ThemeToggle />
      <OfflineBanner />
      <FloatingSOS />
      <ToastContainer />
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/sos" element={<SOSPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/admin" element={<AdminGuard><AdminPage /></AdminGuard>} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </PageTransition>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App;
