import { History, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PropertyRentalCard } from '@/components/properties/PropertyRentalCard'
import { PropertyRentalHistoryDialog } from '@/components/properties/PropertyRentalHistoryDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useMe } from '@/features/auth/useMe'
import { useDeleteProperty, useMyProperties } from '@/features/properties/useProperties'
import { useConfirm } from '@/hooks/use-confirm'
import type { Property } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

const statusVariant: Record<string, 'default' | 'secondary' | 'warning' | 'destructive' | 'success'> = {
  DRAFT: 'secondary',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  RENTED: 'default',
  SUSPENDED: 'warning',
}

export function OwnerDashboardPage() {
  const { t } = useTranslation()
  const { data: me } = useMe()
  const { data, isLoading } = useMyProperties()
  const deleteMutation = useDeleteProperty()
  const { confirm, dialog } = useConfirm()
  const [historyProperty, setHistoryProperty] = useState<Property | null>(null)

  const handleDelete = (property: Property) => {
    confirm({
      description: t('properties.deleteConfirm'),
      onConfirm: async () => {
        await deleteMutation.mutateAsync(property.id)
      },
    })
  }

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
              <CardContent className="flex flex-wrap items-start justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{property.title}</h3>
                    <Badge variant={statusVariant[property.status] ?? 'secondary'}>
                      {t(`status.${property.status}`)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(
                      Number(property.price),
                      property.purpose,
                      property.pricePeriod,
                    )}{' '}
                    — {property.city}
                  </p>
                  {property.rejectionReason && (
                    <p className="mt-1 text-sm text-destructive">
                      {t('properties.rejectionReason')}: {property.rejectionReason}
                    </p>
                  )}
                  {property.suspensionReason && (
                    <p className="mt-1 text-sm text-warning">
                      {t('admin.suspensionReason')}: {property.suspensionReason}
                    </p>
                  )}
                  {property.rental && (
                    <PropertyRentalCard rental={property.rental} compact />
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setHistoryProperty(property)}
                  >
                    <History className="h-4 w-4" />
                    {t('rental.viewHistory')}
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/properties/${property.id}`}>{t('common.view')}</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => handleDelete(property)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('common.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">{t('common.noResults')}</p>
      )}

      {historyProperty && (
        <PropertyRentalHistoryDialog
          propertyId={historyProperty.id}
          propertyTitle={historyProperty.title}
          open={!!historyProperty}
          onOpenChange={(open) => {
            if (!open) setHistoryProperty(null)
          }}
        />
      )}
      {dialog}
    </div>
  )
}
