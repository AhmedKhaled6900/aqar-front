import { useQuery } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import type { ServiceCategory } from '@/lib/types'

export function useServiceCategories() {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['services', 'categories'],
    queryFn: async () => {
      const { data } = await axios.get<{ items: ServiceCategory[] }>(
        '/services/categories',
      )
      return data.items
    },
    staleTime: 5 * 60_000,
  })
}
