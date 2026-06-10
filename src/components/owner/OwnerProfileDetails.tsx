import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { OwnerProfile } from '@/lib/types'

interface OwnerProfileDetailsProps {
  owner: OwnerProfile
}

export function OwnerProfileDetails({ owner }: OwnerProfileDetailsProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('admin.userInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <DetailRow label={t('auth.name')} value={owner.user?.name ?? '—'} />
          <DetailRow label={t('auth.email')} value={owner.user?.email ?? '—'} />
          <DetailRow label={t('auth.phone')} value={owner.user?.phone ?? '—'} />
          <DetailRow
            label={t('admin.emailVerified')}
            value={owner.user?.isVerified ? t('common.yes') : t('common.no')}
          />
          {owner.user?.createdAt && (
            <DetailRow
              label={t('admin.registeredAt')}
              value={new Date(owner.user.createdAt).toLocaleDateString('ar-EG')}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t('admin.profileInfo')}</CardTitle>
          <div className="flex gap-2">
            <Badge>{t(`status.${owner.profileStatus}`)}</Badge>
            {owner.pendingType && (
              <Badge variant="warning">{t(`admin.pendingType.${owner.pendingType}`)}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <DetailRow label={t('owner.ownerType')} value={owner.ownerType ?? '—'} />
          {owner.companyName && (
            <DetailRow label={t('owner.companyName')} value={owner.companyName} />
          )}
          <DetailRow label={t('auth.phone')} value={owner.phone ?? '—'} />
          <DetailRow label={t('owner.whatsapp')} value={owner.whatsapp ?? '—'} />
          <DetailRow label={t('auth.email')} value={owner.email ?? '—'} />
          <DetailRow label={t('properties.city')} value={owner.city ?? '—'} />
          <DetailRow label={t('properties.area')} value={owner.area ?? '—'} />
          <DetailRow label={t('properties.address')} value={owner.address ?? '—'} />
          {owner.bio && (
            <div className="sm:col-span-2">
              <DetailRow label={t('owner.bio')} value={owner.bio} />
            </div>
          )}
          {owner.rejectionReason && (
            <div className="sm:col-span-2">
              <DetailRow
                label={t('properties.rejectionReason')}
                value={owner.rejectionReason}
              />
            </div>
          )}
          {owner.createdAt && (
            <DetailRow
              label={t('admin.submittedAt')}
              value={new Date(owner.createdAt).toLocaleDateString('ar-EG')}
            />
          )}
          {owner.updatedAt && (
            <DetailRow
              label={t('admin.updatedAt')}
              value={new Date(owner.updatedAt).toLocaleDateString('ar-EG')}
            />
          )}
        </CardContent>
      </Card>

      {(owner.nationalId || owner.taxNumber || owner.commercialRegister) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('admin.documents')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {owner.nationalId && (
              <DocumentPreview label={t('owner.nationalId')} url={owner.nationalId} />
            )}
            {owner.taxNumber && (
              <DocumentPreview label={t('owner.taxNumber')} url={owner.taxNumber} />
            )}
            {owner.commercialRegister && (
              <DocumentPreview
                label={t('owner.commercialRegister')}
                url={owner.commercialRegister}
              />
            )}
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

function DocumentPreview({ label, url }: { label: string; url: string }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted-foreground">{label}</p>
      <a href={url} target="_blank" rel="noreferrer" className="block">
        <img
          src={url}
          alt={label}
          className="max-h-64 w-full rounded-lg border border-border object-contain"
        />
      </a>
    </div>
  )
}
