import { Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function PendingReviewPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-20 text-center">
      <Clock className="mb-4 h-16 w-16 text-warning" />
      <h1 className="mb-2 text-2xl font-bold">{t('owner.pendingReview')}</h1>
      <p className="text-muted-foreground">{t('owner.pendingMessage')}</p>
    </div>
  )
}
