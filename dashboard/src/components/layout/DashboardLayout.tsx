import { Outlet, NavLink } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Users, UserPlus, LogOut, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/appointments', label: 'Citas', icon: CalendarDays },
  { to: '/patients', label: 'Pacientes', icon: Users },
  { to: '/leads', label: 'Leads', icon: UserPlus }
] as const

export default function DashboardLayout() {
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-[var(--sidebar-width)] flex-col border-r bg-card">
        <div className="px-6 py-5">
          <div className="font-bold text-lg">🧠 Asistente Psi</div>
          <div className="text-xs text-muted-foreground">Panel de Control</div>
        </div>

        <Separator />

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t px-6 py-4 space-y-3">
          <Link
            to="/capture"
            target="_blank"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Send className="h-4 w-4" />
            Formulario público
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
          <div className="text-xs text-muted-foreground">v1.0.0</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex h-[var(--header-height)] items-center justify-between border-b bg-card px-8">
          <span className="font-semibold text-base">Panel de Control</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}