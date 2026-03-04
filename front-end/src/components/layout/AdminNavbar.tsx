import { NavLink, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { clearAdminSessionKey } from '@/lib/adminAuth'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/students', label: 'Daftar Siswa' },
]

export function AdminNavbar() {
  const navigate = useNavigate()

  function handleSignOut() {
    clearAdminSessionKey()
    navigate('/admin/login', { replace: true })
  }

  return (
    <header className="border-b border-[#e3d3a9] bg-[#101b2d] text-[#f5e6c8]">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#c79635] to-[#2b4168]" />
          <div>
            <p className="text-sm font-semibold">Admin Console</p>
            <p className="text-xs text-[#cbb07a]">Issuance & Compliance</p>
          </div>
        </div>
        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-[#c79635] text-[#101b2d]' : 'text-[#f5e6c8] hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[#cbb07a] bg-transparent text-[#f5e6c8] hover:bg-[#1b2a4a] hover:text-white"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </div>
      </Container>
    </header>
  )
}
