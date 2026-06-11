import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import {
  useCategorySelectMenu,
  useSubcategorySelectMenu,
} from '@/features/categories/useCategories'
import {
  useCreateProperty,
  useDeletePropertyImage,
  useDeletePropertyVideo,
  useProperty,
  useSubmitProperty,
  useUpdateProperty,
  useUploadPropertyImages,
  useUploadPropertyVideo,
} from '@/features/properties/useProperties'
import type { PricePeriod, PropertyPurpose } from '@/lib/types'

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
  pricePeriod: 'MONTH' as PricePeriod,
  parentCategoryId: '',
  subcategoryId: '',
  isNegotiable: false,
}

export function PropertyFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const isAdmin = location.pathname.startsWith('/admin/properties')
  const listPath = isAdmin ? '/admin/properties' : '/owner/dashboard'
  const isEdit = !!id
  const { data: parentCategories = [] } = useCategorySelectMenu()
  const { data: property, isLoading: loadingProperty } = useProperty(id ?? '')
  const createMutation = useCreateProperty()
  const updateMutation = useUpdateProperty(id ?? '')
  const uploadImages = useUploadPropertyImages(id ?? '')
  const deleteImage = useDeletePropertyImage(id ?? '')
  const uploadVideo = useUploadPropertyVideo(id ?? '')
  const deleteVideo = useDeletePropertyVideo(id ?? '')
  const submitMutation = useSubmitProperty()
  const [form, setForm] = useState(emptyForm)
  const { data: subcategories = [] } = useSubcategorySelectMenu(
    form.parentCategoryId,
    isAdmin,
  )
  const [images, setImages] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [error, setError] = useState('')

  const canEditMedia =
    property?.status === 'DRAFT' || property?.status === 'REJECTED'

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
        pricePeriod: property.pricePeriod ?? 'MONTH',
        parentCategoryId:
          property.parentCategoryId ??
          property.parentCategory?.id ??
          property.category.parentId ??
          '',
        subcategoryId: property.subcategoryId ?? property.categoryId ?? '',
        isNegotiable: property.isNegotiable ?? false,
      })
    }
  }, [property])

  const buildPayload = () => {
    const base = {
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
      parentCategoryId: form.parentCategoryId,
      ...(form.subcategoryId ? { subcategoryId: form.subcategoryId } : {}),
      isNegotiable: form.isNegotiable,
    }

    if (form.purpose === 'RENT') {
      return { ...base, pricePeriod: form.pricePeriod }
    }

    return base
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(buildPayload())
        if (images.length) {
          await uploadImages.mutateAsync({ images, primaryIndex: 0 })
        }
        if (video) {
          await uploadVideo.mutateAsync(video)
          setVideo(null)
        }
      } else {
        const created = await createMutation.mutateAsync(buildPayload())
        navigate(
          isAdmin
            ? `/admin/properties/${created.id}/edit`
            : `/owner/properties/${created.id}/edit`,
        )
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
      navigate(listPath)
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
      {isAdmin && (
        <Button variant="ghost" size="sm" className="mb-2" asChild>
          <Link to={listPath}>{t('common.back')}</Link>
        </Button>
      )}
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
                setForm({
                  ...form,
                  purpose: e.target.value as PropertyPurpose,
                })
              }
            >
              <option value="SALE">{t('home.sale')}</option>
              <option value="RENT">{t('home.rent')}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isNegotiable"
            type="checkbox"
            checked={form.isNegotiable}
            onChange={(e) => setForm({ ...form, isNegotiable: e.target.checked })}
          />
          <Label htmlFor="isNegotiable" className="cursor-pointer">
            {t('properties.isNegotiable')}
          </Label>
          <p className="text-xs text-muted-foreground">{t('properties.isNegotiableHint')}</p>
        </div>

        {form.purpose === 'RENT' && (
          <div>
            <Label>{t('properties.pricePeriod')}</Label>
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={form.pricePeriod}
              onChange={(e) =>
                setForm({ ...form, pricePeriod: e.target.value as PricePeriod })
              }
              required
            >
              <option value="DAY">{t('properties.pricePeriodDay')}</option>
              <option value="MONTH">{t('properties.pricePeriodMonth')}</option>
              <option value="YEAR">{t('properties.pricePeriodYear')}</option>
            </select>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{t('properties.parentCategory')}</Label>
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={form.parentCategoryId}
              onChange={(e) =>
                setForm({
                  ...form,
                  parentCategoryId: e.target.value,
                  subcategoryId: '',
                })
              }
              required
            >
              <option value="">{t('properties.selectParentCategory')}</option>
              {parentCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {form.parentCategoryId && (
            <div>
              <Label>{t('properties.subcategory')}</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.subcategoryId}
                onChange={(e) =>
                  setForm({ ...form, subcategoryId: e.target.value })
                }
              >
                <option value="">{t('properties.selectSubcategoryOptional')}</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}
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

        {isEdit && canEditMedia && (
          <div>
            <Label>{t('properties.video')}</Label>
            <p className="mb-2 text-xs text-muted-foreground">
              {t('properties.videoHint')}
            </p>
            {property?.videoUrl && (
              <div className="mb-3 space-y-2">
                <video
                  src={property.videoUrl}
                  controls
                  className="max-h-48 w-full rounded-md border border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deleteVideo.isPending}
                  onClick={() => deleteVideo.mutate()}
                >
                  {t('properties.deleteVideo')}
                </Button>
              </div>
            )}
            <Input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              className="mt-1"
              onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
            />
            {video && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                disabled={uploadVideo.isPending}
                onClick={async () => {
                  setError('')
                  try {
                    await uploadVideo.mutateAsync(video)
                    setVideo(null)
                  } catch (err: unknown) {
                    const axiosErr = err as {
                      response?: { data?: { message?: string } }
                    }
                    setError(axiosErr.response?.data?.message ?? t('common.error'))
                  }
                }}
              >
                {t('properties.uploadVideo')}
              </Button>
            )}
          </div>
        )}

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
