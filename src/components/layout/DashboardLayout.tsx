import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AuthBootstrap } from '@/components/auth/AuthBootstrap'
import { NotificationBootstrap } from '@/components/notifications/NotificationBootstrap'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AuthBootstrap />
      <NotificationBootstrap />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
