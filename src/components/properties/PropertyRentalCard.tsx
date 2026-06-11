import { Calendar, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PropertyRental, PropertyRentalRecord } from '@/lib/types'
import {
  formatDateAr,
  formatOfferPrice,
  formatRentalDuration,
} from '@/lib/utils'

interface PropertyRentalCardProps {
  rental: PropertyRental | PropertyRentalRecord
  compact?: boolean
}

export function PropertyRentalCard({ rental, compact = false }: PropertyRentalCardProps) {
  const { t } = useTranslation()

  const content = (
    <div className={compact ? 'space-y-2 text-sm' : 'space-y-3'}>
      <div className="flex flex-wrap items-center gap-2">
        <p className={compact ? 'font-semibold text-main' : 'text-xl font-bold text-main'}>
          {formatOfferPrice(rental.agreedPrice, rental.pricePeriod)}
        </p>
        <Badge variant="secondary">{t(`rental.source.${rental.source}`)}</Badge>
        <Badge variant={rental.status === 'ACTIVE' ? 'success' : 'secondary'}>
          {t(`rental.status.${rental.status}`)}
        </Badge>
      </div>

      <p className="text-muted-foreground">
        {t('rental.duration')}:{' '}
        <span className="font-medium text-foreground">
          {formatRentalDuration(rental.duration, rental.pricePeriod)}
        </span>
      </p>

      <div className="flex flex-wrap gap-4 text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {t('rental.startedAt')}: {formatDateAr(rental.startedAt)}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {t('rental.endsAt')}: {formatDateAr(rental.endsAt)}
        </span>
      </div>

      {rental.tenant && (
        <div className="rounded-md bg-muted/50 p-3">
          <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            {t('rental.tenant')}
          </p>
          <p className="font-medium">{rental.tenant.name}</p>
          {rental.tenant.email && (
            <p className="text-sm text-muted-foreground" dir="ltr">
              {rental.tenant.email}
            </p>
          )}
          {rental.tenant.phone && (
            <p className="text-sm text-muted-foreground" dir="ltr">
              {rental.tenant.phone}
            </p>
          )}
        </div>
      )}

      {rental.notes && (
        <p className="text-sm text-muted-foreground">{rental.notes}</p>
      )}
    </div>
  )

  if (compact) {
    return (
      <div className="mt-3 rounded-md border border-border bg-muted/30 p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          {t('rental.activeContract')}
        </p>
        {content}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t('rental.title')}</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}
