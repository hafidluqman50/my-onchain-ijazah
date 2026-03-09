import { NavLink, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'

const links = [
  { to: '/', label: 'Home' },
  { to: '/verify', label: 'Verifier' },
]

export function PublicNavbar() {
  return (
    <header className="border-b border-[#e3d3a9] bg-[#fffaf0]/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#1b2a4a] to-[#c79635]" />
          <div>
            <p className="text-sm font-semibold">Onchain Ijazah</p>
            <p className="text-xs text-[#6d5b3e]">SBT Certificate Portal</p>
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
                    ? 'bg-[#1b2a4a] text-[#fff7e6]'
                    : 'text-[#6d5b3e] hover:text-[#1b2a4a]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin">Admin</Link>
          </Button>
        </div>
      </Container>
    </header>
  )
}
