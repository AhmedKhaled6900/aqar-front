import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { OfferStatus } from '@/lib/types'

const variantMap: Record<
  OfferStatus,
  'warning' | 'default' | 'success' | 'destructive' | 'secondary' | 'outline'
> = {
  PENDING: 'warning',
  NEGOTIATING: 'default',
  ACCEPTED: 'success',
  REJECTED: 'destructive',
  EXPIRED: 'secondary',
  NEGOTIATING_FAIL: 'destructive',
}

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
  const { t } = useTranslation()
  return (
    <Badge variant={variantMap[status]}>{t(`offers.status.${status}`)}</Badge>
  )
}
