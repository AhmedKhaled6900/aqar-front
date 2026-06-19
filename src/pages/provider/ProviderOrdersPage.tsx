import { Package } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  useAcceptOrder,
  useProviderOrders,
  useRejectOrder,
  useUpdateOrderStatus,
} from '@/features/service-provider/useProviderOrders'
import { useCookies } from '@/lib/token-managament/useCookies'
import type { ServiceOrder, ServiceOrderStatus } from '@/lib/types'

const PAGE_SIZE = 10

const NEXT_STATUS: Partial<Record<ServiceOrderStatus, ServiceOrderStatus>> = {
  ACCEPTED: 'PREPARING',
  PREPARING: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
}

export function ProviderOrdersPage() {
  const { t } = useTranslation()
  const { hasPermission } = useCookies()
  const canManage = hasPermission('provider.order.manage')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<ServiceOrderStatus | ''>('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [error, setError] = useState('')

  const filters = {
    page,
    limit: PAGE_SIZE,
    ...(statusFilter ? { status: statusFilter } : {}),
  }

  const { data, isLoading, isError, error: queryError, refetch } = useProviderOrders(filters)
  const acceptMutation = useAcceptOrder()
  const rejectMutation = useRejectOrder()
  const statusMutation = useUpdateOrderStatus()

  const handleReject = async (id: string) => {
    setError('')
    try {
      await rejectMutation.mutateAsync({ id, reason: rejectReason || undefined })
      setRejectingId(null)
      setRejectReason('')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const advanceStatus = async (order: ServiceOrder) => {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    await statusMutation.mutateAsync({ id: order.id, status: next })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Package className="h-7 w-7 text-main" />
            {t('provider.orders')}
          </h1>
          {data?.meta && (
            <p className="text-sm text-muted-foreground">
              {t('pagination.total', { count: data.meta.total })}
            </p>
          )}
        </div>
        <select
          className="flex h-10 rounded-md border border-border bg-background px-3 text-sm"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ServiceOrderStatus | '')
            setPage(1)
          }}
        >
          <option value="">{t('common.all')}</option>
          {(
            [
              'PENDING',
              'ACCEPTED',
              'PREPARING',
              'OUT_FOR_DELIVERY',
              'DELIVERED',
              'REJECTED',
              'CANCELLED',
            ] as ServiceOrderStatus[]
          ).map((s) => (
            <option key={s} value={s}>
              {t(`provider.orderStatus.${s}`)}
            </option>
          ))}
        </select>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      {isError && (
        <Alert variant="destructive">
          {(queryError as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? t('common.error')}
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : data?.items.length ? (
        <>
          <div className="space-y-4">
            {data.items.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground" dir="ltr">
                          #{order.id.slice(0, 8)}
                        </span>
                        <Badge>{t(`provider.orderStatus.${order.status}`)}</Badge>
                      </div>
                      <p className="mt-1 font-medium">{order.customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer.phone ?? order.customer.email}
                      </p>
                      {order.listing && (
                        <p className="text-sm">{order.listing.title}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {order.deliveryCity}
                        {order.deliveryArea ? ` — ${order.deliveryArea}` : ''}
                      </p>
                      {order.deliveryAddress && (
                        <p className="text-sm">{order.deliveryAddress}</p>
                      )}
                      {order.notes && (
                        <p className="mt-1 text-sm italic text-muted-foreground">{order.notes}</p>
                      )}
                      <ul className="mt-2 text-sm">
                        {order.items.map((item, i) => (
                          <li key={i}>
                            {item.name} × {item.quantity} —{' '}
                            {(item.unitPrice * item.quantity).toLocaleString('ar-EG')} ج.م
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-left text-sm">
                      <p>
                        {t('provider.subtotal')}: {order.subtotal.toLocaleString('ar-EG')} ج.م
                      </p>
                      <p>
                        {t('provider.deliveryFee')}: {order.deliveryFee.toLocaleString('ar-EG')} ج.م
                      </p>
                      <p className="font-bold text-main">
                        {t('provider.providerNet')}: {order.providerNet.toLocaleString('ar-EG')} ج.م
                      </p>
                    </div>
                  </div>

                  {canManage && rejectingId === order.id ? (
                    <div className="mt-4 space-y-2">
                      <Label>{t('admin.rejectReason')}</Label>
                      <Input
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={rejectMutation.isPending}
                          onClick={() => handleReject(order.id)}
                        >
                          {t('common.reject')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRejectingId(null)}
                        >
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    canManage && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {order.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              disabled={acceptMutation.isPending}
                              onClick={() => acceptMutation.mutate(order.id)}
                            >
                              {t('common.approve')}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setRejectingId(order.id)}
                            >
                              {t('common.reject')}
                            </Button>
                          </>
                        )}
                        {NEXT_STATUS[order.status] && (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={statusMutation.isPending}
                            onClick={() => advanceStatus(order)}
                          >
                            {t(`provider.orderAction.${NEXT_STATUS[order.status]}`)}
                          </Button>
                        )}
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {data.meta.totalPages > 1 && (
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
        </>
      ) : (
        <p className="text-center text-muted-foreground">{t('common.noResults')}</p>
      )}
    </div>
  )
}
