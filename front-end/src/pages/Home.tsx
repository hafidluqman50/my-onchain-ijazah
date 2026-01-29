import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { SectionTitle } from '@/components/ui/section-title'
import { Link } from 'react-router-dom'

const highlights = [
  { title: 'Cek cepat', desc: 'Masukkan kode pendek untuk memastikan ijazah valid.' },
  { title: 'Aman', desc: 'Data pribadi tidak ditampilkan di publik.' },
  { title: 'Praktis', desc: 'Siswa cukup simpan kode/QR dari sekolah.' },
]

export default function Home() {
  return (
    <Container className="space-y-12">
      <section className="grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Badge className="w-fit">Onchain Ijazah</Badge>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Cek ijazah dengan kode singkat.
          </h1>
          <p className="text-base leading-relaxed text-mutedForeground md:text-lg">
            Dapatkan kode dari sekolah, lalu verifikasi di halaman ini. Proses cepat tanpa ribet.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/verify">Mulai Verifikasi</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/admin">Dashboard Admin</Link>
            </Button>
          </div>
        </div>
        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="space-y-4">
            <SectionTitle title="Cara pakai" subtitle="3 langkah sederhana" />
            <ol className="space-y-2 text-sm leading-relaxed text-mutedForeground">
              <li>1. Sekolah kirim kode atau QR.</li>
              <li>2. Buka halaman verifikasi.</li>
              <li>3. Masukkan kode untuk cek status.</li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title} className="bg-white/90 backdrop-blur">
            <CardContent className="space-y-4 py-7">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-mutedForeground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </Container>
  )
}
