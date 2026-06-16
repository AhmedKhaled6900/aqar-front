import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { PropertyFiltersBar } from '@/components/properties/PropertyFilters'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useCategories } from '@/features/categories/useCategories'
import {
  useProperties,
  type PropertyFilters,
} from '@/features/properties/useProperties'

export function PropertiesPage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<PropertyFilters>({
    page: 1,
    limit: 12,
    purpose: 'RENT',
  })
  const { data: categories = [] } = useCategories()
  const { data, isLoading } = useProperties(filters)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t('properties.title')}</h1>

      <PropertyFiltersBar
        filters={filters}
        categories={categories}
        onChange={setFilters}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : data?.items.length ? (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {data.meta.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={filters.page === 1}
                onClick={() =>
                  setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))
                }
              >
                {t('common.previous')}
              </Button>
              <span className="flex items-center px-4 text-sm">
                {filters.page ?? 1} / {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={(filters.page ?? 1) >= data.meta.totalPages}
                onClick={() =>
                  setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))
                }
              >
                {t('common.next')}
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="mt-8 text-center text-muted-foreground">
          {t('common.noResults')}
        </p>
      )}
    </div>
  )
}
