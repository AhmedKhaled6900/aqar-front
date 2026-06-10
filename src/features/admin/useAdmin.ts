import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import type { AxiosInstance } from 'axios'
import { useLocation } from 'react-router-dom'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import type {
  AdminOwnerListItem,
  OwnerProfile,
  PaginatedResponse,
  ProfileStatus,
  Property,
} from '@/lib/types'

function findOwnerInCache(
  queryClient: QueryClient,
  userId: string,
): OwnerProfile | undefined {
  const queries = queryClient.getQueriesData<PaginatedResponse<OwnerProfile>>({
    queryKey: ['admin', 'owners', 'pending'],
  })

  for (const [, data] of queries) {
    const found = data?.items.find((owner) => owner.userId === userId)
    if (found) return found
  }

  return undefined
}

async function fetchOwnerFromPendingList(axios: AxiosInstance, userId: string) {
  let page = 1
  const limit = 50

  while (true) {
    const { data } = await axios.get<PaginatedResponse<OwnerProfile>>(
      '/admin/owners/pending',
      { params: { page, limit } },
    )
    const found = data.items.find((owner) => owner.userId === userId)
    if (found) return found
    if (!data.meta.hasNextPage) break
    page++
  }

  throw new Error('Owner not found')
}

export function useAdminOwnerDetail(userId: string) {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()
  const location = useLocation()
  const initialOwner = (location.state as { owner?: OwnerProfile } | null)?.owner

  return useQuery({
    queryKey: ['admin', 'owners', userId],
    queryFn: async () => {
      const cached = findOwnerInCache(queryClient, userId)
      if (cached) return cached
      return fetchOwnerFromPendingList(axios, userId)
    },
    initialData: initialOwner,
    enabled: !!userId,
  })
}

export function useAdminOwners(
  page = 1,
  limit = 20,
  filters: {
    emailVerification?: 'VERIFIED' | 'NOT_VERIFIED'
    profileCompletion?: 'COMPLETE' | 'INCOMPLETE'
    profileStatus?: ProfileStatus
  } = {},
) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['admin', 'owners', 'all', page, limit, filters],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<AdminOwnerListItem>>(
        '/admin/owners',
        { params: { page, limit, ...filters } },
      )
      return data
    },
  })
}

function findOwnerListItemInCache(
  queryClient: QueryClient,
  userId: string,
): AdminOwnerListItem | undefined {
  const queries = queryClient.getQueriesData<PaginatedResponse<AdminOwnerListItem>>({
    queryKey: ['admin', 'owners', 'all'],
  })

  for (const [, data] of queries) {
    const found = data?.items.find((owner) => owner.id === userId)
    if (found) return found
  }

  return undefined
}

async function fetchOwnerFromAllList(axios: AxiosInstance, userId: string) {
  let page = 1
  const limit = 50

  while (true) {
    const { data } = await axios.get<PaginatedResponse<AdminOwnerListItem>>(
      '/admin/owners',
      { params: { page, limit } },
    )
    const found = data.items.find((owner) => owner.id === userId)
    if (found) return found
    if (!data.meta.hasNextPage) break
    page++
  }

  throw new Error('Owner not found')
}

export function useAdminOwnerListItem(userId: string) {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()
  const location = useLocation()
  const initialOwner = (location.state as { owner?: AdminOwnerListItem } | null)
    ?.owner

  return useQuery({
    queryKey: ['admin', 'owners', 'all', userId],
    queryFn: async () => {
      const cached = findOwnerListItemInCache(queryClient, userId)
      if (cached) return cached
      return fetchOwnerFromAllList(axios, userId)
    },
    initialData: initialOwner,
    enabled: !!userId,
  })
}

export function usePendingOwners(page = 1, limit = 10) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['admin', 'owners', 'pending', page, limit],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<OwnerProfile>>(
        '/admin/owners/pending',
        { params: { page, limit } },
      )
      return data
    },
  })
}

export function useApproveOwner() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await axios.patch<{ message: string; profile: OwnerProfile }>(
        `/admin/owners/${userId}/approve`,
      )
      return data
    },
    onSuccess: (_, userId) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'owners', 'pending'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'owners', userId] })
    },
  })
}

export function useRejectOwner() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { data } = await axios.patch<{ message: string; profile: OwnerProfile }>(
        `/admin/owners/${userId}/reject`,
        { reason },
      )
      return data
    },
    onSuccess: (_, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'owners', 'pending'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'owners', userId] })
    },
  })
}

export function useAdminProperties(status?: string, page = 1) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['admin', 'properties', status, page],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<Property>>(
        '/admin/properties',
        { params: { status, page } },
      )
      return data
    },
  })
}

export function usePendingProperties() {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['admin', 'properties', 'pending'],
    queryFn: async () => {
      const { data } = await axios.get<Property[]>(
        '/admin/properties/pending/list',
      )
      return data
    },
  })
}

export function useApproveProperty() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.patch<Property>(
        `/admin/properties/${id}/approve`,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] })
    },
  })
}

export function useRejectProperty() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await axios.patch<Property>(
        `/admin/properties/${id}/reject`,
        { reason },
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] })
    },
  })
}
