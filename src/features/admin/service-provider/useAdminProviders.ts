import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { normalizePaginatedResponse } from '@/lib/api/pagination'
import { toastMeta } from '@/lib/mutation-meta'
import type {
  AdminServiceProviderListItem,
  PaginatedResponse,
  ServiceCategory,
  ServiceProviderProfile,
} from '@/lib/types'

export function usePendingProviders(page = 1, limit = 10) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['admin', 'providers', 'pending', page, limit],
    queryFn: async () => {
      const { data } = await axios.get<
        PaginatedResponse<AdminServiceProviderListItem>
      >('/admin/providers/pending', { params: { page, limit } })
      return normalizePaginatedResponse<AdminServiceProviderListItem>(data)
    },
  })
}

export function useApproveServiceProvider() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async (userId: string) => {
      const { data } = await axios.patch<{
        message: string
        profile: ServiceProviderProfile
      }>(`/admin/providers/${userId}/approve`)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] })
    },
  })
}

export function useRejectServiceProvider() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { data } = await axios.patch<{
        message: string
        profile: ServiceProviderProfile
      }>(`/admin/providers/${userId}/reject`, { reason })
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] })
    },
  })
}

export function useSuspendServiceProvider() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const { data } = await axios.patch<{
        message: string
        profile: ServiceProviderProfile
      }>(`/admin/providers/${userId}/suspend`, { reason })
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] })
    },
  })
}

export function useAdminServiceCategories() {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['admin', 'service-categories'],
    queryFn: async () => {
      const { data } = await axios.get<ServiceCategory[]>(
        '/admin/service-categories',
      )
      return data
    },
  })
}

export function useCreateServiceCategory() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.created(),
    mutationFn: async (input: {
      name: string
      slug: string
      description?: string
      commissionRate?: number
    }) => {
      const { data } = await axios.post<{
        message: string
        category: ServiceCategory
      }>('/admin/service-categories', input)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'service-categories'] })
      void queryClient.invalidateQueries({ queryKey: ['services', 'categories'] })
    },
  })
}

export function useUpdateServiceCategory() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.updated(),
    mutationFn: async ({
      id,
      ...input
    }: {
      id: string
      name?: string
      commissionRate?: number
      isActive?: boolean
      sortOrder?: number
    }) => {
      const { data } = await axios.patch<{
        message: string
        category: ServiceCategory
      }>(`/admin/service-categories/${id}`, input)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'service-categories'] })
      void queryClient.invalidateQueries({ queryKey: ['services', 'categories'] })
    },
  })
}
