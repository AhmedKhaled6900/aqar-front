import type { PaginatedResponse, PaginationMeta } from '@/lib/types'

const defaultMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
}

/** Normalize API responses that may be a plain array or `{ items, meta }`. */
export function extractPaginatedItems<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data
  if (
    data &&
    typeof data === 'object' &&
    'items' in data &&
    Array.isArray((data as PaginatedResponse<T>).items)
  ) {
    return (data as PaginatedResponse<T>).items
  }
  return []
}

export function normalizePaginatedResponse<T>(data: unknown): PaginatedResponse<T> {
  if (
    data &&
    typeof data === 'object' &&
    'items' in data &&
    Array.isArray((data as PaginatedResponse<T>).items)
  ) {
    const paginated = data as PaginatedResponse<T>
    return {
      items: paginated.items,
      meta: paginated.meta ?? defaultMeta,
    }
  }

  if (Array.isArray(data)) {
    return {
      items: data,
      meta: {
        ...defaultMeta,
        total: data.length,
        totalPages: 1,
      },
    }
  }

  return { items: [], meta: defaultMeta }
}
