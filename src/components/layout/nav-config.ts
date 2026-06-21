import {
  Building2,
  ChefHat,
  ClipboardCheck,
  ClipboardList,
  FolderTree,
  Home,
  Layers,
  LayoutDashboard,
  HandCoins,
  Link2,
  ListChecks,
  List,
  MapPin,
  Package,
  Plus,
  ShieldCheck,
  Store,
  Truck,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/lib/types'

export interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
  end?: boolean
  permission?: string
  badgeKey?: 'provider.pendingOrders'
  isActiveMatch?: (pathname: string) => boolean
}

export interface NavSection {
  titleKey?: string
  roles?: UserRole[]
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    titleKey: 'sidebar.general',
    items: [
      { to: '/', labelKey: 'nav.home', icon: Home, end: true },
      { to: '/properties', labelKey: 'nav.properties', icon: Building2 },
    ],
  },
  {
    titleKey: 'sidebar.owner',
    roles: ['OWNER'],
    items: [
      { to: '/owner/dashboard', labelKey: 'nav.myProperties', icon: LayoutDashboard },
      {
        to: '/owner/offers',
        labelKey: 'nav.ownerOffers',
        icon: HandCoins,
        permission: 'offer.read',
      },
      {
        to: '/owner/properties/new',
        labelKey: 'nav.addProperty',
        icon: Plus,
        permission: 'property.create',
      },
      {
        to: '/owner/profile',
        labelKey: 'nav.profile',
        icon: User,
        permission: 'owner.profile.read',
      },
    ],
  },
  {
    titleKey: 'sidebar.provider',
    roles: ['SERVICE_PROVIDER'],
    items: [
      {
        to: '/provider/dashboard',
        labelKey: 'nav.providerDashboard',
        icon: LayoutDashboard,
        permission: 'provider.dashboard.read',
      },
      {
        to: '/provider/profile',
        labelKey: 'nav.providerProfile',
        icon: User,
        permission: 'provider.profile.read',
      },
      {
        to: '/provider/coverage',
        labelKey: 'nav.providerCoverage',
        icon: MapPin,
        permission: 'provider.coverage.manage',
      },
      {
        to: '/provider/menu-items',
        labelKey: 'nav.providerMenu',
        icon: ChefHat,
      },
      {
        to: '/provider/listings',
        labelKey: 'nav.providerListings',
        icon: List,
        permission: 'provider.listing.manage',
      },
      {
        to: '/provider/orders',
        labelKey: 'nav.providerOrders',
        icon: Package,
        permission: 'provider.order.read',
        badgeKey: 'provider.pendingOrders',
      },
      {
        to: '/provider/leads',
        labelKey: 'nav.providerLeads',
        icon: Truck,
        permission: 'provider.lead.read',
      },
    ],
  },
  {
    titleKey: 'sidebar.admin',
    roles: ['ADMIN'],
    items: [
      {
        to: '/admin/owners',
        labelKey: 'nav.adminAllOwners',
        icon: Users,
        permission: 'users.read',
      },
      {
        to: '/admin/owners/pending',
        labelKey: 'nav.adminOwners',
        icon: ShieldCheck,
        permission: 'owner.review',
      },
      {
        to: '/admin/providers',
        labelKey: 'nav.adminAllProviders',
        icon: Store,
        permission: 'provider.review',
      },
      {
        to: '/admin/providers/pending',
        labelKey: 'nav.adminProviders',
        icon: ShieldCheck,
        permission: 'provider.review',
      },
      {
        to: '/admin/properties/pending',
        labelKey: 'nav.adminPending',
        icon: ClipboardCheck,
        permission: 'property.review',
      },
      {
        to: '/admin/properties',
        labelKey: 'nav.adminProperties',
        icon: ClipboardList,
        permission: 'property.read',
      },
      {
        to: '/admin/categories',
        labelKey: 'nav.adminCategories',
        icon: FolderTree,
        permission: 'category.read',
        end: true,
      },
      {
        to: '/admin/service-categories',
        labelKey: 'nav.adminServiceCategories',
        icon: Store,
        permission: 'service.category.read',
        end: true,
      },
      {
        to: '/admin/subcategories',
        labelKey: 'nav.adminSubcategories',
        icon: Layers,
        permission: 'category.read',
        end: true,
      },
      {
        to: '/admin/attributes',
        labelKey: 'nav.adminAttributes',
        icon: ListChecks,
        permission: 'attribute.read',
      },
      {
        to: '/admin/attributes/links',
        labelKey: 'nav.adminAttributeLinks',
        icon: Link2,
        permission: 'attribute.update',
        end: true,
      },
    ],
  },
]
