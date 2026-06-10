import { useMe } from '@/features/auth/useMe'
import { getAccessToken } from '@/lib/token-managament/useCookies'

export function AuthBootstrap() {
  useMe()
  if (!getAccessToken()) return null
  return null
}
