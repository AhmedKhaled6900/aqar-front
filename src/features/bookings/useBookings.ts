import { useQuery } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { normalizePaginatedResponse } from '@/lib/api/pagination'
import type { PaginatedResponse, PropertyRentalRecord } from '@/lib/types'

export function useMyRentals(page = 1, limit = 20) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['bookings', 'my', page, limit],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<PropertyRentalRecord>>(
        '/bookings/my',
        { params: { page, limit } },
      )
      return data
    },
    select: (data) => normalizePaginatedResponse<PropertyRentalRecord>(data),
  })
}

export function usePropertyRentals(propertyId: string, enabled = true) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['bookings', 'property', propertyId],
    queryFn: async () => {
      const { data } = await axios.get<PropertyRentalRecord[]>(
        `/bookings/property/${propertyId}`,
      )
      return data
    },
    enabled: !!propertyId && enabled,
  })
}
