import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PropertyImage } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: PropertyImage[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const { t } = useTranslation()
  const sorted = [...images].sort((a, b) => a.order - b.order)
  const [activeIndex, setActiveIndex] = useState(0)
  const active = sorted[activeIndex]

  if (!active) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
        {t('properties.noImage')}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="aspect-video overflow-hidden rounded-lg bg-muted">
        <img
          src={active.imageUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sorted.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'h-16 w-24 shrink-0 overflow-hidden rounded-md border-2',
                index === activeIndex ? 'border-main' : 'border-transparent',
              )}
            >
              <img
                src={img.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
