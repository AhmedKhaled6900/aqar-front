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
