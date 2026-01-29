const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function adminCreateCertificate(form: FormData) {
  const res = await fetch(`${API_URL}/admin/certificates`, {
    method: 'POST',
    headers: {
      'X-Admin-Key': import.meta.env.VITE_ADMIN_KEY || 'dev_admin_key_change_me',
    },
    body: form,
  })
  if (!res.ok) {
    throw new Error(await res.text())
  }
  return res.json()
}

export async function studentLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    throw new Error(await res.text())
  }
  return res.json()
}

export async function studentListCertificates(token: string) {
  const res = await fetch(`${API_URL}/student/certificates`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new Error(await res.text())
  }
  return res.json()
}

export async function studentRequestKey(token: string, certId: number, otp: string) {
  const res = await fetch(`${API_URL}/student/certificates/${certId}/key`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ otp }),
  })
  if (!res.ok) {
    throw new Error(await res.text())
  }
  return res.json()
}

export async function verifyCertificate(params: {
  code?: string
  tokenId?: string
  contract?: string
  hash?: string
}) {
  const qs = new URLSearchParams()
  if (params.code) qs.set('code', params.code)
  if (params.tokenId) qs.set('tokenId', params.tokenId)
  if (params.contract) qs.set('contract', params.contract)
  if (params.hash) qs.set('hash', params.hash)

  const res = await fetch(`${API_URL}/verify?${qs.toString()}`)
  if (!res.ok) {
    throw new Error(await res.text())
  }
  return res.json()
}
