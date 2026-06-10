import { storePermissions } from '@/lib/token-managament/useCookies'
import type { AuthResponse } from '@/lib/types'

export function persistAuthResponse(
  data: AuthResponse,
  setTokens: (access: string, refresh: string) => void,
) {
  setTokens(data.accessToken, data.refreshToken)
  storePermissions(data.permissions)
}
