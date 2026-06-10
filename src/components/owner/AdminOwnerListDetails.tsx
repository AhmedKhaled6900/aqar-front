import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AdminOwnerListItem } from '@/lib/types'

interface AdminOwnerListDetailsProps {
  owner: AdminOwnerListItem
}

export function AdminOwnerListDetails({ owner }: AdminOwnerListDetailsProps) {
  const { t } = useTranslation()
  const profile = owner.ownerProfile

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('admin.userInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <DetailRow label={t('auth.name')} value={owner.name} />
          <DetailRow label={t('auth.email')} value={owner.email ?? '—'} />
          <DetailRow label={t('auth.phone')} value={owner.phone ?? '—'} />
          <DetailRow label={t('admin.provider')} value={owner.provider} />
          <DetailRow
            label={t('admin.emailVerified')}
            value={t(`admin.emailStatus.${owner.emailVerificationStatus}`)}
          />
          <DetailRow
            label={t('admin.profileCompletion')}
            value={t(`admin.profileCompletionStatus.${owner.profileCompletionStatus}`)}
          />
          <DetailRow
            label={t('common.status')}
            value={t(`status.${owner.profileStatus}`)}
          />
          <DetailRow
            label={t('admin.registeredAt')}
            value={new Date(owner.createdAt).toLocaleString('ar-EG')}
          />
          <DetailRow
            label={t('admin.updatedAt')}
            value={new Date(owner.updatedAt).toLocaleString('ar-EG')}
          />
        </CardContent>
      </Card>

      {profile && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t('admin.profileInfo')}</CardTitle>
            <Badge>{t(`status.${profile.profileStatus}`)}</Badge>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DetailRow label={t('owner.ownerType')} value={profile.ownerType ?? '—'} />
            <DetailRow label={t('owner.companyName')} value={profile.companyName ?? '—'} />
            <DetailRow label={t('properties.city')} value={profile.city ?? '—'} />
            {profile.rejectionReason && (
              <div className="sm:col-span-2">
                <DetailRow
                  label={t('properties.rejectionReason')}
                  value={profile.rejectionReason}
                />
              </div>
            )}
            <DetailRow
              label={t('admin.submittedAt')}
              value={new Date(profile.createdAt).toLocaleString('ar-EG')}
            />
            <DetailRow
              label={t('admin.updatedAt')}
              value={new Date(profile.updatedAt).toLocaleString('ar-EG')}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
