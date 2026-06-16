import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { toastMeta } from '@/lib/mutation-meta'
import { getAccessToken } from '@/lib/token-managament/useCookies'
import type { Notification, PaginatedResponse } from '@/lib/types'

export function useNotifications(page = 1, limit = 10) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<Notification>>(
        '/notifications',
        { params: { page, limit } },
      )
      return data
    },
    enabled: !!getAccessToken(),
  })
}

export function useUnreadNotificationsCount() {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await axios.get<{ unreadCount: number }>(
        '/notifications/unread-count',
      )
      return data.unreadCount
    },
    refetchInterval: 60_000,
    enabled: !!getAccessToken(),
  })
}

export function useRegisterDevice() {
  const axios = useAxiosInstance()

  return useMutation({
    meta: { ...toastMeta.skipError(), ...toastMeta.skipSuccess() },
    mutationFn: async (token: string) => {
      const { data } = await axios.post<{ message: string }>(
        '/notifications/devices/register',
        { token, platform: 'web' },
      )
      return data
    },
  })
}

export function useUnregisterDevice() {
  const axios = useAxiosInstance()

  return useMutation({
    meta: { ...toastMeta.skipError(), ...toastMeta.skipSuccess() },
    mutationFn: async (token: string) => {
      const { data } = await axios.delete<{ message: string }>(
        `/notifications/devices/${encodeURIComponent(token)}`,
      )
      return data
    },
  })
}

export function useMarkNotificationRead() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: { ...toastMeta.skipError(), ...toastMeta.skipSuccess() },
    mutationFn: async (id: string) => {
      const { data } = await axios.patch<Notification>(
        `/notifications/${id}/read`,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: { ...toastMeta.skipError(), ...toastMeta.skipSuccess() },
    mutationFn: async () => {
      const { data } = await axios.patch<{ message: string; updatedCount: number }>(
        '/notifications/read-all',
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
