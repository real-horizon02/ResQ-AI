import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import Home from './pages/Home'
import MapPage from './pages/Map'
import AuthPage from './pages/Auth'
import ProfileSetup from './pages/ProfileSetup'
import ReportPage from './pages/Report'
import AdminDashboard from './pages/AdminDashboard'
import VolunteerDashboard from './pages/VolunteerDashboard'
import { useAuth } from './hooks/useAuth'
import SOSButton from './components/sos/SOSButton'

function App() {
  // Initialize auth listener
  useAuth()

  return (
    <Router>
      <Layout>
        <SOSButton />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/volunteer" element={<VolunteerDashboard />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
