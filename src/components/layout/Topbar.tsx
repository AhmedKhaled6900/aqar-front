import { useQueryClient } from '@tanstack/react-query'
import { LogOut, Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { useMe } from '@/features/auth/useMe'
import { logoutSession } from '@/lib/auth/logout'
import { useCookies } from '@/lib/token-managament/useCookies'

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const axios = useAxiosInstance()
  const { clearSession } = useCookies()
  const { data } = useMe()
  const user = data?.user

  const logout = async () => {
    await logoutSession(axios, queryClient, clearSession)
    navigate('/auth/login')
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/80 bg-background/85 px-4 shadow-sm backdrop-blur-md">
      <button
        type="button"
        className="rounded-md p-1.5 text-foreground transition-colors hover:bg-main-muted hover:text-main lg:hidden"
        onClick={onMenuClick}
        aria-label="menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <NotificationBell />
            <div className="text-left">
              <p className="text-sm font-semibold leading-tight text-foreground">{user.name}</p>
              <Badge variant="secondary" className="mt-0.5 bg-main-muted text-main text-[10px]">
                {t(`roles.${user.role}`)}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              {t('nav.logout')}
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth/login">{t('nav.login')}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth/register">{t('nav.register')}</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
