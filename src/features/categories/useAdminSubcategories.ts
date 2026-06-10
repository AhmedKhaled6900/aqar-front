import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { normalizePaginatedResponse } from '@/lib/api/pagination'
import type {
  AdminCategory,
  CreateSubcategoryInput,
  PaginatedResponse,
  UpdateSubcategoryInput,
} from '@/lib/types'

export function useAdminSubcategoriesList(
  page = 1,
  limit = 20,
  filters: { parentId?: string; isActive?: boolean } = {},
) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['admin', 'subcategories', 'list', page, limit, filters],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<AdminCategory>>(
        '/admin/subcategories',
        { params: { page, limit, ...filters } },
      )
      return data
    },
    select: (data) => normalizePaginatedResponse<AdminCategory>(data),
  })
}

export function useAdminSubcategory(id: string) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['admin', 'subcategories', 'detail', id],
    queryFn: async () => {
      const { data } = await axios.get<AdminCategory>(`/admin/subcategories/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateSubcategory() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      parentId,
      input,
    }: {
      parentId: string
      input: CreateSubcategoryInput
    }) => {
      const { data } = await axios.post<{ message: string; category: AdminCategory }>(
        '/admin/subcategories',
        { parentId, ...input },
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'subcategories'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateSubcategory() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: UpdateSubcategoryInput
    }) => {
      const { data } = await axios.patch<{ message: string; category: AdminCategory }>(
        `/admin/subcategories/${id}`,
        input,
      )
      return data
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'subcategories', 'detail', data.category.id],
      })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'subcategories', 'list'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteSubcategory() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete<{ message: string }>(
        `/admin/subcategories/${id}`,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'subcategories'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
