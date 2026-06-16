import { Building2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useLocation } from 'react-router-dom'
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
  const { pathname } = useLocation()
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
    <nav className="scrollbar-hide flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {visibleSections.map((section) => (
        <div key={section.titleKey}>
          {section.titleKey && (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-white/45">
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
                className={({ isActive }) => {
                  const active =
                    isActive || (item.isActiveMatch?.(pathname) ?? false)
                  return cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/20'
                      : 'text-white/75 hover:bg-white/10 hover:text-white hover:translate-x-[-2px]',
                  )
                }}
              >
                <item.icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
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
      <Link
        to="/"
        className="group flex items-center gap-2 font-bold text-white transition-opacity hover:opacity-90"
        onClick={onClose}
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20 transition-transform duration-200 group-hover:scale-105">
          <Building2 className="h-5 w-5" />
        </span>
        <span className="text-lg">{t('app.name')}</span>
      </Link>
      <button
        type="button"
        className="rounded-md p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
        onClick={onClose}
        aria-label={t('common.cancel')}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )

  const sidebarClass =
    'sticky top-0 flex h-screen w-64 shrink-0 flex-col gradient-brand shadow-[4px_0_24px_-4px_rgb(218_73_40/0.25)]'

  return (
    <>
      {/* Desktop */}
      <aside className={cn(sidebarClass, 'hidden lg:flex')}>
        {brand}
        {nav}
        <div className="border-t border-white/10 p-4">
          <p className="text-center text-xs text-white/40">{t('app.tagline')}</p>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <aside className={cn(sidebarClass, 'absolute inset-y-0 right-0 animate-slide-in-right')}>
            {brand}
            {nav}
          </aside>
        </div>
      )}
    </>
  )
}
