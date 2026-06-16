import { Home, SearchX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[60vh] items-center justify-center animate-fade-in">
      <Card className="w-full max-w-md border-border/80 text-center shadow-[var(--shadow-card)]">
        <CardContent className="flex flex-col items-center gap-4 pt-10 pb-10">
          <div className="flex size-16 items-center justify-center rounded-full bg-main-muted">
            <SearchX className="size-8 text-main" />
          </div>
          <div className="space-y-2">
            <p className="text-6xl font-bold text-main">404</p>
            <h1 className="text-xl font-semibold">{t('notFound.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('notFound.description')}</p>
          </div>
          <Button asChild>
            <Link to="/">
              <Home className="size-4" />
              {t('notFound.backHome')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
