import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PropertyReviewActions } from '@/components/properties/PropertyReviewActions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useAdminProperties } from '@/features/admin/useAdmin'
import { useCookies } from '@/lib/token-managament/useCookies'
import type { PropertyStatus } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

const statusVariant: Record<string, 'default' | 'secondary' | 'warning' | 'destructive' | 'success'> = {
  DRAFT: 'secondary',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  SOLD: 'default',
  RENTED: 'default',
}

export function AdminPropertiesPage() {
  const { t } = useTranslation()
  const { hasPermission } = useCookies()
  const [status, setStatus] = useState<PropertyStatus | ''>('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminProperties(status || undefined, page)
  const canCreate = hasPermission('property.create')

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('admin.allProperties')}</h1>
        {canCreate && (
          <Button asChild>
            <Link to="/admin/properties/new">
              <Plus className="h-4 w-4" />
              {t('nav.addProperty')}
            </Link>
          </Button>
        )}
      </div>

      <select
        className="mb-6 flex h-10 w-full max-w-xs rounded-md border border-border bg-background px-3 text-sm"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value as PropertyStatus | '')
          setPage(1)
        }}
      >
        <option value="">{t('common.all')}</option>
        {(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'SOLD', 'RENTED'] as const).map(
          (s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ),
        )}
      </select>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : data?.items.length ? (
        <>
          <div className="space-y-3">
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
                      {property.city} — {property.owner?.name}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {property.status === 'PENDING' && (
                      <PropertyReviewActions propertyId={property.id} />
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/properties/${property.id}`}>{t('common.view')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {data.meta.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t('common.previous')}
              </Button>
              <span className="flex items-center px-4 text-sm">
                {page} / {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('common.next')}
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-muted-foreground">{t('common.noResults')}</p>
      )}
    </div>
  )
}
