import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AttributeType, SubcategoryAttributeItem } from '@/lib/types'

interface AttributeFieldProps {
  attribute: SubcategoryAttributeItem
  value: unknown
  onChange: (value: unknown) => void
}

export function AttributeField({ attribute, value, onChange }: AttributeFieldProps) {
  const { t } = useTranslation()
  const fieldId = `attr-${attribute.id}`

  const label = (
    <Label htmlFor={fieldId}>
      {attribute.name}
      {attribute.isRequired && <span className="text-destructive"> *</span>}
    </Label>
  )

  switch (attribute.type as AttributeType) {
    case 'BOOLEAN':
      return (
        <div className="flex items-center gap-2">
          <input
            id={fieldId}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <Label htmlFor={fieldId} className="cursor-pointer">
            {attribute.name}
            {attribute.isRequired && <span className="text-destructive"> *</span>}
          </Label>
        </div>
      )

    case 'NUMBER':
      return (
        <div>
          {label}
          <Input
            id={fieldId}
            type="number"
            dir="ltr"
            value={value === undefined || value === null ? '' : String(value)}
            onChange={(e) =>
              onChange(e.target.value === '' ? '' : Number(e.target.value))
            }
            required={attribute.isRequired}
            className="mt-1"
          />
        </div>
      )

    case 'SELECT':
      return (
        <div>
          {label}
          <select
            id={fieldId}
            className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            required={attribute.isRequired}
          >
            <option value="">{t('attributes.selectOption')}</option>
            {(attribute.options ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )

    case 'MULTI_SELECT': {
      const selected = Array.isArray(value) ? (value as string[]) : []
      return (
        <div>
          {label}
          <div className="mt-2 space-y-2 rounded-md border border-border p-3">
            {(attribute.options ?? []).map((opt) => (
              <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selected, opt])
                    } else {
                      onChange(selected.filter((item) => item !== opt))
                    }
                  }}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      )
    }

    case 'DATE':
      return (
        <div>
          {label}
          <Input
            id={fieldId}
            type="date"
            dir="ltr"
            value={typeof value === 'string' ? value.slice(0, 10) : ''}
            onChange={(e) => onChange(e.target.value)}
            required={attribute.isRequired}
            className="mt-1"
          />
        </div>
      )

    default:
      return (
        <div>
          {label}
          <Input
            id={fieldId}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            required={attribute.isRequired}
            className="mt-1"
          />
        </div>
      )
  }
}
