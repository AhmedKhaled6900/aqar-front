import type { User } from '@/lib/types'

export function getPostLoginPath(user: User): string {
  if (!user.isVerified) {
    return '/auth/verify-email'
  }

  if (user.role === 'OWNER') {
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

  if (user.role === 'ADMIN') {
    return '/admin/owners/pending'
  }

  return '/'
}
