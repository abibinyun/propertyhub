# Development Guide - PropertyHub

**Last Updated:** 2026-03-23 20:05 WIB  
**Status:** Backend 100% ✅ | Frontend 58% 🚧

---

## 🚀 Menjalankan Project

### Backend
```bash
cd server
bun run start:dev   # http://localhost:3001
```

### Frontend
```bash
cd client
bun run dev         # http://localhost:3000
```

### Database (jika belum jalan)
```bash
docker start postgres   # atau sesuai nama container
```

---

## 📁 Struktur Penting

```
property-webapp/
├── server/src/
│   ├── auth/           # JWT, register, login
│   ├── users/          # Profile management
│   ├── properties/     # CRUD + SEO slug + ranking
│   │   ├── dto/        # Validation DTOs
│   │   ├── validators/ # Custom title validator
│   │   └── ranking.service.ts
│   ├── leads/          # Contact forms
│   ├── favorites/      # Bookmarks
│   ├── admin/          # Admin + moderation
│   └── cloudinary/     # Image upload
│
├── client/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # UI components
│   └── lib/
│       ├── api/        # Axios services
│       ├── context/    # Auth context
│       └── providers/  # React Query
│
└── docs/               # Dokumentasi
```

---

## 🔑 Akun Development

| Role  | Email                      | Password  |
|-------|----------------------------|-----------|
| Admin | admin@propertyhub.com      | admin123  |
| Agent | agent1@propertyhub.com     | admin123  |
| Agent | agent2@propertyhub.com     | admin123  |
| User  | user@propertyhub.com       | admin123  |

---

## 🌐 API Endpoints Utama

```
POST   /auth/register
POST   /auth/login
GET    /auth/me

GET    /properties              # List dengan filter
GET    /properties/jual         # SEO category
GET    /properties/jual/rumah   # SEO category
GET    /properties/my           # Properti milik user
POST   /properties              # Buat properti (auth)
PATCH  /properties/:slug        # Update (auth, owner)
DELETE /properties/:slug        # Hapus (auth, owner)
POST   /properties/:id/images   # Upload gambar (auth)

POST   /leads                   # Kirim pertanyaan
GET    /leads/my                # Pertanyaan saya
GET    /leads/property/:id      # Leads properti saya

POST   /favorites/:propertyId   # Tambah favorit
DELETE /favorites/:propertyId   # Hapus favorit
GET    /favorites               # Daftar favorit

GET    /admin/stats             # (ADMIN only)
GET    /admin/moderation/queue  # Review queue
PATCH  /admin/moderation/:id/approve
PATCH  /admin/moderation/:id/reject
PATCH  /admin/moderation/:id/flag
```

Dokumentasi lengkap: [docs/API.md](./docs/API.md)

---

## ⚠️ Yang Perlu Diperhatikan

1. **Property baru** dibuat dengan status `DRAFT` dan `moderationStatus: PENDING` — tidak muncul di listing publik sampai di-approve admin
2. **Gambar** di-upload ke Cloudinary. `next/image` butuh domain `res.cloudinary.com` di-whitelist di `next.config.ts` (belum dikonfigurasi)
3. **Slug** format: `jual-rumah-jakarta-selatan-kebayoran-baru-judul-properti`
4. **Ranking** dihitung otomatis saat create/update/view

---

## 📋 Sisa Pekerjaan Frontend

Lihat [TASKS.md](./TASKS.md) dan [docs/TODO.md](./docs/TODO.md) untuk detail lengkap.

Prioritas:
1. Fix `next.config.ts` — whitelist Cloudinary domain
2. Homepage fetch data real
3. Filter & search di listing
4. Edit property + upload gambar
5. Dashboard stats real
6. Favorites, Leads, Profile page
7. Admin panel UI
