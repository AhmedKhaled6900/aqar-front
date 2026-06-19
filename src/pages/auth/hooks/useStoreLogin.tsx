import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '@/features/auth/useLogin'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { resolvePostLoginPath } from '@/lib/auth-redirect'

export function useStoreLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const axios = useAxiosInstance()
  const loginMutation = useLogin()

  const login = async (email: string, password: string) => {
    try {
      const data = await loginMutation.mutateAsync({ email, password })
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      const path = await resolvePostLoginPath(axios, data.user)
      navigate(path)
      return { success: true as const }
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { isVerified?: boolean; message?: string } }
      }

      if (err.response?.status === 403 && err.response.data?.isVerified === false) {
        navigate('/auth/verify-email', { state: { email } })
        return { success: false as const, unverified: true }
      }

      const message =
        err.response?.data?.message ?? 'فشل تسجيل الدخول. تحقق من البيانات.'
      return { success: false as const, message }
    }
  }

  return {
    login,
    isPending: loginMutation.isPending,
    error: loginMutation.error,
  }
}
