import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AdminNavbar } from '@/components/layout/AdminNavbar'
import { hasAdminSession } from '@/lib/adminAuth'

export function AdminLayout() {
  const location = useLocation()

  if (!hasAdminSession()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return (
    <div className="min-h-screen bg-[#f7f2e8]">
      <AdminNavbar />
      <main className="py-10">
        <Outlet />
      </main>
    </div>
  )
}
