import { List, Pencil, Plus, Trash2 } from 'lucide-react'
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
  buildCreateListingPayload,
  useCreateListing,
  useDeleteListing,
  useProviderListings,
  useUpdateListing,
  useUpdateListingStatus,
  type UpdateListingInput,
} from '@/features/service-provider/useListings'
import { useConfirm } from '@/hooks/use-confirm'
import type { ServiceListing, ServiceListingStatus } from '@/lib/types'

interface ListingFormState {
  title: string
  description: string
  deliveryFee: string
  metadata: Record<string, unknown>
  status: ServiceListingStatus
}

const emptyForm = (): ListingFormState => ({
  title: '',
  description: '',
  deliveryFee: '',
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
    setForm({
      title: listing.title,
      description: listing.description ?? '',
      deliveryFee:
        listing.deliveryFee != null ? String(listing.deliveryFee) : '',
      metadata: listing.metadata ?? {},
      status: listing.status,
    })
    setFormOpen(true)
    setError('')
  }

  const buildInput = (): UpdateListingInput =>
    buildCreateListingPayload({
      title: form.title,
      description: form.description,
      deliveryFee: form.deliveryFee === '' ? 0 : Number(form.deliveryFee),
      metadata: form.metadata,
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const fee =
      form.deliveryFee === '' ? undefined : Number(form.deliveryFee)
    if (fee !== undefined && (Number.isNaN(fee) || fee < 0)) {
      setError(t('common.error'))
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
                  {listing.deliveryFee != null && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t('provider.deliveryFee')}:{' '}
                      {listing.deliveryFee.toLocaleString('ar-EG')} ج.م
                    </p>
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
