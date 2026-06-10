import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Category } from '@/lib/types'
import type { PropertyFilters } from '@/features/properties/useProperties'

interface PropertyFiltersProps {
  filters: PropertyFilters
  categories: Category[]
  onChange: (filters: PropertyFilters) => void
}

export function PropertyFiltersBar({
  filters,
  categories,
  onChange,
}: PropertyFiltersProps) {
  const { t } = useTranslation()

  const subcategories = categories.flatMap((c) => c.subcategories ?? [])

  return (
    <div className="grid gap-4 rounded-lg border border-border bg-muted/30 p-4 md:grid-cols-4">
      <div>
        <Label>{t('properties.purpose')}</Label>
        <select
          className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={filters.purpose ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              purpose: (e.target.value || undefined) as PropertyFilters['purpose'],
              page: 1,
            })
          }
        >
          <option value="">{t('common.all')}</option>
          <option value="SALE">{t('home.sale')}</option>
          <option value="RENT">{t('home.rent')}</option>
        </select>
      </div>

      <div>
        <Label>{t('properties.category')}</Label>
        <select
          className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={filters.categoryId ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              categoryId: e.target.value || undefined,
              page: 1,
            })
          }
        >
          <option value="">{t('common.all')}</option>
          {subcategories.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>{t('properties.city')}</Label>
        <Input
          className="mt-1"
          value={filters.city ?? ''}
          onChange={(e) =>
            onChange({ ...filters, city: e.target.value || undefined, page: 1 })
          }
          placeholder="القاهرة"
        />
      </div>

      <div className="flex items-end">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onChange({ page: 1, limit: filters.limit })}
        >
          {t('common.filter')}
        </Button>
      </div>
    </div>
  )
}
