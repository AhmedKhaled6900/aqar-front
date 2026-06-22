import type { ListingOrderStats, ServiceOrder, ServiceOrderStatus } from '@/lib/types'

const COMPLETED_STATUSES: ServiceOrderStatus[] = ['DELIVERED']
const ACTIVE_STATUSES: ServiceOrderStatus[] = [
  'PENDING',
  'ACCEPTED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
]
const CLOSED_STATUSES: ServiceOrderStatus[] = ['REJECTED', 'CANCELLED']

export const MAIN_MENU_LISTING_KEY = '__main_menu__'

export function emptyListingOrderStats(): ListingOrderStats {
  return { total: 0, completed: 0, active: 0, closed: 0 }
}

export function isOrderFromListing(order: ServiceOrder): boolean {
  return Boolean(order.listingId ?? order.listing?.id)
}

export function orderListingKey(order: ServiceOrder): string {
  return order.listingId ?? order.listing?.id ?? MAIN_MENU_LISTING_KEY
}

function bumpStats(stats: ListingOrderStats, status: ServiceOrderStatus) {
  stats.total += 1
  if (COMPLETED_STATUSES.includes(status)) {
    stats.completed += 1
  } else if (ACTIVE_STATUSES.includes(status)) {
    stats.active += 1
  } else if (CLOSED_STATUSES.includes(status)) {
    stats.closed += 1
  }
}

export function aggregateOrdersByListing(
  orders: ServiceOrder[],
): Record<string, ListingOrderStats> {
  const map: Record<string, ListingOrderStats> = {}

  for (const order of orders) {
    const key = orderListingKey(order)
    if (!map[key]) map[key] = emptyListingOrderStats()
    bumpStats(map[key], order.status)
  }

  return map
}
