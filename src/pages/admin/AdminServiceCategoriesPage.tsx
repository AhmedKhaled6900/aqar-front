import { FolderTree, Pencil, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  useAdminServiceCategories,
  useCreateServiceCategory,
  useUpdateServiceCategory,
} from '@/features/admin/service-provider/useAdminProviders'
import { useCookies } from '@/lib/token-managament/useCookies'
import type { ServiceCategory } from '@/lib/types'

export function AdminServiceCategoriesPage() {
  const { t } = useTranslation()
  const { hasPermission } = useCookies()
  const { data: categories = [], isLoading } = useAdminServiceCategories()
  const createMutation = useCreateServiceCategory()
  const updateMutation = useUpdateServiceCategory()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceCategory | null>(null)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    commissionRate: '0',
  })
  const [error, setError] = useState('')

  const canCreate = hasPermission('service.category.manage')
  const canUpdate = hasPermission('service.category.manage')

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', commissionRate: '0' })
    setDialogOpen(true)
    setError('')
  }

  const openEdit = (category: ServiceCategory) => {
    setEditing(category)
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      commissionRate: String((category.commissionRate ?? 0) * 100),
    })
    setDialogOpen(true)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const commissionRate = Number(form.commissionRate) / 100
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          name: form.name,
          commissionRate,
        })
      } else {
        await createMutation.mutateAsync({
          name: form.name,
          slug: form.slug,
          description: form.description || undefined,
          commissionRate,
        })
      }
      setDialogOpen(false)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const toggleActive = async (category: ServiceCategory) => {
    await updateMutation.mutateAsync({
      id: category.id,
      isActive: !category.isActive,
    })
  }

  const columns = useMemo<DataTableColumn<ServiceCategory>[]>(
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
        id: 'commission',
        header: t('provider.commissionRate'),
        cell: (row) => `${Math.round((row.commissionRate ?? 0) * 100)}%`,
      },
      {
        id: 'isActive',
        header: t('categories.isActive'),
        cell: (row) => (
          <Badge variant={row.isActive ? 'default' : 'secondary'}>
            {row.isActive ? t('common.yes') : t('common.no')}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: t('common.actions'),
        cell: (row) =>
          canUpdate ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => toggleActive(row)}>
                {row.isActive ? t('provider.deactivate') : t('provider.activate')}
              </Button>
            </div>
          ) : null,
      },
    ],
    [t, canUpdate],
  )

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <FolderTree className="h-7 w-7 text-main" />
            {t('admin.serviceCategories')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('admin.serviceCategoriesDesc')}</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t('common.add')}
          </Button>
        )}
      </div>

      {dialogOpen && (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t('categories.name')}</Label>
                <Input
                  className="mt-1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              {!editing && (
                <div>
                  <Label>{t('categories.slug')}</Label>
                  <Input
                    dir="ltr"
                    className="mt-1"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    required
                  />
                </div>
              )}
              <div>
                <Label>{t('provider.commissionRate')}</Label>
                <Input
                  dir="ltr"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  className="mt-1"
                  value={form.commissionRate}
                  onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
                />
              </div>
              {!editing && (
                <div className="sm:col-span-2">
                  <Label>{t('categories.description')}</Label>
                  <Input
                    className="mt-1"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {t('common.save')}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={categories} getRowKey={(row) => row.id} />
    </div>
  )
}
