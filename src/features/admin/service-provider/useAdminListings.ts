import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { normalizePaginatedResponse } from '@/lib/api/pagination'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { toastMeta } from '@/lib/mutation-meta'
import type {
  AdminServiceListingRecord,
  PaginatedResponse,
  ServiceListing,
  ServiceListingStatus,
} from '@/lib/types'

export interface AdminListingsFilters {
  status?: ServiceListingStatus
  featured?: boolean
  page?: number
  limit?: number
}

export function useAdminListings(filters: AdminListingsFilters = {}) {
  const axios = useAxiosInstance()
  const { page = 1, limit = 20, ...params } = filters

  return useQuery({
    queryKey: ['admin', 'listings', filters],
    queryFn: async () => {
      const { data } = await axios.get<
        PaginatedResponse<AdminServiceListingRecord> | AdminServiceListingRecord[]
      >('/admin/listings', { params: { page, limit, ...params } })
      return normalizePaginatedResponse<AdminServiceListingRecord>(
        Array.isArray(data) ? { items: data } : data,
      )
    },
  })
}

export function usePendingListings(page = 1, limit = 10) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['admin', 'listings', 'pending', page, limit],
    queryFn: async () => {
      const { data } = await axios.get<
        PaginatedResponse<AdminServiceListingRecord> | AdminServiceListingRecord[]
      >('/admin/listings/pending', { params: { page, limit } })
      return normalizePaginatedResponse<AdminServiceListingRecord>(
        Array.isArray(data) ? { items: data } : data,
      )
    },
  })
}

export function useAdminListingDetail(listingId: string) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['admin', 'listings', listingId],
    queryFn: async () => {
      const { data } = await axios.get<AdminServiceListingRecord>(
        `/admin/listings/${listingId}`,
      )
      return data
    },
    enabled: Boolean(listingId),
  })
}

export function useApproveListing() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async (id: string) => {
      const { data } = await axios.patch<{
        message: string
        listing: ServiceListing
      }>(`/admin/listings/${id}/approve`)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] })
    },
  })
}

export function useRejectListing() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await axios.patch<{
        message: string
        listing: ServiceListing
      }>(`/admin/listings/${id}/reject`, { reason })
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] })
    },
  })
}

export function useSetListingFeatured() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      const { data } = await axios.patch<{
        message: string
        listing: ServiceListing
      }>(`/admin/listings/${id}/featured`, { isFeatured })
      return data
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] })
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'listings', variables.id],
      })
    },
  })
}
