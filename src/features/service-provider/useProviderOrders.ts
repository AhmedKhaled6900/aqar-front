import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMe } from '@/features/auth/useMe'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { normalizePaginatedResponse } from '@/lib/api/pagination'
import { toastMeta } from '@/lib/mutation-meta'
import type { PaginatedResponse, ServiceOrder, ServiceOrderStatus } from '@/lib/types'

export interface ProviderOrdersFilters {
  status?: ServiceOrderStatus
  from?: string
  to?: string
  page?: number
  limit?: number
}

export function useProviderOrders(filters: ProviderOrdersFilters = {}) {
  const axios = useAxiosInstance()
  const { data: me } = useMe()
  const isProvider = me?.user.role === 'SERVICE_PROVIDER'

  return useQuery({
    queryKey: ['provider', 'orders', filters],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<ServiceOrder>>(
        '/provider/orders',
        { params: filters },
      )
      return normalizePaginatedResponse<ServiceOrder>(data)
    },
    enabled: isProvider,
  })
}

export function useProviderPendingOrdersCount() {
  const { data: me } = useMe()
  const isProvider = me?.user.role === 'SERVICE_PROVIDER'
  const { data } = useProviderOrders({
    status: 'PENDING',
    limit: 1,
    page: 1,
  })
  return isProvider ? (data?.meta.total ?? 0) : 0
}

export function useAcceptOrder() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async (id: string) => {
      const { data } = await axios.patch<{ message: string; order: ServiceOrder }>(
        `/provider/orders/${id}/accept`,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'orders'] })
      void queryClient.invalidateQueries({ queryKey: ['provider', 'dashboard'] })
    },
  })
}

export function useRejectOrder() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await axios.patch<{ message: string; order: ServiceOrder }>(
        `/provider/orders/${id}/reject`,
        { reason },
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'orders'] })
      void queryClient.invalidateQueries({ queryKey: ['provider', 'dashboard'] })
    },
  })
}

export function useUpdateOrderStatus() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: ServiceOrderStatus
    }) => {
      const { data } = await axios.patch<{ message: string; order: ServiceOrder }>(
        `/provider/orders/${id}/status`,
        { status },
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'orders'] })
      void queryClient.invalidateQueries({ queryKey: ['provider', 'dashboard'] })
    },
  })
}
