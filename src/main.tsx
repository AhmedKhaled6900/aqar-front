import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { AxiosProvider } from '@/hooks/useAxiosInstance'
import '@/i18n'
import { toastError, toastSuccess } from '@/lib/toast'
import { router } from '@/router'
import './index.css'

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      if (mutation.meta?.skipSuccessToast) return
      const message = mutation.meta?.successMessage as string | undefined
      if (message) {
        toastSuccess(message)
      }
    },
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.skipErrorToast) return
      toastError(undefined, error)
    },
  }),
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
          <Toaster />
        </div>
      </AxiosProvider>
    </QueryClientProvider>
  </StrictMode>,
)
