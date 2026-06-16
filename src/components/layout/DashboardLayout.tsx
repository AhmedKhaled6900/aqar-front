import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AuthBootstrap } from '@/components/auth/AuthBootstrap'
import { NotificationBootstrap } from '@/components/notifications/NotificationBootstrap'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="gradient-page flex min-h-screen">
      <AuthBootstrap />
      <NotificationBootstrap />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main
          key={pathname}
          className="flex-1 animate-fade-in p-4 md:p-6"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
