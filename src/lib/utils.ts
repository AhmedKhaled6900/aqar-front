import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const pricePeriodSuffix: Record<string, string> = {
  DAY: 'يوم',
  MONTH: 'شهر',
  YEAR: 'سنة',
}

export function formatPrice(
  price: number,
  purpose: 'SALE' | 'RENT',
  pricePeriod?: string | null,
) {
  const formatted = new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(price)

  if (purpose !== 'RENT') return formatted

  const period = pricePeriod ? pricePeriodSuffix[pricePeriod] : 'شهر'
  return `${formatted} / ${period}`
}

export function formatOfferPrice(price: number, pricePeriod?: string | null) {
  const formatted = new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(price)

  const period = pricePeriod ? pricePeriodSuffix[pricePeriod] : 'شهر'
  return `${formatted} / ${period}`
}

export function formatRentalDuration(duration: number, pricePeriod?: string | null) {
  const unit = pricePeriod ? pricePeriodSuffix[pricePeriod] : 'شهر'
  return `${duration} ${unit}`
}

export function formatDateAr(date: string) {
  return new Date(date).toLocaleDateString('ar-EG', { dateStyle: 'medium' })
}

export function formatAttributeValue(
  value: unknown,
  type: string,
): string {
  if (value === null || value === undefined || value === '') return '—'
  if (type === 'BOOLEAN') return value ? 'نعم' : 'لا'
  if (type === 'MULTI_SELECT' && Array.isArray(value)) return value.join('، ')
  if (type === 'DATE' && typeof value === 'string') return formatDateAr(value)
  return String(value)
}

export function isAttributeValueEmpty(value: unknown, type: string): boolean {
  if (value === undefined || value === null || value === '') return true
  if (type === 'MULTI_SELECT' && Array.isArray(value)) return value.length === 0
  return false
}
