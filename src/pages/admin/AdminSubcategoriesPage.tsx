import { Layers, Link2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SubcategoryAttributesDialog } from '@/components/attributes/SubcategoryAttributesDialog'
import { SubcategoryFormDialog } from '@/components/categories/SubcategoryFormDialog'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { useAdminCategories } from '@/features/categories/useAdminCategories'
import {
  useAdminSubcategoriesList,
  useDeleteSubcategory,
} from '@/features/categories/useAdminSubcategories'
import { useCookies } from '@/lib/token-managament/useCookies'
import type { AdminCategory } from '@/lib/types'

const PAGE_SIZE = 20
const MAIN_CATEGORIES_LIMIT = 100

export function AdminSubcategoriesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const parentIdFilter = searchParams.get('parentId') ?? undefined

  const { hasPermission } = useCookies()
  const [page, setPage] = useState(1)
  const [isActiveFilter, setIsActiveFilter] = useState<'all' | 'true' | 'false'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null)
  const [linkingSubcategory, setLinkingSubcategory] = useState<AdminCategory | null>(null)
  const [error, setError] = useState('')

  const listFilters = {
    ...(parentIdFilter ? { parentId: parentIdFilter } : {}),
    ...(isActiveFilter !== 'all'
      ? { isActive: isActiveFilter === 'true' }
      : {}),
  }

  const { data: mainCategories, isLoading: loadingMain } = useAdminCategories(
    1,
    MAIN_CATEGORIES_LIMIT,
  )
  const { data, isLoading } = useAdminSubcategoriesList(page, PAGE_SIZE, listFilters)
  const deleteMutation = useDeleteSubcategory()

  const canCreate = hasPermission('category.create')
  const canUpdate = hasPermission('category.update')
  const canDelete = hasPermission('category.delete')
  const canLinkAttributes = hasPermission('attribute.update')

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

  const openEdit = (subcategory: AdminCategory) => {
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

  const columns = useMemo<DataTableColumn<AdminCategory>[]>(
    () => [
      {
        id: 'name',
        header: t('categories.name'),
        cell: (row) => <span className="font-medium">{row.name}</span>,
      },
      {
        id: 'parent',
        header: t('categories.parent'),
        cell: (row) => row.parent?.name ?? '—',
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
        id: 'properties',
        header: t('categories.propertyCount'),
        cell: (row) => row.propertyCount ?? 0,
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
            {canLinkAttributes && (
              <Button
                variant="ghost"
                size="sm"
                title={t('attributes.linkTitle')}
                onClick={() => setLinkingSubcategory(row)}
              >
                <Link2 className="h-4 w-4" />
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
    [t, canUpdate, canDelete, canLinkAttributes, deleteMutation.isPending],
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
            {t('categories.subcategoriesAllDesc', { count: data?.meta.total ?? 0 })}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>{t('categories.filterByParent')}</Label>
          <select
            className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={parentIdFilter ?? ''}
            onChange={(e) => handleParentFilterChange(e.target.value)}
          >
            <option value="">{t('common.all')}</option>
            {mainCategories?.items.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
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
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        meta={data?.meta}
        emptyMessage={t('categories.noSubcategories')}
        onPageChange={setPage}
        getRowKey={(row) => row.id}
      />

      <SubcategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subcategoryId={editingSubcategoryId}
        defaultParentId={parentIdFilter}
        mainCategories={mainCategories?.items ?? []}
      />

      {linkingSubcategory && (
        <SubcategoryAttributesDialog
          open={!!linkingSubcategory}
          onOpenChange={(open) => {
            if (!open) setLinkingSubcategory(null)
          }}
          subcategoryId={linkingSubcategory.id}
          subcategoryName={linkingSubcategory.name}
        />
      )}
    </div>
  )
}
