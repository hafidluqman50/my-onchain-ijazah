import { Outlet } from 'react-router-dom'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'

export function PublicLayout() {
  return (
    <div className="app-shell relative min-h-screen overflow-hidden">
      <div className="blur-orb right-[-100px] top-[-60px] h-[220px] w-[220px]" />
      <div className="blur-orb left-[-80px] bottom-[-40px] h-[200px] w-[200px]" />
      <div className="flex min-h-screen flex-col">
        <PublicNavbar />
        <main className="flex-1 py-12">
          <Outlet />
        </main>
        <PublicFooter />
      </div>
    </div>
  )
}
