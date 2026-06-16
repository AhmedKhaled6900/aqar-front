import { FolderTree, Layers, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CategoryFormDialog } from '@/components/categories/CategoryFormDialog'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  useAdminCategories,
  useDeleteCategory,
} from '@/features/categories/useAdminCategories'
import { useConfirm } from '@/hooks/use-confirm'
import { useCookies } from '@/lib/token-managament/useCookies'
import type { AdminCategory } from '@/lib/types'

const PAGE_SIZE = 20

export function AdminCategoriesPage() {
  const { t } = useTranslation()
  const { hasPermission } = useCookies()
  const [page, setPage] = useState(1)
  const [isActiveFilter, setIsActiveFilter] = useState<'all' | 'true' | 'false'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
  const [error, setError] = useState('')

  const filters = {
    ...(isActiveFilter !== 'all'
      ? { isActive: isActiveFilter === 'true' }
      : {}),
  }

  const { data, isLoading } = useAdminCategories(page, PAGE_SIZE, filters)
  const deleteMutation = useDeleteCategory()
  const { confirm, dialog } = useConfirm()

  const canCreate = hasPermission('category.create')
  const canUpdate = hasPermission('category.update')
  const canDelete = hasPermission('category.delete')
  const canReadSubs = hasPermission('category.read')

  const openCreateMain = () => {
    setEditingCategory(null)
    setDialogOpen(true)
  }

  const openEdit = (category: AdminCategory) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    confirm({
      description: t('categories.deleteConfirm'),
      onConfirm: async () => {
        setError('')
        await deleteMutation.mutateAsync(id)
      },
    })
  }

  const columns = useMemo<DataTableColumn<AdminCategory>[]>(
    () => [
      {
        id: 'name',
        header: t('categories.name'),
        cell: (row) => <span className="font-medium">{row.name}</span>,
      },
      {
        id: 'slug',
        header: t('categories.slug'),
        cell: (row) => <span dir="ltr">{row.slug}</span>,
      },
      {
        id: 'subcategories',
        header: t('categories.subcategories'),
        cell: (row) => {
          const count = row.subcategoryCount ?? row.subcategories?.length ?? 0
          if (!canReadSubs) return count
          return (
            <Button variant="link" className="h-auto p-0" asChild>
              <Link to={`/admin/subcategories?parentId=${row.id}`}>
                <Layers className="h-4 w-4" />
                {t('categories.manageSubcategories', { count })}
              </Link>
            </Button>
          )
        },
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
    [t, canReadSubs, canUpdate, canDelete, deleteMutation.isPending],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <FolderTree className="h-7 w-7 text-main" />
            {t('categories.adminTitle')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('categories.adminDesc')}</p>
        </div>
        {canCreate && (
          <Button onClick={openCreateMain}>
            <Plus className="h-4 w-4" />
            {t('categories.addMain')}
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
        isLoading={isLoading}
        onPageChange={setPage}
        getRowKey={(row) => row.id}
      />

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
      />
      {dialog}
    </div>
  )
}
