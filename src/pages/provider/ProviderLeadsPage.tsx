import { Truck } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  useProviderLeads,
  useUpdateLeadStatus,
} from '@/features/service-provider/useProviderLeads'
import { useCookies } from '@/lib/token-managament/useCookies'
import type { ServiceLead, ServiceLeadStatus } from '@/lib/types'

const PAGE_SIZE = 10

const NEXT_LEAD_STATUS: Partial<Record<ServiceLeadStatus, ServiceLeadStatus>> = {
  NEW: 'CONTACTED',
  CONTACTED: 'QUOTED',
  QUOTED: 'COMPLETED',
}

export function ProviderLeadsPage() {
  const { t } = useTranslation()
  const { hasPermission } = useCookies()
  const canManage = hasPermission('provider.lead.manage')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<ServiceLeadStatus | ''>('')

  const filters = {
    page,
    limit: PAGE_SIZE,
    ...(statusFilter ? { status: statusFilter } : {}),
  }

  const { data, isLoading, isError, error: queryError, refetch } = useProviderLeads(filters)
  const statusMutation = useUpdateLeadStatus()

  const advanceLead = async (lead: ServiceLead) => {
    const next = NEXT_LEAD_STATUS[lead.status]
    if (!next) return
    await statusMutation.mutateAsync({ id: lead.id, status: next })
  }

  const markLost = async (id: string) => {
    await statusMutation.mutateAsync({ id, status: 'LOST' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Truck className="h-7 w-7 text-main" />
            {t('provider.leads')}
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
            setStatusFilter(e.target.value as ServiceLeadStatus | '')
            setPage(1)
          }}
        >
          <option value="">{t('common.all')}</option>
          {(['NEW', 'CONTACTED', 'QUOTED', 'COMPLETED', 'LOST'] as ServiceLeadStatus[]).map(
            (s) => (
              <option key={s} value={s}>
                {t(`provider.leadStatus.${s}`)}
              </option>
            ),
          )}
        </select>
      </div>

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
            {data.items.map((lead) => (
              <Card key={lead.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{t(`provider.leadStatus.${lead.status}`)}</Badge>
                        <Badge variant="secondary">{lead.type}</Badge>
                      </div>
                      <p className="mt-1 font-medium">{lead.customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.customer.phone ?? lead.customer.email}
                      </p>
                      <p className="text-sm">
                        {lead.pickupCity}
                        {lead.pickupArea ? ` — ${lead.pickupArea}` : ''} → {lead.destination}
                      </p>
                      {lead.passengers != null && (
                        <p className="text-sm text-muted-foreground">
                          {t('provider.passengers')}: {lead.passengers}
                        </p>
                      )}
                      {lead.preferredDateTime && (
                        <p className="text-sm text-muted-foreground" dir="ltr">
                          {new Date(lead.preferredDateTime).toLocaleString('ar-EG')}
                        </p>
                      )}
                      {lead.notes && (
                        <p className="mt-1 text-sm italic text-muted-foreground">{lead.notes}</p>
                      )}
                    </div>
                  </div>

                  {canManage && lead.status !== 'COMPLETED' && lead.status !== 'LOST' && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {NEXT_LEAD_STATUS[lead.status] && (
                        <Button
                          size="sm"
                          disabled={statusMutation.isPending}
                          onClick={() => advanceLead(lead)}
                        >
                          {t(`provider.leadAction.${NEXT_LEAD_STATUS[lead.status]}`)}
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={statusMutation.isPending}
                        onClick={() => markLost(lead.id)}
                      >
                        {t('provider.markLost')}
                      </Button>
                    </div>
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
