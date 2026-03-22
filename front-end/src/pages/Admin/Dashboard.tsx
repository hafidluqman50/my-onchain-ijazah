import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminListCertificates, adminListCohorts, type AdminCertificateItem, type CohortItem } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { SectionTitle } from '@/components/ui/section-title'

type BatchSummary = {
  cohort: CohortItem
  total: number
  active: number
  pending: number
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <Card className="bg-white/90 backdrop-blur">
      <CardContent className="p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-mutedForeground">{label}</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">{value}</p>
        {sub && <p className="mt-1 text-xs text-mutedForeground">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const [certificates, setCertificates] = useState<AdminCertificateItem[]>([])
  const [cohorts, setCohorts] = useState<CohortItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [certRes, cohortRes] = await Promise.all([
          adminListCertificates(),
          adminListCohorts(),
        ])
        setCertificates(certRes.certificates || [])
        setCohorts(cohortRes.cohorts || [])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const total = certificates.length
  const active = certificates.filter((c) => c.status === 'active').length
  const pending = certificates.filter((c) => c.status === 'pending').length
  const revoked = certificates.filter((c) => c.status === 'revoked').length

  const batchSummaries: BatchSummary[] = cohorts.map((cohort) => {
    const certs = certificates.filter((c) => c.cohort_id === cohort.id)
    return {
      cohort,
      total: certs.length,
      active: certs.filter((c) => c.status === 'active').length,
      pending: certs.filter((c) => c.status === 'pending').length,
    }
  }).sort((a, b) => b.total - a.total)

  return (
    <Container className="space-y-8">
      <SectionTitle
        title="Dashboard"
        subtitle="Ringkasan issuance dan akses cepat untuk batch mint."
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total sertifikat" value={loading ? '—' : total} />
        <StatCard label="Aktif" value={loading ? '—' : active} sub="sudah minted & valid" />
        <StatCard label="Pending" value={loading ? '—' : pending} sub="belum diproses" />
        <StatCard label="Revoked" value={loading ? '—' : revoked} sub="dicabut" />
      </div>

      {/* Batch Mint CTA */}
      <Card className="bg-white/90 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Batch Mint</CardTitle>
            <CardDescription>Upload CSV + ZIP untuk menerbitkan ijazah massal.</CardDescription>
          </div>
          <Button asChild>
            <Link to="/admin/batch">Mulai Batch Mint</Link>
          </Button>
        </CardHeader>
      </Card>

      {/* Batch per Cohort */}
      <Card className="bg-white/90 backdrop-blur">
        <CardHeader>
          <CardTitle>Issuance per Angkatan</CardTitle>
          <CardDescription>
            {loading ? 'Memuat...' : `${cohorts.length} angkatan terdaftar.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && (
            <p className="text-sm text-mutedForeground">Memuat data...</p>
          )}
          {!loading && batchSummaries.length === 0 && (
            <p className="text-sm text-mutedForeground">Belum ada angkatan terdaftar.</p>
          )}
          {batchSummaries.map(({ cohort, total, active, pending }) => (
            <div
              key={cohort.id}
              className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-4"
            >
              <div>
                <p className="font-medium">{cohort.label}</p>
                <p className="mt-0.5 text-xs text-mutedForeground">
                  {active} aktif · {pending} pending
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-mutedForeground">Total</p>
                <p className="text-lg font-semibold tabular-nums">{total}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </Container>
  )
}
