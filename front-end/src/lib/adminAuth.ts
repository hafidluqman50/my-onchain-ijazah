const ADMIN_KEY_STORAGE = 'admin_access_key'

function getStoredKey() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(ADMIN_KEY_STORAGE) || ''
}

export function getAdminApiKey() {
  return getStoredKey() || import.meta.env.VITE_ADMIN_KEY || 'dev_admin_key_change_me'
}

export function hasAdminSession() {
  return getStoredKey().trim().length > 0
}

export function setAdminSessionKey(key: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ADMIN_KEY_STORAGE, key.trim())
}

export function clearAdminSessionKey() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ADMIN_KEY_STORAGE)
}
