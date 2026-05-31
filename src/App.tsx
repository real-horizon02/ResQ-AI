import { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom';
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
        { path: '*', element: <Home /> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  } as any
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
