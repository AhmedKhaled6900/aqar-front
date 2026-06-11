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
  parentCategoryId?: string
  parentCategory?: { id: string; name: string; slug: string } | null
  subcategoryId?: string
  subcategory?: {
    id: string
    name: string
    slug: string
    parentId: string | null
  }
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
  isNegotiable?: boolean
  images: PropertyImage[]
  videoUrl?: string | null
  createdAt: string
  updatedAt: string
}

export type OfferStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'NEGOTIATING'
  | 'NEGOTIATING_FAIL'

export type OfferSenderRole = 'CUSTOMER' | 'OWNER'

export interface OfferRound {
  id: string
  senderRole: OfferSenderRole
  senderId: string
  price: number
  pricePeriod: PricePeriod
  notes?: string | null
  createdAt: string
}

export interface PriceOffer {
  id: string
  propertyId: string
  customerId: string
  status: OfferStatus
  expiresAt: string
  customerOfferCount: number
  ownerOfferCount: number
  maxOffersPerSide: number
  expiresInDays: number
  property: {
    id: string
    title: string
    ownerId: string
    isNegotiable: boolean
    status: PropertyStatus
    listPrice: number
    listPricePeriod?: PricePeriod | null
    purpose: PropertyPurpose
  }
  customer: { id: string; name: string; email: string | null }
  latestRound: OfferRound | null
  rounds: OfferRound[]
  createdAt: string
  updatedAt: string
}

export interface OfferSummary {
  total: number
  pending: number
  negotiating: number
  accepted: number
  rejected: number
  expired: number
  negotiatingFailed: number
  active: number
  closed: number
}

export interface OwnerPropertyOffersGroup {
  property: {
    id: string
    title: string
    status: PropertyStatus
    isNegotiable: boolean
    price: number
    pricePeriod?: PricePeriod | null
  }
  summary: OfferSummary
  offers: PriceOffer[]
}

export interface CreateOfferInput {
  price: number
  pricePeriod: PricePeriod
  notes?: string
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

export interface CategorySelectMenuItem {
  id: string
  name: string
  slug: string
  description?: string | null
  sortOrder: number
  isActive?: boolean
  subcategories?: CategorySelectMenuItem[]
}

export interface SubcategorySelectMenuItem {
  id: string
  name: string
  slug: string
  description?: string | null
  parentId: string | null
  sortOrder: number
  parent?: { id: string; name: string; slug: string } | null
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
