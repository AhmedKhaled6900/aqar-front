import Cookies from 'js-cookie'
import { useCallback, useMemo } from 'react'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const PERMISSIONS_KEY = 'permissions'

export function getAccessToken() {
  return Cookies.get(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return Cookies.get(REFRESH_TOKEN_KEY)
}

export function getPermissions(): string[] {
  try {
    const raw = localStorage.getItem(PERMISSIONS_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function storePermissions(permissions: string[]) {
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions))
}

export function clearAuthStorage() {
  Cookies.remove(ACCESS_TOKEN_KEY)
  Cookies.remove(REFRESH_TOKEN_KEY)
  localStorage.removeItem(PERMISSIONS_KEY)
}

export function useCookies() {
  const hasPermission = useCallback((permission: string) => {
    return getPermissions().includes(permission)
  }, [])

  const setTokens = useCallback((accessToken: string, refreshToken: string) => {
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, { expires: 1 })
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7 })
  }, [])

  const clearSession = useCallback(() => {
    clearAuthStorage()
  }, [])

  return useMemo(
    () => ({
      getAccessToken,
      getRefreshToken,
      getPermissions,
      storePermissions,
      hasPermission,
      setTokens,
      clearSession,
    }),
    [hasPermission, setTokens, clearSession],
  )
}
