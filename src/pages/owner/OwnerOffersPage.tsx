import { HandCoins } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { OwnerOfferCard } from '@/components/offers/OwnerOfferCard'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useOwnerOffersGrouped } from '@/features/offers/useOffers'
import { formatOfferPrice } from '@/lib/utils'

export function OwnerOffersPage() {
  const { t } = useTranslation()
  const { data: groups = [], isLoading } = useOwnerOffersGrouped()

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <HandCoins className="h-7 w-7 text-main" />
          {t('offers.ownerTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('offers.ownerDesc')}</p>
      </div>

      {!groups.length ? (
        <p className="py-12 text-center text-muted-foreground">{t('offers.noOffers')}</p>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.property.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>{group.property.title}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t('offers.listPrice')}:{' '}
                        {formatOfferPrice(
                          group.property.price,
                          group.property.pricePeriod,
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.summary.active > 0 && (
                        <Badge variant="warning">
                          {t('offers.activeCount', { count: group.summary.active })}
                        </Badge>
                      )}
                      {group.summary.pending > 0 && (
                        <Badge variant="warning">
                          {t('offers.pendingCount', { count: group.summary.pending })}
                        </Badge>
                      )}
                      {group.summary.negotiating > 0 && (
                        <Badge>
                          {t('offers.negotiatingCount', {
                            count: group.summary.negotiating,
                          })}
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        {t('offers.totalCount', { count: group.summary.total })}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-4 text-center text-sm">
                    <div>
                      <p className="font-bold text-success">{group.summary.accepted}</p>
                      <p className="text-muted-foreground">{t('offers.status.ACCEPTED')}</p>
                    </div>
                    <div>
                      <p className="font-bold text-destructive">{group.summary.rejected}</p>
                      <p className="text-muted-foreground">{t('offers.status.REJECTED')}</p>
                    </div>
                    <div>
                      <p className="font-bold">{group.summary.expired}</p>
                      <p className="text-muted-foreground">{t('offers.status.EXPIRED')}</p>
                    </div>
                    <div>
                      <p className="font-bold text-destructive">
                        {group.summary.negotiatingFailed}
                      </p>
                      <p className="text-muted-foreground">
                        {t('offers.status.NEGOTIATING_FAIL')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 lg:grid-cols-2">
                {group.offers.map((offer) => (
                  <OwnerOfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
