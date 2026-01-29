import { Outlet } from 'react-router-dom'
import { AdminNavbar } from '@/components/layout/AdminNavbar'

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f7f2e8]">
      <AdminNavbar />
      <main className="py-10">
        <Outlet />
      </main>
    </div>
  )
}
