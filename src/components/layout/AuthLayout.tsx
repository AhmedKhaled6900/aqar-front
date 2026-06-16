import { Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthLayout() {
  const { t } = useTranslation()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 gradient-page" />
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-main/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative w-full max-w-md animate-scale-in">
        <Link
          to="/"
          className="mb-6 flex items-center justify-center gap-2 text-main transition-opacity hover:opacity-80"
        >
          <span className="flex size-11 items-center justify-center rounded-xl gradient-brand text-white shadow-[var(--shadow-soft)]">
            <Building2 className="h-6 w-6" />
          </span>
          <span className="text-2xl font-bold">{t('app.name')}</span>
        </Link>
        <Card className="border-border/80 shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-center text-main">{t('app.tagline')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
