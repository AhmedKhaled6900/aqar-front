import { ExternalLink, List, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import {
  listingMenuItemsFromApi,
  useCreateListing,
  useDeleteListing,
  useProviderListings,
  useUpdateListing,
  useUpdateListingStatus,
  type CreateListingInput,
  type ListingMenuItemInput,
  type UpdateListingInput,
} from '@/features/service-provider/useListings'
import { useProviderOrderStatsByListing } from '@/features/service-provider/useProviderOrders'
import { useConfirm } from '@/hooks/use-confirm'
import { emptyListingOrderStats } from '@/lib/order-stats'
import type { ListingOrderStats, ServiceListing, ServiceListingStatus } from '@/lib/types'

interface ListingMenuItemFormRow {
  id?: string
  name: string
  price: string
  prepTimeMinutes: string
}

interface ListingFormState {
  title: string
  description: string
  deliveryFee: string
  link: string
  metadata: Record<string, unknown>
  status: ServiceListingStatus
}

const emptyMenuRow = (): ListingMenuItemFormRow => ({
  name: '',
  price: '',
  prepTimeMinutes: '',
})

const emptyForm = (): ListingFormState => ({
  title: '',
  description: '',
  deliveryFee: '',
  link: '',
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

function buildMenuItemsPayload(rows: ListingMenuItemFormRow[]): ListingMenuItemInput[] {
  return rows
    .filter((row) => row.name.trim())
    .map((row) => ({
      ...(row.id ? { id: row.id } : {}),
      name: row.name.trim(),
      price: Number(row.price) || 0,
      ...(row.prepTimeMinutes && Number(row.prepTimeMinutes) > 0
        ? { prepTimeMinutes: Number(row.prepTimeMinutes) }
        : {}),
    }))
}

function menuRowsFromListing(listing: ServiceListing): ListingMenuItemFormRow[] {
  const items = listingMenuItemsFromApi(listing.menuItems)
  if (!items.length) return []
  return items.map((item) => ({
    ...(item.id ? { id: item.id } : {}),
    name: item.name,
    price: String(item.price),
    prepTimeMinutes: item.prepTimeMinutes != null ? String(item.prepTimeMinutes) : '',
  }))
}

function resolveListingOrderStats(
  listing: ServiceListing,
  statsMap?: Record<string, ListingOrderStats>,
): ListingOrderStats {
  if (listing.orderStats) return listing.orderStats
  return statsMap?.[listing.id] ?? emptyListingOrderStats()
}

export function ProviderListingsPage() {
  const { t } = useTranslation()
  const { data: listings = [], isLoading } = useProviderListings()
  const { data: orderStatsMap } = useProviderOrderStatsByListing()
  const createMutation = useCreateListing()
  const updateMutation = useUpdateListing()
  const statusMutation = useUpdateListingStatus()
  const deleteMutation = useDeleteListing()
  const { confirm, dialog } = useConfirm()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceListing | null>(null)
  const [form, setForm] = useState<ListingFormState>(emptyForm())
  const [image, setImage] = useState<File | null>(null)
  const [menuRows, setMenuRows] = useState<ListingMenuItemFormRow[]>([])
  const [error, setError] = useState('')

  const resetForm = () => {
    setForm(emptyForm())
    setImage(null)
    setMenuRows([])
    setEditing(null)
  }

  const openCreate = () => {
    resetForm()
    setMenuRows([emptyMenuRow()])
    setFormOpen(true)
    setError('')
  }

  const openEdit = (listing: ServiceListing) => {
    setEditing(listing)
    setImage(null)
    setMenuRows(menuRowsFromListing(listing))
    setForm({
      title: listing.title,
      description: listing.description ?? '',
      deliveryFee: listing.deliveryFee != null ? String(listing.deliveryFee) : '',
      link: listing.link ?? '',
      metadata: listing.metadata ?? {},
      status: listing.status,
    })
    setFormOpen(true)
    setError('')
  }

  const buildCreateInput = (): CreateListingInput => {
    const menuItems = buildMenuItemsPayload(menuRows)
    return {
      title: form.title,
      image: image!,
      description: form.description || undefined,
      deliveryFee: form.deliveryFee === '' ? undefined : Number(form.deliveryFee),
      link: form.link || undefined,
      metadata: form.metadata,
      ...(menuItems.length ? { menuItems } : {}),
    }
  }

  const buildUpdateInput = (): UpdateListingInput => ({
    title: form.title,
    ...(image ? { image } : {}),
    description: form.description || undefined,
    deliveryFee: form.deliveryFee === '' ? undefined : Number(form.deliveryFee),
    link: form.link || undefined,
    metadata: form.metadata,
    status: form.status,
    menuItems: buildMenuItemsPayload(menuRows),
  })

  const addMenuRow = () => {
    setMenuRows((rows) => [...rows, emptyMenuRow()])
  }

  const removeMenuRow = (index: number) => {
    setMenuRows((rows) => rows.filter((_, i) => i !== index))
  }

  const updateMenuRow = (index: number, patch: Partial<ListingMenuItemFormRow>) => {
    setMenuRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!editing && !image) {
      setError(t('provider.listingImageRequired'))
      return
    }

    const fee = form.deliveryFee === '' ? undefined : Number(form.deliveryFee)
    if (fee !== undefined && (Number.isNaN(fee) || fee < 0)) {
      setError(t('common.error'))
      return
    }

    const invalidMenuRow = menuRows.find(
      (row) => row.name.trim() && (Number.isNaN(Number(row.price)) || Number(row.price) < 0),
    )
    if (invalidMenuRow) {
      setError(t('common.error'))
      return
    }

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...buildUpdateInput() })
      } else {
        await createMutation.mutateAsync(buildCreateInput())
      }
      setFormOpen(false)
      resetForm()
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
          <p className="mt-1 text-sm text-muted-foreground">
            {t('provider.listingsMenuHint')}{' '}
            <Link to="/provider/menu-items" className="text-main underline">
              {t('provider.menuTitle')}
            </Link>
          </p>
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
                <Label>
                  {t('provider.listingImage')}
                  {!editing && <span className="text-destructive"> *</span>}
                </Label>
                {editing?.image && !image && (
                  <img
                    src={editing.image}
                    alt={editing.title}
                    className="mt-2 h-32 w-full max-w-xs rounded-md border border-border object-cover"
                  />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  className="mt-1"
                  required={!editing}
                  onChange={(e) => setImage(e.target.files?.[0] ?? null)}
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
              <div>
                <Label>{t('provider.listingDeliveryFee')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('provider.listingDeliveryFeeDesc')}
                </p>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  dir="ltr"
                  className="mt-1 max-w-xs"
                  value={form.deliveryFee}
                  onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>{t('provider.listingLink')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('provider.listingLinkOptional')}
                </p>
                <Input
                  type="url"
                  dir="ltr"
                  className="mt-1"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://example.com/promo"
                />
              </div>

              <div className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Label>{t('provider.listingMenu')}</Label>
                    <p className="text-sm text-muted-foreground">{t('provider.listingMenuDesc')}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addMenuRow}>
                    <Plus className="h-4 w-4" />
                    {t('provider.addMenuItem')}
                  </Button>
                </div>
                {menuRows.length ? (
                  <div className="space-y-3">
                    {menuRows.map((row, index) => (
                      <div
                        key={row.id ?? `new-${index}`}
                        className="grid gap-3 rounded-md border border-border bg-muted/30 p-3 sm:grid-cols-[1fr_120px_120px_auto]"
                      >
                        <div>
                          <Label className="text-xs">{t('provider.menuItemName')}</Label>
                          <Input
                            className="mt-1"
                            value={row.name}
                            onChange={(e) => updateMenuRow(index, { name: e.target.value })}
                            placeholder={t('provider.menuItemName')}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{t('provider.menuItemPrice')}</Label>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            dir="ltr"
                            className="mt-1"
                            value={row.price}
                            onChange={(e) => updateMenuRow(index, { price: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{t('provider.prepTimeMinutes')}</Label>
                          <Input
                            type="number"
                            min={0}
                            dir="ltr"
                            className="mt-1"
                            value={row.prepTimeMinutes}
                            onChange={(e) =>
                              updateMenuRow(index, { prepTimeMinutes: e.target.value })
                            }
                            placeholder={t('provider.prepTimeOptional')}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeMenuRow(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('provider.noMenuItems')}</p>
                )}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormOpen(false)
                    resetForm()
                  }}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {listings.length ? (
        <div className="space-y-3">
          {listings.map((listing) => {
            const orderStats = resolveListingOrderStats(listing, orderStatsMap)
            const incomplete = orderStats.active + orderStats.closed

            return (
            <Card key={listing.id}>
              <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="flex gap-3">
                  {listing.image && (
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="h-20 w-28 shrink-0 rounded-md border border-border object-cover"
                    />
                  )}
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
                    {listing.deliveryFee != null && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t('provider.deliveryFee')}:{' '}
                        {listing.deliveryFee.toLocaleString('ar-EG')} ج.م
                      </p>
                    )}
                    {listing.link && (
                      <a
                        href={listing.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-sm text-main underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {listing.link}
                      </a>
                    )}
                    {listing.menuItems && listing.menuItems.length > 0 && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t('provider.listingMenuCount', { count: listing.menuItems.length })}
                      </p>
                    )}
                    {orderStats.total > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="default">
                          {t('provider.listingOrdersCompleted', { count: orderStats.completed })}
                        </Badge>
                        <Badge variant="secondary">
                          {t('provider.listingOrdersIncomplete', { count: incomplete })}
                        </Badge>
                        {orderStats.active > 0 && (
                          <Badge variant="warning">
                            {t('provider.listingOrdersActive', { count: orderStats.active })}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
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
            )
          })}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">{t('provider.noListings')}</p>
      )}
    </div>
  )
}
