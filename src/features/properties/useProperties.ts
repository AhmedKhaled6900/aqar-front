import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { normalizePaginatedResponse } from '@/lib/api/pagination'
import { toastMeta } from '@/lib/mutation-meta'
import type {
  PaginatedResponse,
  PricePeriod,
  Property,
  PropertyAttributeInput,
  PropertyCustomAttributeInput,
  PropertyPurpose,
} from '@/lib/types'

export interface PropertyFilters {
  purpose?: PropertyPurpose
  subcategoryId?: string
  parentCategoryId?: string
  city?: string
  page?: number
  limit?: number
}

export function useProperties(filters: PropertyFilters = {}) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<Property> | Property[]>(
        '/properties',
        { params: filters },
      )
      return data
    },
    select: (data) => normalizePaginatedResponse<Property>(data),
  })
}

export function useProperty(id: string) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['properties', id],
    queryFn: async () => {
      const { data } = await axios.get<Property>(`/properties/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export interface CreatePropertyInput {
  title: string
  description: string
  price: number
  city: string
  area: string
  address: string
  latitude?: number
  longitude?: number
  bedrooms?: number
  bathrooms?: number
  areaSize?: number
  purpose: PropertyPurpose
  pricePeriod?: PricePeriod
  parentCategoryId: string
  subcategoryId?: string
  isNegotiable?: boolean
  attributes?: PropertyAttributeInput[]
  customAttributes?: PropertyCustomAttributeInput[]
}

export function useCreateProperty() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.created(),
    mutationFn: async (input: CreatePropertyInput) => {
      const { data } = await axios.post<Property>('/properties', input)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['properties'] })
      void queryClient.invalidateQueries({ queryKey: ['my-properties'] })
    },
  })
}

export function useUpdateProperty(id: string) {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.updated(),
    mutationFn: async (input: Partial<CreatePropertyInput>) => {
      const { data } = await axios.patch<Property>(`/properties/${id}`, input)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['properties', id] })
      void queryClient.invalidateQueries({ queryKey: ['my-properties'] })
    },
  })
}

export function useDeleteProperty() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.deleted(),
    mutationFn: async (id: string) => {
      const { data } = await axios.delete<{ message: string }>(`/properties/${id}`)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-properties'] })
      void queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

export function useMyProperties(
  filters: {
    status?: string
    subcategoryId?: string
    parentCategoryId?: string
    page?: number
    limit?: number
  } = {},
) {
  const axios = useAxiosInstance()
  const { status, subcategoryId, parentCategoryId, page = 1, limit = 20 } = filters

  return useQuery({
    queryKey: ['my-properties', status, subcategoryId, parentCategoryId, page, limit],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<Property>>(
        '/properties/my/list',
        { params: { status, subcategoryId, parentCategoryId, page, limit } },
      )
      return data
    },
  })
}

export function useUploadPropertyImages(propertyId: string) {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async ({
      images,
      primaryIndex,
    }: {
      images: File[]
      primaryIndex?: number
    }) => {
      const formData = new FormData()
      images.forEach((file) => formData.append('images', file))
      if (primaryIndex !== undefined) {
        formData.append('primaryIndex', String(primaryIndex))
      }

      const { data } = await axios.post<Property>(
        `/properties/${propertyId}/images`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['properties', propertyId] })
      void queryClient.invalidateQueries({ queryKey: ['my-properties'] })
    },
  })
}

export function useUpdatePropertyImage(propertyId: string) {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async ({
      imageId,
      isPrimary,
      order,
    }: {
      imageId: string
      isPrimary?: boolean
      order?: number
    }) => {
      const { data } = await axios.patch<Property>(
        `/properties/${propertyId}/images/${imageId}`,
        { isPrimary, order },
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['properties', propertyId] })
    },
  })
}

export function useDeletePropertyImage(propertyId: string) {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.deleted(),
    mutationFn: async (imageId: string) => {
      const { data } = await axios.delete<Property>(
        `/properties/${propertyId}/images/${imageId}`,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['properties', propertyId] })
    },
  })
}

export function useUploadPropertyVideo(propertyId: string) {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async (video: File) => {
      const formData = new FormData()
      formData.append('video', video)

      const { data } = await axios.post<{ message: string; property: Property }>(
        `/properties/${propertyId}/video`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['properties', propertyId] })
      void queryClient.invalidateQueries({ queryKey: ['my-properties'] })
    },
  })
}

export function useDeletePropertyVideo(propertyId: string) {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.deleted(),
    mutationFn: async () => {
      const { data } = await axios.delete<{ message: string; property: Property }>(
        `/properties/${propertyId}/video`,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['properties', propertyId] })
      void queryClient.invalidateQueries({ queryKey: ['my-properties'] })
    },
  })
}

export function useSubmitProperty() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async (id: string) => {
      const { data } = await axios.post<Property>(`/properties/${id}/submit`)
      return data
    },
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ['properties', id] })
      void queryClient.invalidateQueries({ queryKey: ['my-properties'] })
    },
  })
}

export function useMarkPropertyRented() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async (id: string) => {
      const { data } = await axios.patch<{ message: string; property: Property }>(
        `/properties/${id}/mark-rented`,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-properties'] })
    },
  })
}
