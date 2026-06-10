import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useApproveProperty,
  useRejectProperty,
} from '@/features/admin/useAdmin'

interface PropertyReviewActionsProps {
  propertyId: string
  onSuccess?: () => void
  className?: string
}

export function PropertyReviewActions({
  propertyId,
  onSuccess,
  className,
}: PropertyReviewActionsProps) {
  const { t } = useTranslation()
  const approveMutation = useApproveProperty()
  const rejectMutation = useRejectProperty()
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const handleApprove = async () => {
    setError('')
    try {
      await approveMutation.mutateAsync(propertyId)
      onSuccess?.()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const handleReject = async () => {
    if (!reason.trim()) {
      setError(t('common.required'))
      return
    }
    setError('')
    try {
      await rejectMutation.mutateAsync({ id: propertyId, reason })
      setShowReject(false)
      setReason('')
      onSuccess?.()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  return (
    <div className={className}>
      {error && <Alert variant="destructive" className="mb-2">{error}</Alert>}

      {showReject ? (
        <div className="space-y-2">
          <Label>{t('admin.rejectReason')}</Label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              disabled={rejectMutation.isPending}
              onClick={handleReject}
            >
              {t('common.reject')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowReject(false)
                setReason('')
                setError('')
              }}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={approveMutation.isPending}
            onClick={handleApprove}
          >
            {t('common.approve')}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={rejectMutation.isPending}
            onClick={() => setShowReject(true)}
          >
            {t('common.reject')}
          </Button>
        </div>
      )}
    </div>
  )
}
