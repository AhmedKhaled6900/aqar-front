import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AdminServiceProviderRecord, ServiceProviderStatus } from '@/lib/types'
import { formatDateAr } from '@/lib/utils'

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

interface AdminProviderDetailsProps {
  provider: AdminServiceProviderRecord
}

function DocPreview({ label, url }: { label: string; url: string }) {
  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <a href={url} target="_blank" rel="noreferrer">
        <img src={url} alt={label} className="h-28 w-36 rounded-md object-cover" />
      </a>
    </div>
  )
}

export function AdminProviderDetails({ provider }: AdminProviderDetailsProps) {
  const { t } = useTranslation()
  const stats = provider.stats

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('provider.listings')} value={stats?.listingsCount ?? 0} />
        <StatCard label={t('provider.orders')} value={stats?.ordersCount ?? 0} />
        <StatCard label={t('provider.leads')} value={stats?.leadsCount ?? 0} />
        <StatCard
          label={t('provider.stats.providerNet')}
          value={`${(stats?.revenue?.providerNet ?? 0).toLocaleString('ar-EG')} ج.م`}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start gap-4">
            {provider.logo && (
              <img
                src={provider.logo}
                alt=""
                className="size-20 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <CardTitle>{provider.businessName}</CardTitle>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant={statusVariant[provider.status] ?? 'secondary'}>
                  {t(`status.${provider.status}`)}
                </Badge>
                <Badge variant="secondary">{provider.category?.name}</Badge>
              </div>
              {provider.description && (
                <p className="mt-2 text-sm text-muted-foreground">{provider.description}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <InfoBlock title={t('admin.userInfo')}>
            <InfoRow label={t('auth.name')} value={provider.user?.name} />
            <InfoRow label={t('auth.email')} value={provider.user?.email} dir="ltr" />
            <InfoRow label={t('auth.phone')} value={provider.user?.phone} dir="ltr" />
            <InfoRow
              label={t('admin.emailVerified')}
              value={
                provider.user?.isVerified ? t('admin.emailStatus.VERIFIED') : t('common.no')
              }
            />
            <InfoRow
              label={t('admin.registeredAt')}
              value={provider.user?.createdAt ? formatDateAr(provider.user.createdAt) : '—'}
            />
          </InfoBlock>
          <InfoBlock title={t('provider.profileTitle')}>
            <InfoRow label={t('auth.phone')} value={provider.phone} dir="ltr" />
            <InfoRow label={t('provider.whatsapp')} value={provider.whatsapp} dir="ltr" />
            <InfoRow
              label={t('admin.registeredAt')}
              value={formatDateAr(provider.createdAt)}
            />
            <InfoRow
              label={t('admin.updatedAt')}
              value={formatDateAr(provider.updatedAt)}
            />
            {provider.rejectionReason && (
              <InfoRow label={t('provider.rejectionReason')} value={provider.rejectionReason} />
            )}
            {provider.suspensionReason && (
              <InfoRow label={t('admin.suspensionReason')} value={provider.suspensionReason} />
            )}
          </InfoBlock>
        </CardContent>
      </Card>

      {(provider.nationalId || provider.commercialRegister) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('admin.documents')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-6">
            {provider.nationalId && (
              <DocPreview label={t('provider.nationalId')} url={provider.nationalId} />
            )}
            {provider.commercialRegister && (
              <DocPreview
                label={t('provider.commercialRegister')}
                url={provider.commercialRegister}
              />
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('provider.coverage')}</CardTitle>
        </CardHeader>
        <CardContent>
          {provider.coverageAreas?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('properties.city')}</TableHead>
                  <TableHead>{t('properties.area')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {provider.coverageAreas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell>{area.city}</TableCell>
                    <TableCell>{area.area || t('provider.wholeCity')}</TableCell>
                    <TableCell>
                      <Badge variant={area.isActive ? 'default' : 'secondary'}>
                        {area.isActive ? t('categories.isActive') : t('provider.inactive')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">{t('provider.noCoverage')}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('provider.listings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {provider.listings?.length ? (
            provider.listings.map((listing) => (
              <div key={listing.id} className="rounded-lg border border-border p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold">{listing.title}</h4>
                  <Badge variant={listing.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {t(`provider.listingStatus.${listing.status}`)}
                  </Badge>
                </div>
                {listing.description && (
                  <p className="mb-2 text-sm text-muted-foreground">{listing.description}</p>
                )}
                {listing.menuItems?.length ? (
                  <ul className="text-sm">
                    {listing.menuItems.map((item, i) => (
                      <li key={i}>
                        {item.name} — {item.price.toLocaleString('ar-EG')} ج.م
                      </li>
                    ))}
                  </ul>
                ) : listing.metadata ? (
                  <pre className="overflow-x-auto rounded bg-muted/50 p-2 text-xs" dir="ltr">
                    {JSON.stringify(listing.metadata, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">{t('provider.noListings')}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('provider.orders')}</CardTitle>
        </CardHeader>
        <CardContent>
          {provider.orders?.length ? (
            <div className="space-y-4">
              {provider.orders.map((order) => (
                <div key={order.id} className="rounded-lg border border-border p-4 text-sm">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge>{t(`provider.orderStatus.${order.status}`)}</Badge>
                    <span className="text-muted-foreground">
                      {order.customer?.name} — {order.customer?.phone}
                    </span>
                  </div>
                  <p>
                    {order.listing?.title} — {order.providerNet.toLocaleString('ar-EG')} ج.م
                  </p>
                  <p className="text-muted-foreground">
                    {order.deliveryCity}
                    {order.deliveryArea ? ` / ${order.deliveryArea}` : ''}
                  </p>
                  <ul className="mt-1">
                    {order.items.map((item, i) => (
                      <li key={item.id ?? i}>
                        {item.name} × {item.quantity} —{' '}
                        {(item.unitPrice * item.quantity).toLocaleString('ar-EG')} ج.م
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('common.noResults')}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('provider.leads')}</CardTitle>
        </CardHeader>
        <CardContent>
          {provider.leads?.length ? (
            <div className="space-y-4">
              {provider.leads.map((lead) => (
                <div key={lead.id} className="rounded-lg border border-border p-4 text-sm">
                  <div className="mb-1 flex flex-wrap gap-2">
                    <Badge>{t(`provider.leadStatus.${lead.status}`)}</Badge>
                    <Badge variant="secondary">{lead.type}</Badge>
                  </div>
                  <p className="font-medium">{lead.customer?.name}</p>
                  <p>
                    {lead.pickupCity}
                    {lead.pickupArea ? ` / ${lead.pickupArea}` : ''} → {lead.destination}
                  </p>
                  {lead.passengers != null && (
                    <p className="text-muted-foreground">
                      {t('provider.passengers')}: {lead.passengers}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('common.noResults')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-2xl font-bold text-main">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

function InfoBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="mb-3 font-semibold">{title}</h3>
      <dl className="space-y-2">{children}</dl>
    </div>
  )
}

function InfoRow({
  label,
  value,
  dir,
}: {
  label: string
  value?: string | null
  dir?: 'ltr' | 'rtl'
}) {
  return (
    <div className="flex gap-2 text-sm">
      <dt className="min-w-[7rem] text-muted-foreground">{label}:</dt>
      <dd className="font-medium" dir={dir}>
        {value ?? '—'}
      </dd>
    </div>
  )
}
