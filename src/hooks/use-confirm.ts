import { createElement, useCallback, useState } from 'react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export interface ConfirmOptions {
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'destructive' | 'default'
  onConfirm: () => void | Promise<void>
}

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean
    options: ConfirmOptions | null
    loading: boolean
  }>({ open: false, options: null, loading: false })

  const confirm = useCallback((options: ConfirmOptions) => {
    setState({ open: true, options, loading: false })
  }, [])

  const close = useCallback(() => {
    setState({ open: false, options: null, loading: false })
  }, [])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && !state.loading) close()
    },
    [close, state.loading],
  )

  const handleConfirm = useCallback(async () => {
    if (!state.options) return
    setState((s) => ({ ...s, loading: true }))
    try {
      await state.options.onConfirm()
      close()
    } catch {
      setState((s) => ({ ...s, loading: false }))
    }
  }, [close, state.options])

  const dialog = createElement(ConfirmDialog, {
    open: state.open,
    onOpenChange: handleOpenChange,
    title: state.options?.title,
    description: state.options?.description ?? '',
    confirmLabel: state.options?.confirmLabel,
    cancelLabel: state.options?.cancelLabel,
    variant: state.options?.variant ?? 'destructive',
    loading: state.loading,
    onConfirm: handleConfirm,
  })

  return { confirm, dialog }
}
