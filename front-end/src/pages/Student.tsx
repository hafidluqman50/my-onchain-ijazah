import { useState } from 'react'
import { studentListCertificates, studentLogin, studentRequestKey } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { Input } from '@/components/ui/input'
import { SectionTitle } from '@/components/ui/section-title'

export default function Student() {
  const [creds, setCreds] = useState({ email: '', password: '' })
  const [token, setToken] = useState('')
  const [certs, setCerts] = useState<any[]>([])
  const [otp, setOtp] = useState('')
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setKey('')
    try {
      const result = await studentLogin(creds.email, creds.password)
      setToken(result.access_token)
      const certResp = await studentListCertificates(result.access_token)
      setCerts(certResp.certificates || [])
    } catch (err) {
      setToken('')
      setCerts([])
      setKey(String(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleRequestKey(certId: number) {
    if (!token) return
    setLoading(true)
    setKey('')
    try {
      const result = await studentRequestKey(token, certId, otp)
      setKey(result.key_b64)
    } catch (err) {
      setKey(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="space-y-8">
      <SectionTitle title="Portal Siswa" subtitle="Login untuk mengakses sertifikat dan kunci dekripsi." />

      <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-white/85 backdrop-blur">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Gunakan kredensial yang dikirim admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleLogin}>
              <Input
                placeholder="Email"
                type="email"
                value={creds.email}
                onChange={(e) => setCreds({ ...creds, email: e.target.value })}
              />
              <Input
                placeholder="Password"
                type="password"
                value={creds.password}
                onChange={(e) => setCreds({ ...creds, password: e.target.value })}
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>

            <div className="mt-4 space-y-2">
              <Input
                placeholder="OTP / MFA code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              {key && (
                <pre className="max-h-28 overflow-auto rounded-md bg-muted p-3 text-xs">{key}</pre>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Sertifikat Saya</CardTitle>
            <CardDescription>Ambil key untuk mendekripsi file terenkripsi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Total</span>
              <Badge>{certs.length} items</Badge>
            </div>
            {certs.length === 0 && (
              <p className="text-sm text-mutedForeground">Belum ada sertifikat. Silakan login.</p>
            )}
            {certs.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between rounded-md border border-border bg-white p-3"
              >
                <div>
                  <p className="text-sm font-medium">#{cert.id}</p>
                  <p className="text-xs text-mutedForeground">{cert.document_hash}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{cert.status}</Badge>
                  <Button size="sm" variant="outline" onClick={() => handleRequestKey(cert.id)}>
                    Ambil Key
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}
