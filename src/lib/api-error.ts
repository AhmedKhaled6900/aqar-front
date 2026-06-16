import type { AxiosError } from 'axios'

type ApiErrorBody = {
  message?: string | string[]
  error?: string
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'حدث خطأ',
): string {
  if (!error) return fallback

  const axiosErr = error as AxiosError<ApiErrorBody>
  const message = axiosErr.response?.data?.message

  if (Array.isArray(message)) {
    return message.join(' — ')
  }

  if (typeof message === 'string' && message.trim()) {
    return message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
