import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { extractPaginatedItems } from '@/lib/api/pagination'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { toastMeta } from '@/lib/mutation-meta'
import type { ServiceCoverageArea } from '@/lib/types'

export function useCoverageAreas() {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['provider', 'coverage-areas'],
    queryFn: async () => {
      const { data } = await axios.get<
        { items: ServiceCoverageArea[] } | ServiceCoverageArea[]
      >('/provider/coverage-areas')
      return extractPaginatedItems<ServiceCoverageArea>(data)
    },
  })
}

export function useCreateCoverageArea() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.created(),
    mutationFn: async (input: { city: string; area?: string }) => {
      const { data } = await axios.post<{
        message: string
        area: ServiceCoverageArea
      }>('/provider/coverage-areas', input)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'coverage-areas'] })
      void queryClient.invalidateQueries({ queryKey: ['provider', 'profile'] })
    },
  })
}

export function useUpdateCoverageArea() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.updated(),
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data } = await axios.patch<{
        message: string
        area: ServiceCoverageArea
      }>(`/provider/coverage-areas/${id}`, { isActive })
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'coverage-areas'] })
    },
  })
}

export function useDeleteCoverageArea() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.deleted(),
    mutationFn: async (id: string) => {
      const { data } = await axios.delete<{ message: string }>(
        `/provider/coverage-areas/${id}`,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'coverage-areas'] })
      void queryClient.invalidateQueries({ queryKey: ['provider', 'profile'] })
    },
  })
}
