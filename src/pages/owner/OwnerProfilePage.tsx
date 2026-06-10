import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useOwnerProfile } from '@/features/owner/useOwnerProfile'

export function OwnerProfilePage() {
  const { t } = useTranslation()
  const { data: profile, isLoading, isError } = useOwnerProfile()

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-2xl">
        <Alert variant="warning">{t('common.noResults')}</Alert>
        <Button className="mt-4" asChild>
          <Link to="/owner/complete-profile">{t('owner.completeProfile')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('owner.profile')}</h1>
        <Badge>{t(`status.${profile.profileStatus}`)}</Badge>
      </div>

      {profile.rejectionReason && (
        <Alert variant="destructive" className="mb-4">
          {profile.rejectionReason}
        </Alert>
      )}

      <Card>
        <CardContent className="space-y-3 p-6">
          <Row label={t('owner.ownerType')} value={profile.ownerType ?? '—'} />
          {profile.companyName && (
            <Row label={t('owner.companyName')} value={profile.companyName} />
          )}
          <Row label={t('auth.phone')} value={profile.phone ?? '—'} />
          <Row label={t('owner.whatsapp')} value={profile.whatsapp ?? '—'} />
          <Row label={t('auth.email')} value={profile.email ?? '—'} />
          <Row label={t('properties.city')} value={profile.city ?? '—'} />
          <Row label={t('properties.area')} value={profile.area ?? '—'} />
          <Row label={t('properties.address')} value={profile.address ?? '—'} />
          {profile.bio && <Row label={t('owner.bio')} value={profile.bio} />}

          {profile.nationalId && (
            <div>
              <p className="text-sm text-muted-foreground">{t('owner.nationalId')}</p>
              <img src={profile.nationalId} alt="" className="mt-1 max-h-40 rounded-md" />
            </div>
          )}
        </CardContent>
      </Card>

      {(profile.profileStatus === 'INCOMPLETE' ||
        profile.profileStatus === 'REJECTED') && (
        <Button className="mt-4" asChild>
          <Link to="/owner/complete-profile">{t('owner.resubmit')}</Link>
        </Button>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p>{value}</p>
    </div>
  )
}
