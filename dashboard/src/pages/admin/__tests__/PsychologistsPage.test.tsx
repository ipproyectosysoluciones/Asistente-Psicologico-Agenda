import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PsychologistsPage from '../PsychologistsPage'

// Mock useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true,
    token: 'fake-admin-token',
    jwtRole: 'admin',
    jwtPsychologistId: 'psych-1',
    login: vi.fn(),
    logout: vi.fn(),
  })),
}))

// Mock api module to avoid real network calls
vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '@/lib/api'

const mockApi = api as { get: ReturnType<typeof vi.fn> }

const mockPsychologists = [
  {
    id: 'psych-1',
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'admin' as const,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'psych-2',
    email: 'doctor@example.com',
    full_name: 'doctor@example.com',
    role: 'psychologist' as const,
    is_active: true,
    created_at: '2024-02-01T00:00:00Z',
  },
]

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PsychologistsPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('PsychologistsPage', () => {
  beforeEach(() => {
    mockApi.get.mockResolvedValue({ psychologists: mockPsychologists })
  })

  it('renders table headers', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Nombre')).toBeInTheDocument()
      expect(screen.getByText('Rol')).toBeInTheDocument()
    })
  })

  it('renders psychologist rows after successful fetch', async () => {
    renderPage()

    await waitFor(() => {
      // admin@example.com appears as email column only (full_name is "Admin User")
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
      // doctor@example.com appears in both full_name and email columns (COALESCE fallback)
      // use getAllByText since it renders in two columns
      const doctorCells = screen.getAllByText('doctor@example.com')
      expect(doctorCells.length).toBeGreaterThanOrEqual(1)
      // Full name column should show "Admin User"
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })
  })

  it('shows skeleton rows while loading', async () => {
    // Delay the response to catch loading state
    mockApi.get.mockReturnValue(new Promise(() => {})) // never resolves

    renderPage()

    // Skeleton rows should appear immediately before data loads
    const skeletons = document.querySelectorAll('[data-testid="skeleton-row"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
