import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { AdminListingDetails } from '@/components/admin/AdminListingDetails'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useAdminListingDetail } from '@/features/admin/service-provider/useAdminListings'

export function AdminListingDetailPage() {
  const { t } = useTranslation()
  const { listingId = '' } = useParams()
  const { data: listing, isLoading, isError, refetch } = useAdminListingDetail(listingId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (isError || !listing) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/admin/listings">
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
      <div>
        <Button variant="ghost" size="sm" className="mb-2" asChild>
          <Link to="/admin/listings">
            <ArrowRight className="h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{t('admin.listingDetails')}</h1>
        <p className="text-muted-foreground">{listing.title}</p>
      </div>

      <AdminListingDetails listing={listing} />
    </div>
  )
}
