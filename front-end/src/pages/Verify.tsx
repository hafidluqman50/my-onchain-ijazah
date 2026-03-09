import { useState } from 'react'
import { verifyCertificate } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { Input } from '@/components/ui/input'
import { SectionTitle } from '@/components/ui/section-title'

export default function Verify() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult('')
    try {
      const res = await verifyCertificate({ code })
      setResult(JSON.stringify(res, null, 2))
    } catch (err) {
      setResult(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="space-y-8">
      <SectionTitle
        title="Verifier"
        subtitle="Masukkan kode pendek dari sekolah untuk cek keaslian ijazah."
      />

      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle>Verifikasi Sertifikat</CardTitle>
            <CardDescription>Kode pendek sudah cukup.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3" onSubmit={handleVerify}>
              <Input
                placeholder="Kode pendek (contoh: X7M2K9P1)"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              <Button type="submit" disabled={loading || !code}>
                {loading ? 'Memproses...' : 'Verifikasi'}
              </Button>
            </form>

            {result && (
              <pre className="mt-4 max-h-56 overflow-auto rounded-md bg-muted p-3 text-xs">
                {result}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/85 backdrop-blur">
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Interpretasi hasil verifikasi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-mutedForeground">
            <p>Valid → ijazah asli & aktif.</p>
            <p>Revoked → ijazah dibatalkan.</p>
            <p>Not found → kode salah / tidak terdaftar.</p>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}
