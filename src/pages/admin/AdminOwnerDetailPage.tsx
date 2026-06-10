import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { OwnerProfileDetails } from '@/components/owner/OwnerProfileDetails'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  useAdminOwnerDetail,
  useApproveOwner,
  useRejectOwner,
} from '@/features/admin/useAdmin'

export function AdminOwnerDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { userId = '' } = useParams()
  const { data: owner, isLoading, isError, refetch } = useAdminOwnerDetail(userId)
  const approveMutation = useApproveOwner()
  const rejectMutation = useRejectOwner()
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState('')

  const canReview = owner?.pendingType === 'KYC_REVIEW'

  const handleApprove = async () => {
    setFormError('')
    try {
      await approveMutation.mutateAsync(userId)
      navigate('/admin/owners/pending')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setFormError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  const handleReject = async () => {
    if (!reason.trim()) {
      setFormError(t('common.required'))
      return
    }
    setFormError('')
    try {
      await rejectMutation.mutateAsync({ userId, reason })
      navigate('/admin/owners/pending')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setFormError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (isError || !owner) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/admin/owners/pending">
            <ArrowRight className="h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>
        <Alert variant="destructive">{t('common.noResults')}</Alert>
        <Button variant="outline" onClick={() => refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" asChild>
            <Link to="/admin/owners/pending">
              <ArrowRight className="h-4 w-4" />
              {t('common.back')}
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{t('admin.ownerDetails')}</h1>
          <p className="text-muted-foreground">{owner.user?.name}</p>
        </div>

        {canReview && !showReject && (
          <div className="flex gap-2">
            <Button
              disabled={approveMutation.isPending}
              onClick={handleApprove}
            >
              {t('common.approve')}
            </Button>
            <Button variant="destructive" onClick={() => setShowReject(true)}>
              {t('common.reject')}
            </Button>
          </div>
        )}
      </div>

      {formError && <Alert variant="destructive">{formError}</Alert>}

      {owner.pendingType === 'EMAIL_NOT_VERIFIED' && (
        <Alert variant="warning">{t('admin.emailNotVerifiedNote')}</Alert>
      )}

      {showReject && (
        <div className="rounded-lg border border-border bg-background p-4">
          <Label>{t('admin.rejectReason')}</Label>
          <Input
            className="mt-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="mt-3 flex gap-2">
            <Button
              variant="destructive"
              disabled={rejectMutation.isPending}
              onClick={handleReject}
            >
              {t('common.reject')}
            </Button>
            <Button variant="outline" onClick={() => setShowReject(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      )}

      <OwnerProfileDetails owner={owner} />
    </div>
  )
}
