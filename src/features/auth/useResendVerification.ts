import { useMutation } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'

export function useResendVerification() {
  const axios = useAxiosInstance()

  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await axios.post<{ message: string }>(
        '/auth/resend-verification',
        { email },
      )
      return data
    },
  })
}
