# PropertyHub API Documentation

**Base URL:** `http://localhost:3001`
**Version:** 1.5.0
**Last Updated:** 2026-03-29 WIB
**Swagger UI:** `http://localhost:3001/api/docs` (dev only)

**Total Endpoints:** 82

---

## 📊 Summary

| Module | Endpoints |
|---|---|
| Auth | 10 |
| Users | 7 |
| Properties | 18 |
| Leads | 7 |
| Favorites | 6 |
| Payment | 3 |
| Reviews | 3 |
| Reports | 3 |
| Saved Searches | 3 |
| Notifications | 3 |
| Settings | 4 |
| Admin | 13 |
| System | 2 |

---

## 🔐 Authentication

All protected endpoints require JWT cookie (`token`, httpOnly).

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /auth/register | - | Register user baru |
| POST | /auth/login | - | Login, set httpOnly cookie (access 15min + refresh 7d) |
| POST | /auth/logout | ✅ | Hapus cookie + revoke refresh token |
| POST | /auth/refresh | - | Refresh access token via `refresh_token` cookie |
| GET | /auth/me | ✅ | Get current user |
| GET | /auth/google | - | Redirect ke Google OAuth |
| GET | /auth/google/callback | - | Callback Google, set cookie, redirect ke `/dashboard` |
| GET | /auth/verify-email | - | Verifikasi email via token query param |
| POST | /auth/resend-verification | ✅ | Kirim ulang email verifikasi |
| POST | /auth/forgot-password | - | Kirim email reset password |
| POST | /auth/reset-password | - | Reset password dengan token |

---

## 👤 Users

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /users/profile | ✅ | Get profil sendiri |
| PATCH | /users/profile | ✅ | Update profil (name, phone, company, avatar) |
| PATCH | /users/password | ✅ | Ganti password (butuh currentPassword) |
| GET | /users/stats | ✅ | Dashboard stats (properties/leads/favorites/views) |
| GET | /users/:id/public | - | Profil publik agen (listing aktif + avg rating) |

---

## 🏠 Properties

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /properties | ✅ | Buat listing baru |
| PATCH | /properties/:slug | ✅ | Update listing (owner/admin) |
| DELETE | /properties/:slug | ✅ | Hapus listing (owner/admin) |
| GET | /properties | - | List semua properti (filter/sort/pagination) |
| GET | /properties/my | ✅ | Listing milik sendiri (search/filter/sort/pagination) |
| GET | /properties/my/analytics/:propertyId | ✅ | Leads per hari 30 hari terakhir |
| GET | /properties/my/price-history/:propertyId | ✅ | Riwayat harga (owner) |
| GET | /properties/price-history/:slug | - | Riwayat harga (public) |
| GET | /properties/properti/detail/:slug | - | Detail by slug (views+1 kecuali owner) |
| GET | /properties/properti/:location/:slug | - | Detail by location+slug (SEO URL) |
| GET | /properties/:status/:city/:district/:type | - | List by kota+kecamatan+tipe |
| GET | /properties/:status/:city/:type | - | List by kota+tipe |
| GET | /properties/:status/:type | - | List by tipe |
| GET | /properties/:status | - | List by status (jual/sewa) |
| POST | /properties/:id/images | ✅ | Upload foto (max 5MB, rate limit: 20/10mnt) |
| PATCH | /properties/images/:imageId/primary | ✅ | Set foto utama |
| DELETE | /properties/images/:imageId | ✅ | Hapus foto |
| POST | /properties/:id/floor-plan | ✅ | Upload denah lantai (max 5MB, rate limit: 10/10mnt) |
| DELETE | /properties/:id/floor-plan | ✅ | Hapus denah lantai |

**Query params untuk list endpoints:**
`page`, `limit`, `sort`, `search`, `minPrice`, `maxPrice`, `bedrooms`, `propertyType`, `listingType`, `city`, `district`, `province`, `lat`, `lng`, `radius`

---

## 📩 Leads

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /leads | ✅ | Kirim lead/inquiry (rate limit: 3/mnt, 10/hari) |
| GET | /leads/unread-count | ✅ | Jumlah lead belum dibaca |
| GET | /leads/received/export | ✅ | Export leads diterima ke CSV |
| GET | /leads/received | ✅ | Leads yang saya terima (search/filter/pagination) |
| GET | /leads/my | ✅ | Leads yang saya kirim (search/filter/pagination) |
| GET | /leads/property/:propertyId | ✅ | Leads untuk properti tertentu (owner) |
| PATCH | /leads/:id/status | ✅ | Update status lead (NEW/READ/REPLIED/CLOSED) |

---

## ❤️ Favorites

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /favorites/:propertyId | ✅ | Tambah favorit (self-favorite dicegah) |
| DELETE | /favorites/:propertyId | ✅ | Hapus favorit |
| GET | /favorites | ✅ | List favorit saya |
| GET | /favorites/ids | ✅ | Array ID properti favorit |
| GET | /favorites/property-counts | ✅ | Count favorit per properti milik saya |
| GET | /favorites/check/:propertyId | ✅ | Cek apakah properti difavoritkan |

---

## 💳 Payment

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /payments/featured/:propertyId/:featuredType | ✅ | Buat transaksi featured (BASIC/PREMIUM/ULTIMATE) |
| POST | /payments/notification | - | Webhook Midtrans |
| POST | /payments/featured/:propertyId/:featuredType/activate | ✅ | Dev: aktifkan langsung (log mode) |

---

## ⭐ Reviews

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /reviews/agent/:agentId | ✅ | Beri review ke agen (1x per agen, self-review dicegah) |
| GET | /reviews/agent/:agentId | - | List review + avg rating agen |

---

## 🚩 Reports

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /reports | ✅ | Laporkan listing (spam/scam/dll) |
| GET | /reports | ADMIN | Semua laporan (filter resolved) |
| PATCH | /reports/:id/resolve | ADMIN | Resolve laporan |

---

## 🔔 Notifications

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /notifications | ✅ | List notifikasi (leads/approve/reject) |
| PATCH | /notifications/:id/read | ✅ | Tandai satu notifikasi dibaca |
| PATCH | /notifications/read-all | ✅ | Tandai semua notifikasi dibaca |

---

## 🔖 Saved Searches

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /saved-searches | ✅ | List saved searches |
| POST | /saved-searches | ✅ | Simpan filter pencarian (name + url) |
| DELETE | /saved-searches/:id | ✅ | Hapus saved search |

---

## 🛡️ Admin

Semua endpoint admin butuh role `ADMIN`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /admin/stats | ADMIN | KPI stats + charts (properti/user/leads/kota) |
| GET | /admin/users | ADMIN | List users (filter/search/pagination) |
| PATCH | /admin/users/:id | ADMIN | Update user (role/verified) |
| PATCH | /admin/users/:id/ban | ADMIN | Ban user dengan alasan |
| GET | /admin/properties | ADMIN | List semua properti |
| PATCH | /admin/properties/:id/status | ADMIN | Update status properti |
| DELETE | /admin/properties/:id | ADMIN | Hapus properti |
| GET | /admin/moderation/queue | ADMIN | Antrian moderasi (filter status) |
| GET | /admin/moderation/logs | ADMIN | Log moderasi |
| PATCH | /admin/moderation/:id/approve | ADMIN | Approve listing |
| PATCH | /admin/moderation/:id/reject | ADMIN | Reject listing (butuh reason) |
| PATCH | /admin/moderation/:id/flag | ADMIN | Flag listing (butuh reason) |
| GET | /admin/leads | ADMIN | Semua leads |

---

## 🖥️ System

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /health | - | Health check (`{ status: 'ok', timestamp }`) |
| GET | /stats | - | Social proof stats (properties/agents/leads/users) |

---

## 📝 Request/Response Examples

### POST /auth/login
```json
// Request
{ "email": "user@example.com", "password": "password123" }

// Response 200
{ "id": "uuid", "email": "user@example.com", "name": "John", "role": "USER", "emailVerified": true }
// Sets httpOnly cookies: token (15min) + refresh_token (7d)
```

### POST /properties
```json
// Request
{
  "title": "Rumah Modern 3KT di Kebayoran",
  "description": "Rumah minimalis modern...",
  "propertyType": "HOUSE",
  "listingType": "SALE",
  "price": 2500000000,
  "address": "Jl. Melati No. 5",
  "city": "Jakarta Selatan",
  "district": "Kebayoran Baru",
  "province": "DKI Jakarta",
  "landArea": 150,
  "buildingArea": 120,
  "bedrooms": 3,
  "bathrooms": 2,
  "videoUrl": "https://youtube.com/watch?v=xxx",
  "features": ["swimming_pool", "security_24h"]
}
```

### GET /reviews/agent/:agentId
```json
// Response 200
{
  "reviews": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Agen sangat responsif",
      "createdAt": "2026-03-29T...",
      "author": { "name": "Budi", "avatar": null }
    }
  ],
  "avgRating": 4.8,
  "totalReviews": 12
}
```

---

## ⚠️ Error Responses

| Status | Description |
|---|---|
| 400 | Bad Request — validasi gagal |
| 401 | Unauthorized — tidak login / token expired |
| 403 | Forbidden — bukan pemilik / bukan admin |
| 404 | Not Found |
| 409 | Conflict — duplikat (favorit, review, dll) |
| 429 | Too Many Requests — rate limit |
| 500 | Internal Server Error |

```json
// Error format
{ "statusCode": 400, "message": "Minimal 3 foto diperlukan", "error": "Bad Request" }
```

---

## 🔒 Rate Limits

| Scope | Limit |
|---|---|
| Global (short) | 10 req/detik |
| Global (medium) | 100 req/menit |
| Global (long) | 500 req/jam |
| Upload foto | 20 upload/10 menit |
| Upload floor plan | 10 upload/10 menit |
| Kirim lead | 3/menit, 10/hari per user |
