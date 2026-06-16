import { Link2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { SubcategoryAttributeLinksEditor } from '@/components/attributes/SubcategoryAttributeLinksEditor'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  useCategorySelectMenu,
  useSubcategorySelectMenu,
} from '@/features/categories/useCategories'

export function AdminAttributeLinksPage() {
  const { t } = useTranslation()
  const [parentCategoryId, setParentCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')

  const { data: parentCategories = [] } = useCategorySelectMenu()
  const { data: subcategories = [] } = useSubcategorySelectMenu(parentCategoryId, true)

  const subcategoryName =
    subcategories.find((sub) => sub.id === subcategoryId)?.name ?? ''

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="mb-2" asChild>
          <Link to="/admin/attributes">{t('common.back')}</Link>
        </Button>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Link2 className="h-7 w-7 text-main" />
          {t('attributes.linkPageTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('attributes.linkPageDesc')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>{t('properties.parentCategory')}</Label>
          <select
            className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={parentCategoryId}
            onChange={(e) => {
              setParentCategoryId(e.target.value)
              setSubcategoryId('')
            }}
          >
            <option value="">{t('properties.selectParentCategory')}</option>
            {parentCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>{t('properties.subcategory')}</Label>
          <select
            className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            disabled={!parentCategoryId}
          >
            <option value="">{t('attributes.selectSubcategory')}</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!subcategoryId ? (
        <p className="rounded-md border border-dashed border-border py-12 text-center text-muted-foreground">
          {t('attributes.selectSubcategoryFirst')}
        </p>
      ) : (
        <div className="rounded-md border border-border p-4">
          <p className="mb-4 text-sm text-muted-foreground">
            {t('attributes.linkingTo')}: <strong>{subcategoryName}</strong>
          </p>
          <SubcategoryAttributeLinksEditor subcategoryId={subcategoryId} />
        </div>
      )}
    </div>
  )
}
