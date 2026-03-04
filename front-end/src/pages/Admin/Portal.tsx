import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { Input } from '@/components/ui/input'
import { SectionTitle } from '@/components/ui/section-title'

type BatchRow = {
  name: string
  email: string
  wallet: string
}

export default function Admin() {
  const [batchRows, setBatchRows] = useState<BatchRow[]>([])
  const [batchFileName, setBatchFileName] = useState('')
  const [zipFileName, setZipFileName] = useState('')

  function parseCsv(text: string) {
    const lines = text.split(/\r?\n/).filter(Boolean)
    const rows: BatchRow[] = []
    for (const line of lines.slice(1)) {
      const [name, email, wallet] = line.split(',').map((v) => v?.trim() || '')
      if (!name || !wallet) continue
      rows.push({ name, email, wallet })
    }
    setBatchRows(rows)
  }

  async function handleBatchFile(file?: File | null) {
    if (!file) return
    setBatchFileName(file.name)
    const text = await file.text()
    parseCsv(text)
  }

  function handleZipFile(file?: File | null) {
    if (!file) return
    setZipFileName(file.name)
  }

  function downloadTemplate() {
    const sample = 'name,email,wallet\nRaka,raka@mail.com,0xabc...\nSinta,sinta@mail.com,0xdef...\n'
    const blob = new Blob([sample], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_wallets.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exampleVerifyUrl = `${window.location.origin}/verify?code=AB12CD34`

  return (
    <Container className="space-y-8">
      <SectionTitle
        title="Admin Dashboard"
        subtitle="Batch mint untuk ratusan siswa: upload CSV wallet + (opsional) ZIP PDF."
      />

      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle>Batch Mint (CSV)</CardTitle>
            <CardDescription>
              Upload daftar wallet siswa. Sistem akan generate token + kode verifikasi pendek.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" onClick={downloadTemplate}>
                Download Template CSV
              </Button>
              <span className="text-xs text-mutedForeground">Kolom: name, email, wallet</span>
            </div>
            <Input
              type="file"
              accept="text/csv"
              onChange={(e) => handleBatchFile(e.target.files?.[0])}
            />
            {batchFileName && (
              <p className="text-xs text-mutedForeground">CSV: {batchFileName}</p>
            )}

            <div className="space-y-2">
              <p className="text-xs text-mutedForeground">
                Upload ZIP PDF (opsional). Nama file harus match wallet / nama siswa.
              </p>
              <Input type="file" accept="application/zip" onChange={(e) => handleZipFile(e.target.files?.[0])} />
              {zipFileName && (
                <p className="text-xs text-mutedForeground">ZIP: {zipFileName}</p>
              )}
            </div>

            {batchRows.length > 0 && (
              <div className="max-h-44 overflow-auto rounded-md border border-[#e3d3a9] bg-white text-xs">
                <div className="grid grid-cols-3 gap-2 border-b border-[#e3d3a9] bg-[#fff7e6] px-3 py-2 font-medium">
                  <span>Nama</span>
                  <span>Email</span>
                  <span>Wallet</span>
                </div>
                {batchRows.map((row, idx) => (
                  <div key={`${row.wallet}-${idx}`} className="grid grid-cols-3 gap-2 px-3 py-2">
                    <span>{row.name}</span>
                    <span>{row.email || '-'}</span>
                    <span className="truncate">{row.wallet}</span>
                  </div>
                ))}
              </div>
            )}
            <Button type="button" size="lg" disabled>
              Mint Batch (API belum ada)
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/85 backdrop-blur">
          <CardHeader>
            <CardTitle>Bagikan ke Siswa</CardTitle>
            <CardDescription>
              Setelah mint, sistem akan buat kode pendek + QR untuk tiap siswa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <p className="text-xs text-mutedForeground">Contoh link verifikasi</p>
              <div className="rounded-md border border-[#e3d3a9] bg-white p-2 text-xs break-all">
                {exampleVerifyUrl}
              </div>
            </div>
            <div className="rounded-md border border-[#e3d3a9] bg-white p-3">
              <QRCodeCanvas value={exampleVerifyUrl} size={160} />
              <p className="mt-2 text-xs text-mutedForeground">Scan QR untuk cek</p>
            </div>
            <Button type="button" variant="outline">
              Download Kode Verifikasi (CSV)
            </Button>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}
