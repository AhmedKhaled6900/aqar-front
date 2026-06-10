import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import type { PaginatedResponse, Property, PropertyPurpose } from '@/lib/types'

export interface PropertyFilters {
  purpose?: PropertyPurpose
  categoryId?: string
  city?: string
  page?: number
  limit?: number
}

export function useProperties(filters: PropertyFilters = {}) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<Property>>('/properties', {
        params: filters,
      })
      return data
    },
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
  categoryId: string
}

export function useCreateProperty() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
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
    mutationFn: async (id: string) => {
      const { data } = await axios.delete<{ message: string }>(`/properties/${id}`)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-properties'] })
    },
  })
}

export function useMyProperties(status?: string, page = 1) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['my-properties', status, page],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<Property>>(
        '/properties/my/list',
        { params: { status, page } },
      )
      return data
    },
  })
}

export function useUploadPropertyImages(propertyId: string) {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
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

export function useSubmitProperty() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
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

export function useMarkPropertySold() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.patch<{ message: string; property: Property }>(
        `/properties/${id}/mark-sold`,
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-properties'] })
    },
  })
}

export function useMarkPropertyRented() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
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
