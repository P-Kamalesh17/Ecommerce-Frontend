const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

let accessToken: string | null = null          // memory only
const REFRESH_KEY = "refreshToken"             // swap for a cookie later

export const tokenStore = {
  getAccess: () => accessToken,
  setTokens: (t: { token: string; refreshToken: string }) => {
    accessToken = t.token
    localStorage.setItem(REFRESH_KEY, t.refreshToken)
  },
  clear: () => {
    accessToken = null
    localStorage.removeItem(REFRESH_KEY)
  },
  hasSession: () =>
    accessToken !== null || localStorage.getItem(REFRESH_KEY) !== null,
}

// One refresh at a time: parallel 401s share the same promise
let refreshing: Promise<boolean> | null = null

export function refreshSession(): Promise<boolean> {
  if (refreshing) return refreshing
  refreshing = (async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY)
    if (!refreshToken) {
      console.warn("[auth] refresh skipped: no refreshToken in localStorage. Log in again.")
      return false
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/Authentication/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })
      if (!res.ok) {
        tokenStore.clear()
        return false
      }
      tokenStore.setTokens(await res.json()) // new token AND new refreshToken
      return true
    } catch {
      return false // network error: keep session, try later
    }
  })().finally(() => {
    refreshing = null
  })
  return refreshing
}

// Drop-in replacement for fetch(`${API_BASE_URL}${path}`, init)
export async function authFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const send = () => {
    const headers = new Headers(init.headers)
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`)
    return fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  }

  if (!accessToken) await refreshSession() // e.g. first call after page reload
  let res = await send()

  if (res.status === 401 && (await refreshSession())) {
    res = await send() // retry exactly once
  }
  if (res.status === 401) {
    console.warn(`[auth] 401 from ${path} and refresh did not help, redirecting to /login`)
    tokenStore.clear()
    window.location.assign("/login") // session is really over
  }
  return res
}

export async function logout() {
  const refreshToken = localStorage.getItem(REFRESH_KEY)
  if (refreshToken) {
    fetch(`${API_BASE_URL}/api/Authentication/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {})
  }
  tokenStore.clear()
}
