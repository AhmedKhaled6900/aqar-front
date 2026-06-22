import { Eye, Megaphone } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Label } from '@/components/ui/label'
import { useAdminListings } from '@/features/admin/service-provider/useAdminListings'
import type { AdminServiceListingRecord, ServiceListingStatus } from '@/lib/types'

const PAGE_SIZE = 20

const statusVariant: Record<
  ServiceListingStatus,
  'default' | 'secondary' | 'warning' | 'destructive' | 'success'
> = {
  DRAFT: 'secondary',
  PENDING_REVIEW: 'warning',
  ACTIVE: 'success',
  REJECTED: 'destructive',
  PAUSED: 'default',
}

export function AdminListingsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<ServiceListingStatus | ''>('')
  const [featuredOnly, setFeaturedOnly] = useState(false)

  const filters = {
    page,
    limit: PAGE_SIZE,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(featuredOnly ? { featured: true } : {}),
  }

  const { data, isLoading } = useAdminListings(filters)

  const columns = useMemo<DataTableColumn<AdminServiceListingRecord>[]>(
    () => [
      {
        id: 'title',
        header: t('provider.listingTitle'),
        cell: (row) => (
          <div className="flex items-center gap-3">
            {row.image ? (
              <img src={row.image} alt="" className="h-12 w-16 rounded-md object-cover" />
            ) : null}
            <div>
              <p className="font-medium">{row.title}</p>
              {row.isFeatured && (
                <Badge variant="default" className="mt-1">
                  <Megaphone className="h-3 w-3" />
                  {t('admin.listingFeatured')}
                </Badge>
              )}
            </div>
          </div>
        ),
      },
      {
        id: 'provider',
        header: t('provider.businessName'),
        cell: (row) => row.provider?.businessName ?? '—',
      },
      {
        id: 'status',
        header: t('common.status'),
        cell: (row) => (
          <Badge variant={statusVariant[row.status] ?? 'secondary'}>
            {t(`provider.listingStatus.${row.status}`)}
          </Badge>
        ),
      },
      {
        id: 'deliveryFee',
        header: t('provider.deliveryFee'),
        cell: (row) =>
          row.deliveryFee != null ? `${row.deliveryFee.toLocaleString('ar-EG')} ج.م` : '—',
      },
      {
        id: 'actions',
        header: t('common.actions'),
        cell: (row) => (
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/listings/${row.id}`}>
              <Eye className="h-4 w-4" />
              {t('common.view')}
            </Link>
          </Button>
        ),
      },
    ],
    [t],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.allListings')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.allListingsDesc')}</p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label>{t('common.status')}</Label>
          <select
            className="mt-1 flex h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ServiceListingStatus | '')
              setPage(1)
            }}
          >
            <option value="">{t('common.all')}</option>
            {(
              ['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'REJECTED', 'PAUSED'] as ServiceListingStatus[]
            ).map((status) => (
              <option key={status} value={status}>
                {t(`provider.listingStatus.${status}`)}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => {
              setFeaturedOnly(e.target.checked)
              setPage(1)
            }}
          />
          {t('admin.featuredOnly')}
        </label>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
      />

      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={!data.meta.hasPreviousPage}
            onClick={() => setPage((p) => p - 1)}
          >
            {t('common.previous')}
          </Button>
          <span className="flex items-center px-4 text-sm">
            {data.meta.page} / {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={!data.meta.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('common.next')}
          </Button>
        </div>
      )}
    </div>
  )
}
