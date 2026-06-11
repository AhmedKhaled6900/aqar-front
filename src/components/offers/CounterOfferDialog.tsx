import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCounterOffer } from '@/features/offers/useOffers'
import type { PricePeriod } from '@/lib/types'

interface CounterOfferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offerId: string
}

export function CounterOfferDialog({
  open,
  onOpenChange,
  offerId,
}: CounterOfferDialogProps) {
  const { t } = useTranslation()
  const counterMutation = useCounterOffer()
  const [price, setPrice] = useState('')
  const [pricePeriod, setPricePeriod] = useState<PricePeriod>('MONTH')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setPrice('')
    setPricePeriod('MONTH')
    setNotes('')
    setError('')
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await counterMutation.mutateAsync({
        id: offerId,
        input: {
          price: Number(price),
          pricePeriod,
          notes: notes || undefined,
        },
      })
      onOpenChange(false)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? t('common.error'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('offers.counterTitle')}</DialogTitle>
        </DialogHeader>

        {error && <Alert variant="destructive">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('offers.price')}</Label>
            <Input
              type="number"
              dir="ltr"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label>{t('offers.pricePeriod')}</Label>
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={pricePeriod}
              onChange={(e) => setPricePeriod(e.target.value as PricePeriod)}
              required
            >
              <option value="DAY">{t('properties.pricePeriodDay')}</option>
              <option value="MONTH">{t('properties.pricePeriodMonth')}</option>
              <option value="YEAR">{t('properties.pricePeriodYear')}</option>
            </select>
          </div>

          <div>
            <Label>{t('offers.notes')}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={counterMutation.isPending}>
              {counterMutation.isPending ? t('common.loading') : t('offers.sendCounter')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
