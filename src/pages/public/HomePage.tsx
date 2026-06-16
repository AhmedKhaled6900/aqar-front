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
    <div className="space-y-8">
      <section className="gradient-hero relative animate-fade-in-up overflow-hidden rounded-2xl px-6 py-8 text-white shadow-[var(--shadow-card)] md:px-10 md:py-10">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-2 text-sm font-medium text-white/80">{t('app.tagline')}</p>
          <h1 className="text-2xl font-bold md:text-3xl">
            {me?.user ? `${t('home.welcome')}, ${me.user.name}` : t('home.hero')}
          </h1>
          <p className="mt-3 text-white/75">{t('home.heroSubtitle')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-white text-main hover:bg-white/90 hover:text-main-dark"
            >
              <Link to="/properties">{t('nav.properties')}</Link>
            </Button>
            {role === 'OWNER' && (
              <Button
                asChild
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link to="/owner/properties/new">
                  <Plus className="h-4 w-4" />
                  {t('nav.addProperty')}
                </Link>
              </Button>
            )}
          </div>
        </div>
        <div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-10 size-56 rounded-full bg-accent/20 blur-3xl" />
      </section>

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
    <div className="stagger-children grid gap-4 sm:grid-cols-2">
      <StatCard
        to="/admin/owners/pending"
        icon={<ShieldCheck className="h-8 w-8 text-main" />}
        label={t('admin.pendingOwners')}
        value={pendingOwners?.meta.total ?? 0}
      />
      <StatCard
        to="/admin/properties/pending"
        icon={<ClipboardCheck className="h-8 w-8 text-accent" />}
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
    <div className="stagger-children grid gap-4 sm:grid-cols-2">
      <StatCard
        to="/owner/dashboard"
        icon={<Building2 className="h-8 w-8 text-main" />}
        label={t('nav.myProperties')}
        value={data?.meta.total ?? 0}
      />
      <Card className="hover-lift flex items-center justify-center border-border/80">
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
      <Card className="hover-lift border-border/80">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-main-muted">
            {icon}
          </div>
          <div>
            <p className="text-3xl font-bold text-main">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function LatestProperties() {
  const { t } = useTranslation()
  const { data, isLoading } = useProperties({ limit: 6, purpose: 'RENT' })

  return (
    <section className="animate-fade-in-up">
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
        <div className="stagger-children grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
