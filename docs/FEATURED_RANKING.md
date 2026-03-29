# Featured Listing & Ranking Algorithm

**Last Updated:** 2026-03-29 WIB

---

## Featured Listing

### Tier & Harga

| Tier | Harga Default | Durasi | Rank Boost | Freshness |
|---|---|---|---|---|
| BASIC | Rp 99.000 | 7 hari | ×1.3 | Freeze di 100 |
| PREMIUM | Rp 299.000 | 7 hari | ×1.5 | Freeze di 100 |
| ULTIMATE | Rp 599.000 | 30 hari | ×2.0 | Freeze di 100 |

Harga dapat diubah admin via **Admin Panel → Pengaturan → Harga** tanpa deploy ulang.

---

### Alur Aktivasi

```
User klik "Promosikan"
        │
        ▼
POST /payments/featured/:propertyId/:type
        │
        ├── Baca harga dari SiteSettings DB
        ├── Buat Transaction (status=PENDING)
        │
        ├── [LOG MODE] → return log-token
        │       │
        │       ▼
        │   POST .../activate → featured langsung aktif
        │
        └── [MIDTRANS] → return snap_token
                │
                ▼
            User bayar di Midtrans UI
                │
                ▼
            Webhook POST /payments/notification
                │
                ▼
            handleNotification() → cek fraud_status
                │
                ▼
            activateFeatured()
```

### Aktivasi Featured

```
activateFeatured(propertyId, featuredType, userId):
  1. Cek apakah sudah featured dan belum expired
     - Jika ya → extend dari featuredUntil (bukan dari sekarang)
     - Jika tidak → mulai dari sekarang
  2. Update: featured=true, featuredUntil, featuredType
  3. Kirim notifikasi in-app ke owner
  4. updatePropertyRanking() → rankScore naik dengan boost tier
```

### Auto-Expire (Cron setiap jam)

```
expireFeaturedListings():
  1. Query: featured=true AND featuredUntil < now()
  2. Batch update: featured=false, featuredType=null
  3. Per properti:
     - updatePropertyRanking() → rankScore turun (boost hilang)
     - Kirim notifikasi "Featured Berakhir" ke owner
```

---

## Ranking Algorithm

### Formula

```
rankScore = (quality × 0.35) + (freshness × 0.25) + (engagement × 0.25) + (reputation × 0.15)

Jika featured=true:
  rankScore × boostMultiplier (1.3 / 1.5 / 2.0)
```

### Komponen

**1. Quality Score (0-100)**

| Kriteria | Poin |
|---|---|
| Judul ≥ 20 karakter | 10 |
| Deskripsi ≥ 100 karakter | 10 |
| Foto ≥ 3 | 10 |
| Koordinat GPS | 5 |
| Kode pos | 5 |
| Luas tanah | 5 |
| Luas bangunan | 5 |
| Kamar tidur | 5 |
| Kamar mandi | 5 |
| Lantai | 5 |
| Sertifikat | 5 |
| Tahun dibangun | 5 |
| Furnishing | 5 |
| Fitur ≥ 3 | 10 |
| Harga per m² | 10 |

**2. Freshness Score (0-100)**

Decay dari `lastBoostedAt`:
- 0-30 hari: 100 → 50
- 30-90 hari: 50 → 0
- >90 hari: 0

**Saat `featured=true`: freeze di 100 (tidak decay)**

**3. Engagement Score (0-100)**

```
viewScore  = min(views / 10, 30)   → max 30 poin (100 views)
leadScore  = min(leads × 5, 40)    → max 40 poin (8 leads)
favScore   = min(favorites × 3, 30) → max 30 poin (10 favorit)
```

**4. User Reputation (0-100)**

```
base = avgQualityScore semua listing aktif × 0.7
bonus = +10 jika ≥5 listing, +5 jika ≥3 listing
```

---

## Fairness

Sistem dirancang agar adil untuk semua user:

| Aspek | Implementasi |
|---|---|
| Boost berbeda per tier | BASIC 1.3x, PREMIUM 1.5x, ULTIMATE 2x — sesuai harga |
| Freshness freeze saat featured | User yang bayar tidak dirugikan oleh decay waktu |
| Extend dari featuredUntil | Upgrade/perpanjang tidak buang sisa waktu |
| Harga dari DB | Semua user bayar harga yang sama saat transaksi |
| Kualitas tetap dihargai | Listing berkualitas tinggi bisa mengalahkan featured berkualitas rendah |

**Tidak ada jaminan posisi absolut** — featured meningkatkan visibilitas, bukan menjamin posisi 1.

---

## Kapan rankScore Diupdate?

| Event | Trigger |
|---|---|
| User buka detail page | `updatePropertyRanking()` async (non-blocking) |
| Properti diupdate | `boostProperty()` → reset freshness ke 100 |
| Featured diaktifkan | `updatePropertyRanking()` |
| Featured expired (cron) | `updatePropertyRanking()` |
| Cron batch (opsional) | `updateAllRankings()` — belum dijadwalkan |

---

## Payment Provider

Modular — bisa ganti tanpa ubah business logic:

| Provider | Konfigurasi | Behavior |
|---|---|---|
| `log` (default) | `PAYMENT_PROVIDER=log` | Log ke console, featured langsung aktif via `/activate` |
| `midtrans` | `PAYMENT_PROVIDER=midtrans` + keys | Snap payment UI, aktivasi via webhook |
