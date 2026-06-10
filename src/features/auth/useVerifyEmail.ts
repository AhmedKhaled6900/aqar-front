import { useMutation } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { useCookies } from '@/lib/token-managament/useCookies'
import type { AuthResponse } from '@/lib/types'
import { persistAuthResponse } from './auth-storage'

interface VerifyEmailInput {
  email: string
  code: string
}

export function useVerifyEmail() {
  const axios = useAxiosInstance()
  const { setTokens } = useCookies()

  return useMutation({
    mutationFn: async (input: VerifyEmailInput) => {
      const { data } = await axios.post<AuthResponse>('/auth/verify-email', input)
      persistAuthResponse(data, setTokens)
      return data
    },
  })
}
