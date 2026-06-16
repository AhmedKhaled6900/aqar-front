import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { normalizePaginatedResponse } from '@/lib/api/pagination'
import { toastMeta } from '@/lib/mutation-meta'
import type {
  AdminCategory,
  CreateCategoryInput,
  PaginatedResponse,
  UpdateCategoryInput,
} from '@/lib/types'

export function useAdminCategories(
  page = 1,
  limit = 20,
  filters: { isActive?: boolean; parentId?: string } = {},
) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['admin', 'categories', page, limit, filters],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<AdminCategory>>(
        '/admin/categories',
        { params: { page, limit, ...filters } },
      )
      return data
    },
    select: (data) => normalizePaginatedResponse<AdminCategory>(data),
  })
}

export function useAdminCategory(id: string) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['admin', 'categories', id],
    queryFn: async () => {
      const { data } = await axios.get<AdminCategory>(`/admin/categories/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.created(),
    mutationFn: async (input: CreateCategoryInput) => {
      const { data } = await axios.post<{ message: string; category: AdminCategory }>(
        '/admin/categories',
        input,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.updated(),
    mutationFn: async ({ id, input }: { id: string; input: UpdateCategoryInput }) => {
      const { data } = await axios.patch<{ message: string; category: AdminCategory }>(
        `/admin/categories/${id}`,
        input,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteCategory() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.deleted(),
    mutationFn: async (id: string) => {
      const { data } = await axios.delete<{ message: string }>(
        `/admin/categories/${id}`,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
