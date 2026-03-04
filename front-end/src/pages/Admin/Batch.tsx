import { useMemo, useState } from 'react'
import Select from 'react-select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAdminCohorts, useCreateCohort } from '@/hooks/admin/useAdminCohorts'
import { useIssueCertificate } from '@/hooks/admin/useIssueCertificate'
import { useIssueBatchCertificates } from '@/hooks/admin/useIssueBatchCertificates'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { Input } from '@/components/ui/input'
import { SectionTitle } from '@/components/ui/section-title'
import type { BatchIssueResponse, IssueCertificateResponse } from '@/lib/api'

type StudentRow = {
  name: string
  email: string
}

type CohortOption = {
  value: number
  label: string
}

const createCohortSchema = z.object({
  label: z.string().trim().min(3, 'Isi nama kelompok dulu.'),
})

type CreateCohortFormValues = z.infer<typeof createCohortSchema>

const issueSchema = z.object({
  cohortId: z.number().int().positive('Pilih kelompok dulu.'),
  studentName: z.string().trim().min(1, 'Nama siswa wajib diisi.'),
  studentEmail: z.string().trim().email('Email siswa tidak valid.'),
  studentWallet: z.string().trim().min(1, 'Alamat dompet wajib diisi.'),
  file: z.custom<File>((file) => file instanceof File, { message: 'Unggah berkas ijazah.' }),
})

type IssueFormInput = z.input<typeof issueSchema>
type IssueFormValues = z.output<typeof issueSchema>

export default function AdminBatch() {
  const [rows, setRows] = useState<StudentRow[]>([])
  const [listFileName, setListFileName] = useState('')
  const [listFile, setListFile] = useState<File | null>(null)
  const [batchFileName, setBatchFileName] = useState('')
  const [batchFile, setBatchFile] = useState<File | null>(null)
  const [batchError, setBatchError] = useState('')
  const [batchResult, setBatchResult] = useState<BatchIssueResponse | null>(null)

  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState<IssueCertificateResponse | null>(null)

  const cohortsQuery = useAdminCohorts()

  const issueForm = useForm<IssueFormInput, unknown, IssueFormValues>({
    resolver: zodResolver(issueSchema),
    mode: 'onChange',
    defaultValues: {
      cohortId: 0,
      studentName: '',
      studentEmail: '',
      studentWallet: '',
    },
  })

  const cohortForm = useForm<CreateCohortFormValues>({
    resolver: zodResolver(createCohortSchema),
    defaultValues: { label: '' },
  })

  const createCohortMutation = useCreateCohort((cohort) => {
    issueForm.setValue('cohortId', cohort.id, { shouldDirty: true, shouldValidate: true })
    cohortForm.reset({ label: '' })
  })

  const issueMutation = useIssueCertificate()
  const issueBatchMutation = useIssueBatchCertificates()

  const selectedCohortId = Number(issueForm.watch('cohortId') || 0)
  const selectedFile = issueForm.watch('file')

  const cohortOptions = useMemo<CohortOption[]>(() => {
    return (cohortsQuery.data?.cohorts || []).map((cohort) => ({
      value: cohort.id,
      label: cohort.label,
    }))
  }, [cohortsQuery.data?.cohorts])

  const selectedCohortOption = useMemo(
    () => cohortOptions.find((option) => option.value === selectedCohortId) ?? null,
    [cohortOptions, selectedCohortId],
  )

  const canSubmitBatch =
    !!selectedCohortId && !!listFile && !!batchFile && rows.length > 0 && !issueBatchMutation.isPending

  function parseList(text: string) {
    const lines = text.split(/\r?\n/).filter(Boolean)
    const next: StudentRow[] = []
    for (const line of lines.slice(1)) {
      const [name, email] = line.split(',').map((v) => v?.trim() || '')
      if (!name || !email) continue
      next.push({ name, email })
    }
    setRows(next)
    return next
  }

  async function handleListFile(file?: File | null) {
    setBatchError('')
    setBatchResult(null)

    if (!file) {
      setListFile(null)
      setListFileName('')
      setRows([])
      return
    }

    setListFile(file)
    setListFileName(file.name)

    try {
      const text = await file.text()
      const parsed = parseList(text)
      if (parsed.length === 0) {
        setBatchError('Daftar belum terbaca. Gunakan format: nama,email')
      }
    } catch {
      setRows([])
      setBatchError('File daftar tidak bisa dibaca.')
    }
  }

  function handleBatchFile(file?: File | null) {
    setBatchError('')
    setBatchResult(null)

    if (!file) {
      setBatchFile(null)
      setBatchFileName('')
      return
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setBatchFile(null)
      setBatchFileName('')
      setBatchError('Berkas ijazah harus PDF.')
      return
    }

    setBatchFile(file)
    setBatchFileName(file.name)
  }

  function downloadSample() {
    const sample = 'nama,email\nRaka,raka@mail.com\nSinta,sinta@mail.com\n'
    const blob = new Blob([sample], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contoh-daftar-siswa.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const submitCreateCohort = cohortForm.handleSubmit(async (values) => {
    await createCohortMutation.mutateAsync(values.label)
  })

  const submitIssue = issueForm.handleSubmit(async (values) => {
    setSubmitError('')
    setResult(null)

    try {
      const issued = await issueMutation.mutateAsync({
        cohortId: values.cohortId,
        studentName: values.studentName,
        studentEmail: values.studentEmail,
        studentWallet: values.studentWallet,
        file: values.file,
      })
      setResult(issued)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err))
    }
  })

  async function handleSubmitBatch() {
    setBatchError('')
    setBatchResult(null)

    if (!selectedCohortId) {
      setBatchError('Pilih kelompok dulu.')
      return
    }

    if (!listFile || rows.length === 0) {
      setBatchError('Unggah daftar siswa dulu.')
      return
    }

    if (!batchFile) {
      setBatchError('Unggah berkas ijazah PDF dulu.')
      return
    }

    try {
      const issued = await issueBatchMutation.mutateAsync({
        cohortId: selectedCohortId,
        studentsCsv: listFile,
        file: batchFile,
      })
      setBatchResult(issued)
    } catch (err) {
      setBatchError(err instanceof Error ? err.message : String(err))
    }
  }

  const failedItems = batchResult?.items.filter((item) => !!item.error) || []

  return (
    <Container className="space-y-8">
      <SectionTitle title="Terbitkan Ijazah" subtitle="Isi data siswa lalu unggah berkas ijazah." />

      <Card className="bg-white/90 backdrop-blur">
        <CardHeader>
          <CardTitle>Kelompok</CardTitle>
          <CardDescription>Pilih kelompok yang sudah ada, atau buat baru.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select<CohortOption, false>
            options={cohortOptions}
            value={selectedCohortOption}
            onChange={(option) => {
              const id = option?.value ?? 0
              issueForm.setValue('cohortId', id, { shouldDirty: true, shouldValidate: true })
            }}
            placeholder="Pilih kelompok"
            isLoading={cohortsQuery.isLoading}
            isClearable
            classNamePrefix="cohort-select"
          />
          {issueForm.formState.errors.cohortId?.message && (
            <p className="text-xs text-red-700">{issueForm.formState.errors.cohortId.message}</p>
          )}

          <form className="flex gap-2" onSubmit={submitCreateCohort}>
            <Input placeholder="Contoh: XII IPA 2026" {...cohortForm.register('label')} />
            <Button type="submit" variant="outline" disabled={createCohortMutation.isPending}>
              {createCohortMutation.isPending ? 'Menyimpan...' : 'Buat'}
            </Button>
          </form>

          {cohortForm.formState.errors.label?.message && (
            <p className="text-xs text-red-700">{cohortForm.formState.errors.label.message}</p>
          )}
          {createCohortMutation.error && (
            <p className="text-xs text-red-700">
              {createCohortMutation.error instanceof Error
                ? createCohortMutation.error.message
                : String(createCohortMutation.error)}
            </p>
          )}
          {cohortsQuery.isLoading && <p className="text-xs text-mutedForeground">Memuat kelompok...</p>}
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur">
        <CardHeader>
          <CardTitle>Untuk Satu Siswa</CardTitle>
          <CardDescription>Gunakan form ini untuk menerbitkan ijazah satu per satu.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={submitIssue}>
            <Input placeholder="Nama siswa" {...issueForm.register('studentName')} />
            <Input placeholder="Email siswa" type="email" {...issueForm.register('studentEmail')} />
            <Input placeholder="Alamat dompet siswa" {...issueForm.register('studentWallet')} />

            {issueForm.formState.errors.studentName?.message && (
              <p className="text-xs text-red-700">{issueForm.formState.errors.studentName.message}</p>
            )}
            {issueForm.formState.errors.studentEmail?.message && (
              <p className="text-xs text-red-700">{issueForm.formState.errors.studentEmail.message}</p>
            )}
            {issueForm.formState.errors.studentWallet?.message && (
              <p className="text-xs text-red-700">{issueForm.formState.errors.studentWallet.message}</p>
            )}

            <div className="space-y-2">
              <p className="text-xs text-mutedForeground">Unggah berkas ijazah</p>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) {
                    issueForm.resetField('file')
                    return
                  }
                  issueForm.setValue('file', file, { shouldDirty: true, shouldValidate: true })
                }}
              />
              {selectedFile && <p className="text-xs text-mutedForeground">File terpilih: {selectedFile.name}</p>}
              {issueForm.formState.errors.file?.message && (
                <p className="text-xs text-red-700">{issueForm.formState.errors.file.message}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={!issueForm.formState.isValid || issueMutation.isPending}>
                {issueMutation.isPending ? 'Sedang diproses...' : 'Terbitkan Sekarang'}
              </Button>
            </div>
          </form>

          {submitError && (
            <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-700">
              {submitError}
            </div>
          )}

          {result && (
            <div className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <p className="font-semibold">Ijazah berhasil diterbitkan.</p>
              <p>Nomor terbit: {result.certificate_id}</p>
              <p>Kode cek: {result.verification_code}</p>
              {result.temp_password && <p>Kata sandi awal: {result.temp_password}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur">
        <CardHeader>
          <CardTitle>Untuk Banyak Siswa</CardTitle>
          <CardDescription>Unggah daftar siswa dan berkas ijazah, lalu terbitkan sekaligus.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={downloadSample}>
              Unduh Contoh Daftar
            </Button>
            <span className="text-xs text-mutedForeground">Isi contoh: nama, email</span>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-mutedForeground">Unggah daftar siswa (CSV)</p>
            <Input type="file" accept="text/csv" onChange={(e) => void handleListFile(e.target.files?.[0])} />
            {listFileName && <p className="text-xs text-mutedForeground">Daftar: {listFileName}</p>}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-mutedForeground">Unggah berkas ijazah (PDF)</p>
            <Input type="file" accept="application/pdf" onChange={(e) => handleBatchFile(e.target.files?.[0])} />
            {batchFileName && <p className="text-xs text-mutedForeground">Berkas: {batchFileName}</p>}
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" disabled={!canSubmitBatch} onClick={() => void handleSubmitBatch()}>
              {issueBatchMutation.isPending ? 'Sedang diproses...' : 'Terbitkan Daftar'}
            </Button>
            <span className="text-xs text-mutedForeground">
              Tombol aktif setelah kelompok, daftar, dan berkas siap.
            </span>
          </div>

          {batchError && (
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-700">
              {batchError}
            </div>
          )}

          {batchResult && (
            <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
              <p className="font-semibold">Proses selesai.</p>
              <p>Total daftar: {batchResult.total} siswa</p>
              <p>Berhasil terbit: {batchResult.success} siswa</p>
              <p>Perlu diperiksa: {batchResult.failed} siswa</p>
            </div>
          )}

          {failedItems.length > 0 && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              <p className="font-semibold">Baris yang perlu diperiksa:</p>
              <ul className="mt-2 space-y-1">
                {failedItems.slice(0, 8).map((item) => (
                  <li key={`${item.row}-${item.student_email}`}>
                    Baris {item.row} - {item.student_name || '-'} ({item.student_email || '-'}) : {item.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rows.length > 0 && (
            <div className="max-h-60 overflow-auto rounded-md border border-[#e3d3a9] bg-white text-xs">
              <div className="grid grid-cols-2 gap-2 border-b border-[#e3d3a9] bg-[#fff7e6] px-3 py-2 font-medium">
                <span>Nama</span>
                <span>Email</span>
              </div>
              {rows.map((row, idx) => (
                <div key={`${row.email}-${idx}`} className="grid grid-cols-2 gap-2 px-3 py-2">
                  <span>{row.name}</span>
                  <span>{row.email}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}
