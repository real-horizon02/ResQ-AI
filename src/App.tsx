import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useLenis } from './hooks/useLenis';
import { CustomCursor } from './components/ui/CustomCursor';
import { PageTransition } from './components/ui/PageTransition';
import { ToastContainer } from './components/ui/Toast';
import { FloatingSOS } from './components/ui/FloatingSOS';
import { OfflineBanner } from './components/ui/OfflineBanner';
import Home from './pages/Home';
import MapPage from './pages/Map';
import SOSPage from './pages/SOS';
import VolunteerPage from './pages/Volunteer';
import AdminPage from './pages/Admin';
import AuthPage from './pages/Auth';
import ProfilePage from './pages/Profile';

function AppInner() {
  useLenis();
  const location = useLocation();

  return (
    <>
      <CustomCursor />
      <OfflineBanner />
      <FloatingSOS />
      <ToastContainer />
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/sos" element={<SOSPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/auth" element={<AuthPage />} />
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
