import { Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 flex items-center justify-center gap-2 text-main"
        >
          <Building2 className="h-8 w-8" />
          <span className="text-2xl font-bold">{t('app.name')}</span>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t('app.tagline')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
