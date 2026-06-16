import i18n from '@/i18n'

export const toastMeta = {
  created: () => ({ successMessage: i18n.t('toast.created') }),
  updated: () => ({ successMessage: i18n.t('toast.updated') }),
  saved: () => ({ successMessage: i18n.t('toast.saved') }),
  deleted: () => ({ successMessage: i18n.t('toast.deleted') }),
  skipError: () => ({ skipErrorToast: true as const }),
  skipSuccess: () => ({ skipSuccessToast: true as const }),
}
