import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AxiosProvider } from '@/hooks/useAxiosInstance'
import '@/i18n'
import { router } from '@/router'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
})

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AxiosProvider>
        <div dir="rtl" lang="ar">
          <RouterProvider router={router} />
        </div>
      </AxiosProvider>
    </QueryClientProvider>
  </StrictMode>,
)
