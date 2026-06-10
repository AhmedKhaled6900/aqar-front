import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '@/components/ui/spinner'
import { useMe } from '@/features/auth/useMe'
import { getAccessToken } from '@/lib/token-managament/useCookies'

export function ProtectedRoute() {
  const location = useLocation()
  const hasToken = !!getAccessToken()
  const { isLoading, isError } = useMe()

  if (!hasToken) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
