import { useMutation } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { getRefreshToken, useCookies } from '@/lib/token-managament/useCookies'
import type { AuthResponse } from '@/lib/types'
import { persistAuthResponse } from './auth-storage'

export function useRefreshToken() {
  const axios = useAxiosInstance()
  const { setTokens } = useCookies()

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken()
      if (!refreshToken) throw new Error('No refresh token')

      const { data } = await axios.post<AuthResponse>('/auth/refresh-token', {
        refreshToken,
      })
      persistAuthResponse(data, setTokens)
      return data
    },
  })
}
