import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/auth/AuthGuard'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import AppointmentsPage from '@/pages/appointments/AppointmentsPage'
import PatientsPage from '@/pages/patients/PatientsPage'
import LeadsPage from '@/pages/leads/LeadsPage'
import LandingPage from '@/pages/landing/LandingPage'
import CapturePage from '@/pages/capture/CapturePage'
import LoginPage from '@/pages/auth/LoginPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/capture" element={<CapturePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/landing-pages" element={<Navigate to="/landing" replace />} />

        <Route
          path="/"
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="leads" element={<LeadsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}