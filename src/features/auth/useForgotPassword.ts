import { useMutation } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { toastMeta } from '@/lib/mutation-meta'

export function useForgotPassword() {
  const axios = useAxiosInstance()

  return useMutation({
    meta: toastMeta.skipError(),
    mutationFn: async (input: { email?: string; phone?: string }) => {
      const { data } = await axios.post<{ message: string }>(
        '/auth/forgot-password',
        input,
      )
      return data
    },
  })
}
