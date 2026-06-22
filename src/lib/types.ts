export type UserRole = 'ADMIN' | 'OWNER' | 'CUSTOMER' | 'SERVICE_PROVIDER'

export type ProfileStatus =
  | 'INCOMPLETE'
  | 'BASIC_DONE'
  | 'KYC_PENDING'
  | 'VERIFIED'
  | 'REJECTED'

export type OwnerType = 'INDIVIDUAL' | 'COMPANY'

export type OwnerPendingType = 'KYC_REVIEW' | 'EMAIL_NOT_VERIFIED'

export type PropertyPurpose = 'RENT' | 'SALE' // SALE reserved for future sale feature

export type PricePeriod = 'DAY' | 'MONTH' | 'YEAR'

export type PropertyStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SOLD'
  | 'RENTED'
  | 'SUSPENDED'

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
  suspensionReason?: string | null
  suspendedAt?: string | null
  submittedAt?: string | null
  approvedAt?: string | null
  isNegotiable?: boolean
  rental?: PropertyRental | null
  attributes?: PropertyAttributesGroup
  images: PropertyImage[]
  videoUrl?: string | null
  createdAt: string
  updatedAt: string
}

export type RentalSource = 'DIRECT_BOOKING' | 'NEGOTIATION'

export type RentalStatus = 'ACTIVE' | 'CANCELLED' | 'COMPLETED'

export interface RentalTenant {
  id: string
  name: string
  email: string | null
  phone: string | null
}

export interface PropertyRental {
  id: string
  source: RentalSource
  agreedPrice: number
  pricePeriod: PricePeriod
  duration: number
  startedAt: string
  endsAt: string
  status: RentalStatus
  notes?: string | null
  offerId?: string | null
  tenant?: RentalTenant
}

export interface PropertyRentalRecord extends PropertyRental {
  propertyId: string
  tenantId: string
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
  duration: number
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
  duration: number
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

export type AttributeType =
  | 'TEXT'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'DATE'

export type AttributeScope = 'SYSTEM' | 'COMPANY'

export interface Attribute {
  id: string
  name: string
  slug: string
  type: AttributeType
  scope: AttributeScope
  options: string[] | null
  companyId: string | null
  createdById: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface SubcategoryAttributeItem extends Attribute {
  attributeId?: string
  isRequired: boolean
  linkSortOrder: number
}

export interface SubcategoryAttributesResponse {
  subcategoryId: string
  items: SubcategoryAttributeItem[]
}

export interface CreateAttributeInput {
  name: string
  slug: string
  type: AttributeType
  scope: AttributeScope
  options?: string[]
  sortOrder?: number
  isActive?: boolean
}

export type UpdateAttributeInput = Partial<CreateAttributeInput>

export interface SubcategoryAttributeLinkInput {
  attributeId: string
  isRequired?: boolean
  sortOrder?: number
}

export interface PropertySystemAttribute {
  id: string
  attributeId: string
  name: string
  slug: string
  type: AttributeType
  value: unknown
}

export interface PropertyCustomAttribute {
  id: string
  name: string
  type: AttributeType
  value: unknown
}

export interface PropertyAttributesGroup {
  system: PropertySystemAttribute[]
  custom: PropertyCustomAttribute[]
}

export interface PropertyAttributeInput {
  attributeId: string
  value: unknown
}

export interface PropertyCustomAttributeInput {
  name: string
  type: AttributeType
  options?: string[]
  value: unknown
}

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

// ——— Service Provider ———

export type ServiceProviderStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'SUSPENDED'
  | 'REJECTED'

export type ServiceListingStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'REJECTED'
  | 'PAUSED'

export type ServiceOrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELLED'

export type ServiceLeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUOTED'
  | 'COMPLETED'
  | 'LOST'

export interface ServiceCategory {
  id: string
  name: string
  slug: string
  description?: string | null
  sortOrder?: number
  commissionRate?: number
  isActive?: boolean
}

export interface ServiceCoverageArea {
  id: string
  providerId?: string
  city: string
  area: string | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ServiceProviderProfile {
  id: string
  userId: string
  businessName: string
  categoryId: string
  description: string | null
  logo: string | null
  phone: string | null
  whatsapp: string | null
  nationalId: string | null
  commercialRegister: string | null
  status: ServiceProviderStatus
  rejectionReason: string | null
  suspensionReason: string | null
  /** سعر توصيل ثابت لمنيو المقدم — يُضبط عبر PATCH /provider/profile */
  menuDeliveryFee?: number | null
  category: ServiceCategory
  coverageAreas: ServiceCoverageArea[]
  counts?: { listings: number; orders: number; leads: number }
}

export interface ListingMenuItem {
  id?: string
  name: string
  price: number
  prepTimeMinutes?: number | null
  sortOrder?: number
}

/** @deprecated use ListingMenuItem */
export interface ServiceMenuItem {
  name: string
  price: number
}

/** منيو ثابت للمقدم — CRUD عبر /provider/menu-items */
export interface ProviderMenuItem {
  id: string
  name: string
  price: number
  prepTimeMinutes?: number | null
  isActive: boolean
  sortOrder: number
  createdAt?: string
  updatedAt?: string
}

export interface ServiceListing {
  id: string
  providerId?: string
  categoryId?: string
  title: string
  description: string | null
  status: ServiceListingStatus
  image?: string | null
  link?: string | null
  isFeatured?: boolean
  rejectionReason?: string | null
  menuItems: ListingMenuItem[] | null
  /** سعر توصيل خاص بهذا الإعلان */
  deliveryFee?: number | null
  metadata?: Record<string, unknown> | null
  orderStats?: ListingOrderStats
  createdAt?: string
  updatedAt?: string
}

export interface ListingOrderStats {
  total: number
  completed: number
  active: number
  closed: number
}

export interface AdminServiceListingRecord extends ServiceListing {
  provider?: {
    id: string
    businessName: string
    logo?: string | null
    status?: ServiceProviderStatus
    category?: ServiceCategory
    user?: {
      id?: string
      name?: string
      email?: string | null
      phone?: string | null
    }
  }
}

export interface ServiceOrderCustomer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
}

export interface ServiceOrder {
  id: string
  status: ServiceOrderStatus
  subtotal: number
  deliveryFee: number
  platformFee: number
  providerNet: number
  deliveryCity: string
  deliveryArea?: string | null
  deliveryAddress?: string | null
  notes?: string | null
  rejectionReason?: string | null
  items: Array<{
    id?: string
    name: string
    quantity: number
    unitPrice: number
    notes?: string | null
  }>
  customer: ServiceOrderCustomer
  listingId?: string | null
  listing?: { id: string; title: string } | null
  createdAt: string
  updatedAt?: string
}

export interface ServiceLead {
  id: string
  status: ServiceLeadStatus
  type: string
  pickupCity: string
  pickupArea?: string | null
  destination: string
  passengers?: number | null
  preferredDateTime?: string | null
  notes?: string | null
  customer: ServiceOrderCustomer
  createdAt: string
  updatedAt?: string
}

export interface ProviderDashboardSummary {
  period: { from: string | null; to: string | null }
  orders: {
    total: number
    delivered: number
    acceptanceRate: number
  }
  leads: {
    total: number
    byStatus: Array<{ status: ServiceLeadStatus; count: number }>
  }
  revenue: {
    totalSales: number
    platformFee: number
    providerNet: number
  }
  topDeliveryAreas: Array<{ area: string; orderCount: number }>
}

export interface AdminServiceProviderUser {
  id: string
  name: string
  email: string | null
  phone: string | null
  isVerified: boolean
  createdAt: string
}

export interface AdminProviderStats {
  listingsCount: number
  ordersCount: number
  leadsCount: number
  ordersByStatus: Record<string, number>
  leadsByStatus: Record<string, number>
  revenue: {
    totalSales: number
    platformFee: number
    providerNet: number
  }
}

export interface AdminServiceProviderRecord {
  id: string
  userId: string
  businessName: string
  description: string | null
  logo: string | null
  phone: string | null
  whatsapp: string | null
  nationalId: string | null
  commercialRegister: string | null
  status: ServiceProviderStatus
  rejectionReason: string | null
  suspensionReason: string | null
  suspendedAt: string | null
  createdAt: string
  updatedAt: string
  user: AdminServiceProviderUser
  category: ServiceCategory
  coverageAreas: ServiceCoverageArea[]
  listings: ServiceListing[]
  orders: ServiceOrder[]
  leads: ServiceLead[]
  promotions: unknown[]
  stats: AdminProviderStats
}

/** @deprecated use AdminServiceProviderRecord for full list items */
export interface AdminServiceProviderListItem {
  userId: string
  businessName: string
  status: ServiceProviderStatus
  category?: ServiceCategory | null
  user?: { id: string; name: string; email: string | null; phone: string | null }
  logo?: string | null
  nationalId?: string | null
  commercialRegister?: string | null
  description?: string | null
  createdAt?: string
}
