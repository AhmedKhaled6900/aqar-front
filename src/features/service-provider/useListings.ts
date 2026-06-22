import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { extractPaginatedItems } from '@/lib/api/pagination'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { toastMeta } from '@/lib/mutation-meta'
import type { ListingMenuItem, ServiceListing, ServiceListingStatus } from '@/lib/types'

export interface ListingMenuItemInput {
  id?: string
  name: string
  price: number
  prepTimeMinutes?: number
}

export interface CreateListingInput {
  title: string
  image: File
  description?: string
  deliveryFee?: number
  link?: string
  metadata?: Record<string, unknown>
  menuItems?: ListingMenuItemInput[]
}

export interface UpdateListingInput {
  title: string
  image?: File
  description?: string
  deliveryFee?: number
  link?: string
  metadata?: Record<string, unknown>
  status?: ServiceListingStatus
  /** عند الإرسال يستبدل المنيو بالكامل؛ عند الغياب يبقى المنيو كما هو */
  menuItems?: ListingMenuItemInput[]
}

/** @deprecated use CreateListingInput / UpdateListingInput */
export type ListingInput = UpdateListingInput

function serializeListingMenuItems(items: ListingMenuItemInput[]): string {
  return JSON.stringify(
    items.map((item) => {
      const payload: Record<string, unknown> = {
        name: item.name,
        price: item.price,
      }
      if (item.prepTimeMinutes != null && item.prepTimeMinutes > 0) {
        payload.prepTimeMinutes = item.prepTimeMinutes
      }
      if (item.id) payload.id = item.id
      return payload
    }),
  )
}

function buildListingFormData(input: {
  title: string
  image?: File
  description?: string
  deliveryFee?: number
  link?: string
  metadata?: Record<string, unknown>
  status?: ServiceListingStatus
  menuItems?: ListingMenuItemInput[]
}): FormData {
  const form = new FormData()
  form.append('title', input.title)
  if (input.image) form.append('image', input.image)
  if (input.description) form.append('description', input.description)
  if (input.deliveryFee !== undefined) {
    form.append('deliveryFee', String(input.deliveryFee))
  }
  if (input.link) form.append('link', input.link)
  if (input.metadata && Object.keys(input.metadata).length > 0) {
    form.append('metadata', JSON.stringify(input.metadata))
  }
  if (input.status) form.append('status', input.status)
  if (input.menuItems !== undefined) {
    form.append('menuItems', serializeListingMenuItems(input.menuItems))
  }
  return form
}

export function listingMenuItemsFromApi(
  items: ListingMenuItem[] | null | undefined,
): ListingMenuItemInput[] {
  if (!items?.length) return []
  return items.map((item) => ({
    ...(item.id ? { id: item.id } : {}),
    name: item.name,
    price: item.price,
    ...(item.prepTimeMinutes != null && item.prepTimeMinutes > 0
      ? { prepTimeMinutes: item.prepTimeMinutes }
      : {}),
  }))
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
      const { menuItems, ...rest } = input
      const formData = buildListingFormData({
        ...rest,
        ...(menuItems?.length ? { menuItems } : {}),
      })
      const { data } = await axios.post<{
        message: string
        listing: ServiceListing
      }>('/provider/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
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
      const formData = new FormData()
      formData.append('status', status)
      const { data } = await axios.patch<{
        message: string
        listing: ServiceListing
      }>(`/provider/listings/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
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
      const formData = buildListingFormData(input)
      const { data } = await axios.patch<{
        message: string
        listing: ServiceListing
      }>(`/provider/listings/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
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
