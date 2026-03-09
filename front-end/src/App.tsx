import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { StudentLayout } from '@/layouts/StudentLayout'
import Home from '@/pages/Home'
import Verify from '@/pages/Verify'
import AdminLogin from '@/pages/Admin/Login'
import AdminDashboard from '@/pages/Admin/Dashboard'
import AdminStudents from '@/pages/Admin/Students'
import AdminBatch from '@/pages/Admin/Batch'
import Student from '@/pages/Student'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/batch" element={<AdminBatch />} />
        <Route path="/admin/students" element={<AdminStudents />} />
      </Route>

      <Route element={<StudentLayout />}>
        <Route path="/student" element={<Student />} />
        <Route path="/student/certificates" element={<Student />} />
        <Route path="/student/security" element={<Student />} />
      </Route>
    </Routes>
  )
}

export default App
