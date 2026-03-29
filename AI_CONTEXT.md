# AI Context — PropertyHub

Ini adalah file konteks untuk AI. Baca semua bagian sebelum mulai bekerja.

---

## Identitas Project

**Nama:** PropertyHub  
**Tipe:** Platform listing properti fullstack (monorepo)  
**Status:** Production-ready, belum deploy  
**Tujuan:** Bersaing dengan Rumah123, OLX Properti — listing gratis, monetisasi via Featured Listing

---

## Stack Teknis

| Layer | Tech | Port |
|---|---|---|
| Backend | NestJS + PostgreSQL + Prisma + Bun | 3001 |
| Frontend | Next.js 16 (App Router, Turbopack) + Tailwind v4 + shadcn/ui + Bun | 3000 |
| Auth | JWT httpOnly cookie + OAuth Google | - |
| Storage | Cloudinary | - |
| Payment | Midtrans (modular, default: log) | - |
| Email | Resend (modular, default: log) | - |

---

## Struktur Folder

```
property-webapp/
├── dev.sh                    ← jalankan BE + FE sekaligus
├── server/                   ← NestJS backend
│   └── src/
│       ├── auth/             ← JWT, register, login, OAuth Google, password reset
│       ├── email/            ← EmailService modular (log/resend)
│       ├── payment/          ← PaymentService modular (log/midtrans)
│       ├── properties/       ← CRUD, SEO slug, ranking, analytics
│       ├── leads/            ← Contact forms, anti-spam, email notif, export CSV
│       ├── favorites/
│       ├── users/
│       ├── admin/
│       └── cloudinary/
└── client/                   ← Next.js frontend
    ├── app/
    │   ├── (listing)/        ← /jual, /sewa + filter
    │   ├── properti/         ← /properti/[location]/[slug]
    │   ├── dashboard/        ← user dashboard
    │   │   └── properties/[id]/analytics/
    │   ├── admin/
    │   ├── about|contact|privacy|terms/
    │   ├── forgot-password|reset-password/
    │   ├── error.tsx          ← global error boundary
    │   ├── global-error.tsx   ← layout crash handler
    │   └── not-found.tsx
    ├── components/
    │   ├── client/           ← 'use client' components
    │   ├── property/
    │   └── ui/               ← shadcn/ui
    └── lib/
        ├── api/              ← client-side API wrappers
        └── server/           ← server-side fetchers (pakai cookie)
```

---

## Fitur yang Sudah Ada

### Auth
- Register + Login (email/password)
- OAuth Google
- JWT httpOnly cookie (7 hari)
- Email verification
- Password reset via email

### Properti
- CRUD lengkap
- Upload gambar (Cloudinary, max 5MB)
- SEO URL 5 level: `/jual/jakarta-selatan/kebayoran-baru/rumah/nama-properti`
- Ranking algorithm (quality + freshness + engagement + reputation)
- Moderasi admin (PENDING → APPROVED/REJECTED/FLAGGED)
- Analytics per properti (leads per hari, 30 hari)

### Leads
- Form kontak di halaman detail
- Anti-spam (max 3/menit, max 10/hari, no duplikat 24 jam)
- Email notifikasi ke pemilik (via EmailService)
- Export CSV

### Featured Listing (Berbayar)
- BASIC Rp 50rb/minggu, PREMIUM Rp 100rb/minggu, ULTIMATE Rp 200rb/bulan
- Payment modular: log (dev) → Midtrans (prod)

### Dashboard
- Stats, properti, leads (2 tab), favorit, profil
- Analitik per properti (bar chart Recharts)

### Admin
- Dashboard KPI + charts
- Moderasi properti
- Manajemen user (ban/unban, role)
- Semua leads

### Halaman Publik
- Homepage dengan search autocomplete
- Listing dengan filter/sort/pagination
- Detail properti (gallery, peta, similar, sticky contact WA)
- About, Contact, Privacy, Terms
- 404 custom

---

## Aturan Coding Frontend (WAJIB DIPATUHI)

> Lihat `RULES_FE.md` untuk detail lengkap. Ringkasan:

1. **Next.js = UI layer only** — tidak ada business logic di frontend
2. **Server Components by default** — `'use client'` hanya untuk interaksi
3. **Semua data dari NestJS API** — tidak ada akses DB langsung
4. **Fetch di server** — jangan fetch di `useEffect` kalau bisa di server
5. **Semua lewat API wrapper** — `lib/api/` (client) atau `lib/server/api.ts` (server)
6. **No `any`** — semua harus typed
7. **URL properti** — selalu pakai `propertyDetailUrl()` dari `lib/url.ts`
8. **DOM library** — pakai `next/dynamic` dengan `ssr: false`
9. **Image** — pakai `next/image`, bukan `<img>`
10. **Error handling** — semua fetch harus handle network error

---

## Pola Kode yang Harus Diikuti

### Server Component (default)
```tsx
export default async function Page() {
  const data = await serverApi.getSomething().catch(() => fallback);
  return <ClientComponent data={data} />;
}
```

### Client Component
```tsx
'use client';
export function ClientComponent({ data }: Props) {
  const [state, setState] = useState(...);
  // ...
}
```

### API Wrapper (client)
```ts
// lib/api/something.ts
export const somethingApi = {
  getAll: () => apiFetch<Type[]>('/something'),
};
```

### Error handling di server component
```tsx
// Kalau error = notFound
try {
  data = await serverApi.get(id);
} catch { notFound(); }

// Kalau error = fallback
const data = await serverApi.get().catch(() => defaultValue);
```

---

## Modular Systems

### Email
```
EMAIL_PROVIDER=log    → LogEmailProvider (console)
EMAIL_PROVIDER=resend → ResendEmailProvider
```
Tambah provider: implement `EmailProvider` interface di `server/src/email/`

### Payment
```
PAYMENT_PROVIDER=log      → LogPaymentProvider (langsung aktif)
PAYMENT_PROVIDER=midtrans → MidtransPaymentProvider
```
Tambah provider: implement `PaymentProvider` interface di `server/src/payment/`

---

## Environment Variables

### Backend (`server/.env`)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=
APP_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EMAIL_PROVIDER=log
RESEND_API_KEY=
PAYMENT_PROVIDER=log
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
```

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PAYMENT_PROVIDER=log
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
```

---

## Akun Development (Seeder)

| Role | Email | Password |
|---|---|---|
| Admin | admin@propertyhub.com | admin123 |
| Agent | agent1@propertyhub.com | admin123 |
| User | user@propertyhub.com | admin123 |

---

## Cara Jalankan

```bash
cd ~/data/LATIHAN/property-webapp
./dev.sh
# Backend  → http://localhost:3001
# Frontend → http://localhost:3000
```

---

## Backlog (Belum Dikerjakan)

- Deployment (Docker + CI/CD)
- Social proof di homepage (counter real dari DB)
- Export leads ke CSV sudah ada, tapi belum ada endpoint `/contact` untuk form kontak di halaman `/contact`
- Refresh token (access 15min + refresh 7d)
- Notifikasi in-app (bell icon)

---

## Hal Penting yang Harus Diketahui AI

1. **`APP_URL`** di backend = URL backend (3001), bukan frontend
2. **`FRONTEND_URL`** = URL frontend (3000) — dipakai untuk redirect OAuth & email
3. **Properti baru** → `moderationStatus: PENDING` → tidak muncul di listing sampai admin approve
4. **Email dev** → cek log terminal backend untuk link verifikasi & reset password
5. **Payment dev** → `PAYMENT_PROVIDER=log` → featured langsung aktif tanpa bayar
6. **Google OAuth** → redirect URI di Google Console harus `{APP_URL}/auth/google/callback`
7. **Route ordering NestJS** → specific routes harus di atas wildcard (sudah dihandle)
8. **Semua `apiFetch`** sudah handle network error (TypeError: fetch failed)
9. **`error.tsx`** ada di root, dashboard, admin — semua error tertangkap
10. **`global-error.tsx`** untuk layout crash — pakai inline style karena CSS belum tentu load
