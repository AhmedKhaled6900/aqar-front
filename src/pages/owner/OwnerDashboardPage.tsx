import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useMe } from '@/features/auth/useMe'
import {
  useMarkPropertyRented,
  useMarkPropertySold,
  useMyProperties,
} from '@/features/properties/useProperties'
import { formatPrice } from '@/lib/utils'

const statusVariant: Record<string, 'default' | 'secondary' | 'warning' | 'destructive' | 'success'> = {
  DRAFT: 'secondary',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  SOLD: 'default',
  RENTED: 'default',
}

export function OwnerDashboardPage() {
  const { t } = useTranslation()
  const { data: me } = useMe()
  const { data, isLoading } = useMyProperties()
  const markSold = useMarkPropertySold()
  const markRented = useMarkPropertyRented()

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('owner.dashboard')}</h1>
          <p className="text-muted-foreground">{me?.user.name}</p>
        </div>
        {me?.user.profileStatus === 'VERIFIED' && (
          <Button asChild>
            <Link to="/owner/properties/new">
              <Plus className="h-4 w-4" />
              {t('nav.addProperty')}
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : data?.items.length ? (
        <div className="grid gap-4">
          {data.items.map((property) => (
            <Card key={property.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-semibold">{property.title}</h3>
                    <Badge variant={statusVariant[property.status] ?? 'secondary'}>
                      {t(`status.${property.status}`)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(Number(property.price), property.purpose)} —{' '}
                    {property.city}
                  </p>
                  {property.rejectionReason && (
                    <p className="mt-1 text-sm text-destructive">
                      {t('properties.rejectionReason')}: {property.rejectionReason}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(property.status === 'DRAFT' || property.status === 'REJECTED') && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/owner/properties/${property.id}/edit`}>
                        {t('common.edit')}
                      </Link>
                    </Button>
                  )}
                  {property.status === 'APPROVED' && property.purpose === 'SALE' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={markSold.isPending}
                      onClick={() => markSold.mutate(property.id)}
                    >
                      {t('properties.markSold')}
                    </Button>
                  )}
                  {property.status === 'APPROVED' && property.purpose === 'RENT' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={markRented.isPending}
                      onClick={() => markRented.mutate(property.id)}
                    >
                      {t('properties.markRented')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">{t('common.noResults')}</p>
      )}
    </div>
  )
}
