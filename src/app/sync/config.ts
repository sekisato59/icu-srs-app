export interface SyncConfig { token: string; owner: string; repo: string; branch: string }

const KEY = 'icu-srs-sync'

export function loadConfig(): SyncConfig | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    const c = JSON.parse(raw) as SyncConfig
    if (!c || typeof c.token !== 'string' || typeof c.owner !== 'string' || typeof c.repo !== 'string' || typeof c.branch !== 'string') return null
    return c
  } catch {
    return null
  }
}

export function saveConfig(c: SyncConfig): void {
  localStorage.setItem(KEY, JSON.stringify(c))
}

export function clearConfig(): void {
  localStorage.removeItem(KEY)
}
