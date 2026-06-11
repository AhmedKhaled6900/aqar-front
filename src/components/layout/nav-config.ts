import {
  Building2,
  ClipboardCheck,
  ClipboardList,
  FolderTree,
  Home,
  Layers,
  LayoutDashboard,
  HandCoins,
  Plus,
  ShieldCheck,
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
        to: '/admin/subcategories',
        labelKey: 'nav.adminSubcategories',
        icon: Layers,
        permission: 'category.read',
        end: true,
      },
    ],
  },
]
