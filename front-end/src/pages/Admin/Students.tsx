import { useEffect, useMemo, useState } from 'react'
import { adminListCertificates, type AdminCertificateItem } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { SectionTitle } from '@/components/ui/section-title'

const gridCols = 'grid-cols-[1.2fr_1.2fr_1fr_0.8fr_0.9fr_1.2fr]'

function buildVerifyUrl(code: string) {
  if (typeof window === 'undefined') return `/verify?code=${encodeURIComponent(code)}`
  return `${window.location.origin}/verify?code=${encodeURIComponent(code)}`
}

export default function AdminStudents() {
  const [items, setItems] = useState<AdminCertificateItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const result = await adminListCertificates()
      setItems(result.certificates || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()),
    [items],
  )

  return (
    <Container className="space-y-8">
      <SectionTitle
        title="Daftar Siswa"
        subtitle="Data issuance aktual dari backend, lengkap dengan kode verifikasi."
      />

      <Card className="bg-white/90 backdrop-blur">
        <CardHeader className="flex items-center justify-between gap-3 md:flex-row">
          <div>
            <CardTitle>List Sertifikat</CardTitle>
            <CardDescription>Total: {sortedItems.length}</CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
            {loading ? 'Memuat...' : 'Refresh'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className={`grid ${gridCols} gap-3 rounded-md border border-[#e3d3a9] bg-[#fff7e6] px-4 py-3 text-xs font-semibold`}>
            <span>Nama</span>
            <span>Email</span>
            <span>Kode</span>
            <span>Status</span>
            <span>Issued</span>
            <span className="text-right">Aksi</span>
          </div>

          {sortedItems.map((item) => {
            const verifyUrl = buildVerifyUrl(item.verification_code)
            return (
              <div
                key={item.id}
                className={`grid ${gridCols} items-center gap-3 rounded-md border border-[#efe3c7] bg-white px-4 py-3`}
              >
                <span className="font-medium">{item.student.name || '-'}</span>
                <span className="text-xs text-mutedForeground">{item.student.email || '-'}</span>
                <span className="font-semibold">{item.verification_code}</span>
                <span>{item.status}</span>
                <span className="text-xs text-mutedForeground">
                  {new Date(item.issued_at).toLocaleString()}
                </span>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    size="sm"
                    variant="info"
                    className="min-w-[110px]"
                    onClick={() => window.open(verifyUrl, '_blank', 'noopener,noreferrer')}
                  >
                    Cek Verifikasi
                  </Button>
                </div>
              </div>
            )
          })}

          {!loading && sortedItems.length === 0 && !error && (
            <p className="text-sm text-mutedForeground">Belum ada data sertifikat.</p>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}
