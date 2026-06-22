import { ExternalLink, Megaphone } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useApproveListing,
  useRejectListing,
  useSetListingFeatured,
} from '@/features/admin/service-provider/useAdminListings'
import type { AdminServiceListingRecord } from '@/lib/types'

interface AdminListingDetailsProps {
  listing: AdminServiceListingRecord
}

export function AdminListingDetails({ listing }: AdminListingDetailsProps) {
  const { t } = useTranslation()
  const approveMutation = useApproveListing()
  const rejectMutation = useRejectListing()
  const featuredMutation = useSetListingFeatured()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const handleReject = async () => {
    if (!reason.trim()) {
      setError(t('common.required'))
      return
    }
    setError('')
    try {
      await rejectMutation.mutateAsync({ id: listing.id, reason })
      setRejectOpen(false)
      setReason('')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive">{error}</Alert>}

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-start gap-4">
            {listing.image && (
              <img
                src={listing.image}
                alt={listing.title}
                className="h-40 w-full max-w-sm rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold">{listing.title}</h2>
                <Badge>{t(`provider.listingStatus.${listing.status}`)}</Badge>
                {listing.isFeatured && (
                  <Badge variant="default">
                    <Megaphone className="h-3 w-3" />
                    {t('admin.listingFeatured')}
                  </Badge>
                )}
              </div>
              {listing.description && (
                <p className="mt-2 text-muted-foreground">{listing.description}</p>
              )}
              {listing.rejectionReason && (
                <Alert variant="destructive" className="mt-3">
                  {t('admin.rejectReason')}: {listing.rejectionReason}
                </Alert>
              )}
              {listing.deliveryFee != null && (
                <p className="mt-2 text-sm">
                  {t('provider.deliveryFee')}: {listing.deliveryFee.toLocaleString('ar-EG')} ج.م
                </p>
              )}
              {listing.link && (
                <a
                  href={listing.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-main underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {listing.link}
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {listing.provider && (
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 font-semibold">{t('provider.businessName')}</h3>
            <div className="flex items-center gap-3">
              {listing.provider.logo && (
                <img
                  src={listing.provider.logo}
                  alt=""
                  className="size-12 rounded-md object-cover"
                />
              )}
              <div>
                <p className="font-medium">{listing.provider.businessName}</p>
                <p className="text-sm text-muted-foreground">
                  {listing.provider.user?.email ?? listing.provider.user?.phone ?? '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {listing.menuItems && listing.menuItems.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 font-semibold">{t('provider.listingMenu')}</h3>
            <ul className="space-y-2 text-sm">
              {listing.menuItems.map((item) => (
                <li key={item.id ?? item.name} className="flex justify-between gap-4">
                  <span>{item.name}</span>
                  <span dir="ltr">
                    {item.price.toLocaleString('ar-EG')} ج.م
                    {item.prepTimeMinutes != null && item.prepTimeMinutes > 0
                      ? ` · ${item.prepTimeMinutes} ${t('provider.minutes')}`
                      : ''}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {listing.status === 'PENDING_REVIEW' && (
          <>
            <Button
              disabled={approveMutation.isPending}
              onClick={() => approveMutation.mutate(listing.id)}
            >
              {t('common.approve')}
            </Button>
            <Button variant="destructive" onClick={() => setRejectOpen(true)}>
              {t('common.reject')}
            </Button>
          </>
        )}
        {listing.status === 'ACTIVE' && (
          <Button
            variant={listing.isFeatured ? 'outline' : 'default'}
            disabled={featuredMutation.isPending}
            onClick={() =>
              featuredMutation.mutate({ id: listing.id, isFeatured: !listing.isFeatured })
            }
          >
            <Megaphone className="h-4 w-4" />
            {listing.isFeatured ? t('admin.unfeatureListing') : t('admin.featureListing')}
          </Button>
        )}
      </div>

      {rejectOpen && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <Label>{t('admin.rejectReason')}</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                disabled={rejectMutation.isPending}
                onClick={handleReject}
              >
                {t('common.reject')}
              </Button>
              <Button variant="outline" onClick={() => setRejectOpen(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
