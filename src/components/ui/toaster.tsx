import { CheckCircle2, XCircle } from 'lucide-react'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider swipeDirection="left">
      {toasts.map(({ id, title, description, action, variant, ...props }) => (
        <Toast key={id} variant={variant} duration={4000} {...props}>
          {variant === 'success' && (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          )}
          {variant === 'destructive' && (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          )}
          <div className="grid flex-1 gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
