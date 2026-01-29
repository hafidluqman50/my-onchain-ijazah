import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { SectionTitle } from '@/components/ui/section-title'

const sampleStudents = [
  {
    name: 'Raka Pratama',
    email: 'raka@mail.com',
    wallet: '0xAbc...1234',
    code: 'AB12CD34',
    status: 'Minted',
  },
  {
    name: 'Sinta Lestari',
    email: 'sinta@mail.com',
    wallet: '0xDef...5678',
    code: 'JK78LM90',
    status: 'Minted',
  },
]

const gridCols = 'grid-cols-[1.2fr_1.2fr_1.3fr_0.8fr_0.7fr_1.4fr]'

export default function AdminStudents() {
  return (
    <Container className="space-y-8">
      <SectionTitle
        title="Daftar Siswa"
        subtitle="Siswa yang sudah di-mint, lengkap dengan kode verifikasi."
      />

      <Card className="bg-white/90 backdrop-blur">
        <CardHeader>
          <CardTitle>List Siswa</CardTitle>
          <CardDescription>Gunakan aksi untuk cek QR atau kirim ulang email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className={`grid ${gridCols} gap-3 rounded-md border border-[#e3d3a9] bg-[#fff7e6] px-4 py-3 text-xs font-semibold`}>
            <span>Nama</span>
            <span>Email</span>
            <span>Wallet</span>
            <span>Kode</span>
            <span>Status</span>
            <span className="text-right">Aksi</span>
          </div>
          {sampleStudents.map((student) => (
            <div
              key={student.code}
              className={`grid ${gridCols} items-center gap-3 rounded-md border border-[#efe3c7] bg-white px-4 py-3`}
            >
              <span className="font-medium">{student.name}</span>
              <span className="text-xs text-mutedForeground">{student.email}</span>
              <span className="text-xs text-mutedForeground">{student.wallet}</span>
              <span className="font-semibold">{student.code}</span>
              <span>{student.status}</span>
              <div className="flex flex-wrap justify-end gap-2">
                <Button size="sm" variant="info" className="min-w-[110px]">
                  Cek QR
                </Button>
                <Button size="sm" variant="success" className="min-w-[110px]">
                  Kirim Ulang
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </Container>
  )
}
