import { Layers, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SubcategoryFormDialog } from '@/components/categories/SubcategoryFormDialog'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  useAllSubcategories,
  useMainCategories,
  type SubcategoryListItem,
} from '@/features/categories/useCategories'
import { useDeleteSubcategory } from '@/features/categories/useAdminSubcategories'
import { useCookies } from '@/lib/token-managament/useCookies'
import type { PaginationMeta } from '@/lib/types'

const PAGE_SIZE = 20

export function AdminSubcategoriesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const parentIdFilter = searchParams.get('parentId') ?? undefined

  const { hasPermission } = useCookies()
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const { data: mainCategories = [], isLoading: loadingMain } = useMainCategories()
  const { data: allSubcategories = [], isLoading } = useAllSubcategories(parentIdFilter)
  const deleteMutation = useDeleteSubcategory()

  const canCreate = hasPermission('category.create')
  const canUpdate = hasPermission('category.update')
  const canDelete = hasPermission('category.delete')

  const { items, meta } = useMemo(() => {
    const total = allSubcategories.length
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const currentPage = Math.min(page, totalPages)
    const start = (currentPage - 1) * PAGE_SIZE
    const paginatedItems = allSubcategories.slice(start, start + PAGE_SIZE)

    const paginationMeta: PaginationMeta = {
      total,
      page: currentPage,
      limit: PAGE_SIZE,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    }

    return { items: paginatedItems, meta: paginationMeta }
  }, [allSubcategories, page])

  const handleParentFilterChange = (nextParentId: string) => {
    setPage(1)
    if (nextParentId) {
      navigate(`/admin/subcategories?parentId=${nextParentId}`)
    } else {
      navigate('/admin/subcategories')
    }
  }

  const openCreate = () => {
    setEditingSubcategoryId(null)
    setDialogOpen(true)
  }

  const openEdit = (subcategory: SubcategoryListItem) => {
    setEditingSubcategoryId(subcategory.id)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('categories.deleteSubcategoryConfirm'))) return
    setError('')
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const columns = useMemo<DataTableColumn<SubcategoryListItem>[]>(
    () => [
      {
        id: 'name',
        header: t('categories.name'),
        cell: (row) => <span className="font-medium">{row.name}</span>,
      },
      {
        id: 'parent',
        header: t('categories.parent'),
        cell: (row) => row.parentName,
      },
      {
        id: 'slug',
        header: t('categories.slug'),
        cell: (row) => <span dir="ltr">{row.slug}</span>,
      },
      {
        id: 'sortOrder',
        header: t('categories.sortOrder'),
        cell: (row) => row.sortOrder,
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

  if (loadingMain || isLoading) {
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
            <Layers className="h-7 w-7 text-main" />
            {t('categories.subcategoriesTitle')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('categories.subcategoriesAllDesc', { count: allSubcategories.length })}
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t('categories.addSubcategory')}
          </Button>
        )}
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="max-w-xs">
        <Label>{t('categories.filterByParent')}</Label>
        <select
          className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={parentIdFilter ?? ''}
          onChange={(e) => handleParentFilterChange(e.target.value)}
        >
          <option value="">{t('common.all')}</option>
          {mainCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={items}
        meta={meta}
        emptyMessage={t('categories.noSubcategories')}
        onPageChange={setPage}
        getRowKey={(row) => row.id}
      />

      <SubcategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subcategoryId={editingSubcategoryId}
        defaultParentId={parentIdFilter}
        mainCategories={mainCategories}
      />
    </div>
  )
}
