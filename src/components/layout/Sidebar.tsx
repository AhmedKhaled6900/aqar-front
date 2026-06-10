import { Building2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router-dom'
import { useMe } from '@/features/auth/useMe'
import { useCookies } from '@/lib/token-managament/useCookies'
import { cn } from '@/lib/utils'
import { navSections } from './nav-config'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation()
  const { hasPermission } = useCookies()
  const { data } = useMe()
  const role = data?.user.role

  const visibleSections = navSections
    .filter((section) => !section.roles || (role && section.roles.includes(role)))
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.permission || hasPermission(item.permission),
      ),
    }))
    .filter((section) => section.items.length > 0)

  const nav = (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {visibleSections.map((section) => (
        <div key={section.titleKey}>
          {section.titleKey && (
            <p className="mb-2 px-3 text-xs font-semibold uppercase text-white/50">
              {t(section.titleKey)}
            </p>
          )}
          <div className="space-y-1">
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {t(item.labelKey)}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )

  const brand = (
    <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
      <Link to="/" className="flex items-center gap-2 font-bold text-white" onClick={onClose}>
        <Building2 className="h-6 w-6" />
        <span className="text-lg">{t('app.name')}</span>
      </Link>
      <button
        type="button"
        className="text-white/70 hover:text-white lg:hidden"
        onClick={onClose}
        aria-label={t('common.cancel')}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-main lg:flex">
        {brand}
        {nav}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden
          />
          <aside className="absolute inset-y-0 right-0 flex w-64 flex-col bg-main shadow-xl">
            {brand}
            {nav}
          </aside>
        </div>
      )}
    </>
  )
}
