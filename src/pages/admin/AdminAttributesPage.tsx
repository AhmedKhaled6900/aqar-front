import { ArrowDown, ArrowUp, ListChecks, Pencil, Plus, Trash2, Unlink } from 'lucide-react'
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
  useCategorySelectMenu,
  useSubcategorySelectMenu,
} from '@/features/categories/useCategories'
import {
  useDeleteAttribute,
  useSubcategoryAttributeLinks,
  useSyncSubcategoryAttributes,
} from '@/features/attributes/useAdminAttributes'
import { useCookies } from '@/lib/token-managament/useCookies'
import type { SubcategoryAttributeItem } from '@/lib/types'

export function AdminAttributesPage() {
  const { t } = useTranslation()
  const { hasPermission } = useCookies()
  const [parentCategoryId, setParentCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAttribute, setEditingAttribute] = useState<SubcategoryAttributeItem | null>(
    null,
  )
  const [error, setError] = useState('')

  const { data: parentCategories = [] } = useCategorySelectMenu()
  const { data: subcategories = [] } = useSubcategorySelectMenu(parentCategoryId, true)
  const { data: linksData, isLoading } = useSubcategoryAttributeLinks(subcategoryId)
  const deleteMutation = useDeleteAttribute()
  const syncMutation = useSyncSubcategoryAttributes()

  const canCreate = hasPermission('attribute.create')
  const canUpdate = hasPermission('attribute.update')
  const canDelete = hasPermission('attribute.delete')

  const items = linksData?.items ?? []
  const subcategoryName =
    subcategories.find((sub) => sub.id === subcategoryId)?.name ?? ''

  const existingLinks = items.map((item, index) => ({
    attributeId: item.id,
    isRequired: item.isRequired,
    sortOrder: index,
  }))

  const openCreate = () => {
    setEditingAttribute(null)
    setDialogOpen(true)
  }

  const openEdit = (attribute: SubcategoryAttributeItem) => {
    setEditingAttribute(attribute)
    setDialogOpen(true)
  }

  const handleUnlink = async (attributeId: string) => {
    if (!window.confirm(t('attributes.unlinkConfirm'))) return
    setError('')
    try {
      await syncMutation.mutateAsync({
        subcategoryId,
        items: existingLinks
          .filter((link) => link.attributeId !== attributeId)
          .map((link, index) => ({ ...link, sortOrder: index })),
      })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
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

  const moveItem = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= items.length) return
    const reordered = [...existingLinks]
    const temp = reordered[index]
    reordered[index] = reordered[nextIndex]
    reordered[nextIndex] = temp
    setError('')
    try {
      await syncMutation.mutateAsync({
        subcategoryId,
        items: reordered.map((link, i) => ({ ...link, sortOrder: i })),
      })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const columns = useMemo<DataTableColumn<SubcategoryAttributeItem>[]>(
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
        id: 'isRequired',
        header: t('attributes.required'),
        cell: (row) => (
          <Badge variant={row.isRequired ? 'default' : 'secondary'}>
            {row.isRequired ? t('common.yes') : t('common.no')}
          </Badge>
        ),
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
        className: 'w-[160px]',
        cell: (row) => {
          const index = items.findIndex((item) => item.id === row.id)
          return (
            <div className="flex flex-wrap gap-1">
              {canUpdate && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === 0 || syncMutation.isPending}
                    onClick={() => moveItem(index, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === items.length - 1 || syncMutation.isPending}
                    onClick={() => moveItem(index, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </>
              )}
              {canUpdate && (
                <Button
                  variant="ghost"
                  size="sm"
                  title={t('attributes.unlink')}
                  disabled={syncMutation.isPending}
                  onClick={() => handleUnlink(row.id)}
                >
                  <Unlink className="h-4 w-4" />
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
          )
        },
      },
    ],
    [
      t,
      canUpdate,
      canDelete,
      items,
      syncMutation.isPending,
      deleteMutation.isPending,
    ],
  )

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
        {canCreate && subcategoryId && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t('attributes.add')}
          </Button>
        )}
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>{t('properties.parentCategory')}</Label>
          <select
            className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={parentCategoryId}
            onChange={(e) => {
              setParentCategoryId(e.target.value)
              setSubcategoryId('')
            }}
          >
            <option value="">{t('properties.selectParentCategory')}</option>
            {parentCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>{t('properties.subcategory')}</Label>
          <select
            className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            disabled={!parentCategoryId}
          >
            <option value="">{t('attributes.selectSubcategory')}</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!subcategoryId ? (
        <p className="rounded-md border border-dashed border-border py-12 text-center text-muted-foreground">
          {t('attributes.selectSubcategoryFirst')}
        </p>
      ) : isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          emptyMessage={t('attributes.emptyForSubcategory')}
          getRowKey={(row) => row.id}
        />
      )}

      {subcategoryId && (
        <AttributeFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          subcategoryId={subcategoryId}
          subcategoryName={subcategoryName}
          attribute={editingAttribute}
          existingLinks={existingLinks}
        />
      )}
    </div>
  )
}
