# Public Services Module — Website Frontend Implementation

> **الغرض:** بناء واجهة **العميل/الزائر** لاكتشاف مقدمي الخدمة على موقع وجهتك العقارية.  
> **نفس المشروع:** `aqar-front` (Vite + React 19 + RTL عربي) — ليس تطبيقاً منفصلاً.  
> **الداشبورد جاهز:** `/provider/*` لمقدم الخدمة — **لا تلمسه** في هذه المهمة.  
> **الباك:** NestJS API على `VITE_API_URL`  
> **مرجع إضافي:** [`SERVICE_PROVIDER_README.md`](./SERVICE_PROVIDER_README.md) + Swagger `GET /api/docs`

---

## الهدف (Product)

منصة العقارات + خدمات المصيف في مكان واحد:

1. **عميل أجر وحدة نشطة** → على الهوم يظهر سكشن **«خدمات بالقرب منك»** حسب `city` + `area` الوحدة المؤجرة.
2. **زائر أو عميل بدون إيجار** → سكشن **«اكتشف الخدمات»** (كل المقدمين / فلاتر عامة).
3. كتالوج `/services` + تفاصيل `/services/providers/:id` مع منيو واتصال/واتساب.

**MVP = اكتشاف وعرض فقط.** لا تبني طلب أوردر أو lead في هذه المرحلة.

---

## Tech Stack (اتبع المشروع الحالي)

- Vite + React 19 + React Router v7
- TanStack React Query v5
- Axios عبر `useAxiosInstance()`
- Tailwind + shadcn/ui
- i18next — عربي RTL
- Auth: cookie `access_token` + `permissions` في localStorage
- Pagination: `normalizePaginatedResponse()` من `src/lib/api/pagination.ts`

```env
VITE_API_URL=https://your-api.railway.app
```

---

## Business Rules

1. المقدم يظهر للعميل فقط إذا:
   - `status === APPROVED`
   - عنده `coverage area` نشطة تطابق `city`/`area` المطلوب
   - عنده `listing` بحالة `ACTIVE` (للمنيو في التفاصيل)
2. فئات الخدمات (seed): `restaurants` | `cafes` | `home-cooking` | `transport`
3. **الطعام** → أوردر كامل (مرحلة 2). **النقل** → lead (مرحلة 2).
4. لا تخلط `OWNER` / `SERVICE_PROVIDER` / `CUSTOMER` — verticals منفصلة.

---

## Endpoints — المرحلة 1 (الويب العام)

### Public (بدون token)

#### `GET /services/categories`

فئات الخدمات النشطة.

**Response:**

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "مطاعم",
      "slug": "restaurants",
      "description": "...",
      "sortOrder": 1
    }
  ]
}
```

**Hook موجود:** `src/features/service-provider/useServiceCategories.ts` — أعد استخدامه أو انقله إلى `src/features/services/`.

---

#### `GET /services/providers`

اكتشاف مقدمين معتمدين.

**Query params:**

| Param | Type | الوصف |
|-------|------|--------|
| `city` | string | اختياري — فلتر المدينة |
| `area` | string | اختياري — فلتر المنطقة |
| `category` | string | اختياري — slug أو id الفئة |
| `page` | number | افتراضي 1 |
| `limit` | number | افتراضي 12–20 |

**Response:** paginated `{ items, meta }` — تحقق من Swagger للشكل الدقيق.

**شكل متوقع لكل item (تقريبي — لا تخمّن، اقرأ Swagger):**

```json
{
  "id": "uuid",
  "businessName": "مطعم البحر",
  "description": "توصيل طعام",
  "logo": "https://...",
  "phone": "+201...",
  "whatsapp": "+201...",
  "category": {
    "id": "uuid",
    "name": "مطاعم",
    "slug": "restaurants"
  },
  "coverageAreas": [
    { "city": "الإسكندرية", "area": "سيدي بشر", "isActive": true }
  ]
}
```

---

#### `GET /services/providers/:id`

تفاصيل مقدم + listings نشطة + menuItems.

**Response (تقريبي):**

```json
{
  "id": "uuid",
  "businessName": "مطعم البحر",
  "description": "...",
  "logo": "https://...",
  "phone": "+201...",
  "whatsapp": "+201...",
  "category": { "id": "...", "name": "مطاعم", "slug": "restaurants" },
  "coverageAreas": [...],
  "listings": [
    {
      "id": "uuid",
      "title": "منيو المطعم",
      "description": "...",
      "status": "ACTIVE",
      "menuItems": [{ "name": "كشري", "price": 25 }]
    }
  ]
}
```

---

### Authenticated — لسكشن «بالقرب منك»

#### `GET /bookings/my?page=&limit=`

- **Permission:** `booking.read`
- **الاستخدام:** إيجاد إيجار نشط للعميل `CUSTOMER`.

**فلتر الإيجار النشط في الفرونت:**

```ts
status === 'ACTIVE' && new Date(endsAt) > new Date()
```

**Response item (`PropertyRentalRecord`):**

```json
{
  "id": "uuid",
  "propertyId": "uuid",
  "status": "ACTIVE",
  "startedAt": "...",
  "endsAt": "...",
  "agreedPrice": 5000,
  "pricePeriod": "MONTH",
  "duration": 1
}
```

> **ملاحظة:** الرد لا يتضمن `city`/`area` — جلب الموقع عبر:

#### `GET /properties/:id`

Public endpoint — لجلب `title`, `city`, `area` للوحدة المؤجرة.

---

## Endpoints — المرحلة 2 (لا تبنيها الآن)

| Method | Path | Permission |
|--------|------|------------|
| POST | `/services/orders` | `service.order.create` |
| GET | `/services/my/orders` | `service.order.read` |
| POST | `/services/leads` | `service.lead.create` |
| GET | `/services/my/leads` | `service.lead.read` |

---

## منطق العرض على الهوم

```
if (!loggedIn) {
  show DiscoverServicesSection only
} else if (CUSTOMER && hasActiveRental) {
  activeRental = latest ACTIVE rental from GET /bookings/my
  property = GET /properties/{activeRental.propertyId}
  providers = GET /services/providers?city={property.city}&area={property.area}
  show ServicesNearYouSection (with property context)
} else {
  show DiscoverServicesSection only
}
```

**نص السياق:** «أنت في: {property.title} — {property.city} / {property.area}»

**حالات حافة:**

- أكثر من إيجار نشط → الأحدث `startedAt`
- `booking.read` مفقود → أخفِ «بالقرب منك»
- لا مقدمين في المنطقة → empty state + رابط `/services` بدون فلتر موقع

---

## Routes

| Route | Guard | الصفحة |
|-------|-------|--------|
| `/services` | Public | كتالوج + فلاتر |
| `/services/providers/:id` | Public | تفاصيل المقدم |

**Query params لـ `/services`:**

- `?city=الإسكندرية&area=سيدي بشر&category=restaurants`
- يُملأ تلقائياً من زر «عرض الكل» في سكشن «بالقرب منك»

**لا تضع هذه الـ routes تحت `ProtectedRoute`.**

---

## الملفات المطلوب إنشاؤها

```
src/features/services/
  usePublicProviders.ts       → GET /services/providers
  usePublicProviderDetail.ts  → GET /services/providers/:id
  useActiveRentalLocation.ts  → useMyRentals + useProperty → { city, area, propertyTitle }

src/components/services/
  ServiceProviderCard.tsx       # شبيه PropertyCard
  ServiceCategoryChips.tsx      # فلاتر أفقية للفئات
  ServiceListingMenu.tsx        # عرض menuItems في التفاصيل
  ServicesNearYouSection.tsx      # سكشن الهوم — بالقرب منك
  DiscoverServicesSection.tsx   # سكشن الهوم — اكتشف الخدمات

src/pages/public/
  ServicesPage.tsx
  ServiceProviderDetailPage.tsx
```

### تعديلات على ملفات موجودة

| الملف | التعديل |
|-------|---------|
| `src/pages/public/HomePage.tsx` | أضف السكشنين بعد hero |
| `src/router/index.tsx` | routes عامة لـ `/services` و `/services/providers/:id` |
| `src/components/layout/nav-config.ts` | رابط «الخدمات» جنب «العقارات» |
| `src/lib/types.ts` | `PublicServiceProvider` إن لزم (من Swagger) |
| `src/i18n/ar.json` | مفاتيح `services.*` و `nav.services` |

---

## Hooks — Implementation Guide

### `usePublicProviders(filters)`

```ts
queryKey: ['services', 'providers', filters]
GET /services/providers { params: { city, area, category, page, limit } }
return normalizePaginatedResponse(data)
staleTime: 60_000
// Public — لا يحتاج enabled على role
```

### `usePublicProviderDetail(id)`

```ts
queryKey: ['services', 'providers', id]
GET /services/providers/:id
enabled: !!id
```

### `useActiveRentalLocation()`

```ts
const { data: me } = useMe()
const enabled = me?.user.role === 'CUSTOMER'
const { data: rentals } = useMyRentals(1, 10) // enabled only if CUSTOMER + token

const active = rentals?.items
  .filter(r => r.status === 'ACTIVE' && new Date(r.endsAt) > new Date())
  .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0]

const { data: property } = useProperty(active?.propertyId ?? '', !!active?.propertyId)

return active && property
  ? { city: property.city, area: property.area, propertyTitle: property.title, rental: active }
  : null
```

**موجود:** `useMyRentals` في `src/features/bookings/useBookings.ts`  
**موجود:** `useProperty` في `src/features/properties/useProperties.ts`

---

## UI Components

### `ServiceProviderCard`

- Link → `/services/providers/{id}`
- صورة: `logo` أو placeholder
- `businessName`, `category.name`
- badge للفئة
- سطر موقع من `coverageAreas[0]` أو من سياق البحث
- نفس أسلوب `PropertyCard` (`hover-lift`, RTL)

### `ServiceProviderDetailPage`

- هيدر: logo + businessName + category badge
- وصف + مناطق التغطية
- `ServiceListingMenu` لكل listing نشط
- CTA:
  - `whatsapp` → `https://wa.me/{phone}` (نظّف الرقم)
  - `phone` → `tel:`
- **لا زر «اطلب الآن»** في MVP

### `ServicesPage`

- شبيه `PropertiesPage` — فلاتر city, area, category chips
- قراءة initial filters من `useSearchParams()`
- pagination مثل العقارات

---

## i18n (ar.json) — أضف

```json
{
  "nav": {
    "services": "الخدمات"
  },
  "services": {
    "title": "الخدمات",
    "nearYou": "خدمات بالقرب منك",
    "nearYouDesc": "مقدمو خدمة في منطقة إقامتك",
    "discover": "اكتشف الخدمات",
    "discoverDesc": "مطاعم، كافيهات، أكل بيتي، ونقل في كل المناطق",
    "viewAll": "عرض الكل",
    "youAreAt": "أنت في: {{title}} — {{city}} / {{area}}",
    "noProvidersNearby": "لا يوجد مقدمو خدمة في منطقتك حالياً",
    "coverage": "مناطق التغطية",
    "menu": "المنيو",
    "contact": "تواصل",
    "call": "اتصال",
    "whatsapp": "واتساب"
  }
}
```

---

## أنماط يجب اتباعها

| مرجع | المسار |
|------|--------|
| كرت القائمة | `src/components/properties/PropertyCard.tsx` |
| صفحة القائمة + فلاتر | `src/pages/public/PropertiesPage.tsx` |
| صفحة التفاصيل | `src/pages/public/PropertyDetailPage.tsx` |
| Pagination | `src/lib/api/pagination.ts` |
| تأكيد الحذف | `src/hooks/use-confirm.ts` |

---

## Types (أضف في types.ts)

```ts
export interface PublicServiceProvider {
  id: string
  businessName: string
  description?: string | null
  logo?: string | null
  phone?: string | null
  whatsapp?: string | null
  category: ServiceCategory
  coverageAreas?: ServiceCoverageArea[]
  listings?: ServiceListing[]
}
```

> حدّث من Swagger — لا تخمّن حقولاً إضافية.

---

## Test Plan

1. **زائر:** الهوم يعرض «اكتشف الخدمات» فقط — `/services` يعمل بدون login
2. **عميل بدون إيجار:** نفس الزائر
3. **عميل بإيجار ACTIVE في سيدي بشر:**
   - سكشن «بالقرب منك» يظهر
   - النتائج من `?city=...&area=...`
4. **تفاصيل مقدم:** منيو + واتساب يفتح
5. **مقدم غير APPROVED أو بدون تغطية:** لا يظهر في القائمة
6. **`npm run build`** بدون أخطاء TypeScript

---

## فجوات الباك (للعلم — ليست blocker للمرحلة 1)

- `/bookings/my` بدون `property.city/area` → workaround: `GET /properties/:id`
- `docs/openapi.json` قد يكون قديم — صدّر من الباك قبل التنفيذ (`npm run openapi:export`)
- تأكد deploy موديول service-provider على Railway
- بيانات تجريبية: مقدم APPROVED + coverage + listing ACTIVE

---

## Cursor Prompt (انسخ للتنفيذ)

```
Implement the Public Services customer-facing module using docs/PUBLIC_SERVICES_WEBSITE_PROMPT.md.

Requirements:
- Arabic RTL UI, reuse existing auth/axios/React Query/Tailwind/shadcn patterns
- HomePage: dynamic sections — "خدمات بالقرب منك" (customer with ACTIVE rental → city/area from property) vs "اكتشف الخدمات" (guest / no rental)
- Routes: /services (catalog + filters), /services/providers/:id (detail + menu + whatsapp/call)
- Hooks: usePublicProviders, usePublicProviderDetail, useActiveRentalLocation (useMyRentals + useProperty)
- Components: ServiceProviderCard, ServiceCategoryChips, ServiceListingMenu, ServicesNearYouSection, DiscoverServicesSection
- Nav link "الخدمات" + ar.json keys
- Public routes — NO ProtectedRoute for browse
- MVP = discovery only — NO orders/leads pages yet
- Read Swagger/openapi for exact API response shapes — do not guess
- Follow PropertyCard / PropertiesPage patterns

API:
- GET /services/categories
- GET /services/providers?city&area&category&page&limit
- GET /services/providers/:id
- GET /bookings/my (active rental detection)
- GET /properties/:id (rental location)

API base: VITE_API_URL
```

---

*Last updated: June 2026 — Public Services Website MVP*
