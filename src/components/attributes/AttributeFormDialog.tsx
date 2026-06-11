import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateAttribute,
  useSyncSubcategoryAttributes,
  useUpdateAttribute,
} from '@/features/attributes/useAdminAttributes'
import type {
  AttributeType,
  CreateAttributeInput,
  SubcategoryAttributeItem,
  SubcategoryAttributeLinkInput,
} from '@/lib/types'

interface AttributeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subcategoryId: string
  subcategoryName?: string
  attribute?: SubcategoryAttributeItem | null
  existingLinks: SubcategoryAttributeLinkInput[]
}

const SELECT_TYPES: AttributeType[] = ['SELECT', 'MULTI_SELECT']

const emptyForm: CreateAttributeInput = {
  name: '',
  slug: '',
  type: 'TEXT',
  scope: 'SYSTEM',
  options: [],
  sortOrder: 0,
  isActive: true,
}

export function AttributeFormDialog({
  open,
  onOpenChange,
  subcategoryId,
  subcategoryName,
  attribute,
  existingLinks,
}: AttributeFormDialogProps) {
  const { t } = useTranslation()
  const createMutation = useCreateAttribute()
  const updateMutation = useUpdateAttribute()
  const syncMutation = useSyncSubcategoryAttributes()
  const isEdit = !!attribute
  const [form, setForm] = useState<CreateAttributeInput>(emptyForm)
  const [optionsText, setOptionsText] = useState('')
  const [isRequired, setIsRequired] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (attribute) {
      setForm({
        name: attribute.name,
        slug: attribute.slug,
        type: attribute.type,
        scope: attribute.scope,
        sortOrder: attribute.sortOrder,
        isActive: attribute.isActive,
        options: attribute.options ?? [],
      })
      setOptionsText((attribute.options ?? []).join('\n'))
      setIsRequired(attribute.isRequired)
    } else {
      setForm(emptyForm)
      setOptionsText('')
      setIsRequired(false)
    }
    setError('')
  }, [open, attribute])

  const needsOptions = SELECT_TYPES.includes(form.type)
  const isPending =
    createMutation.isPending || updateMutation.isPending || syncMutation.isPending

  const buildLinksAfterCreate = (attributeId: string): SubcategoryAttributeLinkInput[] => [
    ...existingLinks,
    {
      attributeId,
      isRequired,
      sortOrder: existingLinks.length,
    },
  ]

  const buildLinksAfterUpdate = (): SubcategoryAttributeLinkInput[] =>
    existingLinks.map((link) =>
      link.attributeId === attribute?.id
        ? { ...link, isRequired }
        : link,
    )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const options = needsOptions
      ? optionsText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
      : undefined

    const payload: CreateAttributeInput = {
      name: form.name,
      slug: form.slug,
      type: form.type,
      scope: 'SYSTEM',
      sortOrder: form.sortOrder,
      isActive: form.isActive,
      ...(needsOptions ? { options } : {}),
    }

    try {
      if (isEdit && attribute) {
        await updateMutation.mutateAsync({ id: attribute.id, input: payload })
        await syncMutation.mutateAsync({
          subcategoryId,
          items: buildLinksAfterUpdate(),
        })
      } else {
        const created = await createMutation.mutateAsync(payload)
        await syncMutation.mutateAsync({
          subcategoryId,
          items: buildLinksAfterCreate(created.id),
        })
      }
      onOpenChange(false)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('attributes.edit') : t('attributes.add')}
          </DialogTitle>
          {subcategoryName && (
            <p className="text-sm text-muted-foreground">
              {t('properties.subcategory')}: {subcategoryName}
            </p>
          )}
        </DialogHeader>

        {error && <Alert variant="destructive">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('attributes.name')}</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={2}
              className="mt-1"
            />
          </div>

          <div>
            <Label>{t('attributes.slug')}</Label>
            <Input
              dir="ltr"
              value={form.slug}
              onChange={(e) =>
                setForm({ ...form, slug: e.target.value.toLowerCase().trim() })
              }
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              className="mt-1"
            />
          </div>

          <div>
            <Label>{t('attributes.type')}</Label>
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as AttributeType })
              }
            >
              {(
                [
                  'TEXT',
                  'NUMBER',
                  'BOOLEAN',
                  'SELECT',
                  'MULTI_SELECT',
                  'DATE',
                ] as AttributeType[]
              ).map((type) => (
                <option key={type} value={type}>
                  {t(`attributes.types.${type}`)}
                </option>
              ))}
            </select>
          </div>

          {needsOptions && (
            <div>
              <Label>{t('attributes.options')}</Label>
              <Textarea
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder={t('attributes.optionsPlaceholder')}
                rows={4}
                required
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {t('attributes.optionsHint')}
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t('categories.sortOrder')}</Label>
              <Input
                type="number"
                dir="ltr"
                min={0}
                value={form.sortOrder ?? 0}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) })
                }
                className="mt-1"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                />
                {t('attributes.required')}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  id="attr-active"
                  type="checkbox"
                  checked={form.isActive ?? true}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                {t('categories.isActive')}
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
