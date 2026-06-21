import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { extractPaginatedItems } from '@/lib/api/pagination'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { toastMeta } from '@/lib/mutation-meta'
import type { ProviderMenuItem } from '@/lib/types'

export interface CreateMenuItemInput {
  name: string
  price: number
  prepTimeMinutes?: number
  sortOrder?: number
}

export interface UpdateMenuItemInput {
  name?: string
  price?: number
  prepTimeMinutes?: number
  sortOrder?: number
  isActive?: boolean
}

export function useProviderMenuItems() {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['provider', 'menu-items'],
    queryFn: async () => {
      const { data } = await axios.get<{ items: ProviderMenuItem[] } | ProviderMenuItem[]>(
        '/provider/menu-items',
      )
      return extractPaginatedItems<ProviderMenuItem>(data)
    },
  })
}

export function useCreateMenuItem() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.created(),
    mutationFn: async (input: CreateMenuItemInput) => {
      const { data } = await axios.post<{
        message: string
        item: ProviderMenuItem
      }>('/provider/menu-items', input)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'menu-items'] })
    },
  })
}

export function useUpdateMenuItem() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.updated(),
    mutationFn: async ({ id, ...input }: UpdateMenuItemInput & { id: string }) => {
      const { data } = await axios.patch<{
        message: string
        item: ProviderMenuItem
      }>(`/provider/menu-items/${id}`, input)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'menu-items'] })
    },
  })
}

export function useDeleteMenuItem() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.deleted(),
    mutationFn: async (id: string) => {
      const { data } = await axios.delete<{ message: string }>(
        `/provider/menu-items/${id}`,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'menu-items'] })
    },
  })
}
