import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AttributeField } from '@/components/attributes/AttributeField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { useSubcategoryAttributes } from '@/features/attributes/useAttributes'
import type {
  AttributeType,
  PropertyCustomAttributeInput,
} from '@/lib/types'

interface PropertyAttributesFormProps {
  subcategoryId: string
  systemValues: Record<string, unknown>
  onSystemValuesChange: (values: Record<string, unknown>) => void
  customAttributes: PropertyCustomAttributeInput[]
  onCustomAttributesChange: (items: PropertyCustomAttributeInput[]) => void
}

const CUSTOM_TYPES: AttributeType[] = [
  'TEXT',
  'NUMBER',
  'BOOLEAN',
  'SELECT',
  'DATE',
]

const emptyCustom = (): PropertyCustomAttributeInput => ({
  name: '',
  type: 'TEXT',
  value: '',
})

export function PropertyAttributesForm({
  subcategoryId,
  systemValues,
  onSystemValuesChange,
  customAttributes,
  onCustomAttributesChange,
}: PropertyAttributesFormProps) {
  const { t } = useTranslation()
  const { data, isLoading } = useSubcategoryAttributes(subcategoryId)

  if (!subcategoryId) return null

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    )
  }

  const items = data?.items ?? []

  const updateCustom = (
    index: number,
    patch: Partial<PropertyCustomAttributeInput>,
  ) => {
    onCustomAttributesChange(
      customAttributes.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    )
  }

  return (
    <div className="space-y-6 rounded-md border border-border p-4">
      <h3 className="font-semibold">{t('attributes.propertySection')}</h3>

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((attr) => (
            <AttributeField
              key={attr.id}
              attribute={attr}
              value={systemValues[attr.id]}
              onChange={(value) =>
                onSystemValuesChange({ ...systemValues, [attr.id]: value })
              }
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t('attributes.noLinked')}</p>
      )}

      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-2">
          <Label>{t('attributes.customSection')}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onCustomAttributesChange([...customAttributes, emptyCustom()])}
          >
            <Plus className="h-4 w-4" />
            {t('attributes.addCustom')}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{t('attributes.customHint')}</p>

        {customAttributes.map((custom, index) => (
          <div
            key={index}
            className="space-y-3 rounded-md border border-dashed border-border p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium">
                {t('attributes.customItem', { index: index + 1 })}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() =>
                  onCustomAttributesChange(customAttributes.filter((_, i) => i !== index))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>{t('attributes.name')}</Label>
                <Input
                  value={custom.name}
                  onChange={(e) => updateCustom(index, { name: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('attributes.type')}</Label>
                <select
                  className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={custom.type}
                  onChange={(e) =>
                    updateCustom(index, {
                      type: e.target.value as AttributeType,
                      value: e.target.value === 'BOOLEAN' ? false : '',
                    })
                  }
                >
                  {CUSTOM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`attributes.types.${type}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {custom.type === 'BOOLEAN' ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(custom.value)}
                  onChange={(e) => updateCustom(index, { value: e.target.checked })}
                />
                {t('common.yes')}
              </label>
            ) : custom.type === 'NUMBER' ? (
              <div>
                <Label>{t('attributes.value')}</Label>
                <Input
                  type="number"
                  dir="ltr"
                  value={custom.value === '' ? '' : String(custom.value)}
                  onChange={(e) =>
                    updateCustom(index, {
                      value: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                  className="mt-1"
                />
              </div>
            ) : custom.type === 'DATE' ? (
              <div>
                <Label>{t('attributes.value')}</Label>
                <Input
                  type="date"
                  dir="ltr"
                  value={typeof custom.value === 'string' ? custom.value.slice(0, 10) : ''}
                  onChange={(e) => updateCustom(index, { value: e.target.value })}
                  className="mt-1"
                />
              </div>
            ) : (
              <div>
                <Label>{t('attributes.value')}</Label>
                <Input
                  value={typeof custom.value === 'string' ? custom.value : ''}
                  onChange={(e) => updateCustom(index, { value: e.target.value })}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
