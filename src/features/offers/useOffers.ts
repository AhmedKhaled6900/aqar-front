import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { normalizePaginatedResponse } from '@/lib/api/pagination'
import type {
  CreateOfferInput,
  OwnerPropertyOffersGroup,
  PaginatedResponse,
  PriceOffer,
} from '@/lib/types'

export function useOwnerOffersGrouped() {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['offers', 'received', 'grouped'],
    queryFn: async () => {
      const { data } = await axios.get<{ items: OwnerPropertyOffersGroup[] }>(
        '/offers/received/by-property',
      )
      return data.items
    },
  })
}

export function useOwnerOffers(
  page = 1,
  limit = 20,
  filters: { propertyId?: string; status?: string } = {},
) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['offers', 'received', page, limit, filters],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<PriceOffer>>(
        '/offers/received',
        { params: { page, limit, ...filters } },
      )
      return data
    },
    select: (data) => normalizePaginatedResponse<PriceOffer>(data),
  })
}

export function useOffer(id: string) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['offers', id],
    queryFn: async () => {
      const { data } = await axios.get<PriceOffer>(`/offers/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useAcceptOffer() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.post<PriceOffer>(`/offers/${id}/accept`)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
  })
}

export function useRejectOffer() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await axios.post<PriceOffer>(`/offers/${id}/reject`, {
        reason,
      })
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
  })
}

export function useCounterOffer() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: CreateOfferInput }) => {
      const { data } = await axios.post<PriceOffer>(`/offers/${id}/counter`, input)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
  })
}

export function canOwnerRespond(offer: PriceOffer): boolean {
  if (offer.status === 'PENDING') return true
  if (offer.status === 'NEGOTIATING') {
    return offer.latestRound?.senderRole === 'CUSTOMER'
  }
  return false
}
