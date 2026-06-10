import { useQuery } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { extractPaginatedItems } from '@/lib/api/pagination'
import type { Category, PaginatedResponse } from '@/lib/types'

export function useCategories(limit = 100) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['categories', limit],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<Category> | Category[]>(
        '/categories',
        { params: { page: 1, limit } },
      )
      return data
    },
    select: (data) => extractPaginatedItems<Category>(data),
  })
}

export function useCategory(slug: string) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['categories', slug],
    queryFn: async () => {
      const { data } = await axios.get<Category>(`/categories/${slug}`)
      return data
    },
    enabled: !!slug,
  })
}

export function flattenSubcategories(categories: Category[] | unknown) {
  const list = extractPaginatedItems<Category>(categories)
  return list.flatMap((cat) =>
    Array.isArray(cat.subcategories) ? cat.subcategories : [],
  )
}
