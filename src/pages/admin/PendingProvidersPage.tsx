import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  useApproveServiceProvider,
  usePendingProviders,
  useRejectServiceProvider,
} from '@/features/admin/service-provider/useAdminProviders'

const PAGE_SIZE = 10

export function PendingProvidersPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error: queryError, refetch } = usePendingProviders(
    page,
    PAGE_SIZE,
  )
  const approveMutation = useApproveServiceProvider()
  const rejectMutation = useRejectServiceProvider()
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState('')

  const handleReject = async (userId: string) => {
    if (!reason.trim()) {
      setFormError(t('common.required'))
      return
    }
    setFormError('')
    try {
      await rejectMutation.mutateAsync({ userId, reason })
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
        <h1 className="text-2xl font-bold">{t('admin.pendingProviders')}</h1>
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
            {data.items.map((provider) => (
              <Card key={provider.userId}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{provider.businessName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {provider.user?.name} — {provider.user?.email} — {provider.user?.phone}
                      </p>
                      {provider.category && (
                        <p className="text-sm">
                          {t('provider.category')}: {provider.category.name}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {provider.logo && (
                        <DocPreview label={t('provider.logo')} url={provider.logo} />
                      )}
                      {provider.nationalId && (
                        <DocPreview label={t('provider.nationalId')} url={provider.nationalId} />
                      )}
                      {provider.commercialRegister && (
                        <DocPreview
                          label={t('provider.commercialRegister')}
                          url={provider.commercialRegister}
                        />
                      )}
                    </div>
                  </div>

                  {rejectingId === provider.userId ? (
                    <div className="mt-4 space-y-2">
                      <Label>{t('admin.rejectReason')}</Label>
                      <Input value={reason} onChange={(e) => setReason(e.target.value)} />
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={rejectMutation.isPending}
                          onClick={() => handleReject(provider.userId)}
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
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate(provider.userId)}
                      >
                        {t('common.approve')}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setRejectingId(provider.userId)}
                      >
                        {t('common.reject')}
                      </Button>
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

function DocPreview({ label, url }: { label: string; url: string }) {
  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <a href={url} target="_blank" rel="noreferrer">
        <img src={url} alt={label} className="h-24 w-32 rounded-md object-cover" />
      </a>
    </div>
  )
}
