import { MapPin, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  useCoverageAreas,
  useCreateCoverageArea,
  useDeleteCoverageArea,
  useUpdateCoverageArea,
} from '@/features/service-provider/useCoverageAreas'
import { useConfirm } from '@/hooks/use-confirm'

export function ProviderCoveragePage() {
  const { t } = useTranslation()
  const { data: areas = [], isLoading } = useCoverageAreas()
  const createMutation = useCreateCoverageArea()
  const updateMutation = useUpdateCoverageArea()
  const deleteMutation = useDeleteCoverageArea()
  const { confirm, dialog } = useConfirm()
  const [city, setCity] = useState('')
  const [area, setArea] = useState('')
  const [error, setError] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!city.trim()) {
      setError(t('common.required'))
      return
    }
    try {
      await createMutation.mutateAsync({
        city: city.trim(),
        area: area.trim() || undefined,
      })
      setCity('')
      setArea('')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const handleDelete = (id: string) => {
    confirm({
      description: t('provider.deleteCoverageConfirm'),
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {dialog}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <MapPin className="h-7 w-7 text-main" />
          {t('provider.coverage')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('provider.coverageDesc')}</p>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>{t('properties.city')}</Label>
                <Input
                  className="mt-1"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t('provider.cityPlaceholder')}
                />
              </div>
              <div>
                <Label>{t('properties.area')}</Label>
                <Input
                  className="mt-1"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder={t('provider.areaOptional')}
                />
              </div>
            </div>
            <Button type="submit" size="sm" disabled={createMutation.isPending}>
              <Plus className="h-4 w-4" />
              {t('common.add')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {areas.length ? (
        <div className="space-y-3">
          {areas.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{item.city}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.area || t('provider.wholeCity')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.isActive ? 'default' : 'secondary'}>
                    {item.isActive ? t('categories.isActive') : t('provider.inactive')}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({ id: item.id, isActive: !item.isActive })
                    }
                  >
                    {item.isActive ? t('provider.deactivate') : t('provider.activate')}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">{t('provider.noCoverage')}</p>
      )}
    </div>
  )
}
