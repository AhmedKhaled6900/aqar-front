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
  useAdminSubcategory,
  useCreateSubcategory,
  useUpdateSubcategory,
} from '@/features/categories/useAdminSubcategories'
import type { Category, CreateSubcategoryInput } from '@/lib/types'

interface SubcategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subcategoryId?: string | null
  defaultParentId?: string
  mainCategories?: Category[]
}

const emptyForm: CreateSubcategoryInput = {
  name: '',
  slug: '',
  description: '',
  sortOrder: 0,
  isActive: true,
}

export function SubcategoryFormDialog({
  open,
  onOpenChange,
  subcategoryId,
  defaultParentId,
  mainCategories = [],
}: SubcategoryFormDialogProps) {
  const { t } = useTranslation()
  const createMutation = useCreateSubcategory()
  const updateMutation = useUpdateSubcategory()
  const { data: subcategory, isLoading: loadingSubcategory } = useAdminSubcategory(
    subcategoryId ?? '',
  )
  const isEdit = !!subcategoryId
  const [parentId, setParentId] = useState(defaultParentId ?? '')
  const [form, setForm] = useState<CreateSubcategoryInput>(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setParentId(defaultParentId ?? subcategory?.parentId ?? '')
    if (isEdit && subcategory) {
      setForm({
        name: subcategory.name,
        slug: subcategory.slug,
        description: subcategory.description ?? '',
        sortOrder: subcategory.sortOrder,
        isActive: subcategory.isActive,
      })
    } else {
      setForm(emptyForm)
    }
    setError('')
  }, [open, isEdit, subcategory, defaultParentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isEdit && !parentId) {
      setError(t('categories.parentRequired'))
      return
    }

    try {
      if (isEdit && subcategory) {
        await updateMutation.mutateAsync({
          id: subcategory.id,
          input: {
            name: form.name,
            slug: form.slug,
            description: form.description || undefined,
            sortOrder: form.sortOrder,
            isActive: form.isActive,
          },
        })
      } else {
        await createMutation.mutateAsync({
          parentId,
          input: {
            ...form,
            description: form.description || undefined,
          },
        })
      }
      onOpenChange(false)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const parentName = mainCategories.find((c) => c.id === parentId)?.name

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('categories.editSubcategory') : t('categories.addSubcategory')}
          </DialogTitle>
          {parentName && (
            <p className="text-sm text-muted-foreground">
              {t('categories.parent')}: {parentName}
            </p>
          )}
        </DialogHeader>

        {error && <Alert variant="destructive">{error}</Alert>}

        {isEdit && loadingSubcategory ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t('common.loading')}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isEdit && !defaultParentId && (
              <div>
                <Label>{t('categories.selectParent')}</Label>
                <select
                  className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  required
                >
                  <option value="">{t('categories.selectParentPlaceholder')}</option>
                  {mainCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label>{t('categories.name')}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                minLength={2}
                className="mt-1"
              />
            </div>

            <div>
              <Label>{t('categories.slug')}</Label>
              <Input
                dir="ltr"
                value={form.slug}
                onChange={(e) =>
                  setForm({ ...form, slug: e.target.value.toLowerCase().trim() })
                }
                required
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                className="mt-1"
              />
            </div>

            <div>
              <Label>{t('categories.description')}</Label>
              <Textarea
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1"
              />
            </div>

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
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
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
              <Button type="submit" disabled={isPending || (isEdit && loadingSubcategory)}>
                {isPending ? t('common.loading') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
