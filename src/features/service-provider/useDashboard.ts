import { useQuery } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import type { ProviderDashboardSummary } from '@/lib/types'

export interface DashboardFilters {
  from?: string
  to?: string
}

export function useDashboardSummary(filters: DashboardFilters = {}) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['provider', 'dashboard', 'summary', filters],
    queryFn: async () => {
      const { data } = await axios.get<ProviderDashboardSummary>(
        '/provider/dashboard/summary',
        { params: filters },
      )
      return data
    },
  })
}

export function useDashboardAnalytics(
  filters: DashboardFilters & { groupBy?: 'daily' | 'weekly' } = {},
) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['provider', 'dashboard', 'analytics', filters],
    queryFn: async () => {
      const { data } = await axios.get<{
        groupBy: string
        period: { from: string | null; to: string | null }
        series: Array<{
          period: string
          orders: number
          sales: number
          platformFee: number
          providerNet: number
        }>
      }>('/provider/dashboard/analytics', { params: filters })
      return data
    },
  })
}
