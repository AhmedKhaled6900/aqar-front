import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { extractPaginatedItems } from '@/lib/api/pagination'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { toastMeta } from '@/lib/mutation-meta'
import type { ServiceListing, ServiceListingStatus, ServiceMenuItem } from '@/lib/types'

export interface CreateListingInput {
  title: string
  description: string
  menuItems: ServiceMenuItem[]
  metadata: Record<string, unknown>
}

export interface UpdateListingInput extends CreateListingInput {
  status?: ServiceListingStatus
}

/** @deprecated use CreateListingInput / UpdateListingInput */
export type ListingInput = UpdateListingInput

export function buildCreateListingPayload(input: {
  title: string
  description?: string
  menuItems: ServiceMenuItem[]
  metadata?: Record<string, unknown>
}): CreateListingInput {
  return {
    title: input.title,
    description: input.description ?? '',
    menuItems: input.menuItems,
    metadata: input.metadata ?? {},
  }
}

export function useProviderListings() {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['provider', 'listings'],
    queryFn: async () => {
      const { data } = await axios.get<{ items: ServiceListing[] } | ServiceListing[]>(
        '/provider/listings',
      )
      return extractPaginatedItems<ServiceListing>(data)
    },
  })
}

export function useCreateListing() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.created(),
    mutationFn: async (input: CreateListingInput) => {
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

export function useUpdateListingStatus() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async ({ id, status }: { id: string; status: ServiceListingStatus }) => {
      const { data } = await axios.patch<{
        message: string
        listing: ServiceListing
      }>(`/provider/listings/${id}`, { status })
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'listings'] })
    },
  })
}

export function useUpdateListing() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.updated(),
    mutationFn: async ({ id, ...input }: UpdateListingInput & { id: string }) => {
      const { status, ...rest } = input
      const payload = {
        ...buildCreateListingPayload(rest),
        ...(status !== undefined ? { status } : {}),
      }
      const { data } = await axios.patch<{
        message: string
        listing: ServiceListing
      }>(`/provider/listings/${id}`, payload)
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
