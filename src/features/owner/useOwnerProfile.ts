import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { toastMeta } from '@/lib/mutation-meta'
import type { OwnerProfile, OwnerType } from '@/lib/types'

export function useOwnerProfile() {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['owner', 'profile'],
    queryFn: async () => {
      const { data } = await axios.get<OwnerProfile>('/owner/profile')
      return data
    },
    retry: false,
  })
}

export interface CompleteOwnerProfileInput {
  ownerType: OwnerType
  companyName?: string
  whatsapp?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  area?: string
  bio?: string
  nationalId?: File
  taxNumber?: File
  commercialRegister?: File
}

export function useCompleteOwnerProfile() {
  const axios = useAxiosInstance()
  const queryClient = useQueryClient()

  return useMutation({
    meta: toastMeta.saved(),
    mutationFn: async (input: CompleteOwnerProfileInput) => {
      const formData = new FormData()
      formData.append('ownerType', input.ownerType)

      if (input.companyName) formData.append('companyName', input.companyName)
      if (input.whatsapp) formData.append('whatsapp', input.whatsapp)
      if (input.phone) formData.append('phone', input.phone)
      if (input.email) formData.append('email', input.email)
      if (input.address) formData.append('address', input.address)
      if (input.city) formData.append('city', input.city)
      if (input.area) formData.append('area', input.area)
      if (input.bio) formData.append('bio', input.bio)
      if (input.nationalId) formData.append('nationalId', input.nationalId)
      if (input.taxNumber) formData.append('taxNumber', input.taxNumber)
      if (input.commercialRegister) {
        formData.append('commercialRegister', input.commercialRegister)
      }

      const { data } = await axios.post<{
        message: string
        profile: OwnerProfile
      }>('/owner/profile/complete', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['owner', 'profile'] })
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}
