import { BedDouble, MapPin, Bath } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Property } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { t } = useTranslation()
  const primaryImage =
    property.images.find((img) => img.isPrimary) ?? property.images[0]

  return (
    <Link to={`/properties/${property.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-[4/3] bg-muted">
          {primaryImage ? (
            <img
              src={primaryImage.imageUrl}
              alt={property.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {t('properties.noImage')}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold">{property.title}</h3>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant={property.purpose === 'SALE' ? 'default' : 'secondary'}>
                {property.purpose === 'SALE' ? t('home.sale') : t('home.rent')}
              </Badge>
              {property.status === 'RENTED' && (
                <Badge variant="secondary">{t('status.RENTED')}</Badge>
              )}
            </div>
          </div>
          <p className="mb-2 text-lg font-bold text-main">
            {formatPrice(Number(property.price), property.purpose, property.pricePeriod)}
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {property.city} — {property.area}
            </span>
          </div>
          {(property.bedrooms || property.bathrooms) && (
            <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
              {property.bedrooms != null && (
                <span className="flex items-center gap-1">
                  <BedDouble className="h-4 w-4" />
                  {property.bedrooms}
                </span>
              )}
              {property.bathrooms != null && (
                <span className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  {property.bathrooms}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
