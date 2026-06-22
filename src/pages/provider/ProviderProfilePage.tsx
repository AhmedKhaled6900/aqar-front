import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import {
  useProviderProfile,
  useSubmitProviderProfile,
  useUpdateProviderLogo,
  useUpdateProviderProfile,
} from '@/features/service-provider/useProviderProfile'
import { useServiceCategories } from '@/features/service-provider/useServiceCategories'

export function ProviderProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: profile, isLoading, isError } = useProviderProfile()
  const { data: categories = [] } = useServiceCategories()
  const updateMutation = useUpdateProviderProfile()
  const updateLogoMutation = useUpdateProviderLogo()
  const submitMutation = useSubmitProviderProfile()
  const [form, setForm] = useState({
    businessName: '',
    categoryId: '',
    description: '',
    phone: '',
    whatsapp: '',
  })
  const [logo, setLogo] = useState<File | null>(null)
  const [nationalId, setNationalId] = useState<File | null>(null)
  const [commercialRegister, setCommercialRegister] = useState<File | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) {
      setForm({
        businessName: profile.businessName,
        categoryId: profile.categoryId,
        description: profile.description ?? '',
        phone: profile.phone ?? '',
        whatsapp: profile.whatsapp ?? '',
      })
    }
  }, [profile])

  useEffect(() => {
    if (isError) navigate('/provider/setup')
  }, [isError, navigate])

  const canEdit = profile?.status === 'DRAFT' || profile?.status === 'REJECTED'
  const canSubmitKyc = canEdit
  const canUpdateLogo = profile?.status === 'APPROVED' || profile?.status === 'SUSPENDED' || canEdit

  const handleUpdateLogo = async () => {
    setError('')
    if (!logo) {
      setError(t('common.required'))
      return
    }
    try {
      await updateLogoMutation.mutateAsync(logo)
      setLogo(null)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await updateMutation.mutateAsync(form)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const handleSubmitKyc = async () => {
    setError('')
    if (!nationalId && !commercialRegister) {
      setError(t('provider.kycRequired'))
      return
    }
    try {
      await updateMutation.mutateAsync(form)
      if (logo) {
        await updateLogoMutation.mutateAsync(logo)
      }
      await submitMutation.mutateAsync({
        nationalId: nationalId ?? undefined,
        commercialRegister: commercialRegister ?? undefined,
      })
      navigate('/provider/pending-review')
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
      <h1 className="mb-6 text-2xl font-bold">{t('provider.profileTitle')}</h1>

      {profile?.rejectionReason && (
        <Alert variant="destructive" className="mb-4">
          {t('provider.rejectionReason')}: {profile.rejectionReason}
        </Alert>
      )}
      {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}

      {canUpdateLogo && (
        <div className="mb-6 space-y-3 rounded-lg border border-border bg-card p-4">
          <Label>{t('provider.currentLogo')}</Label>
          {profile?.logo ? (
            <img
              src={profile.logo}
              alt={profile.businessName}
              className="h-24 w-24 rounded-lg border border-border object-cover"
            />
          ) : (
            <p className="text-sm text-muted-foreground">{t('common.noResults')}</p>
          )}
          <div>
            <Label>{t('provider.logo')}</Label>
            <Input
              type="file"
              accept="image/*"
              className="mt-1"
              onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!logo || updateLogoMutation.isPending}
            onClick={handleUpdateLogo}
          >
            {t('provider.updateLogo')}
          </Button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <Label>{t('provider.businessName')}</Label>
          <Input
            className="mt-1"
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            disabled={!canEdit}
            required
          />
        </div>

        <div>
          <Label>{t('provider.category')}</Label>
          <select
            className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm disabled:opacity-60"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            disabled={!canEdit}
          >
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
            disabled={!canEdit}
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
              disabled={!canEdit}
            />
          </div>
          <div>
            <Label>{t('provider.whatsapp')}</Label>
            <Input
              dir="ltr"
              className="mt-1"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              disabled={!canEdit}
            />
          </div>
        </div>

        {canEdit && (
          <>
            <div>
              <Label>{t('provider.nationalId')}</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                className="mt-1"
                onChange={(e) => setNationalId(e.target.files?.[0] ?? null)}
              />
            </div>
            <div>
              <Label>{t('provider.commercialRegister')}</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                className="mt-1"
                onChange={(e) => setCommercialRegister(e.target.files?.[0] ?? null)}
              />
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <>
              <Button type="submit" disabled={updateMutation.isPending}>
                {t('common.save')}
              </Button>
              {canSubmitKyc && (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={submitMutation.isPending}
                  onClick={handleSubmitKyc}
                >
                  {t('provider.submitForReview')}
                </Button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  )
}
