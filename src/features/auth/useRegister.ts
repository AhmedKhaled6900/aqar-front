import { useMutation } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { toastMeta } from '@/lib/mutation-meta'
import type { User } from '@/lib/types'

interface RegisterInput {
  name: string
  email: string
  phone: string
  password: string
  role: 'CUSTOMER' | 'OWNER' | 'SERVICE_PROVIDER'
}

interface RegisterResponse {
  message: string
  user: User
}

export function useRegister() {
  const axios = useAxiosInstance()

  return useMutation({
    meta: toastMeta.skipError(),
    mutationFn: async (input: RegisterInput) => {
      const { data } = await axios.post<RegisterResponse>('/auth/register', input)
      return data
    },
  })
}
