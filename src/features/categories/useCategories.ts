import { useQuery } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import type { Category } from '@/lib/types'

export function useCategories() {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await axios.get<Category[]>('/categories')
      return data
    },
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

export function flattenSubcategories(categories: Category[]) {
  return categories.flatMap((cat) => cat.subcategories ?? [])
}
