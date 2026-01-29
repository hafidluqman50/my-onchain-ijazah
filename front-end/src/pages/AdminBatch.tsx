import { useState } from 'react'
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

export default function AdminBatch() {
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

  return (
    <Container className="space-y-8">
      <SectionTitle
        title="Batch Mint"
        subtitle="Upload CSV wallet siswa + (opsional) ZIP PDF untuk issuance massal."
      />

      <Card className="bg-white/90 backdrop-blur">
        <CardHeader>
          <CardTitle>Upload Data</CardTitle>
          <CardDescription>Template CSV berisi name, email, wallet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={downloadTemplate}>
              Download Template CSV
            </Button>
            <span className="text-xs text-mutedForeground">Kolom: name, email, wallet</span>
          </div>
          <Input type="file" accept="text/csv" onChange={(e) => handleBatchFile(e.target.files?.[0])} />
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
            <div className="max-h-60 overflow-auto rounded-md border border-[#e3d3a9] bg-white text-xs">
              <div className="grid grid-cols-3 gap-2 border-b border-[#e3d3a9] bg-[#fff7e6] px-3 py-2 font-medium">
                <span>Nama</span>
                <span>Email</span>
                <span>Wallet</span>
              </div>
              {batchRows.map((row, idx) => (
                <div key={`${row.wallet}-${idx}`} className="grid grid-cols-3 gap-2 px-3 py-2">
                  <span>{row.name}</span>
                  <span>{row.email || '-'}
                  </span>
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
    </Container>
  )
}
