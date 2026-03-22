import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { verifyCertificate } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { Input } from '@/components/ui/input'
import { SectionTitle } from '@/components/ui/section-title'

type VerifyResult = {
  document_hash: string
  encrypted_cid: string
  issuer_did: string
  status: string
  issued_at: string
  revoked_at: string | null
  token_id: string
  contract_address: string
  verification_code: string
}

function StatusBanner({ status }: { status: string }) {
  const isActive = status === 'active'
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-5 py-3 text-sm font-semibold ${
        isActive
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}
      />
      {isActive ? 'Ijazah Valid & Aktif' : 'Ijazah Dicabut (Revoked)'}
    </div>
  )
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-mutedForeground">
        {label}
      </p>
      <p
        className={`break-all text-sm leading-relaxed text-foreground ${mono ? 'font-mono text-xs' : 'font-medium'}`}
      >
        {value || '—'}
      </p>
    </div>
  )
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}


export default function Verify() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [code, setCode] = useState(searchParams.get('code') ?? '')
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchVerify(codeToCheck: string) {
    if (!codeToCheck) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await verifyCertificate({ code: codeToCheck })
      setResult(res as VerifyResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const paramCode = searchParams.get('code')
    if (paramCode) {
      setCode(paramCode)
      void fetchVerify(paramCode)
    }
  }, [])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setSearchParams(code ? { code } : {})
    await fetchVerify(code)
  }

  return (
    <Container className="space-y-10">
      <SectionTitle
        title="Verifikasi Ijazah"
        subtitle="Masukkan kode pendek dari sekolah untuk mengecek keaslian ijazah."
      />

      {/* Form */}
      <Card className="bg-white/90 backdrop-blur">
        <CardContent className="p-6">
          <form className="flex gap-3" onSubmit={handleVerify}>
            <Input
              className="flex-1"
              placeholder="Kode verifikasi (contoh: QHPCAGFZ)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <Button type="submit" disabled={loading || !code}>
              {loading ? 'Memproses…' : 'Cek Ijazah'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4">
          <p className="text-sm font-medium text-red-700">
            {error === 'not found'
              ? 'Kode tidak ditemukan. Pastikan kode sudah benar.'
              : error}
          </p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-5">
          {/* Status + kode */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-white/90 px-6 py-5 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-mutedForeground">
                Hasil Verifikasi
              </p>
              <p className="mt-1 text-sm text-mutedForeground">
                Kode:{' '}
                <span className="font-mono font-semibold text-foreground">
                  {result.verification_code}
                </span>
              </p>
            </div>
            <StatusBanner status={result.status} />
          </div>

          {/* Revoked notice */}
          {result.status !== 'active' && result.revoked_at && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4">
              <p className="text-sm text-red-700">
                Ijazah ini dicabut pada{' '}
                <strong>{formatDate(result.revoked_at)}</strong>.
              </p>
            </div>
          )}

          {/* Info cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-white/90 backdrop-blur">
              <CardContent className="space-y-5 p-6">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-mutedForeground">
                  Informasi Sertifikat
                </p>
                <InfoRow label="Tanggal Terbit" value={formatDate(result.issued_at)} />
                <InfoRow
                  label="Status"
                  value={result.status === 'active' ? 'Aktif' : 'Dicabut'}
                />
                <InfoRow label="Kode Verifikasi" value={result.verification_code} mono />
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur">
              <CardContent className="space-y-5 p-6">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-mutedForeground">
                  Data Onchain
                </p>
                <InfoRow label="Token ID" value={result.token_id} mono />
                <InfoRow label="Contract Address" value={result.contract_address} mono />
                <InfoRow label="Issuer DID" value={result.issuer_did} mono />
              </CardContent>
            </Card>
          </div>

          {/* Document hash */}
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="space-y-3 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-mutedForeground">
                Hash Dokumen
              </p>
              <p className="break-all font-mono text-xs text-mutedForeground">
                {result.document_hash}
              </p>
            </CardContent>
          </Card>

          {/* Dokumen info */}
          <div className="rounded-xl border border-border bg-white/90 px-6 py-5 backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-mutedForeground">
              Dokumen Ijazah
            </p>
            <p className="mt-3 text-sm text-mutedForeground">
              Dokumen tersimpan dalam format terenkripsi dan hanya dapat diakses oleh pemilik ijazah melalui portal siswa. Verifikasi keaslian cukup dilakukan lewat kode dan hash di atas.
            </p>
          </div>
        </div>
      )}
    </Container>
  )
}
