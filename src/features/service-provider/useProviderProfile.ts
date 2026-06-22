import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { toastMeta } from '@/lib/mutation-meta'
import type { ServiceProviderProfile } from '@/lib/types'

export interface CreateProviderProfileInput {
  businessName: string
  categoryId: string
  description?: string
  phone?: string
  whatsapp?: string
}

export interface UpdateProviderProfileInput extends Partial<CreateProviderProfileInput> {
  menuDeliveryFee?: number
}

export interface SubmitProviderProfileInput {
  nationalId?: File
  commercialRegister?: File
}

export function useProviderProfile() {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['provider', 'profile'],
    queryFn: async () => {
      const { data } = await axios.get<ServiceProviderProfile>('/provider/profile')
      return data
    },
    retry: false,
  })
}

export function useCreateProviderProfile() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.created(),
    mutationFn: async (input: CreateProviderProfileInput) => {
      const { data } = await axios.post<{
        message: string
        profile: ServiceProviderProfile
      }>('/provider/profile', input)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'profile'] })
    },
  })
}

export function useUpdateProviderProfile() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.updated(),
    mutationFn: async (input: UpdateProviderProfileInput) => {
      const { data } = await axios.patch<{
        message: string
        profile: ServiceProviderProfile
      }>('/provider/profile', input)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'profile'] })
    },
  })
}

export function useUpdateProviderLogo() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.updated(),
    mutationFn: async (logo: File) => {
      const formData = new FormData()
      formData.append('logo', logo)
      const { data } = await axios.patch<{
        message: string
        profile: ServiceProviderProfile
      }>('/provider/profile/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'profile'] })
    },
  })
}

export function useSubmitProviderProfile() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async (input: SubmitProviderProfileInput) => {
      const formData = new FormData()
      if (input.nationalId) formData.append('nationalId', input.nationalId)
      if (input.commercialRegister) {
        formData.append('commercialRegister', input.commercialRegister)
      }

      const { data } = await axios.post<{
        message: string
        profile: ServiceProviderProfile
      }>('/provider/profile/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'profile'] })
    },
  })
}
