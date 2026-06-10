import { Bell, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationsCount,
} from '@/features/notifications/useNotifications'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { data: unreadCount = 0 } = useUnreadNotificationsCount()
  const { data, isLoading } = useNotifications(1, 8)
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const handleMarkRead = (id: string, isRead: boolean) => {
    if (isRead) return
    markRead.mutate(id)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('notifications.title')}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-background shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-semibold">{t('notifications.title')}</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-xs"
                  disabled={markAllRead.isPending}
                  onClick={() => markAllRead.mutate()}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  {t('notifications.markAllRead')}
                </Button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner className="h-5 w-5" />
                </div>
              ) : data?.items.length ? (
                data.items.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className={cn(
                      'w-full border-b border-border px-4 py-3 text-right transition-colors hover:bg-muted/50',
                      !notification.isRead && 'bg-main/5',
                    )}
                    onClick={() => handleMarkRead(notification.id, notification.isRead)}
                  >
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {notification.body}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString('ar-EG')}
                    </p>
                  </button>
                ))
              ) : (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {t('notifications.empty')}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
