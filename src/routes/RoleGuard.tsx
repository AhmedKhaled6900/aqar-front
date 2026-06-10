import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '@/components/ui/spinner'
import { useMe } from '@/features/auth/useMe'
import type { UserRole } from '@/lib/types'

interface RoleGuardProps {
  roles: UserRole[]
  fallback?: string
}

export function RoleGuard({ roles, fallback = '/' }: RoleGuardProps) {
  const { data, isLoading } = useMe()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!data?.user || !roles.includes(data.user.role)) {
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}
