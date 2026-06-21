import { Eye } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAdminProviders } from '@/features/admin/service-provider/useAdminProviders'
import type { AdminServiceProviderRecord, ServiceProviderStatus } from '@/lib/types'

const PAGE_SIZE = 20

const statusVariant: Record<
  ServiceProviderStatus,
  'default' | 'secondary' | 'warning' | 'destructive' | 'success'
> = {
  DRAFT: 'secondary',
  PENDING: 'warning',
  APPROVED: 'success',
  SUSPENDED: 'destructive',
  REJECTED: 'destructive',
}

export function AdminProvidersPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<ServiceProviderStatus | ''>('')

  const filters = statusFilter ? { status: statusFilter } : {}
  const { data, isLoading } = useAdminProviders(page, PAGE_SIZE, filters)

  const columns = useMemo<DataTableColumn<AdminServiceProviderRecord>[]>(
    () => [
      {
        id: 'businessName',
        header: t('provider.businessName'),
        cell: (row) => (
          <div className="flex items-center gap-3">
            {row.logo ? (
              <img
                src={row.logo}
                alt=""
                className="size-10 rounded-md object-cover"
              />
            ) : null}
            <span className="font-medium">{row.businessName}</span>
          </div>
        ),
      },
      {
        id: 'category',
        header: t('provider.category'),
        cell: (row) => row.category?.name ?? '—',
      },
      {
        id: 'user',
        header: t('auth.email'),
        cell: (row) => (
          <div className="text-sm">
            <p>{row.user?.email ?? '—'}</p>
            <p className="text-muted-foreground" dir="ltr">
              {row.user?.phone ?? ''}
            </p>
          </div>
        ),
      },
      {
        id: 'status',
        header: t('common.status'),
        cell: (row) => (
          <Badge variant={statusVariant[row.status] ?? 'secondary'}>
            {t(`status.${row.status}`)}
          </Badge>
        ),
      },
      {
        id: 'stats',
        header: t('admin.providerStatsShort'),
        cell: (row) => (
          <span className="text-sm text-muted-foreground">
            {t('admin.providerStatsCounts', {
              listings: row.stats?.listingsCount ?? 0,
              orders: row.stats?.ordersCount ?? 0,
              leads: row.stats?.leadsCount ?? 0,
            })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: t('common.actions'),
        cell: (row) => (
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/providers/${row.id}`}>
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
        <h1 className="text-2xl font-bold">{t('admin.allProviders')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.allProvidersDesc')}</p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label>{t('common.status')}</Label>
          <select
            className="mt-1 flex h-10 min-w-[160px] rounded-md border border-border bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ServiceProviderStatus | '')
              setPage(1)
            }}
          >
            <option value="">{t('common.all')}</option>
            {(['DRAFT', 'PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'] as const).map(
              (s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        emptyMessage={t('common.noResults')}
        onPageChange={setPage}
        getRowKey={(row) => row.id}
      />
    </div>
  )
}
