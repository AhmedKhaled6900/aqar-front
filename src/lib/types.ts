export type UserRole = 'ADMIN' | 'OWNER' | 'CUSTOMER'

export type ProfileStatus =
  | 'INCOMPLETE'
  | 'BASIC_DONE'
  | 'KYC_PENDING'
  | 'VERIFIED'
  | 'REJECTED'

export type OwnerType = 'INDIVIDUAL' | 'COMPANY'

export type OwnerPendingType = 'KYC_REVIEW' | 'EMAIL_NOT_VERIFIED'

export type PropertyPurpose = 'SALE' | 'RENT'

export type PricePeriod = 'DAY' | 'MONTH' | 'YEAR'

export type PropertyStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SOLD'
  | 'RENTED'

export interface User {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: UserRole
  isVerified: boolean
  isProfileComplete?: boolean
  profileStatus?: ProfileStatus
  ownerType?: OwnerType | null
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
  permissions: string[]
}

export interface MeResponse {
  user: User
  permissions: string[]
}

export interface PropertyImage {
  id: string
  imageUrl: string
  isPrimary: boolean
  order: number
}

export interface Property {
  id: string
  title: string
  description: string
  price: number
  city: string
  area: string
  address: string
  latitude?: number | null
  longitude?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  areaSize?: number | null
  purpose: PropertyPurpose
  pricePeriod?: PricePeriod | null
  status: PropertyStatus
  categoryId: string
  category: {
    id: string
    name: string
    slug: string
    parentId: string | null
  }
  ownerId: string
  owner?: { id: string; name: string }
  rejectionReason?: string | null
  submittedAt?: string | null
  approvedAt?: string | null
  images: PropertyImage[]
  videoUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  parent?: { id: string; name: string; slug: string } | null
  sortOrder: number
  subcategories?: Category[]
}

export interface AdminCategory extends Category {
  isActive: boolean
  createdAt: string
  updatedAt: string
  propertyCount?: number
  subcategoryCount?: number
  subcategories?: AdminCategory[]
}

export interface CreateCategoryInput {
  name: string
  slug: string
  description?: string
  parentId?: string
  sortOrder?: number
  isActive?: boolean
}

export interface UpdateCategoryInput {
  name?: string
  slug?: string
  description?: string
  sortOrder?: number
  isActive?: boolean
}

export type CreateSubcategoryInput = Omit<CreateCategoryInput, 'parentId'>
export type UpdateSubcategoryInput = UpdateCategoryInput

export type NotificationType =
  | 'USER_REGISTERED'
  | 'USER_EMAIL_VERIFIED'
  | 'OWNER_PROFILE_SUBMITTED'
  | 'OWNER_KYC_APPROVED'
  | 'OWNER_KYC_REJECTED'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  data: Record<string, unknown> | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

export interface AdminOwnerProfileSummary {
  id: string
  ownerType: OwnerType | null
  companyName: string | null
  city: string | null
  profileStatus: ProfileStatus
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminOwnerListItem {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: 'OWNER'
  isVerified: boolean
  provider: string
  emailVerificationStatus: 'VERIFIED' | 'NOT_VERIFIED'
  profileCompletionStatus: 'COMPLETE' | 'INCOMPLETE'
  profileStatus: ProfileStatus
  ownerProfile: AdminOwnerProfileSummary | null
  createdAt: string
  updatedAt: string
}

export interface OwnerProfile {
  id: string
  userId: string
  ownerType: OwnerType | null
  companyName: string | null
  nationalId: string | null
  taxNumber: string | null
  commercialRegister: string | null
  whatsapp: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  area: string | null
  bio: string | null
  profileStatus: ProfileStatus
  rejectionReason: string | null
  isProfileComplete?: boolean
  isVerified?: boolean
  pendingType?: OwnerPendingType
  createdAt?: string
  updatedAt?: string
  user?: {
    id: string
    name: string
    email: string | null
    phone: string | null
    isVerified?: boolean
    createdAt: string
  }
}
