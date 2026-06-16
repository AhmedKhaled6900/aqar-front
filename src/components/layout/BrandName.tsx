import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface BrandNameProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Sidebar / dark backgrounds */
  inverted?: boolean
  /** Single line: وجهتك العقارية */
  inline?: boolean
}

const sizeClasses = {
  sm: {
    primary: 'text-base',
    secondary: 'text-xs',
    gap: 'gap-0',
  },
  md: {
    primary: 'text-lg',
    secondary: 'text-xs',
    gap: 'gap-0.5',
  },
  lg: {
    primary: 'text-2xl',
    secondary: 'text-sm',
    gap: 'gap-0.5',
  },
} as const

export function BrandName({
  size = 'md',
  className,
  inverted = false,
  inline = false,
}: BrandNameProps) {
  const { t } = useTranslation()
  const s = sizeClasses[size]
  const secondaryClass = inverted ? 'text-white/65' : 'text-muted-foreground'

  if (inline) {
    return (
      <span className={cn('inline-flex items-baseline gap-1.5', className)}>
        <span className={cn('font-bold', s.primary, inverted && 'text-white')}>
          {t('app.name')}
        </span>
        <span className={cn('font-medium', s.secondary, secondaryClass)}>
          {t('app.nameSecondary')}
        </span>
      </span>
    )
  }

  return (
    <span className={cn('inline-flex flex-col leading-tight', s.gap, className)}>
      <span className={cn('font-bold', s.primary, inverted && 'text-white')}>
        {t('app.name')}
      </span>
      <span className={cn('font-medium', s.secondary, secondaryClass)}>
        {t('app.nameSecondary')}
      </span>
    </span>
  )
}
