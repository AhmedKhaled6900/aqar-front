import { Package, TrendingUp, Users, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { useDashboardSummary } from '@/features/service-provider/useDashboard'
import { useProviderProfile } from '@/features/service-provider/useProviderProfile'

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-main-muted text-main">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProviderDashboardPage() {
  const { t } = useTranslation()
  const { data: profile } = useProviderProfile()
  const { data: summary, isLoading } = useDashboardSummary()

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  const acceptancePct = summary
    ? Math.round((summary.orders.acceptanceRate ?? 0) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('provider.dashboard')}</h1>
        <p className="text-muted-foreground">
          {profile?.businessName} — {profile?.category?.name}
        </p>
      </div>

      <div className="stagger-children grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Package className="h-6 w-6" />}
          label={t('provider.stats.totalOrders')}
          value={summary?.orders.total ?? 0}
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6" />}
          label={t('provider.stats.delivered')}
          value={summary?.orders.delivered ?? 0}
        />
        <StatCard
          icon={<Users className="h-6 w-6" />}
          label={t('provider.stats.acceptanceRate')}
          value={`${acceptancePct}%`}
        />
        <StatCard
          icon={<Wallet className="h-6 w-6" />}
          label={t('provider.stats.providerNet')}
          value={summary?.revenue.providerNet?.toLocaleString('ar-EG') ?? 0}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('provider.stats.totalSales')}</p>
            <p className="text-xl font-bold text-main">
              {summary?.revenue.totalSales?.toLocaleString('ar-EG') ?? 0} ج.م
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('provider.stats.platformFee')}</p>
            <p className="text-xl font-bold">
              {summary?.revenue.platformFee?.toLocaleString('ar-EG') ?? 0} ج.م
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('provider.stats.leads')}</p>
            <p className="text-xl font-bold">{summary?.leads.total ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link to="/provider/orders">{t('provider.orders')}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/provider/leads">{t('provider.leads')}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/provider/listings">{t('provider.listings')}</Link>
        </Button>
      </div>
    </div>
  )
}
