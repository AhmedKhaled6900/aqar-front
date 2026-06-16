import { useTranslation } from 'react-i18next'
import { SubcategoryAttributeLinksEditor } from '@/components/attributes/SubcategoryAttributeLinksEditor'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SubcategoryAttributesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subcategoryId: string
  subcategoryName: string
}

export function SubcategoryAttributesDialog({
  open,
  onOpenChange,
  subcategoryId,
  subcategoryName,
}: SubcategoryAttributesDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('attributes.linkTitle')}</DialogTitle>
          <p className="text-sm text-muted-foreground">{subcategoryName}</p>
        </DialogHeader>

        {open && (
          <SubcategoryAttributeLinksEditor
            subcategoryId={subcategoryId}
            onSaved={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
