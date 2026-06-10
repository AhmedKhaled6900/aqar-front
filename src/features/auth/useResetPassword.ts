import { useMutation } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'

interface ResetPasswordInput {
  email?: string
  phone?: string
  code: string
  newPassword: string
}

export function useResetPassword() {
  const axios = useAxiosInstance()

  return useMutation({
    mutationFn: async (input: ResetPasswordInput) => {
      const { data } = await axios.post<{ message: string }>(
        '/auth/reset-password',
        input,
      )
      return data
    },
  })
}
