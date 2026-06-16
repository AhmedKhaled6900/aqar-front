import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  useAdminAttributeSelectMenu,
  useSubcategoryAttributeLinks,
  useSyncSubcategoryAttributes,
} from '@/features/attributes/useAdminAttributes'
import type { SubcategoryAttributeLinkInput } from '@/lib/types'

interface LinkRow extends SubcategoryAttributeLinkInput {
  name: string
  type: string
  isActive: boolean
}

interface SubcategoryAttributeLinksEditorProps {
  subcategoryId: string
  onSaved?: () => void
}

export function SubcategoryAttributeLinksEditor({
  subcategoryId,
  onSaved,
}: SubcategoryAttributeLinksEditorProps) {
  const { t } = useTranslation()
  const { data: linksData, isLoading: loadingLinks } = useSubcategoryAttributeLinks(
    subcategoryId,
    !!subcategoryId,
  )
  const { data: allAttributes = [], isLoading: loadingMenu } = useAdminAttributeSelectMenu()
  const syncMutation = useSyncSubcategoryAttributes()
  const [rows, setRows] = useState<LinkRow[]>([])
  const [addAttributeId, setAddAttributeId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!linksData) return
    setRows(
      linksData.items.map((item) => ({
        attributeId: item.attributeId ?? item.id,
        name: item.name,
        type: item.type,
        isActive: item.isActive,
        isRequired: item.isRequired,
        sortOrder: item.linkSortOrder,
      })),
    )
    setAddAttributeId('')
    setError('')
  }, [linksData])

  const linkedIds = new Set(rows.map((row) => row.attributeId))
  const availableToAdd = allAttributes.filter(
    (attr) => attr.scope === 'SYSTEM' && !linkedIds.has(attr.id),
  )

  const handleAdd = () => {
    if (!addAttributeId) return
    const attr = allAttributes.find((item) => item.id === addAttributeId)
    if (!attr) return
    setRows([
      ...rows,
      {
        attributeId: attr.id,
        name: attr.name,
        type: attr.type,
        isActive: attr.isActive,
        isRequired: false,
        sortOrder: rows.length,
      },
    ])
    setAddAttributeId('')
  }

  const moveRow = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= rows.length) return
    const next = [...rows]
    const temp = next[index]
    next[index] = next[nextIndex]
    next[nextIndex] = temp
    setRows(next.map((row, i) => ({ ...row, sortOrder: i })))
  }

  const handleSave = async () => {
    setError('')

    const items = rows.map((row, index) => ({
      attributeId: row.attributeId,
      isRequired: row.isRequired ?? false,
      sortOrder: index,
    }))

    if (items.some((item) => !item.attributeId)) {
      setError(t('attributes.invalidAttributeId'))
      return
    }

    try {
      await syncMutation.mutateAsync({
        subcategoryId,
        items,
      })
      onSaved?.()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const isLoading = loadingLinks || loadingMenu

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1">
          <Label>{t('attributes.addLink')}</Label>
          <select
            className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={addAttributeId}
            onChange={(e) => setAddAttributeId(e.target.value)}
          >
            <option value="">{t('attributes.selectAttribute')}</option>
            {availableToAdd.map((attr) => (
              <option key={attr.id} value={attr.id}>
                {attr.name} ({t(`attributes.types.${attr.type}`)})
              </option>
            ))}
          </select>
        </div>
        <Button type="button" variant="outline" onClick={handleAdd} disabled={!addAttributeId}>
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          {t('attributes.noLinks')}
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, index) => (
            <li
              key={row.attributeId}
              className="flex flex-wrap items-center gap-2 rounded-md border border-border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{row.name}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant="secondary">{t(`attributes.types.${row.type}`)}</Badge>
                  {!row.isActive && (
                    <Badge variant="destructive">{t('attributes.inactive')}</Badge>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={row.isRequired ?? false}
                  onChange={(e) =>
                    setRows(
                      rows.map((item, i) =>
                        i === index ? { ...item, isRequired: e.target.checked } : item,
                      ),
                    )
                  }
                />
                {t('attributes.required')}
              </label>

              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => moveRow(index, -1)}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === rows.length - 1}
                  onClick={() => moveRow(index, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() =>
                    setRows(
                      rows
                        .filter((_, i) => i !== index)
                        .map((item, i) => ({ ...item, sortOrder: i })),
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={syncMutation.isPending}>
          {t('attributes.saveLinks')}
        </Button>
      </div>
    </div>
  )
}
