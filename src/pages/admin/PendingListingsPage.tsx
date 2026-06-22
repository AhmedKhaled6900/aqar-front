import { Eye } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  useApproveListing,
  usePendingListings,
  useRejectListing,
} from '@/features/admin/service-provider/useAdminListings'
import type { ServiceListingStatus } from '@/lib/types'

const PAGE_SIZE = 10

function listingStatusVariant(
  status: ServiceListingStatus,
): 'default' | 'secondary' | 'warning' | 'destructive' | 'success' {
  if (status === 'ACTIVE') return 'success'
  if (status === 'PENDING_REVIEW') return 'warning'
  if (status === 'REJECTED') return 'destructive'
  if (status === 'DRAFT') return 'secondary'
  return 'default'
}

export function PendingListingsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error: queryError, refetch } = usePendingListings(
    page,
    PAGE_SIZE,
  )
  const approveMutation = useApproveListing()
  const rejectMutation = useRejectListing()
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState('')

  const handleReject = async (id: string) => {
    if (!reason.trim()) {
      setFormError(t('common.required'))
      return
    }
    setFormError('')
    try {
      await rejectMutation.mutateAsync({ id, reason })
      setRejectingId(null)
      setReason('')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setFormError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('admin.pendingListings')}</h1>
        {data?.meta && (
          <p className="text-sm text-muted-foreground">
            {t('pagination.total', { count: data.meta.total })}
          </p>
        )}
      </div>

      {formError && <Alert variant="destructive" className="mb-4">{formError}</Alert>}

      {isError && (
        <Alert variant="destructive" className="mb-4">
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
            {data.items.map((listing) => (
              <Card key={listing.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-3">
                      {listing.image && (
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="h-20 w-28 rounded-md object-cover"
                        />
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{listing.title}</h3>
                          <Badge variant={listingStatusVariant(listing.status)}>
                            {t(`provider.listingStatus.${listing.status}`)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {listing.provider?.businessName ?? '—'}
                        </p>
                        {listing.description && (
                          <p className="mt-1 text-sm">{listing.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/listings/${listing.id}`}>
                          <Eye className="h-4 w-4" />
                          {t('common.view')}
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate(listing.id)}
                      >
                        {t('common.approve')}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setRejectingId(listing.id)}
                      >
                        {t('common.reject')}
                      </Button>
                    </div>
                  </div>

                  {rejectingId === listing.id && (
                    <div className="mt-4 space-y-2">
                      <Label>{t('admin.rejectReason')}</Label>
                      <Input value={reason} onChange={(e) => setReason(e.target.value)} />
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={rejectMutation.isPending}
                          onClick={() => handleReject(listing.id)}
                        >
                          {t('common.reject')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRejectingId(null)
                            setReason('')
                          }}
                        >
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {data.meta.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
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
