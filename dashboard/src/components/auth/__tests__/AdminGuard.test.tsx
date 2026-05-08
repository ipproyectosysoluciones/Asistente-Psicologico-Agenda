import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AdminGuard } from '../AdminGuard'

// Mock useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '@/contexts/AuthContext'

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

function renderWithRouter(jwtRole: string | null) {
  mockUseAuth.mockReturnValue({
    isAuthenticated: true,
    token: 'fake-token',
    jwtRole,
    jwtPsychologistId: null,
    login: vi.fn(),
    logout: vi.fn(),
  })

  return render(
    <MemoryRouter initialEntries={['/admin/psychologists']}>
      <Routes>
        <Route
          path="/admin/psychologists"
          element={
            <AdminGuard>
              <div data-testid="admin-content">Admin Content</div>
            </AdminGuard>
          }
        />
        <Route
          path="/dashboard"
          element={<div data-testid="dashboard">Dashboard</div>}
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('AdminGuard', () => {
  it('renders children when jwtRole is admin', () => {
    renderWithRouter('admin')

    expect(screen.getByTestId('admin-content')).toBeInTheDocument()
  })

  it('redirects to /dashboard when jwtRole is psychologist', () => {
    renderWithRouter('psychologist')

    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
  })

  it('redirects to /dashboard when jwtRole is null', () => {
    renderWithRouter(null)

    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
  })
})
