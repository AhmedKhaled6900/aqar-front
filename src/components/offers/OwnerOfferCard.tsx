import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CounterOfferDialog } from '@/components/offers/CounterOfferDialog'
import { OfferStatusBadge } from '@/components/offers/OfferStatusBadge'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  canOwnerRespond,
  useAcceptOffer,
  useRejectOffer,
} from '@/features/offers/useOffers'
import type { PriceOffer } from '@/lib/types'
import { formatOfferPrice, formatRentalDuration } from '@/lib/utils'

interface OwnerOfferCardProps {
  offer: PriceOffer
}

export function OwnerOfferCard({ offer }: OwnerOfferCardProps) {
  const { t } = useTranslation()
  const acceptMutation = useAcceptOffer()
  const rejectMutation = useRejectOffer()
  const [counterOpen, setCounterOpen] = useState(false)
  const [error, setError] = useState('')

  const canRespond = canOwnerRespond(offer)
  const isPending = acceptMutation.isPending || rejectMutation.isPending

  const handleAccept = async () => {
    if (!window.confirm(t('offers.acceptConfirm'))) return
    setError('')
    try {
      await acceptMutation.mutateAsync(offer.id)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const handleReject = async () => {
    const reason = window.prompt(t('offers.rejectReasonPrompt'))
    if (reason === null) return
    setError('')
    try {
      await rejectMutation.mutateAsync({ id: offer.id, reason: reason || undefined })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 pb-2">
          <div>
            <CardTitle className="text-base">{offer.customer.name}</CardTitle>
            {offer.customer.email && (
              <p className="text-xs text-muted-foreground" dir="ltr">
                {offer.customer.email}
              </p>
            )}
          </div>
          <OfferStatusBadge status={offer.status} />
        </CardHeader>

        <CardContent className="space-y-4">
          {error && <Alert variant="destructive">{error}</Alert>}

          {offer.latestRound && (
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-lg font-bold text-main">
                {formatOfferPrice(offer.latestRound.price, offer.latestRound.pricePeriod)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('offers.duration')}:{' '}
                {formatRentalDuration(
                  offer.latestRound.duration,
                  offer.latestRound.pricePeriod,
                )}
              </p>
              {offer.latestRound.notes && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {offer.latestRound.notes}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {t(`offers.sender.${offer.latestRound.senderRole}`)} —{' '}
                {new Date(offer.latestRound.createdAt).toLocaleDateString('ar-EG')}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>
              {t('offers.customerOffers')}: {offer.customerOfferCount}/{offer.maxOffersPerSide}
            </span>
            <span>
              {t('offers.ownerOffers')}: {offer.ownerOfferCount}/{offer.maxOffersPerSide}
            </span>
            <span>
              {t('offers.expiresAt')}:{' '}
              {new Date(offer.expiresAt).toLocaleDateString('ar-EG')}
            </span>
          </div>

          {offer.rounds.length > 1 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-main">
                {t('offers.negotiationHistory')} ({offer.rounds.length})
              </summary>
              <ul className="mt-2 space-y-2 border-r-2 border-muted pr-3">
                {offer.rounds.map((round) => (
                  <li key={round.id}>
                    <span className="font-medium">
                      {formatOfferPrice(round.price, round.pricePeriod)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {' '}
                      ({formatRentalDuration(round.duration, round.pricePeriod)})
                    </span>
                    <span className="mx-1 text-muted-foreground">—</span>
                    <span className="text-muted-foreground">
                      {t(`offers.sender.${round.senderRole}`)}
                    </span>
                    {round.notes && (
                      <p className="text-xs text-muted-foreground">{round.notes}</p>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          )}

          {canRespond && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={isPending} onClick={handleAccept}>
                {t('offers.accept')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => setCounterOpen(true)}
              >
                {t('offers.counter')}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={isPending}
                onClick={handleReject}
              >
                {t('offers.reject')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CounterOfferDialog
        open={counterOpen}
        onOpenChange={setCounterOpen}
        offerId={offer.id}
        defaultDuration={offer.latestRound?.duration ?? 12}
        defaultPricePeriod={offer.latestRound?.pricePeriod ?? 'MONTH'}
      />
    </>
  )
}
