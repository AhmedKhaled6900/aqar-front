import { Ban } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useProviderProfile } from '@/features/service-provider/useProviderProfile'
import { Spinner } from '@/components/ui/spinner'

export function ProviderSuspendedPage() {
  const { t } = useTranslation()
  const { data: profile, isLoading } = useProviderProfile()

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-20 text-center">
      <Ban className="mb-4 h-16 w-16 text-destructive" />
      <h1 className="mb-2 text-2xl font-bold">{t('provider.suspended')}</h1>
      <p className="text-muted-foreground">{t('provider.suspendedMessage')}</p>
      {profile?.suspensionReason && (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {profile.suspensionReason}
        </p>
      )}
    </div>
  )
}
