import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'

const links = [
  { to: '/', label: 'Home' },
  { to: '/admin', label: 'Admin' },
  { to: '/student', label: 'Siswa' },
  { to: '/verify', label: 'Verifier' },
]

export function Navbar() {
  return (
    <header className="border-b border-border bg-white/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#1b2a4a] to-[#c79635]" />
          <div>
            <p className="text-sm font-semibold">Onchain Ijazah</p>
            <p className="text-xs text-mutedForeground">SBT Certificate Portal</p>
          </div>
        </div>
        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary text-primaryForeground'
                    : 'text-mutedForeground hover:text-foreground'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Docs
          </Button>
        </div>
      </Container>
    </header>
  )
}
