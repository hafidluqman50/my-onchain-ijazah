import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import Home from '@/pages/Home'
import Verify from '@/pages/Verify'
import AdminDashboard from '@/pages/AdminDashboard'
import AdminStudents from '@/pages/AdminStudents'
import AdminBatch from '@/pages/AdminBatch'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/batch" element={<AdminBatch />} />
        <Route path="/admin/students" element={<AdminStudents />} />
      </Route>
    </Routes>
  )
}

export default App
