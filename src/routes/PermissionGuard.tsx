import { Navigate, Outlet } from 'react-router-dom'
import { useCookies } from '@/lib/token-managament/useCookies'

interface PermissionGuardProps {
  permission: string
  fallback?: string
}

export function PermissionGuard({
  permission,
  fallback = '/',
}: PermissionGuardProps) {
  const { hasPermission } = useCookies()

  if (!hasPermission(permission)) {
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}
