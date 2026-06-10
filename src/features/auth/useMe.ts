import { useQuery } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import {
  getAccessToken,
  storePermissions,
} from '@/lib/token-managament/useCookies'
import type { MeResponse } from '@/lib/types'

export function useMe() {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await axios.get<MeResponse>('/auth/me')
      storePermissions(data.permissions)
      return data
    },
    enabled: !!getAccessToken(),
    retry: false,
  })
}
