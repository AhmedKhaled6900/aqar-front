import { useTranslation } from 'react-i18next'
import { PropertyRentalCard } from '@/components/properties/PropertyRentalCard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { usePropertyRentals } from '@/features/bookings/useBookings'

interface PropertyRentalHistoryDialogProps {
  propertyId: string
  propertyTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PropertyRentalHistoryDialog({
  propertyId,
  propertyTitle,
  open,
  onOpenChange,
}: PropertyRentalHistoryDialogProps) {
  const { t } = useTranslation()
  const { data: rentals, isLoading, isError } = usePropertyRentals(propertyId, open)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('rental.historyTitle')}</DialogTitle>
          <p className="text-sm text-muted-foreground">{propertyTitle}</p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : isError ? (
          <p className="py-4 text-center text-sm text-destructive">{t('common.error')}</p>
        ) : rentals?.length ? (
          <div className="space-y-4">
            {rentals.map((rental) => (
              <PropertyRentalCard key={rental.id} rental={rental} compact />
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t('rental.noHistory')}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
