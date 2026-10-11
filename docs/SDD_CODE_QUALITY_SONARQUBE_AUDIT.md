# Software Design Document (SDD): Code Quality & Static Analysis Audit
**Persona:** SonarQube Enterprise Inspector & Principal Software Architect  
**Scope:** `@propertyhub/api` (NestJS) & `@propertyhub/web` (Next.js 16)  
**Document Version:** 1.0.0  
**Status:** PROPOSED FOR REVIEW  

---

## 1. Executive Summary & Quality Gate Overview

Audit ini melakukan inspeksi statis menyeluruh (SonarQube methodology) terhadap seluruh basis kode PropertyHub:
- **Total Masalah Terdeteksi:** 120+ isu kualitas kode across monorepo.
- **Frontend (`apps/web`):** 75 masalah lint (42 errors, 33 warnings).
- **Backend (`apps/api`):** 45+ masalah tipe tidak aman (`no-unsafe-member-access`, `no-unsafe-assignment`, floating promises).

### SonarQube Target Quality Ratings
| Dimensi | Status Saat Ini | Target Quality Gate | Metrik Keberhasilan |
|---|---|---|---|
| **Reliability (Bugs)** | ⚠️ Grade C | ✅ **Grade A** | 0 React hook violations, 0 floating promises |
| **Security (Hotspots)** | ⚠️ Grade B | ✅ **Grade A** | 0 unvalidated `any` payload, strict DTOs |
| **Maintainability (Code Smells)**| ⚠️ Grade C | ✅ **Grade A** | Debt ratio < 5%, 0 unused imports |
| **Type Safety & Coverage** | ⚠️ Grade D (70+ `any`) | ✅ **Grade A** | **0 explicit `any`**, strict generics |

---

## 2. Category 1: 🔴 Reliability & Bug Risks

### 2.1 React 19 Hook Violations (`react-hooks/set-state-in-effect`)
**Lokasi**: 
- `apps/web/components/client/home-search.tsx:56`
- `apps/web/components/client/property-list.tsx:61`
- `apps/web/components/client/search-bar.tsx:69`
- `apps/web/components/client/form-sections/location.tsx:54`

**Root Cause**:
Memanggil `setState` secara sinkron langsung di dalam body `useEffect()`:
```tsx
// Anti-pattern:
useEffect(() => {
  setProperties(initialProperties);
  setSearch(initialSearch);
}, [initialProperties, initialSearch]);
```
**Dampak**: Menimbulkan *cascading re-renders*, memicu layout shift, dan menurunkan skor Core Web Vitals (INP/FID).  
**Remediasi**: Turunkan state langsung dari props (derived state) atau gunakan `key={initialSearch}` pada parent component daripada re-sync via effect.

---

### 2.2 React Immutability Violation (`react-hooks/immutability`)
**Lokasi**: `apps/web/components/client/admin-charts.tsx:45`  
**Root Cause**:
```tsx
// Anti-pattern:
let cumulative = 0;
// Di dalam render map:
cumulative += pct; // Reassigning local rendering variable after render
```
**Dampak**: Berpotensi menghasilkan render grafis yang tidak konsisten saat re-render concurrent.  
**Remediasi**: Gunakan `Array.reduce` atau hitung offset kumulatif murni fungsional sebelum render loop.

---

### 2.3 JSX Construction Inside Try/Catch (`react-hooks/error-boundaries`)
**Lokasi**: `apps/web/components/property/similar-properties.tsx:29`  
**Root Cause**:
Menempatkan konstruksi elemen JSX di dalam blok `try/catch`. React merender komponen secara asinkron di luar siklus try/catch blok kode tersebut sehingga error render tidak akan tertangkap.  
**Remediasi**: Bungkus komponen dengan `<ErrorBoundary fallback={<></>}>` resmi.

---

### 2.4 Floating Promise di Backend (`@typescript-eslint/no-floating-promises`)
**Lokasi**: `apps/api/src/main.ts:66`  
**Root Cause**: `bootstrap();` dipanggil tanpa `.catch(err => logger.error(err))` atau `void`.  
**Dampak**: Jika proses bootstrap gagal (misal koneksi DB timeout), proses Node.js dapat crash dengan `UnhandledPromiseRejection`.  
**Remediasi**:
```ts
bootstrap().catch((err) => {
  new Logger('Bootstrap').error('Fatal error during startup', err);
  process.exit(1);
});
```

---

### 2.5 Silent Error Swallowing (11 Lokasi)
**Lokasi**:
- `apps/api/src/admin/admin.service.ts` (3 lokasi)
- `apps/api/src/leads/leads.service.ts:125`
- `apps/api/src/digest/digest.service.ts:165`
- `apps/web/components/client/notification-bell.tsx:26`

**Root Cause**:
```ts
// Anti-pattern:
this.notifications.create(...).catch(() => {});
```
**Dampak**: Gagal kirim notifikasi atau error database ditelan mentah-mentah tanpa log peringatan. Debugging production menjadi buta.  
**Remediasi**: Selalu sertakan minimal logger: `.catch(err => this.logger.warn('Failed to send notification', err));`.

---

## 3. Category 2: 🟡 Security Hotspots & Input Safety

### 3.1 Type Bypass pada `@CurrentUser() user: any`
**Lokasi**: Tersebar di semua Controller NestJS (`PropertiesController`, `AdminController`, `LeadsController`, `FavoritesController`, `PackagesController`).  
**Root Cause**:
Parameter dekorator dideklarasikan sebagai `any`:
```ts
// Anti-pattern:
@Get('me')
getMe(@CurrentUser() user: any) {
  return this.usersService.getProfile(user.id);
}
```
**Dampak**: Hilangnya jaminan type safety saat runtime, memicu puluhan warning `@typescript-eslint/no-unsafe-member-access` dan `@typescript-eslint/no-unsafe-argument`.  
**Remediasi**:
Buat interface resmi di `packages/shared`:
```ts
export interface RequestUser {
  id: string;
  email: string;
  role: Role;
  name?: string;
  verified?: boolean;
}
```
Ganti semua parameter menjadi `@CurrentUser() user: RequestUser`.

---

## 4. Category 3: 🔵 Maintainability & Cognitive Complexity

### 4.1 "God Services" (> 500 Baris Kode)
**Lokasi**:
1. `apps/api/src/properties/properties.service.ts` (~670 baris)
2. `apps/api/src/admin/admin.service.ts` (~520 baris)

**Root Cause**:
Satu class melayani terlalu banyak domain: upload gambar, floor plan, slug generation, SEO reverse translation, search query builder, analytics aggregation, price history, dan deletion.  
**Remediasi**:
Pecah secara modular sesuai SRP (Single Responsibility Principle):
- `PropertyQueryBuilder`: Menangani filter kompleks dan pencarian radius.
- `PropertyMediaService`: Menangani upload Cloudinary gambar dan denah lantai.
- `PropertySlugService`: Menangani slug generation dan collision resolution.

---

### 4.2 Raw HTML Unescaped Quotes & Non-optimized `<img>` Elements
**Lokasi**:
- `apps/web/app/page.tsx:267`: Tanda kutip unescaped (`"`) di dalam JSX.
- `apps/web/app/properti/[location]/[slug]/page.tsx:307`: Penggunaan tag `<img>` mentah bukan `<Image />` Next.js, merugikan LCP dan bandwidth.
- `apps/web/app/properti/[location]/[slug]/opengraph-image.tsx:46`: Elemen gambar tanpa atribut `alt`.

---

## 5. Category 4: 🟣 Type Safety Leakage Matrix (70+ `any`)

| File | Baris | Tipe `any` Saat Ini | Solusi Tipe Kuat (Strong Typing) |
|---|---|---|---|
| `apps/web/app/admin/reports/page.tsx` | 41 | `r: any` | `Report` interface dari `@propertyhub/shared` |
| `apps/web/app/admin/settings/page.tsx` | 64 | `field: any` | `keyof SiteSettings` |
| `apps/web/app/agen/[handle]/page.tsx` | 41-42 | `p: any` | `Property` dari `@propertyhub/shared` |
| `apps/web/app/bandingkan/page.tsx` | 15, 61, 90 | `p: any` | `Property` dari `@propertyhub/shared` |
| `apps/web/app/dashboard/saved-searches/page.tsx` | 9, 28 | `s: any` | `SavedSearch` interface |
| `apps/web/lib/server/api.ts` | 66, 67, 72 | `(body: any)` | DTO eksplisit (`UpdateUserDto`, `CreateReviewDto`) |
| `apps/api/src/admin/admin.service.ts` | 14, 82, 435 | `where: any` | `Prisma.UserWhereInput`, `Prisma.PropertyWhereInput` |

---

## 6. Implementation Plan & Execution Phases

- **Fase 1: Backend Type Safety & Floating Promise Fixes**
  - Buat `RequestUser` type di `@propertyhub/shared`.
  - Hapus semua `@CurrentUser() user: any` di seluruh controller NestJS.
  - Fix `main.ts` floating promise `bootstrap().catch(...)`.
  - Fix regex escapes di `cloudinary.service.ts`.
  - Tambahkan logger pada 11 silent `.catch(() => {})`.
- **Fase 2: Frontend React 19 Hook & JSX Compliance**
  - Hapus `setState` di dalam `useEffect` pada 4 komponen pencarian.
  - Fix `admin-charts.tsx` mutasi variabel render.
  - Bungkus `similar-properties.tsx` dengan Error Boundary yang benar.
  - Ganti `<img>` dengan `<Image />` di properti detail page dan berikan `alt`.
- **Fase 3: Eliminasi Total 70+ `any` Types**
  - Terapkan generic types dari `@propertyhub/shared` pada admin reports, settings, saved searches, dan bandingkan.
- **Fase 4: Quality Gate Verification**
  - Eksekusi `turbo lint`: target **0 errors, 0 warnings**.
  - Eksekusi `turbo test`: target **100% pass**.
  - Eksekusi `turbo build`: target **100% clean**.

Dokumen ini siap ditinjau.
