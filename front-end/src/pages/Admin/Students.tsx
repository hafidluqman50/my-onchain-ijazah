import { useEffect, useMemo, useState } from 'react'
import { adminListCertificates, type AdminCertificateItem } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { SectionTitle } from '@/components/ui/section-title'

function buildVerifyUrl(code: string) {
  if (typeof window === 'undefined') return `/verify?code=${encodeURIComponent(code)}`
  return `${window.location.origin}/verify?code=${encodeURIComponent(code)}`
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    revoked: 'bg-red-50 text-red-700 border-red-200',
  }
  const cls = map[status] ?? 'bg-muted text-mutedForeground border-border'
  const label: Record<string, string> = {
    active: 'Aktif',
    pending: 'Pending',
    revoked: 'Revoked',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label[status] ?? status}
    </span>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
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

  useEffect(() => { void load() }, [])

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
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Sertifikat</CardTitle>
            <CardDescription>
              {loading ? 'Memuat...' : `${sortedItems.length} sertifikat ditemukan.`}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            {loading ? 'Memuat...' : 'Refresh'}
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {error && (
            <div className="mx-6 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Header row */}
          <div className="grid grid-cols-[1.5fr_1.5fr_1fr_0.8fr_1fr_auto] gap-4 border-b border-border bg-muted/50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-mutedForeground">
            <span>Nama</span>
            <span>Email</span>
            <span>Kode</span>
            <span>Status</span>
            <span>Diterbitkan</span>
            <span />
          </div>

          {sortedItems.length === 0 && !loading && !error && (
            <p className="px-6 py-8 text-sm text-mutedForeground">Belum ada data sertifikat.</p>
          )}

          {sortedItems.map((item, i) => (
            <div
              key={item.id}
              className={`grid grid-cols-[1.5fr_1.5fr_1fr_0.8fr_1fr_auto] items-center gap-4 px-6 py-4 text-sm transition-colors hover:bg-muted/30 ${
                i !== sortedItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <span className="font-medium">{item.student.name || '—'}</span>
              <span className="truncate text-xs text-mutedForeground">{item.student.email || '—'}</span>
              <span className="font-mono text-xs font-semibold tracking-wide">{item.verification_code}</span>
              <StatusBadge status={item.status} />
              <span className="text-xs text-mutedForeground">{formatDate(item.issued_at)}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(buildVerifyUrl(item.verification_code), '_blank', 'noopener,noreferrer')}
              >
                Verifikasi
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </Container>
  )
}
