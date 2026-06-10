import { BedDouble, Bath, MapPin, Ruler } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { ImageGallery } from '@/components/properties/ImageGallery'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useProperty } from '@/features/properties/useProperties'
import { formatPrice } from '@/lib/utils'

export function PropertyDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const { data: property, isLoading, isError } = useProperty(id)

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (isError || !property) {
    return (
      <p className="py-20 text-center text-muted-foreground">
        {t('common.noResults')}
      </p>
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{property.title}</h1>
        <Badge>{property.category.name}</Badge>
        <Badge variant="secondary">
          {property.purpose === 'SALE' ? t('home.sale') : t('home.rent')}
        </Badge>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <ImageGallery images={property.images} />
          {property.videoUrl && (
            <div>
              <h2 className="mb-2 text-lg font-semibold">{t('properties.video')}</h2>
              <video
                src={property.videoUrl}
                controls
                className="w-full rounded-lg border border-border"
              />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <p className="text-3xl font-bold text-main">
            {formatPrice(Number(property.price), property.purpose)}
          </p>

          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {property.city} — {property.area}
            </span>
            {property.bedrooms != null && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-4 w-4" />
                {property.bedrooms} {t('properties.bedrooms')}
              </span>
            )}
            {property.bathrooms != null && (
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                {property.bathrooms} {t('properties.bathrooms')}
              </span>
            )}
            {property.areaSize != null && (
              <span className="flex items-center gap-1">
                <Ruler className="h-4 w-4" />
                {property.areaSize} م²
              </span>
            )}
          </div>

          <Card>
            <CardContent className="p-4">
              <p className="mb-1 text-sm text-muted-foreground">
                {t('properties.address')}
              </p>
              <p>{property.address}</p>
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-2 text-xl font-semibold">
              {t('properties.description')}
            </h2>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {property.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
