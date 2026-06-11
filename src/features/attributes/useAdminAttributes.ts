import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { normalizePaginatedResponse } from '@/lib/api/pagination'
import type {
  Attribute,
  CreateAttributeInput,
  PaginatedResponse,
  SubcategoryAttributeLinkInput,
  SubcategoryAttributesResponse,
  UpdateAttributeInput,
} from '@/lib/types'

export function useAdminAttributes(
  page = 1,
  limit = 20,
  filters: { scope?: string; isActive?: boolean } = {},
) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['admin', 'attributes', page, limit, filters],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<Attribute>>(
        '/admin/attributes',
        { params: { page, limit, ...filters } },
      )
      return data
    },
    select: (data) => normalizePaginatedResponse<Attribute>(data),
  })
}

export function useAdminAttributeSelectMenu(scope = 'SYSTEM') {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['admin', 'attributes', 'select-menu', scope],
    queryFn: async () => {
      const { data } = await axios.get<{ items: Attribute[] }>(
        '/admin/attributes/select-menu',
        { params: { scope } },
      )
      return data.items
    },
  })
}

export function useSubcategoryAttributeLinks(subcategoryId: string, enabled = true) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['admin', 'attributes', 'subcategory-links', subcategoryId],
    queryFn: async () => {
      const { data } = await axios.get<SubcategoryAttributesResponse>(
        `/admin/attributes/subcategories/${subcategoryId}/links`,
      )
      return data
    },
    enabled: !!subcategoryId && enabled,
  })
}

export function useCreateAttribute() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateAttributeInput) => {
      const { data } = await axios.post<Attribute>('/admin/attributes', input)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'attributes'] })
    },
  })
}

export function useUpdateAttribute() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateAttributeInput }) => {
      const { data } = await axios.patch<Attribute>(`/admin/attributes/${id}`, input)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'attributes'] })
    },
  })
}

export function useDeleteAttribute() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete<{ message: string }>(
        `/admin/attributes/${id}`,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'attributes'] })
    },
  })
}

export function useSyncSubcategoryAttributes() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      subcategoryId,
      items,
    }: {
      subcategoryId: string
      items: SubcategoryAttributeLinkInput[]
    }) => {
      const { data } = await axios.put<SubcategoryAttributesResponse>(
        `/admin/attributes/subcategories/${subcategoryId}/links`,
        { items },
      )
      return data
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'attributes'] })
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'attributes', 'subcategory-links', variables.subcategoryId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['subcategory-attributes', variables.subcategoryId],
      })
    },
  })
}
