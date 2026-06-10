import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PropertyReviewActions } from '@/components/properties/PropertyReviewActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { usePendingProperties } from '@/features/admin/useAdmin'
import { formatPrice } from '@/lib/utils'

export function PendingPropertiesPage() {
  const { t } = useTranslation()
  const { data, isLoading } = usePendingProperties()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t('admin.pendingProperties')}</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : data?.length ? (
        <div className="space-y-4">
          {data.map((property) => {
            const primary =
              property.images.find((i) => i.isPrimary) ?? property.images[0]
            return (
              <Card key={property.id}>
                <CardContent className="flex flex-wrap gap-4 p-4">
                  {primary && (
                    <img
                      src={primary.imageUrl}
                      alt=""
                      className="h-24 w-32 rounded-md object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{property.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(Number(property.price), property.purpose)} —{' '}
                      {property.city}
                    </p>
                    <p className="text-sm">{property.owner?.name}</p>
                    <Button variant="link" className="h-auto p-0" asChild>
                      <Link to={`/properties/${property.id}`}>{t('common.view')}</Link>
                    </Button>
                  </div>

                  <PropertyReviewActions propertyId={property.id} />
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">{t('common.noResults')}</p>
      )}
    </div>
  )
}
