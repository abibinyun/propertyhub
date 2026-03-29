# Rencana: Site Settings + Theme System

**Last Updated:** 2026-03-29 WIB
**Status:** 📋 Planned — belum diimplementasi

---

## Fase 1 — Site Settings

### Database

```prisma
model SiteSettings {
  id              String   @id @default("default")

  // Branding
  siteName        String   @default("PropertyHub")
  tagline         String   @default("Temukan Properti Impian Anda")
  logoUrl         String?
  faviconUrl      String?

  // Contact
  email           String?
  phone           String?
  whatsapp        String?
  address         String?

  // Social Media
  instagram       String?
  facebook        String?
  tiktok          String?
  youtube         String?
  twitter         String?

  // Homepage
  heroTitle       String   @default("Temukan Properti Impian Anda")
  heroSubtitle    String   @default("Jual, beli, dan sewa properti terpercaya di Indonesia")

  // Featured Pricing (rupiah)
  priceBasic      Int      @default(99000)
  pricePremium    Int      @default(299000)
  priceUltimate   Int      @default(599000)

  // Theme
  colorTheme      String   @default("modern")       // modern | ocean | forest | sunset
  homepageLayout  String   @default("hero-search")  // hero-search | map-first | grid-featured
  listingLayout   String   @default("card-grid")    // card-grid | card-list
  detailLayout    String   @default("gallery-top")  // gallery-top | gallery-side

  // System
  maintenanceMode Boolean  @default(false)
  maintenanceMsg  String   @default("Sedang dalam pemeliharaan")

  updatedAt       DateTime @updatedAt
}
```

### Backend Endpoints

```
GET  /settings                    — public, dipakai frontend (ISR 300s)
GET  /admin/settings              — admin only, semua field
PATCH /admin/settings             — admin only, update settings
POST /admin/settings/logo         — upload logo → Cloudinary
POST /admin/settings/favicon      — upload favicon → Cloudinary
```

### Frontend

- `lib/server/settings.ts` — fetch + cache ISR 300s
- Inject ke `app/layout.tsx` → semua halaman dapat settings
- Pakai di:
  - `Header` — logo, site name
  - `Footer` — contact, social media, copyright
  - `app/page.tsx` — hero title, hero subtitle
  - `FeaturedModal` — harga BASIC/PREMIUM/ULTIMATE
  - `<title>` / metadata — site name
- Maintenance mode → `middleware.ts` redirect semua non-admin ke `/maintenance`
- Admin UI → `/admin/settings` dengan tab:
  - **Branding** — site name, tagline, logo, favicon
  - **Kontak & Sosmed** — email, phone, WA, address, social links
  - **Homepage** — hero title, hero subtitle
  - **Harga** — featured listing pricing
  - **Tampilan** — color theme + layout variant (Fase 2)
  - **Sistem** — maintenance mode

---

## Fase 2 — Theme System

### Color Themes (CSS only, tweakcn style)

```
client/themes/presets/
├── modern.css    # default — blue/slate
├── ocean.css     # biru-teal, fresh
├── forest.css    # hijau-earth, natural
└── sunset.css    # orange-warm, energetic
```

Tiap file hanya CSS variable override:
```css
/* ocean.css — contoh */
:root {
  --primary: oklch(0.6 0.2 220);
  --background: oklch(0.98 0.01 220);
  --card: oklch(1 0 0);
  /* dll sesuai tweakcn */
}
```

Inject di `app/layout.tsx` berdasarkan `settings.colorTheme`:
```tsx
import `@/themes/presets/${settings.colorTheme}.css`
```
Semua komponen shadcn/ui otomatis ikut — zero JS overhead.

### Layout Variants

```
client/themes/layouts/
├── homepage/
│   ├── hero-search.tsx     # ✅ sudah ada — hero besar + search bar
│   ├── map-first.tsx       # peta di kiri, listing di kanan
│   └── grid-featured.tsx   # featured properties grid di atas
├── listing/
│   ├── card-grid.tsx       # ✅ sudah ada — grid 3 kolom
│   └── card-list.tsx       # list horizontal, info lebih detail
└── detail/
    ├── gallery-top.tsx     # ✅ sudah ada — gallery full width atas
    └── gallery-side.tsx    # gallery kiri, info kanan (sticky)
```

Switch di level page saja — komponen tetap polos:
```tsx
// app/page.tsx
const Layout = homepageLayouts[settings.homepageLayout]
return <Layout settings={settings} />
```

### Admin Theme Picker

- Tab **Tampilan** di `/admin/settings`
- Color theme: visual swatch picker (4 pilihan)
- Layout: preview thumbnail per variant
- Live preview: iframe dengan `?preview_theme=ocean` query param

---

## Urutan Implementasi

```
Fase 1 — Site Settings (~3-4 jam):
├── [1] Prisma migration SiteSettings + seed default
├── [2] Backend: SettingsModule (service + controller)
├── [3] Frontend: lib/server/settings.ts (ISR 300s)
├── [4] Inject ke layout, header, footer, homepage, featured modal
├── [5] Maintenance mode middleware
└── [6] Admin UI: /admin/settings (semua tab kecuali Tampilan)

Fase 2a — Color Themes (~2-3 jam):
├── [1] Buat 3 CSS preset (ocean, forest, sunset)
├── [2] Inject colorTheme di root layout
└── [3] Admin: color swatch picker di tab Tampilan

Fase 2b — Layout Variants (~6-8 jam):
├── [1] homepage: map-first + grid-featured
├── [2] listing: card-list
├── [3] detail: gallery-side
└── [4] Admin: layout picker dengan thumbnail preview
```

---

## Estimasi

| Fase | Effort |
|---|---|
| Fase 1 — Site Settings | ~3-4 jam |
| Fase 2a — Color Themes (3 preset) | ~2-3 jam |
| Fase 2b — Layout Variants (5 variant baru) | ~6-8 jam |
| **Total** | **~11-15 jam** |
