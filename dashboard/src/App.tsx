import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import AppointmentsPage from '@/pages/appointments/AppointmentsPage'
import PatientsPage from '@/pages/patients/PatientsPage'
import PatientDetailPage from '@/pages/patients/PatientDetailPage'
import LeadsPage from '@/pages/leads/LeadsPage'
import LandingPage from '@/pages/landing/LandingPage'
import CapturePage from '@/pages/capture/CapturePage'
import LoginPage from '@/pages/auth/LoginPage'

export default function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<ErrorBoundary serviceName="Landing"><LandingPage /></ErrorBoundary>} />
        <Route path="/landing" element={<Navigate to="/" replace />} />
        <Route path="/capture" element={<ErrorBoundary serviceName="Capture"><CapturePage /></ErrorBoundary>} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes — pathless layout route */}
        <Route element={<AuthGuard><DashboardLayout /></AuthGuard>}>
          <Route path="/dashboard" element={<ErrorBoundary serviceName="Dashboard"><DashboardPage /></ErrorBoundary>} />
          <Route path="/appointments" element={<ErrorBoundary serviceName="Citas"><AppointmentsPage /></ErrorBoundary>} />
          <Route path="/patients" element={<ErrorBoundary serviceName="Pacientes"><PatientsPage /></ErrorBoundary>} />
          <Route path="/patients/:id" element={<ErrorBoundary serviceName="HC Paciente"><PatientDetailPage /></ErrorBoundary>} />
          <Route path="/leads" element={<ErrorBoundary serviceName="Leads"><LeadsPage /></ErrorBoundary>} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
