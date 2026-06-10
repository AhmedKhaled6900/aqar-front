import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  useCompleteOwnerProfile,
  useOwnerProfile,
} from '@/features/owner/useOwnerProfile'
import type { OwnerType } from '@/lib/types'

export function CompleteProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: profile } = useOwnerProfile()
  const completeMutation = useCompleteOwnerProfile()
  const [ownerType, setOwnerType] = useState<OwnerType>('INDIVIDUAL')
  const [companyName, setCompanyName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [area, setArea] = useState('')
  const [bio, setBio] = useState('')
  const [nationalId, setNationalId] = useState<File | null>(null)
  const [taxNumber, setTaxNumber] = useState<File | null>(null)
  const [commercialRegister, setCommercialRegister] = useState<File | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (ownerType === 'INDIVIDUAL' && !nationalId) {
      setError(t('common.required'))
      return
    }
    if (ownerType === 'COMPANY' && (!taxNumber || !commercialRegister || !companyName)) {
      setError(t('common.required'))
      return
    }

    try {
      await completeMutation.mutateAsync({
        ownerType,
        companyName: ownerType === 'COMPANY' ? companyName : undefined,
        whatsapp,
        phone,
        email,
        address,
        city,
        area,
        bio,
        nationalId: nationalId ?? undefined,
        taxNumber: taxNumber ?? undefined,
        commercialRegister: commercialRegister ?? undefined,
      })
      navigate('/owner/pending-review')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">{t('owner.completeProfile')}</h1>

      {profile?.profileStatus === 'REJECTED' && profile.rejectionReason && (
        <Alert variant="destructive" className="mb-4">
          {t('owner.kycRejected')}: {profile.rejectionReason}
        </Alert>
      )}

      {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>{t('owner.ownerType')}</Label>
          <select
            className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={ownerType}
            onChange={(e) => setOwnerType(e.target.value as OwnerType)}
          >
            <option value="INDIVIDUAL">{t('owner.individual')}</option>
            <option value="COMPANY">{t('owner.company')}</option>
          </select>
        </div>

        {ownerType === 'COMPANY' && (
          <div>
            <Label>{t('owner.companyName')}</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="mt-1"
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{t('auth.phone')}</Label>
            <Input dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>{t('owner.whatsapp')}</Label>
            <Input dir="ltr" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="mt-1" />
          </div>
        </div>

        <div>
          <Label>{t('auth.email')}</Label>
          <Input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{t('properties.city')}</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>{t('properties.area')}</Label>
            <Input value={area} onChange={(e) => setArea(e.target.value)} className="mt-1" />
          </div>
        </div>

        <div>
          <Label>{t('properties.address')}</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1" />
        </div>

        <div>
          <Label>{t('owner.bio')}</Label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1" />
        </div>

        {ownerType === 'INDIVIDUAL' ? (
          <div>
            <Label>{t('owner.nationalId')}</Label>
            <Input
              type="file"
              accept="image/*"
              className="mt-1"
              onChange={(e) => setNationalId(e.target.files?.[0] ?? null)}
              required
            />
          </div>
        ) : (
          <>
            <div>
              <Label>{t('owner.taxNumber')}</Label>
              <Input
                type="file"
                accept="image/*"
                className="mt-1"
                onChange={(e) => setTaxNumber(e.target.files?.[0] ?? null)}
                required
              />
            </div>
            <div>
              <Label>{t('owner.commercialRegister')}</Label>
              <Input
                type="file"
                accept="image/*"
                className="mt-1"
                onChange={(e) => setCommercialRegister(e.target.files?.[0] ?? null)}
                required
              />
            </div>
          </>
        )}

        <Button type="submit" className="w-full" disabled={completeMutation.isPending}>
          {completeMutation.isPending ? t('common.loading') : t('common.submit')}
        </Button>
      </form>
    </div>
  )
}
