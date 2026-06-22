import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  storePermissions,
} from '@/lib/token-managament/useCookies'
import type { AuthResponse } from '@/lib/types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type AxiosContextValue = ReturnType<typeof axios.create>

const AxiosContext = createContext<AxiosContextValue | null>(null)

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  try {
    const { data } = await axios.post<AuthResponse>(
      `${API_URL}/auth/refresh-token`,
      { refreshToken },
    )
    Cookies.set('access_token', data.accessToken, { expires: 1 })
    Cookies.set('refresh_token', data.refreshToken, { expires: 7 })
    storePermissions(data.permissions)
    return data.accessToken
  } catch {
    clearAuthStorage()
    return null
  }
}

function createAxiosInstance() {
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    // 304 is not treated as success by default; API clients should always read body.
    validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
  })

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.data instanceof FormData) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type')
      } else {
        delete config.headers['Content-Type']
      }
    }
    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean
      }

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/refresh-token')
      ) {
        originalRequest._retry = true

        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }

        const newToken = await refreshPromise
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return instance(originalRequest)
        }
      }

      return Promise.reject(error)
    },
  )

  return instance
}

export function AxiosProvider({ children }: { children: ReactNode }) {
  const instance = useMemo(() => createAxiosInstance(), [])

  return (
    <AxiosContext.Provider value={instance}>{children}</AxiosContext.Provider>
  )
}

export function useAxiosInstance() {
  const instance = useContext(AxiosContext)
  if (!instance) {
    throw new Error('useAxiosInstance must be used within AxiosProvider')
  }
  return instance
}
