import { List, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import {
  buildCreateListingPayload,
  useCreateListing,
  useDeleteListing,
  useProviderListings,
  useUpdateListing,
  useUpdateListingStatus,
  type UpdateListingInput,
} from '@/features/service-provider/useListings'
import { useConfirm } from '@/hooks/use-confirm'
import type { ServiceListing, ServiceListingStatus, ServiceMenuItem } from '@/lib/types'

interface ListingFormState {
  title: string
  description: string
  menuItems: ServiceMenuItem[]
  metadata: Record<string, unknown>
  status: ServiceListingStatus
}

const emptyMenuItem = (): ServiceMenuItem => ({ name: '', price: 0 })

const emptyForm = (): ListingFormState => ({
  title: '',
  description: '',
  menuItems: [emptyMenuItem()],
  metadata: {},
  status: 'DRAFT',
})

function listingStatusBadgeVariant(
  status: ServiceListingStatus,
): 'default' | 'secondary' | 'warning' {
  if (status === 'ACTIVE') return 'default'
  if (status === 'DRAFT') return 'warning'
  return 'secondary'
}

function nextListingStatus(status: ServiceListingStatus): ServiceListingStatus {
  return status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE'
}

function listingStatusActionLabel(
  status: ServiceListingStatus,
  t: (key: string) => string,
): string {
  if (status === 'ACTIVE') return t('provider.unpublishListing')
  return t('provider.publishListing')
}

function normalizeMenuItems(items: ServiceMenuItem[]): ServiceMenuItem[] {
  return items
    .map((item) => ({
      name: item.name.trim(),
      price: Number(item.price) || 0,
    }))
    .filter((item) => item.name.length > 0)
}

export function ProviderListingsPage() {
  const { t } = useTranslation()
  const { data: listings = [], isLoading } = useProviderListings()
  const createMutation = useCreateListing()
  const updateMutation = useUpdateListing()
  const statusMutation = useUpdateListingStatus()
  const deleteMutation = useDeleteListing()
  const { confirm, dialog } = useConfirm()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceListing | null>(null)
  const [form, setForm] = useState<ListingFormState>(emptyForm())
  const [error, setError] = useState('')

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm())
    setFormOpen(true)
    setError('')
  }

  const openEdit = (listing: ServiceListing) => {
    setEditing(listing)
    const items = listing.menuItems?.length ? listing.menuItems : [emptyMenuItem()]
    setForm({
      title: listing.title,
      description: listing.description ?? '',
      menuItems: items,
      metadata: listing.metadata ?? {},
      status: listing.status,
    })
    setFormOpen(true)
    setError('')
  }

  const updateMenuItem = (index: number, patch: Partial<ServiceMenuItem>) => {
    setForm((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    }))
  }

  const addMenuItemRow = () => {
    setForm((prev) => ({
      ...prev,
      menuItems: [...prev.menuItems, emptyMenuItem()],
    }))
  }

  const removeMenuItemRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      menuItems:
        prev.menuItems.length > 1
          ? prev.menuItems.filter((_, i) => i !== index)
          : [emptyMenuItem()],
    }))
  }

  const buildInput = (): UpdateListingInput =>
    buildCreateListingPayload({
      title: form.title,
      description: form.description,
      menuItems: normalizeMenuItems(form.menuItems),
      metadata: form.metadata,
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const menuItems = normalizeMenuItems(form.menuItems)
    if (!menuItems.length) {
      setError(t('provider.menuItemsRequired'))
      return
    }
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...buildInput(), status: form.status })
      } else {
        await createMutation.mutateAsync(buildInput())
      }
      setFormOpen(false)
      setForm(emptyForm())
      setEditing(null)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const handleDelete = (id: string) => {
    confirm({
      description: t('provider.deleteListingConfirm'),
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id)
      },
    })
  }

  const toggleListingStatus = async (listing: ServiceListing) => {
    await statusMutation.mutateAsync({
      id: listing.id,
      status: nextListingStatus(listing.status),
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {dialog}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <List className="h-7 w-7 text-main" />
            {t('provider.listings')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('provider.listingsDesc')}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </Button>
      </div>

      {formOpen && (
        <Card>
          <CardContent className="p-4">
            {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t('provider.listingTitle')}</Label>
                <Input
                  className="mt-1"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>{t('provider.description')}</Label>
                <Textarea
                  className="mt-1"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-3">
                <Label>{t('provider.menuItems')}</Label>
                {form.menuItems.map((item, index) => (
                  <div key={index} className="flex flex-wrap items-end gap-2">
                    <div className="min-w-[140px] flex-1">
                      {index === 0 && (
                        <span className="mb-1 block text-xs text-muted-foreground">
                          {t('provider.menuItemName')}
                        </span>
                      )}
                      <Input
                        value={item.name}
                        onChange={(e) => updateMenuItem(index, { name: e.target.value })}
                        placeholder={t('provider.menuItemName')}
                        required={index === 0}
                      />
                    </div>
                    <div className="w-32">
                      {index === 0 && (
                        <span className="mb-1 block text-xs text-muted-foreground">
                          {t('provider.menuItemPrice')}
                        </span>
                      )}
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        dir="ltr"
                        value={item.price || ''}
                        onChange={(e) =>
                          updateMenuItem(index, { price: Number(e.target.value) || 0 })
                        }
                        placeholder="0"
                        required={index === 0}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      disabled={form.menuItems.length === 1 && !item.name && !item.price}
                      onClick={() => removeMenuItemRow(index)}
                      aria-label={t('provider.removeMenuItem')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addMenuItemRow}>
                  <Plus className="h-4 w-4" />
                  {t('provider.addMenuItem')}
                </Button>
              </div>
              {editing && (
                <div>
                  <Label>{t('common.status')}</Label>
                  <select
                    className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as ListingFormState['status'],
                      })
                    }
                  >
                    <option value="DRAFT">{t('provider.listingStatus.DRAFT')}</option>
                    <option value="ACTIVE">{t('provider.listingStatus.ACTIVE')}</option>
                    <option value="PAUSED">{t('provider.listingStatus.PAUSED')}</option>
                  </select>
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {t('common.save')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {listings.length ? (
        <div className="space-y-3">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{listing.title}</h3>
                    <Badge variant={listingStatusBadgeVariant(listing.status)}>
                      {t(`provider.listingStatus.${listing.status}`)}
                    </Badge>
                  </div>
                  {listing.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{listing.description}</p>
                  )}
                  {listing.menuItems && listing.menuItems.length > 0 && (
                    <ul className="mt-2 text-sm">
                      {listing.menuItems.map((item, i) => (
                        <li key={i}>
                          {item.name} — {item.price.toLocaleString('ar-EG')} ج.م
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(listing)}>
                    <Pencil className="h-4 w-4" />
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant={listing.status === 'ACTIVE' ? 'outline' : 'default'}
                    size="sm"
                    disabled={statusMutation.isPending}
                    onClick={() => toggleListingStatus(listing)}
                  >
                    {listingStatusActionLabel(listing.status, t)}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => handleDelete(listing.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">{t('provider.noListings')}</p>
      )}
    </div>
  )
}
