import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { useCategories } from '@/features/categories/useCategories'
import {
  useCreateProperty,
  useDeletePropertyImage,
  useProperty,
  useSubmitProperty,
  useUpdateProperty,
  useUploadPropertyImages,
} from '@/features/properties/useProperties'
import type { PropertyPurpose } from '@/lib/types'

const emptyForm = {
  title: '',
  description: '',
  price: '',
  city: '',
  area: '',
  address: '',
  latitude: '',
  longitude: '',
  bedrooms: '',
  bathrooms: '',
  areaSize: '',
  purpose: 'SALE' as PropertyPurpose,
  categoryId: '',
}

export function PropertyFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const { data: categories = [] } = useCategories()
  const { data: property, isLoading: loadingProperty } = useProperty(id ?? '')
  const createMutation = useCreateProperty()
  const updateMutation = useUpdateProperty(id ?? '')
  const uploadImages = useUploadPropertyImages(id ?? '')
  const deleteImage = useDeletePropertyImage(id ?? '')
  const submitMutation = useSubmitProperty()
  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState<File[]>([])
  const [error, setError] = useState('')

  const subcategories = categories.flatMap((c) => c.subcategories ?? [])

  useEffect(() => {
    if (property) {
      setForm({
        title: property.title,
        description: property.description,
        price: String(property.price),
        city: property.city,
        area: property.area,
        address: property.address,
        latitude: property.latitude != null ? String(property.latitude) : '',
        longitude: property.longitude != null ? String(property.longitude) : '',
        bedrooms: property.bedrooms != null ? String(property.bedrooms) : '',
        bathrooms: property.bathrooms != null ? String(property.bathrooms) : '',
        areaSize: property.areaSize != null ? String(property.areaSize) : '',
        purpose: property.purpose,
        categoryId: property.categoryId,
      })
    }
  }, [property])

  const buildPayload = () => ({
    title: form.title,
    description: form.description,
    price: Number(form.price),
    city: form.city,
    area: form.area,
    address: form.address,
    latitude: form.latitude ? Number(form.latitude) : undefined,
    longitude: form.longitude ? Number(form.longitude) : undefined,
    bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
    bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
    areaSize: form.areaSize ? Number(form.areaSize) : undefined,
    purpose: form.purpose,
    categoryId: form.categoryId,
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(buildPayload())
        if (images.length) {
          await uploadImages.mutateAsync({ images, primaryIndex: 0 })
        }
      } else {
        const created = await createMutation.mutateAsync(buildPayload())
        navigate(`/owner/properties/${created.id}/edit`)
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const handleSubmit = async () => {
    if (!id) return
    setError('')
    try {
      await submitMutation.mutateAsync(id)
      navigate('/owner/dashboard')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  if (isEdit && loadingProperty) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">
        {isEdit ? t('properties.edit') : t('properties.create')}
      </h1>

      {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <Label>{t('properties.title') ?? 'العنوان'}</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            minLength={5}
            className="mt-1"
          />
        </div>

        <div>
          <Label>{t('properties.description')}</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            minLength={20}
            className="mt-1"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{t('properties.price')}</Label>
            <Input
              type="number"
              dir="ltr"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label>{t('properties.purpose')}</Label>
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={form.purpose}
              onChange={(e) =>
                setForm({ ...form, purpose: e.target.value as PropertyPurpose })
              }
            >
              <option value="SALE">{t('home.sale')}</option>
              <option value="RENT">{t('home.rent')}</option>
            </select>
          </div>
        </div>

        <div>
          <Label>{t('properties.category')}</Label>
          <select
            className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
          >
            <option value="">—</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{t('properties.city')}</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required className="mt-1" />
          </div>
          <div>
            <Label>{t('properties.area')}</Label>
            <Input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} required className="mt-1" />
          </div>
        </div>

        <div>
          <Label>{t('properties.address')}</Label>
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required className="mt-1" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>{t('properties.bedrooms')}</Label>
            <Input type="number" dir="ltr" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>{t('properties.bathrooms')}</Label>
            <Input type="number" dir="ltr" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>{t('properties.areaSize')}</Label>
            <Input type="number" dir="ltr" value={form.areaSize} onChange={(e) => setForm({ ...form, areaSize: e.target.value })} className="mt-1" />
          </div>
        </div>

        {isEdit && (
          <div>
            <Label>{t('properties.images')}</Label>
            {property?.images.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {property.images.map((img) => (
                  <div key={img.id} className="relative">
                    <img src={img.imageUrl} alt="" className="h-20 w-28 rounded-md object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="mt-1 w-full"
                      disabled={deleteImage.isPending}
                      onClick={() => deleteImage.mutate(img.id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
            <Input
              type="file"
              accept="image/*"
              multiple
              className="mt-2"
              onChange={(e) => setImages(Array.from(e.target.files ?? []))}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {t('common.save')}
          </Button>
          {isEdit && (property?.status === 'DRAFT' || property?.status === 'REJECTED') && (
            <Button
              type="button"
              variant="secondary"
              disabled={submitMutation.isPending}
              onClick={handleSubmit}
            >
              {t('properties.submitForReview')}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
