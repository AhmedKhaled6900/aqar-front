import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { useCookies } from '@/lib/token-managament/useCookies'
import type { AdminCategory } from '@/lib/types'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20

type TableRow = AdminCategory & { isSubcategory?: boolean; parentName?: string }

export function AdminCategoriesPage() {
  const { t } = useTranslation()
  const { hasPermission } = useCookies()
  const [page, setPage] = useState(1)
  const [isActiveFilter, setIsActiveFilter] = useState<'all' | 'true' | 'false'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
  const [parentForCreate, setParentForCreate] = useState<{
    id: string
    name: string
  } | null>(null)
  const [error, setError] = useState('')

  const filters = {
    ...(isActiveFilter !== 'all'
      ? { isActive: isActiveFilter === 'true' }
      : {}),
  }

  const { data, isLoading } = useAdminCategories(page, PAGE_SIZE, filters)
  const deleteMutation = useDeleteCategory()

  const canCreate = hasPermission('category.create')
  const canUpdate = hasPermission('category.update')
  const canDelete = hasPermission('category.delete')

  const tableRows = useMemo(() => {
    const rows: TableRow[] = []
    for (const main of data?.items ?? []) {
      rows.push(main)
      for (const sub of main.subcategories ?? []) {
        rows.push({
          ...sub,
          isSubcategory: true,
          parentName: main.name,
        })
      }
    }
    return rows
  }, [data?.items])

  const openCreateMain = () => {
    setEditingCategory(null)
    setParentForCreate(null)
    setDialogOpen(true)
  }

  const openCreateSub = (parent: AdminCategory) => {
    setEditingCategory(null)
    setParentForCreate({ id: parent.id, name: parent.name })
    setDialogOpen(true)
  }

  const openEdit = (category: AdminCategory) => {
    setEditingCategory(category)
    setParentForCreate(null)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('categories.deleteConfirm'))) return
    setError('')
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const columns = useMemo<DataTableColumn<TableRow>[]>(
    () => [
      {
        id: 'name',
        header: t('categories.name'),
        cell: (row) => (
          <div className={cn(row.isSubcategory && 'pr-6')}>
            <span className="font-medium">{row.name}</span>
            {row.isSubcategory && row.parentName && (
              <p className="text-xs text-muted-foreground">
                {t('categories.subOf', { name: row.parentName })}
              </p>
            )}
          </div>
        ),
      },
      {
        id: 'slug',
        header: t('categories.slug'),
        cell: (row) => <span dir="ltr">{row.slug}</span>,
      },
      {
        id: 'type',
        header: t('categories.type'),
        cell: (row) => (
          <Badge variant={row.isSubcategory ? 'secondary' : 'default'}>
            {row.isSubcategory ? t('categories.subcategory') : t('categories.main')}
          </Badge>
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
        className: 'w-[200px]',
        cell: (row) => (
          <div className="flex flex-wrap gap-1">
            {!row.isSubcategory && canCreate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openCreateSub(row)}
                title={t('categories.addSubcategory')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
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
    [t, canCreate, canUpdate, canDelete, deleteMutation.isPending],
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
        data={tableRows}
        meta={data?.meta}
        isLoading={isLoading}
        onPageChange={setPage}
        getRowKey={(row) => row.id}
      />

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        parentId={parentForCreate?.id}
        parentName={parentForCreate?.name}
      />
    </div>
  )
}
