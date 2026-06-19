import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { toastMeta } from '@/lib/mutation-meta'
import type { ServiceListing, ServiceListingStatus, ServiceMenuItem } from '@/lib/types'

export interface ListingInput {
  title: string
  description?: string
  menuItems?: ServiceMenuItem[]
  metadata?: Record<string, unknown>
  status?: ServiceListingStatus
}

export function useProviderListings() {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['provider', 'listings'],
    queryFn: async () => {
      const { data } = await axios.get<ServiceListing[]>('/provider/listings')
      return data
    },
  })
}

export function useCreateListing() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.created(),
    mutationFn: async (input: ListingInput) => {
      const { data } = await axios.post<{
        message: string
        listing: ServiceListing
      }>('/provider/listings', input)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'listings'] })
      void queryClient.invalidateQueries({ queryKey: ['provider', 'profile'] })
    },
  })
}

export function useUpdateListing() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.updated(),
    mutationFn: async ({ id, ...input }: ListingInput & { id: string }) => {
      const { data } = await axios.patch<{
        message: string
        listing: ServiceListing
      }>(`/provider/listings/${id}`, input)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'listings'] })
    },
  })
}

export function useDeleteListing() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.deleted(),
    mutationFn: async (id: string) => {
      const { data } = await axios.delete<{ message: string }>(
        `/provider/listings/${id}`,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'listings'] })
      void queryClient.invalidateQueries({ queryKey: ['provider', 'profile'] })
    },
  })
}
