import { useQuery } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import type { SubcategoryAttributesResponse } from '@/lib/types'

export function useSubcategoryAttributes(subcategoryId: string) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['subcategory-attributes', subcategoryId],
    queryFn: async () => {
      const { data } = await axios.get<SubcategoryAttributesResponse>(
        `/subcategories/${subcategoryId}/attributes`,
      )
      return data
    },
    enabled: !!subcategoryId,
  })
}
