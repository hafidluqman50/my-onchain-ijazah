import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <Container>
      <section className="grid min-h-[50vh] items-center gap-10 py-8 md:grid-cols-[1.2fr_0.8fr]">
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
              <Link to="/admin/login">Dashboard Admin</Link>
            </Button>
          </div>
        </div>
        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="space-y-5 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-mutedForeground">Mengapa Onchain?</p>
            <ul className="space-y-4">
              {[
                { label: 'Tidak bisa dipalsukan', desc: 'Ijazah disimpan di blockchain — tidak ada pihak yang bisa mengubah atau memalsukan data.' },
                { label: 'Privasi terjaga', desc: 'Data pribadi siswa terenkripsi. Publik hanya bisa memverifikasi keabsahan, bukan melihat isinya.' },
                { label: 'Permanen & independen', desc: 'Tidak bergantung pada satu server. Selama blockchain ada, ijazah tetap bisa diverifikasi.' },
              ].map((item) => (
                <li key={item.label} className="flex gap-3">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#c79635]" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs leading-relaxed text-mutedForeground">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </Container>
  )
}
