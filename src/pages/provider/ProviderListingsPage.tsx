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
  type UpdateListingInput,
} from '@/features/service-provider/useListings'
import { useConfirm } from '@/hooks/use-confirm'
import type { ServiceListing, ServiceMenuItem } from '@/lib/types'

const emptyForm: UpdateListingInput & { menuItemsText: string } = {
  title: '',
  description: '',
  menuItemsText: '',
  menuItems: [],
  metadata: {},
  status: 'DRAFT',
}

function parseMenuItems(text: string): ServiceMenuItem[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, priceStr] = line.split('|').map((s) => s.trim())
      return { name, price: Number(priceStr) || 0 }
    })
    .filter((item) => item.name)
}

function formatMenuItems(items: ServiceMenuItem[]): string {
  return items.map((item) => `${item.name} | ${item.price}`).join('\n')
}

export function ProviderListingsPage() {
  const { t } = useTranslation()
  const { data: listings = [], isLoading } = useProviderListings()
  const createMutation = useCreateListing()
  const updateMutation = useUpdateListing()
  const deleteMutation = useDeleteListing()
  const { confirm, dialog } = useConfirm()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceListing | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormOpen(true)
    setError('')
  }

  const openEdit = (listing: ServiceListing) => {
    setEditing(listing)
    setForm({
      title: listing.title,
      description: listing.description ?? '',
      menuItemsText: formatMenuItems(listing.menuItems ?? []),
      menuItems: listing.menuItems ?? [],
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
      menuItems: parseMenuItems(form.menuItemsText),
      metadata: form.metadata,
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...buildInput(), status: form.status })
      } else {
        await createMutation.mutateAsync(buildInput())
      }
      setFormOpen(false)
      setForm(emptyForm)
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

  const toggleActive = async (listing: ServiceListing) => {
    const nextStatus = listing.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    await updateMutation.mutateAsync({
      id: listing.id,
      ...buildCreateListingPayload({
        title: listing.title,
        description: listing.description ?? '',
        menuItems: listing.menuItems ?? [],
        metadata: listing.metadata ?? {},
      }),
      status: nextStatus,
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
              <div>
                <Label>{t('provider.menuItems')}</Label>
                <Textarea
                  className="mt-1 font-mono text-sm"
                  dir="ltr"
                  value={form.menuItemsText}
                  onChange={(e) => setForm({ ...form, menuItemsText: e.target.value })}
                  placeholder={t('provider.menuItemsPlaceholder')}
                  rows={4}
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
                        status: e.target.value as UpdateListingInput['status'],
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
                    <Badge variant={listing.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {t(`provider.listingStatus.${listing.status}`)}
                    </Badge>
                  </div>
                  {listing.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{listing.description}</p>
                  )}
                  {listing.menuItems?.length > 0 && (
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
                  {listing.status !== 'DRAFT' && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updateMutation.isPending}
                      onClick={() => toggleActive(listing)}
                    >
                      {listing.status === 'ACTIVE'
                        ? t('provider.pauseListing')
                        : t('provider.publishListing')}
                    </Button>
                  )}
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
