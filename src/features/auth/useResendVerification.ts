import { useMutation } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { toastMeta } from '@/lib/mutation-meta'

export function useResendVerification() {
  const axios = useAxiosInstance()

  return useMutation({
    meta: toastMeta.skipError(),
    mutationFn: async (email: string) => {
      const { data } = await axios.post<{ message: string }>(
        '/auth/resend-verification',
        { email },
      )
      return data
    },
  })
}
