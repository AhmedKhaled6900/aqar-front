import { isAxiosError, type AxiosInstance } from 'axios'
import type { ServiceProviderProfile, User } from '@/lib/types'

export function getOwnerPostLoginPath(user: User): string {
  if (user.profileStatus === 'INCOMPLETE' || user.profileStatus === 'REJECTED') {
    return '/owner/complete-profile'
  }
  if (user.profileStatus === 'KYC_PENDING') {
    return '/owner/pending-review'
  }
  if (user.profileStatus === 'VERIFIED') {
    return '/owner/dashboard'
  }
  return '/owner/complete-profile'
}

export function getProviderPathFromProfile(
  profile: ServiceProviderProfile | null | undefined,
): string {
  if (!profile) return '/provider/setup'

  switch (profile.status) {
    case 'DRAFT':
    case 'REJECTED':
      return '/provider/profile'
    case 'PENDING':
      return '/provider/pending-review'
    case 'SUSPENDED':
      return '/provider/suspended'
    case 'APPROVED':
      return '/provider/dashboard'
    default:
      return '/provider/setup'
  }
}

export async function resolvePostLoginPath(
  axios: AxiosInstance,
  user: User,
): Promise<string> {
  if (!user.isVerified) {
    return '/auth/verify-email'
  }

  if (user.role === 'SERVICE_PROVIDER') {
    try {
      const { data } = await axios.get<ServiceProviderProfile>('/provider/profile')
      return getProviderPathFromProfile(data)
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return '/provider/setup'
      }
      return '/provider/setup'
    }
  }

  if (user.role === 'OWNER') {
    return getOwnerPostLoginPath(user)
  }

  if (user.role === 'ADMIN') {
    return '/admin/owners/pending'
  }

  return '/'
}

/** @deprecated Use resolvePostLoginPath for provider-aware redirect */
export function getPostLoginPath(user: User): string {
  if (!user.isVerified) {
    return '/auth/verify-email'
  }

  if (user.role === 'OWNER') {
    return getOwnerPostLoginPath(user)
  }

  if (user.role === 'ADMIN') {
    return '/admin/owners/pending'
  }

  if (user.role === 'SERVICE_PROVIDER') {
    return '/provider/setup'
  }

  return '/'
}
