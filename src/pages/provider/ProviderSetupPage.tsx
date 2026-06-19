import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { useCreateProviderProfile } from '@/features/service-provider/useProviderProfile'
import { useServiceCategories } from '@/features/service-provider/useServiceCategories'

export function ProviderSetupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: categories = [], isLoading } = useServiceCategories()
  const createMutation = useCreateProviderProfile()
  const [form, setForm] = useState({
    businessName: '',
    categoryId: '',
    description: '',
    phone: '',
    whatsapp: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.categoryId) {
      setError(t('provider.categoryRequired'))
      return
    }
    try {
      await createMutation.mutateAsync(form)
      navigate('/provider/profile')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold">{t('provider.setupTitle')}</h1>
      <p className="mb-6 text-muted-foreground">{t('provider.setupDesc')}</p>

      {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>{t('provider.businessName')}</Label>
          <Input
            className="mt-1"
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            required
            minLength={2}
          />
        </div>

        <div>
          <Label>{t('provider.category')}</Label>
          <select
            className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
          >
            <option value="">{t('provider.selectCategory')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>{t('provider.description')}</Label>
          <Textarea
            className="mt-1"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{t('auth.phone')}</Label>
            <Input
              dir="ltr"
              className="mt-1"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <Label>{t('provider.whatsapp')}</Label>
            <Input
              dir="ltr"
              className="mt-1"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            />
          </div>
        </div>

        <Button type="submit" disabled={createMutation.isPending}>
          {t('common.save')}
        </Button>
      </form>
    </div>
  )
}
