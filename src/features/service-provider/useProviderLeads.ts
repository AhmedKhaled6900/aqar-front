import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { normalizePaginatedResponse } from '@/lib/api/pagination'
import { toastMeta } from '@/lib/mutation-meta'
import type { PaginatedResponse, ServiceLead, ServiceLeadStatus } from '@/lib/types'

export interface ProviderLeadsFilters {
  status?: ServiceLeadStatus
  from?: string
  to?: string
  page?: number
  limit?: number
}

export function useProviderLeads(filters: ProviderLeadsFilters = {}) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['provider', 'leads', filters],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<ServiceLead>>(
        '/provider/leads',
        { params: filters },
      )
      return normalizePaginatedResponse<ServiceLead>(data)
    },
  })
}

export function useUpdateLeadStatus() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async ({ id, status }: { id: string; status: ServiceLeadStatus }) => {
      const { data } = await axios.patch<{ message: string; lead: ServiceLead }>(
        `/provider/leads/${id}/status`,
        { status },
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'leads'] })
      void queryClient.invalidateQueries({ queryKey: ['provider', 'dashboard'] })
    },
  })
}
