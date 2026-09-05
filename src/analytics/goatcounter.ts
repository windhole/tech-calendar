const SCRIPT_SRC = 'https://gc.zgo.at/count.js'

type ScriptState = 'idle' | 'loading' | 'ready' | 'failed'

let scriptState: ScriptState = 'idle'
let pendingPath: string | null = null

declare global {
  interface Window {
    goatcounter?: {
      no_onload?: boolean
      allow_local?: boolean
      count?: (vars?: { path?: string; title?: string; event?: boolean }) => void
    }
  }
}

function countEndpoint(): string | undefined {
  const raw = import.meta.env.VITE_GOATCOUNTER_COUNT_URL?.trim()
  if (!raw) {
    return undefined
  }

  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:') {
      return undefined
    }
    return raw
  } catch {
    return undefined
  }
}

function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

export function shouldTrackGoatCounter(): boolean {
  if (!import.meta.env.PROD) {
    return false
  }
  if (!countEndpoint()) {
    return false
  }
  if (typeof window === 'undefined') {
    return false
  }
  return !isLocalHostname(window.location.hostname)
}

function flushPending(): void {
  const path = pendingPath
  pendingPath = null
  if (path && window.goatcounter?.count) {
    window.goatcounter.count({ path })
  }
}

export function initGoatCounter(): void {
  if (!shouldTrackGoatCounter() || scriptState !== 'idle') {
    return
  }

  const endpoint = countEndpoint()
  if (!endpoint) {
    return
  }

  scriptState = 'loading'
  window.goatcounter = {
    ...(window.goatcounter ?? {}),
    no_onload: true,
    allow_local: false,
  }

  const script = document.createElement('script')
  script.async = true
  script.src = SCRIPT_SRC
  script.dataset.goatcounter = endpoint
  script.onload = () => {
    scriptState = 'ready'
    flushPending()
  }
  script.onerror = () => {
    scriptState = 'failed'
    pendingPath = null
  }
  document.head.appendChild(script)
}

export function trackPageview(path: string): void {
  if (!shouldTrackGoatCounter()) {
    return
  }

  initGoatCounter()

  if (scriptState === 'ready' && window.goatcounter?.count) {
    window.goatcounter.count({ path })
    return
  }

  if (scriptState === 'loading') {
    pendingPath = path
  }
}

export function pageviewPath(): string {
  return `${window.location.pathname}${window.location.search}`
}
