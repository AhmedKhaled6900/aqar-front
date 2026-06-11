import { ListChecks, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AttributeFormDialog } from '@/components/attributes/AttributeFormDialog'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  useAdminAttributes,
  useDeleteAttribute,
} from '@/features/attributes/useAdminAttributes'
import { useCookies } from '@/lib/token-managament/useCookies'
import type { Attribute } from '@/lib/types'

const PAGE_SIZE = 20

export function AdminAttributesPage() {
  const { t } = useTranslation()
  const { hasPermission } = useCookies()
  const [page, setPage] = useState(1)
  const [isActiveFilter, setIsActiveFilter] = useState<'all' | 'true' | 'false'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null)
  const [error, setError] = useState('')

  const filters = {
    scope: 'SYSTEM',
    ...(isActiveFilter !== 'all'
      ? { isActive: isActiveFilter === 'true' }
      : {}),
  }

  const { data, isLoading } = useAdminAttributes(page, PAGE_SIZE, filters)
  const deleteMutation = useDeleteAttribute()

  const canCreate = hasPermission('attribute.create')
  const canUpdate = hasPermission('attribute.update')
  const canDelete = hasPermission('attribute.delete')

  const openCreate = () => {
    setEditingAttribute(null)
    setDialogOpen(true)
  }

  const openEdit = (attribute: Attribute) => {
    setEditingAttribute(attribute)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('attributes.deleteConfirm'))) return
    setError('')
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const columns = useMemo<DataTableColumn<Attribute>[]>(
    () => [
      {
        id: 'name',
        header: t('attributes.name'),
        cell: (row) => <span className="font-medium">{row.name}</span>,
      },
      {
        id: 'slug',
        header: t('attributes.slug'),
        cell: (row) => <span dir="ltr">{row.slug}</span>,
      },
      {
        id: 'type',
        header: t('attributes.type'),
        cell: (row) => (
          <Badge variant="secondary">{t(`attributes.types.${row.type}`)}</Badge>
        ),
      },
      {
        id: 'sortOrder',
        header: t('categories.sortOrder'),
        cell: (row) => row.sortOrder,
      },
      {
        id: 'isActive',
        header: t('categories.isActive'),
        cell: (row) => (
          <Badge variant={row.isActive ? 'success' : 'destructive'}>
            {row.isActive ? t('common.yes') : t('common.no')}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: t('common.actions'),
        className: 'w-[120px]',
        cell: (row) => (
          <div className="flex flex-wrap gap-1">
            {canUpdate && (
              <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                disabled={deleteMutation.isPending}
                onClick={() => handleDelete(row.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [t, canUpdate, canDelete, deleteMutation.isPending],
  )

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ListChecks className="h-7 w-7 text-main" />
            {t('attributes.adminTitle')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('attributes.adminDesc')}</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t('attributes.add')}
          </Button>
        )}
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="max-w-xs">
        <Label>{t('categories.isActive')}</Label>
        <select
          className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={isActiveFilter}
          onChange={(e) => {
            setIsActiveFilter(e.target.value as typeof isActiveFilter)
            setPage(1)
          }}
        >
          <option value="all">{t('common.all')}</option>
          <option value="true">{t('common.yes')}</option>
          <option value="false">{t('common.no')}</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        meta={data?.meta}
        emptyMessage={t('attributes.empty')}
        onPageChange={setPage}
        getRowKey={(row) => row.id}
      />

      <AttributeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        attribute={editingAttribute}
      />
    </div>
  )
}
