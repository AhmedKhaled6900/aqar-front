import { useMutation } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { useCookies } from '@/lib/token-managament/useCookies'
import type { AuthResponse } from '@/lib/types'
import { persistAuthResponse } from './auth-storage'

interface LoginInput {
  email: string
  password: string
}

export function useLogin() {
  const axios = useAxiosInstance()
  const { setTokens } = useCookies()

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await axios.post<AuthResponse>('/auth/login', input)
      persistAuthResponse(data, setTokens)
      return data
    },
  })
}
