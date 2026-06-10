import type { QueryClient } from '@tanstack/react-query'
import type { AxiosInstance } from 'axios'
import { clearFcmToken, getStoredFcmToken } from '@/lib/firebase/fcm-storage'

export async function logoutSession(
  axios: AxiosInstance,
  queryClient: QueryClient,
  clearSession: () => void,
) {
  const fcmToken = getStoredFcmToken()

  if (fcmToken) {
    try {
      await axios.delete(`/notifications/devices/${encodeURIComponent(fcmToken)}`)
    } catch {
      // Ignore — session is ending anyway
    }
    clearFcmToken()
  }

  clearSession()
  queryClient.clear()
}
