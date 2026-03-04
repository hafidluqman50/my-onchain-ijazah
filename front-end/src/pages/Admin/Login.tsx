import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { adminListCohorts } from '@/lib/api'
import { clearAdminSessionKey, hasAdminSession, setAdminSessionKey } from '@/lib/adminAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { Input } from '@/components/ui/input'
import { SectionTitle } from '@/components/ui/section-title'

type LoginState = {
  from?: string
}

export default function AdminLogin() {
  const [accessKey, setAccessKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const from = ((location.state as LoginState | null)?.from || '/admin').toString()

  useEffect(() => {
    if (hasAdminSession()) {
      navigate('/admin', { replace: true })
    }
  }, [navigate])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const key = accessKey.trim()
    if (!key) {
      setError('Masukkan kunci admin.')
      return
    }

    setLoading(true)
    setAdminSessionKey(key)

    try {
      await adminListCohorts()
      navigate(from, { replace: true })
    } catch {
      clearAdminSessionKey()
      setError('Kunci admin tidak valid.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="space-y-8">
      <SectionTitle title="Masuk Admin" subtitle="Masukkan kunci admin untuk membuka dashboard." />

      <Card className="mx-auto max-w-xl bg-white/90 backdrop-blur">
        <CardHeader>
          <CardTitle>Akses Dashboard</CardTitle>
          <CardDescription>Kunci ini hanya untuk petugas sekolah.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input
              type="password"
              placeholder="Kunci admin"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Memeriksa...' : 'Masuk'}
            </Button>
          </form>

          {error && (
            <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-700">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}
