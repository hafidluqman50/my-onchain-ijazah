import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { SectionTitle } from '@/components/ui/section-title'

const stats = [
  { label: 'Total siswa', value: '500' },
  { label: 'Sudah minted', value: '420' },
  { label: 'Pending', value: '80' },
  { label: 'Revoked', value: '2' },
]

const recentBatches = [
  { name: 'Kelulusan 2026 - IPA', count: 180, date: '2026-01-15' },
  { name: 'Kelulusan 2026 - IPS', count: 160, date: '2026-01-14' },
]

export default function AdminDashboard() {
  return (
    <Container className="space-y-10">
      <SectionTitle
        title="Dashboard"
        subtitle="Ringkasan issuance dan akses cepat untuk batch mint."
      />

      <div className="grid gap-6 md:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label} className="bg-white/90 backdrop-blur">
            <CardContent className="space-y-2 pt-8">
              <p className="text-xs text-mutedForeground">{item.label}</p>
              <p className="text-2xl font-semibold text-foreground">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white/90 backdrop-blur">
        <CardHeader className="flex items-center justify-between gap-4 md:flex-row md:items-center">
          <div>
            <CardTitle>Batch Mint</CardTitle>
            <CardDescription>Upload CSV + ZIP untuk mint massal.</CardDescription>
          </div>
          <Button asChild>
            <Link to="/admin/batch">Mulai Batch Mint</Link>
          </Button>
        </CardHeader>
      </Card>

      <Card className="bg-white/90 backdrop-blur">
        <CardHeader>
          <CardTitle>Batch Terakhir</CardTitle>
          <CardDescription>Ringkasan issuance terbaru.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentBatches.map((batch) => (
            <div
              key={batch.name}
              className="flex items-center justify-between rounded-md border border-[#e3d3a9] bg-white px-4 py-4"
            >
              <div>
                <p className="font-medium">{batch.name}</p>
                <p className="text-xs text-mutedForeground">{batch.date}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-mutedForeground">Jumlah siswa</p>
                <p className="font-semibold">{batch.count}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </Container>
  )
}
