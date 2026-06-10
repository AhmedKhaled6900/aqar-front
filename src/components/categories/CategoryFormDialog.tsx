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
  useCreateCategory,
  useUpdateCategory,
} from '@/features/categories/useAdminCategories'
import type { AdminCategory, CreateCategoryInput } from '@/lib/types'

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: AdminCategory | null
  parentId?: string
  parentName?: string
}

const emptyForm: CreateCategoryInput = {
  name: '',
  slug: '',
  description: '',
  sortOrder: 0,
  isActive: true,
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  parentId,
  parentName,
}: CategoryFormDialogProps) {
  const { t } = useTranslation()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const isEdit = !!category
  const [form, setForm] = useState<CreateCategoryInput>(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (category) {
      setForm({
        name: category.name,
        slug: category.slug,
        description: category.description ?? '',
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      })
    } else {
      setForm({ ...emptyForm, parentId })
    }
    setError('')
  }, [open, category, parentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({
          id: category.id,
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
          ...form,
          description: form.description || undefined,
          parentId: parentId ?? form.parentId,
        })
      }
      onOpenChange(false)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('categories.edit')
              : parentId
                ? t('categories.addSubcategory')
                : t('categories.addMain')}
          </DialogTitle>
          {parentName && (
            <p className="text-sm text-muted-foreground">
              {t('categories.parent')}: {parentName}
            </p>
          )}
        </DialogHeader>

        {error && <Alert variant="destructive">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" disabled={isPending}>
              {isPending ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
