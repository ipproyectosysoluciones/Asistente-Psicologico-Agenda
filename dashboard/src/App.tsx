import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
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
        <Route path="/landing" element={<ErrorBoundary serviceName="Landing"><LandingPage /></ErrorBoundary>} />
        <Route path="/capture" element={<ErrorBoundary serviceName="Capture"><CapturePage /></ErrorBoundary>} />
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
          <Route path="dashboard" element={<ErrorBoundary serviceName="Dashboard"><DashboardPage /></ErrorBoundary>} />
          <Route path="appointments" element={<ErrorBoundary serviceName="Citas"><AppointmentsPage /></ErrorBoundary>} />
          <Route path="patients" element={<ErrorBoundary serviceName="Pacientes"><PatientsPage /></ErrorBoundary>} />
          <Route path="leads" element={<ErrorBoundary serviceName="Leads"><LeadsPage /></ErrorBoundary>} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}