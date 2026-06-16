import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'destructive' | 'default'
  loading?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'destructive',
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
      <DialogContent className="max-w-md gap-0 p-0 sm:rounded-xl">
        <DialogHeader className="space-y-0 border-b border-border px-6 py-5 text-right">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-full',
                variant === 'destructive' ? 'bg-destructive/10' : 'bg-main-muted',
              )}
            >
              <AlertTriangle
                className={cn(
                  'h-5 w-5',
                  variant === 'destructive' ? 'text-destructive' : 'text-main',
                )}
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
              <DialogTitle>{title ?? t('common.confirmTitle')}</DialogTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 px-6 py-4 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel ?? t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading && <Spinner className="h-4 w-4" />}
            {confirmLabel ?? t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
