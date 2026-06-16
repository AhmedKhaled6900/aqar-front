import i18n from '@/i18n'
import { toast as showToast } from '@/hooks/use-toast'
import { getApiErrorMessage } from '@/lib/api-error'

export function toastSuccess(message?: string) {
  showToast({
    variant: 'success',
    title: message ?? i18n.t('toast.success'),
  })
}

export function toastError(message?: string, error?: unknown) {
  const description =
    message ?? (error ? getApiErrorMessage(error) : i18n.t('toast.error'))

  showToast({
    variant: 'destructive',
    title: i18n.t('toast.errorTitle'),
    description,
  })
}

export { getApiErrorMessage }
