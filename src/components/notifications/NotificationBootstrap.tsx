import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { getAccessToken } from '@/lib/token-managament/useCookies'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import {
  clearFcmToken,
  getStoredFcmToken,
  storeFcmToken,
} from '@/lib/firebase/fcm-storage'
import { requestFcmToken, subscribeToForegroundMessages } from '@/lib/firebase/messaging'

export function NotificationBootstrap() {
  const queryClient = useQueryClient()
  const axios = useAxiosInstance()

  useEffect(() => {
    if (!getAccessToken()) return

    let unsubscribeForeground: (() => void) | undefined
    let cancelled = false

    const setup = async () => {
      if (!isFirebaseConfigured()) return

      const token = await requestFcmToken()
      if (!token || cancelled) return

      const stored = getStoredFcmToken()
      if (stored !== token) {
        try {
          await axios.post('/notifications/devices/register', {
            token,
            platform: 'web',
          })
          storeFcmToken(token)
        } catch {
          clearFcmToken()
        }
      }

      const unsub = await subscribeToForegroundMessages(() => {
        void queryClient.invalidateQueries({ queryKey: ['notifications'] })
      })
      if (!cancelled && typeof unsub === 'function') {
        unsubscribeForeground = unsub
      }
    }

    void setup()

    return () => {
      cancelled = true
      unsubscribeForeground?.()
    }
  }, [axios, queryClient])

  return null
}
