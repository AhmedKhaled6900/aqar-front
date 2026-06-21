import { ChefHat, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  useCreateMenuItem,
  useDeleteMenuItem,
  useProviderMenuItems,
  useUpdateMenuItem,
  type CreateMenuItemInput,
} from '@/features/service-provider/useProviderMenuItems'
import {
  useProviderProfile,
  useUpdateProviderProfile,
} from '@/features/service-provider/useProviderProfile'
import { useConfirm } from '@/hooks/use-confirm'
import { useCookies } from '@/lib/token-managament/useCookies'
import type { ProviderMenuItem } from '@/lib/types'

const emptyForm: CreateMenuItemInput = {
  name: '',
  price: 0,
  prepTimeMinutes: undefined,
  sortOrder: 0,
}

export function ProviderMenuItemsPage() {
  const { t } = useTranslation()
  const { hasPermission } = useCookies()
  const canManageMenu = hasPermission('provider.menu.manage')
  const {
    data: items = [],
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useProviderMenuItems()
  const { data: profile } = useProviderProfile()
  const updateProfileMutation = useUpdateProviderProfile()
  const createMutation = useCreateMenuItem()
  const updateMutation = useUpdateMenuItem()
  const deleteMutation = useDeleteMenuItem()
  const { confirm, dialog } = useConfirm()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProviderMenuItem | null>(null)
  const [form, setForm] = useState<CreateMenuItemInput>(emptyForm)
  const [error, setError] = useState('')
  const [menuDeliveryFee, setMenuDeliveryFee] = useState('')
  const [deliveryFeeError, setDeliveryFeeError] = useState('')

  useEffect(() => {
    if (profile?.menuDeliveryFee != null) {
      setMenuDeliveryFee(String(profile.menuDeliveryFee))
    } else {
      setMenuDeliveryFee('')
    }
  }, [profile?.menuDeliveryFee])

  const canUpdateProfile = hasPermission('provider.profile.update')

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, sortOrder: items.length })
    setFormOpen(true)
    setError('')
  }

  const openEdit = (item: ProviderMenuItem) => {
    setEditing(item)
    setForm({
      name: item.name,
      price: item.price,
      prepTimeMinutes: item.prepTimeMinutes ?? undefined,
      sortOrder: item.sortOrder,
    })
    setFormOpen(true)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!canManageMenu) {
      setError(t('provider.menuPermissionRequired'))
      return
    }
    if (!form.name.trim()) {
      setError(t('common.required'))
      return
    }
    try {
      const payload: CreateMenuItemInput = {
        name: form.name.trim(),
        price: Number(form.price) || 0,
        ...(form.prepTimeMinutes != null && form.prepTimeMinutes > 0
          ? { prepTimeMinutes: form.prepTimeMinutes }
          : {}),
        sortOrder: form.sortOrder ?? 0,
      }
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      setFormOpen(false)
      setForm(emptyForm)
      setEditing(null)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const toggleActive = async (item: ProviderMenuItem) => {
    await updateMutation.mutateAsync({ id: item.id, isActive: !item.isActive })
  }

  const handleSaveMenuDeliveryFee = async (e: React.FormEvent) => {
    e.preventDefault()
    setDeliveryFeeError('')
    if (!canUpdateProfile) {
      setDeliveryFeeError(t('common.error'))
      return
    }
    const fee = menuDeliveryFee === '' ? 0 : Number(menuDeliveryFee)
    if (Number.isNaN(fee) || fee < 0) {
      setDeliveryFeeError(t('common.error'))
      return
    }
    try {
      await updateProfileMutation.mutateAsync({ menuDeliveryFee: fee })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setDeliveryFeeError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const handleDelete = (id: string) => {
    confirm({
      description: t('provider.deleteMenuItemConfirm'),
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id)
      },
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
            <ChefHat className="h-7 w-7 text-main" />
            {t('provider.menuTitle')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('provider.menuDesc')}</p>
        </div>
        <Button onClick={openCreate} disabled={!canManageMenu}>
          <Plus className="h-4 w-4" />
          {t('provider.addMenuItem')}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSaveMenuDeliveryFee} className="space-y-3">
            <div>
              <Label>{t('provider.menuDeliveryFee')}</Label>
              <p className="text-sm text-muted-foreground">{t('provider.menuDeliveryFeeDesc')}</p>
              <Input
                type="number"
                min={0}
                step={0.01}
                dir="ltr"
                className="mt-2 max-w-xs"
                value={menuDeliveryFee}
                onChange={(e) => setMenuDeliveryFee(e.target.value)}
                disabled={!canUpdateProfile}
                placeholder="0"
              />
            </div>
            {deliveryFeeError && <Alert variant="destructive">{deliveryFeeError}</Alert>}
            <Button
              type="submit"
              size="sm"
              disabled={!canUpdateProfile || updateProfileMutation.isPending}
            >
              {t('common.save')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {!canManageMenu && (
        <Alert variant="destructive">{t('provider.menuPermissionRequired')}</Alert>
      )}

      {isError && (
        <Alert variant="destructive">
          {(queryError as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? t('common.error')}
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </Alert>
      )}

      {formOpen && (
        <Card>
          <CardContent className="p-4">
            {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t('provider.menuItemName')}</Label>
                  <Input
                    className="mt-1"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>{t('provider.menuItemPrice')}</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    dir="ltr"
                    className="mt-1"
                    value={form.price || ''}
                    onChange={(e) =>
                      setForm({ ...form, price: Number(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>{t('provider.prepTimeMinutes')}</Label>
                  <Input
                    type="number"
                    min={0}
                    dir="ltr"
                    className="mt-1"
                    value={form.prepTimeMinutes ?? ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        prepTimeMinutes: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder={t('provider.prepTimeOptional')}
                  />
                </div>
                <div>
                  <Label>{t('provider.sortOrder')}</Label>
                  <Input
                    type="number"
                    min={0}
                    dir="ltr"
                    className="mt-1"
                    value={form.sortOrder ?? 0}
                    onChange={(e) =>
                      setForm({ ...form, sortOrder: Number(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
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

      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    <Badge variant={item.isActive ? 'default' : 'secondary'}>
                      {item.isActive ? t('categories.isActive') : t('provider.inactive')}
                    </Badge>
                  </div>
                  <p className="mt-1 text-lg font-bold text-main">
                    {item.price.toLocaleString('ar-EG')} ج.م
                  </p>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {item.prepTimeMinutes != null && item.prepTimeMinutes > 0 && (
                      <span>
                        {t('provider.prepTimeMinutes')}: {item.prepTimeMinutes}{' '}
                        {t('provider.minutes')}
                      </span>
                    )}
                    <span>
                      {t('provider.sortOrder')}: {item.sortOrder}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(item)} disabled={!canManageMenu}>
                    <Pencil className="h-4 w-4" />
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updateMutation.isPending || !canManageMenu}
                    onClick={() => toggleActive(item)}
                  >
                    {item.isActive ? t('provider.hideMenuItem') : t('provider.showMenuItem')}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteMutation.isPending || !canManageMenu}
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">{t('provider.noMenuItems')}</p>
      )}
    </div>
  )
}
