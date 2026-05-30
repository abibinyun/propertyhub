# PropertyHub — Frontend

UI layer untuk platform listing properti. Dibangun dengan Next.js 16 + Tailwind v4 + shadcn/ui.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Runtime**: Bun
- **Maps**: Leaflet + OpenStreetMap (Nominatim untuk geocoding pin)
- **Auth**: Cookie-based (httpOnly, dari backend)

## Setup

```bash
bun install
cp .env.example .env.local
bun run dev
```

App berjalan di `http://localhost:3000`. Pastikan backend sudah jalan di port 3001.

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## URL Structure

```
/                                          → Homepage
/jual                                      → Semua properti dijual
/jual/[city]                               → Per kota
/jual/[city]/[type]                        → Per kota + jenis
/jual/[city]/[district]/[type]             → Per kota + kecamatan + jenis
/sewa/...                                  → Sama untuk sewa
/properti/[location]/[slug]                → Detail properti
/dashboard                                 → Dashboard user
/dashboard/properties                      → Kelola properti
/dashboard/favorites                       → Favorit
/dashboard/leads                           → Leads masuk
/dashboard/profile                         → Edit profil
/admin                                     → Admin panel (ADMIN role)
/login, /register                          → Auth pages
```

## Arsitektur

- **Server Components** by default — semua pages fetch data di server
- **`'use client'`** hanya untuk komponen interaktif (form, map, filter)
- **Cookie auth** — server components baca token dari `next/headers`
- **API wrapper** — semua request lewat `lib/api/` atau `apps/web/lib/server/api.ts`

```
app/                    # Server components (pages)
components/
  client/               # 'use client' components
  property/             # Shared property components
  layout/               # Header, Footer
  ui/                   # shadcn/ui components
lib/
  api/                  # Client-side API wrappers
  server/               # Server-side fetchers
  context/              # Auth context
types/                  # TypeScript interfaces
public/
  wilayah/              # Data wilayah Indonesia (offline)
```

## Data Wilayah Indonesia

Form properti menggunakan data wilayah **offline** untuk dropdown Provinsi → Kota/Kabupaten → Kecamatan.

**Sumber**: [ibnux/data-indonesia](https://github.com/ibnux/data-indonesia) — data wilayah Indonesia lengkap dengan koordinat (lat/lng) per wilayah.

**Teknik**:
- Data di-merge dan disimpan sebagai 2 file JSON statis di `public/wilayah/`:
  - `provinsi-kabupaten.json` (~49KB) — dimuat saat form dibuka
  - `kecamatan.json` (~623KB) — lazy load + in-memory cache, hanya dimuat saat dibutuhkan
- Pilih provinsi/kota/kecamatan → peta otomatis berpindah ke koordinat wilayah tersebut
- Search pin (Nominatim/OpenStreetMap) hanya menggerakkan pin peta, tidak mengubah dropdown
- Saat edit mode, dropdown di-restore dari nama wilayah yang tersimpan dengan cara match nama → id

## SEO

- `generateMetadata()` di semua halaman
- JSON-LD `RealEstateListing` di detail page
- JSON-LD `BreadcrumbList` di listing page
- `sitemap.xml` — auto-generate dari API
- `robots.txt` — block `/dashboard/`, `/admin/`
