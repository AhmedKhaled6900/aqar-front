import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AdminAttributeLinksPage } from '@/pages/admin/AdminAttributeLinksPage'
import { AdminAttributesPage } from '@/pages/admin/AdminAttributesPage'
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage'
import { AdminSubcategoriesPage } from '@/pages/admin/AdminSubcategoriesPage'
import { AdminOwnerDetailPage } from '@/pages/admin/AdminOwnerDetailPage'
import { AdminOwnerListDetailPage } from '@/pages/admin/AdminOwnerListDetailPage'
import { AdminOwnersPage } from '@/pages/admin/AdminOwnersPage'
import { AdminPropertiesPage } from '@/pages/admin/AdminPropertiesPage'
import { ProviderCoveragePage } from '@/pages/provider/ProviderCoveragePage'
import { ProviderDashboardPage } from '@/pages/provider/ProviderDashboardPage'
import { ProviderLeadsPage } from '@/pages/provider/ProviderLeadsPage'
import { ProviderListingsPage } from '@/pages/provider/ProviderListingsPage'
import { ProviderOrdersPage } from '@/pages/provider/ProviderOrdersPage'
import { ProviderPendingReviewPage } from '@/pages/provider/ProviderPendingReviewPage'
import { ProviderProfilePage } from '@/pages/provider/ProviderProfilePage'
import { ProviderSetupPage } from '@/pages/provider/ProviderSetupPage'
import { ProviderSuspendedPage } from '@/pages/provider/ProviderSuspendedPage'
import { PendingOwnersPage } from '@/pages/admin/PendingOwnersPage'
import { PendingProvidersPage } from '@/pages/admin/PendingProvidersPage'
import { AdminServiceCategoriesPage } from '@/pages/admin/AdminServiceCategoriesPage'
import { PendingPropertiesPage } from '@/pages/admin/PendingPropertiesPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage'
import { CompleteProfilePage } from '@/pages/owner/CompleteProfilePage'
import { OwnerDashboardPage } from '@/pages/owner/OwnerDashboardPage'
import { OwnerOffersPage } from '@/pages/owner/OwnerOffersPage'
import { OwnerProfilePage } from '@/pages/owner/OwnerProfilePage'
import { PendingReviewPage } from '@/pages/owner/PendingReviewPage'
import { PropertyFormPage } from '@/pages/owner/PropertyFormPage'
import { HomePage } from '@/pages/public/HomePage'
import { PropertiesPage } from '@/pages/public/PropertiesPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PropertyDetailPage } from '@/pages/public/PropertyDetailPage'
import { ProtectedRoute } from '@/router/ProtectedRoute'
import { PermissionGuard } from '@/routes/PermissionGuard'
import { RoleGuard } from '@/routes/RoleGuard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '404', element: <NotFoundPage /> },
      { path: 'properties', element: <PropertiesPage /> },
      { path: 'properties/:id', element: <PropertyDetailPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <RoleGuard roles={['OWNER']} />,
            children: [
              { path: 'owner/dashboard', element: <OwnerDashboardPage /> },
              {
                element: <PermissionGuard permission="offer.read" />,
                children: [{ path: 'owner/offers', element: <OwnerOffersPage /> }],
              },
              { path: 'owner/pending-review', element: <PendingReviewPage /> },
              {
                element: <PermissionGuard permission="owner.profile.read" />,
                children: [{ path: 'owner/profile', element: <OwnerProfilePage /> }],
              },
              {
                element: <PermissionGuard permission="owner.profile.update" />,
                children: [
                  { path: 'owner/complete-profile', element: <CompleteProfilePage /> },
                ],
              },
              {
                element: <PermissionGuard permission="property.create" />,
                children: [
                  { path: 'owner/properties/new', element: <PropertyFormPage /> },
                ],
              },
              {
                element: <PermissionGuard permission="property.update" />,
                children: [
                  {
                    path: 'owner/properties/:id/edit',
                    element: <PropertyFormPage />,
                  },
                ],
              },
            ],
          },
          {
            element: <RoleGuard roles={['SERVICE_PROVIDER']} />,
            children: [
              { path: 'provider/pending-review', element: <ProviderPendingReviewPage /> },
              { path: 'provider/suspended', element: <ProviderSuspendedPage /> },
              {
                element: <PermissionGuard permission="provider.profile.update" />,
                children: [
                  { path: 'provider/setup', element: <ProviderSetupPage /> },
                ],
              },
              {
                element: <PermissionGuard permission="provider.profile.read" />,
                children: [{ path: 'provider/profile', element: <ProviderProfilePage /> }],
              },
              {
                element: <PermissionGuard permission="provider.dashboard.read" />,
                children: [
                  { path: 'provider/dashboard', element: <ProviderDashboardPage /> },
                ],
              },
              {
                element: <PermissionGuard permission="provider.coverage.manage" />,
                children: [{ path: 'provider/coverage', element: <ProviderCoveragePage /> }],
              },
              {
                element: <PermissionGuard permission="provider.listing.manage" />,
                children: [{ path: 'provider/listings', element: <ProviderListingsPage /> }],
              },
              {
                element: <PermissionGuard permission="provider.order.read" />,
                children: [{ path: 'provider/orders', element: <ProviderOrdersPage /> }],
              },
              {
                element: <PermissionGuard permission="provider.lead.read" />,
                children: [{ path: 'provider/leads', element: <ProviderLeadsPage /> }],
              },
            ],
          },
          {
            element: <RoleGuard roles={['ADMIN']} />,
            children: [
              {
                element: <PermissionGuard permission="provider.review" />,
                children: [
                  { path: 'admin/providers/pending', element: <PendingProvidersPage /> },
                ],
              },
              {
                element: <PermissionGuard permission="service.category.read" />,
                children: [
                  {
                    path: 'admin/service-categories',
                    element: <AdminServiceCategoriesPage />,
                  },
                ],
              },
              {
                element: <PermissionGuard permission="owner.review" />,
                children: [
                  {
                    path: 'admin/owners/pending/:userId',
                    element: <AdminOwnerDetailPage />,
                  },
                  { path: 'admin/owners/pending', element: <PendingOwnersPage /> },
                ],
              },
              {
                element: <PermissionGuard permission="users.read" />,
                children: [
                  { path: 'admin/owners', element: <AdminOwnersPage /> },
                  {
                    path: 'admin/owners/:userId',
                    element: <AdminOwnerListDetailPage />,
                  },
                ],
              },
              {
                element: <PermissionGuard permission="property.review" />,
                children: [
                  {
                    path: 'admin/properties/pending',
                    element: <PendingPropertiesPage />,
                  },
                ],
              },
              {
                element: <PermissionGuard permission="property.read" />,
                children: [
                  { path: 'admin/properties', element: <AdminPropertiesPage /> },
                ],
              },
              {
                element: <PermissionGuard permission="property.create" />,
                children: [
                  { path: 'admin/properties/new', element: <PropertyFormPage /> },
                ],
              },
              {
                element: <PermissionGuard permission="property.update" />,
                children: [
                  {
                    path: 'admin/properties/:id/edit',
                    element: <PropertyFormPage />,
                  },
                ],
              },
              {
                element: <PermissionGuard permission="category.read" />,
                children: [
                  { path: 'admin/categories', element: <AdminCategoriesPage /> },
                  { path: 'admin/subcategories', element: <AdminSubcategoriesPage /> },
                ],
              },
              {
                element: <PermissionGuard permission="attribute.read" />,
                children: [
                  { path: 'admin/attributes', element: <AdminAttributesPage /> },
                ],
              },
              {
                element: <PermissionGuard permission="attribute.update" />,
                children: [
                  {
                    path: 'admin/attributes/links',
                    element: <AdminAttributeLinksPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
])
