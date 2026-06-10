import { useMutation } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'

export function useForgotPassword() {
  const axios = useAxiosInstance()

  return useMutation({
    mutationFn: async (input: { email?: string; phone?: string }) => {
      const { data } = await axios.post<{ message: string }>(
        '/auth/forgot-password',
        input,
      )
      return data
    },
  })
}
