import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PropertyAttributesGroup } from '@/lib/types'
import { formatAttributeValue } from '@/lib/utils'

interface PropertyAttributesDisplayProps {
  attributes?: PropertyAttributesGroup | null
}

export function PropertyAttributesDisplay({
  attributes,
}: PropertyAttributesDisplayProps) {
  const { t } = useTranslation()

  if (!attributes) return null

  const hasSystem = attributes.system.length > 0
  const hasCustom = attributes.custom.length > 0

  if (!hasSystem && !hasCustom) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t('attributes.propertySection')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasSystem && (
          <dl className="grid gap-3 sm:grid-cols-2">
            {attributes.system.map((attr) => (
              <div key={attr.id}>
                <dt className="text-sm text-muted-foreground">{attr.name}</dt>
                <dd className="font-medium">
                  {formatAttributeValue(attr.value, attr.type)}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {hasCustom && (
          <div className={hasSystem ? 'border-t border-border pt-4' : ''}>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              {t('attributes.customSection')}
            </p>
            <dl className="grid gap-3 sm:grid-cols-2">
              {attributes.custom.map((attr) => (
                <div key={attr.id}>
                  <dt className="text-sm text-muted-foreground">{attr.name}</dt>
                  <dd className="font-medium">
                    {formatAttributeValue(attr.value, attr.type)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
