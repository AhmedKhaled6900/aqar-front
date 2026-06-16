import { Ban, RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useAdminDeleteProperty,
  useReactivateProperty,
  useSuspendProperty,
} from '@/features/admin/useAdmin'
import { useConfirm } from '@/hooks/use-confirm'
import { useCookies } from '@/lib/token-managament/useCookies'
import type { PropertyStatus } from '@/lib/types'

interface AdminPropertyManageActionsProps {
  propertyId: string
  status: PropertyStatus
  className?: string
}

export function AdminPropertyManageActions({
  propertyId,
  status,
  className,
}: AdminPropertyManageActionsProps) {
  const { t } = useTranslation()
  const { hasPermission } = useCookies()
  const suspendMutation = useSuspendProperty()
  const reactivateMutation = useReactivateProperty()
  const deleteMutation = useAdminDeleteProperty()
  const { confirm, dialog } = useConfirm()
  const [showSuspend, setShowSuspend] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')
  const [error, setError] = useState('')

  const canUpdate = hasPermission('property.update')
  const canDelete = hasPermission('property.delete')

  if (!canUpdate && !canDelete) return null

  const handleSuspend = async () => {
    setError('')
    try {
      await suspendMutation.mutateAsync({
        id: propertyId,
        reason: suspendReason.trim() || undefined,
      })
      setShowSuspend(false)
      setSuspendReason('')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const handleReactivate = () => {
    confirm({
      description: t('admin.reactivateConfirm'),
      confirmLabel: t('admin.reactivate'),
      variant: 'default',
      onConfirm: async () => {
        setError('')
        await reactivateMutation.mutateAsync(propertyId)
      },
    })
  }

  const handleDelete = () => {
    confirm({
      description: t('admin.deletePropertyConfirm'),
      onConfirm: async () => {
        setError('')
        await deleteMutation.mutateAsync(propertyId)
      },
    })
  }

  const isPending =
    suspendMutation.isPending ||
    reactivateMutation.isPending ||
    deleteMutation.isPending

  return (
    <div className={className}>
      {error && (
        <Alert variant="destructive" className="mb-2">
          {error}
        </Alert>
      )}

      {showSuspend ? (
        <div className="space-y-2">
          <Label>{t('admin.suspensionReason')}</Label>
          <Input
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder={t('admin.suspensionReasonOptional')}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={isPending}
              onClick={handleSuspend}
            >
              {t('admin.suspend')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowSuspend(false)
                setSuspendReason('')
                setError('')
              }}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {canUpdate && status !== 'SUSPENDED' && (
            <Button
              size="sm"
              variant="secondary"
              disabled={isPending}
              onClick={() => setShowSuspend(true)}
            >
              <Ban className="h-4 w-4" />
              {t('admin.suspend')}
            </Button>
          )}
          {canUpdate && status === 'SUSPENDED' && (
            <Button
              size="sm"
              variant="secondary"
              disabled={isPending}
              onClick={handleReactivate}
            >
              <RotateCcw className="h-4 w-4" />
              {t('admin.reactivate')}
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              {t('common.delete')}
            </Button>
          )}
        </div>
      )}
      {dialog}
    </div>
  )
}
