import { useQuery } from '@tanstack/react-query'
import { useAxiosInstance } from '@/hooks/useAxiosInstance'
import { extractPaginatedItems } from '@/lib/api/pagination'
import type {
  Category,
  CategorySelectMenuItem,
  PaginatedResponse,
  SubcategorySelectMenuItem,
} from '@/lib/types'

export function useCategories(limit = 100) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['categories', limit],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<Category> | Category[]>(
        '/categories',
        { params: { page: 1, limit } },
      )
      return data
    },
    select: (data) => extractPaginatedItems<Category>(data),
  })
}

export function useCategory(slug: string) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['categories', slug],
    queryFn: async () => {
      const { data } = await axios.get<Category>(`/categories/${slug}`)
      return data
    },
    enabled: !!slug,
  })
}

export function flattenSubcategories(categories: Category[] | unknown) {
  const list = extractPaginatedItems<Category>(categories)
  return list.flatMap((cat) =>
    Array.isArray(cat.subcategories) ? cat.subcategories : [],
  )
}

export interface SubcategoryListItem extends Category {
  parentName: string
}

export function flattenSubcategoriesWithParent(
  categories: Category[] | unknown,
  parentIdFilter?: string,
): SubcategoryListItem[] {
  const list = extractPaginatedItems<Category>(categories)
  const items = list.flatMap((main) =>
    (main.subcategories ?? []).map((sub) => ({
      ...sub,
      parentId: sub.parentId ?? main.id,
      parentName: main.name,
    })),
  )

  if (!parentIdFilter) return items
  return items.filter((sub) => sub.parentId === parentIdFilter)
}

export function useAllSubcategories(parentIdFilter?: string) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['categories', 'all-subcategories', parentIdFilter],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<Category> | Category[]>(
        '/categories',
        { params: { page: 1, limit: 100 } },
      )
      return data
    },
    select: (data) => flattenSubcategoriesWithParent(data, parentIdFilter),
  })
}

export function useCategorySelectMenu() {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['categories', 'select-menu'],
    queryFn: async () => {
      const { data } = await axios.get<{ items: CategorySelectMenuItem[] }>(
        '/categories/select-menu',
      )
      return data.items
    },
  })
}

export function useSubcategorySelectMenu(parentId: string, admin = false) {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['subcategories', 'select-menu', parentId, admin],
    queryFn: async () => {
      const url = admin
        ? '/admin/subcategories/select-menu'
        : '/subcategories/select-menu'
      const { data } = await axios.get<{ items: SubcategorySelectMenuItem[] }>(
        url,
        { params: { parentId } },
      )
      return data.items
    },
    enabled: !!parentId,
  })
}

export function useMainCategories() {
  const axios = useAxiosInstance()

  return useQuery({
    queryKey: ['categories', 'main'],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedResponse<Category> | Category[]>(
        '/categories',
        { params: { page: 1, limit: 100 } },
      )
      return data
    },
    select: (data) => extractPaginatedItems<Category>(data),
  })
}
