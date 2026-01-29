import { Outlet } from 'react-router-dom'
import { StudentNavbar } from '@/components/layout/StudentNavbar'

export function StudentLayout() {
  return (
    <div className="min-h-screen bg-[#fdf6e9]">
      <StudentNavbar />
      <main className="py-10">
        <Outlet />
      </main>
    </div>
  )
}
