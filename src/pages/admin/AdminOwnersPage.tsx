import { Eye } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAdminOwners } from '@/features/admin/useAdmin'
import type { AdminOwnerListItem, ProfileStatus } from '@/lib/types'

const PAGE_SIZE = 20

const statusVariant: Record<
  string,
  'default' | 'secondary' | 'warning' | 'destructive' | 'success'
> = {
  INCOMPLETE: 'secondary',
  BASIC_DONE: 'secondary',
  KYC_PENDING: 'warning',
  VERIFIED: 'success',
  REJECTED: 'destructive',
}

export function AdminOwnersPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [emailVerification, setEmailVerification] = useState<
    'VERIFIED' | 'NOT_VERIFIED' | ''
  >('')
  const [profileCompletion, setProfileCompletion] = useState<
    'COMPLETE' | 'INCOMPLETE' | ''
  >('')
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | ''>('')

  const filters = {
    ...(emailVerification ? { emailVerification } : {}),
    ...(profileCompletion ? { profileCompletion } : {}),
    ...(profileStatus ? { profileStatus } : {}),
  }

  const { data, isLoading } = useAdminOwners(page, PAGE_SIZE, filters)

  const columns = useMemo<DataTableColumn<AdminOwnerListItem>[]>(
    () => [
      {
        id: 'name',
        header: t('auth.name'),
        cell: (row) => <span className="font-medium">{row.name}</span>,
      },
      {
        id: 'email',
        header: t('auth.email'),
        cell: (row) => row.email ?? '—',
      },
      {
        id: 'phone',
        header: t('auth.phone'),
        cell: (row) => row.phone ?? '—',
      },
      {
        id: 'emailVerification',
        header: t('admin.emailVerified'),
        cell: (row) => (
          <Badge variant={row.isVerified ? 'success' : 'warning'}>
            {t(`admin.emailStatus.${row.emailVerificationStatus}`)}
          </Badge>
        ),
      },
      {
        id: 'profileStatus',
        header: t('common.status'),
        cell: (row) => (
          <Badge variant={statusVariant[row.profileStatus] ?? 'secondary'}>
            {t(`status.${row.profileStatus}`)}
          </Badge>
        ),
      },
      {
        id: 'ownerType',
        header: t('owner.ownerType'),
        cell: (row) => row.ownerProfile?.ownerType ?? '—',
      },
      {
        id: 'companyName',
        header: t('owner.companyName'),
        cell: (row) => row.ownerProfile?.companyName ?? '—',
      },
      {
        id: 'city',
        header: t('properties.city'),
        cell: (row) => row.ownerProfile?.city || '—',
      },
      {
        id: 'createdAt',
        header: t('admin.registeredAt'),
        cell: (row) => new Date(row.createdAt).toLocaleDateString('ar-EG'),
      },
      {
        id: 'actions',
        header: t('common.actions'),
        className: 'w-[120px]',
        cell: (row) => (
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/owners/${row.id}`} state={{ owner: row }}>
              <Eye className="h-4 w-4" />
              {t('admin.viewDetails')}
            </Link>
          </Button>
        ),
      },
    ],
    [t],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.allOwners')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.allOwnersDesc')}</p>
      </div>

      <div className="grid gap-4 rounded-lg border border-border bg-muted/30 p-4 md:grid-cols-4">
        <FilterSelect
          label={t('admin.emailVerified')}
          value={emailVerification}
          onChange={(v) => {
            setEmailVerification(v as typeof emailVerification)
            setPage(1)
          }}
          options={[
            { value: '', label: t('common.all') },
            { value: 'VERIFIED', label: t('admin.emailStatus.VERIFIED') },
            { value: 'NOT_VERIFIED', label: t('admin.emailStatus.NOT_VERIFIED') },
          ]}
        />
        <FilterSelect
          label={t('admin.profileCompletion')}
          value={profileCompletion}
          onChange={(v) => {
            setProfileCompletion(v as typeof profileCompletion)
            setPage(1)
          }}
          options={[
            { value: '', label: t('common.all') },
            { value: 'COMPLETE', label: t('admin.profileCompletionStatus.COMPLETE') },
            {
              value: 'INCOMPLETE',
              label: t('admin.profileCompletionStatus.INCOMPLETE'),
            },
          ]}
        />
        <FilterSelect
          label={t('common.status')}
          value={profileStatus}
          onChange={(v) => {
            setProfileStatus(v as ProfileStatus | '')
            setPage(1)
          }}
          options={[
            { value: '', label: t('common.all') },
            ...(['INCOMPLETE', 'KYC_PENDING', 'VERIFIED', 'REJECTED', 'BASIC_DONE'] as const).map(
              (s) => ({ value: s, label: t(`status.${s}`) }),
            ),
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        onPageChange={setPage}
        getRowKey={(row) => row.id}
      />
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value || 'all'} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
