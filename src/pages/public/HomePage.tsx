import { Building2, ClipboardCheck, Plus, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  usePendingOwners,
  usePendingProperties,
} from '@/features/admin/useAdmin'
import { useMe } from '@/features/auth/useMe'
import {
  useMyProperties,
  useProperties,
} from '@/features/properties/useProperties'

export function HomePage() {
  const { t } = useTranslation()
  const { data: me } = useMe()
  const role = me?.user.role

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {me?.user ? `${t('home.welcome')}, ${me.user.name}` : t('home.hero')}
        </h1>
        <p className="text-muted-foreground">{t('app.tagline')}</p>
      </div>

      {role === 'ADMIN' && <AdminOverview />}
      {role === 'OWNER' && <OwnerOverview />}

      <LatestProperties />
    </div>
  )
}

function AdminOverview() {
  const { t } = useTranslation()
  const { data: pendingOwners } = usePendingOwners()
  const { data: pendingProperties } = usePendingProperties()

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard
        to="/admin/owners/pending"
        icon={<ShieldCheck className="h-8 w-8 text-main" />}
        label={t('admin.pendingOwners')}
        value={pendingOwners?.meta.total ?? 0}
      />
      <StatCard
        to="/admin/properties/pending"
        icon={<ClipboardCheck className="h-8 w-8 text-main" />}
        label={t('admin.pendingProperties')}
        value={pendingProperties?.length ?? 0}
      />
    </div>
  )
}

function OwnerOverview() {
  const { t } = useTranslation()
  const { data } = useMyProperties()

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard
        to="/owner/dashboard"
        icon={<Building2 className="h-8 w-8 text-main" />}
        label={t('nav.myProperties')}
        value={data?.meta.total ?? 0}
      />
      <Card className="flex items-center justify-center">
        <CardContent className="p-6">
          <Button asChild>
            <Link to="/owner/properties/new">
              <Plus className="h-4 w-4" />
              {t('nav.addProperty')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  to,
  icon,
  label,
  value,
}: {
  to: string
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <Link to={to}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-6">
          {icon}
          <div>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function LatestProperties() {
  const { t } = useTranslation()
  const { data, isLoading } = useProperties({ limit: 6 })

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('home.featured')}</h2>
        <Button variant="link" asChild>
          <Link to="/properties">{t('common.view')}</Link>
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : data?.items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.items.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">{t('common.noResults')}</p>
      )}
    </section>
  )
}
