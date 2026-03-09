import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export function AppLayout() {
  return (
    <div className="app-shell relative min-h-screen overflow-hidden">
      <div className="blur-orb right-[-100px] top-[-60px] h-[220px] w-[220px]" />
      <div className="blur-orb left-[-80px] bottom-[-40px] h-[200px] w-[200px]" />
      <Navbar />
      <main className="py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
