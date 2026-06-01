import { useEffect, useState } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLenis } from './hooks/useLenis';
import { CustomCursor } from './components/ui/CustomCursor';
import { PageTransition } from './components/ui/PageTransition';
import { ToastContainer } from './components/ui/Toast';
import { FloatingSOS } from './components/ui/FloatingSOS';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { AdminGuard } from './components/AdminGuard';
import { useAuthStore } from './store/useAuthStore';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { CinematicLoader } from './components/CinematicLoader';
import Home from './pages/Home';
import MapPage from './pages/Map';
import SOSPage from './pages/SOS';
import VolunteerPage from './pages/Volunteer';
import AdminPage from './pages/Admin';
import AuthPage from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import ProfilePage from './pages/Profile';
import VolunteerOnboarding from './pages/VolunteerOnboarding';
import PendingApproval from './pages/PendingApproval';

function Layout() {
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
        <Outlet />
      </PageTransition>
    </>
  );
}

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: 'map', element: <MapPage /> },
        { path: 'sos', element: <SOSPage /> },
        { path: 'volunteer', element: <VolunteerPage /> },
        { path: 'admin', element: <AdminGuard><AdminPage /></AdminGuard> },
        { path: 'auth', element: <AuthPage /> },
        { path: 'auth/callback', element: <AuthCallback /> },
        { path: 'profile', element: <ProfilePage /> },
        { path: 'volunteer-onboarding', element: <VolunteerOnboarding /> },
        { path: 'pending-approval', element: <PendingApproval /> },
        { path: '*', element: <Home /> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  } as any
);

function App() {
  console.log('🎯 App.tsx: Rendering App component');
  const [loaderComplete, setLoaderComplete] = useState(false);

  return (
    <>
      <CinematicLoader onComplete={() => setLoaderComplete(true)} />
      <AnimatePresence>
        {loaderComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <RouterProvider router={router} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
