import { NavLink, Link } from 'react-router-dom'
import { Container } from '@/components/ui/container'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/verify', label: 'Verifier', end: false },
]

export function PublicNavbar() {
  return (
    <header className="border-b border-[#e3d3a9] bg-[#fffaf0]/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#1b2a4a] to-[#c79635]" />
          <p className="text-sm font-semibold tracking-tight">Onchain Ijazah</p>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `relative px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-foreground after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:rounded-full after:bg-[#c79635]'
                    : 'text-mutedForeground hover:text-foreground'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/admin"
          className="text-sm font-medium text-mutedForeground transition-colors hover:text-foreground"
        >
          Admin
        </Link>
      </Container>
    </header>
  )
}
