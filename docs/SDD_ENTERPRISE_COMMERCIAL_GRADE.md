# Software Design Document (SDD): Enterprise Commercial Grade
**System:** PropertyHub — Indonesian Property Marketplace Platform  
**Target Milestone:** Public Commercial Launch & Investment Readiness (Rumah123 Parity)  
**Document Version:** 2.1.0  
**Status:** PROPOSED FOR REVIEW  

---

## 1. Executive Summary & Business Vision

PropertyHub adalah platform marketplace properti nasional di Indonesia yang dirancang untuk bersaing langsung dengan pemain utama (Rumah123, Rumah.com, OLX Properti). 

### 1.1 Core Business Model (Unit Economics & MRR)
Platform mengadopsi model **Freemium & Micro-Monetization**:
1. **Free Tier (Flywheel Akuisisi)**: Setiap pemilik properti / agen baru mendapatkan kuota **3 listing gratis**.
2. **Paid Agent Subscriptions (Recurring Revenue / MRR)**:
   - **Starter** (Rp 149.000 / bln): 10 Kuota Listing + 5 Kuota Sundul.
   - **Pro Broker** (Rp 399.000 / bln): 50 Kuota Listing + 25 Kuota Sundul + 2 Featured Listing + Badge Verifikasi Agen.
   - **Enterprise Office** (Rp 999.000 / 3 bln): 200 Kuota Listing + 100 Kuota Sundul + 5 Featured Listing + Badge Verifikasi Agen.
3. **Pay-Per-Feature (Micro-Transactions)**:
   - **Sundul / Bump Listing**: Rp 15.000 / sundul (reset organic freshness ke posisi teratas).
   - **Featured Listing Tiers**: Basic (Rp 99.000/mgg), Premium (Rp 299.000/mgg), Ultimate (Rp 599.000/bln).

---

## 2. Target Enterprise Topology

```mermaid
graph TD
    Client[Web Client: Next.js 16 App Router] -->|HTTPS| CDN[Edge CDN / Cloudflare]
    CDN -->|Dynamic Web Requests| WebApp[Next.js 16 Standalone Pod :3004]
    CDN -->|API Requests| API[NestJS API Gateway Cluster :3003]
    
    subgraph "Core API Micro-Layers"
        API --> AuthModule[Auth & Session Service]
        API --> PropertyModule[Property & Ranking Engine]
        API --> PackageModule[Monetization & Quota Engine]
        API --> VerificationModule[Agent Verification & Anti-Fraud]
        API --> PaymentModule[Modular Payment Service: Midtrans / Log]
        API --> HealthModule[Liveness / Readiness Probe]
    end

    subgraph "Asynchronous Queue & Cache (Redis)"
        API -->|Cache Reads / Invalidate| Redis[(Redis 7 Cluster :6379)]
        API -->|Dispatch Jobs| JobQueue[(BullMQ Task Queue)]
        JobQueue --> WorkerNode[Background Queue Worker]
        WorkerNode --> EmailService[Email Service: Resend / SMTP]
        WorkerNode --> PushNotifService[In-App Notification Dispatcher]
        WorkerNode --> DigestCron[Weekly Digest Processor]
    end
    
    subgraph "Data & Storage Persistence"
        API -->|Connection Pool| Pooler[PgBouncer Connection Pooler]
        WorkerNode -->|Direct Connection| Pooler
        Pooler --> PG[(PostgreSQL Dedicated Instance :5435)]
        API -->|Signed Direct Uploads| Cloudinary[(Cloudinary Asset Storage)]
        API -->|Snap / Webhooks| MidtransGateway[(Midtrans Payment Gateway)]
    end
    
    subgraph "Observability & SRE"
        API --> Sentry[Sentry Error Tracking & APM]
        WebApp --> Sentry
        API --> Otel[OpenTelemetry / Prometheus Metrics]
    end
```

---

## 3. Detailed Architectural Specifications

### 3.1 Real Health & Readiness Probe (Kubernetes / Docker Compliant)
**Problem**: `GET /health` mengembalikan hardcode `{ status: "ok" }` tanpa memverifikasi koneksi database. Jika PostgreSQL mati atau pool habis, load balancer tetap mengarahkan trafik ke pod yang rusak.  
**Specification**:
- Endpoint: `GET /health` (Liveness) & `GET /health/ready` (Readiness)
- Probing Logic:
  1. Eksekusi query aktif `SELECT 1` ke PostgreSQL via Prisma dengan timeout maksimum 2000ms.
  2. Ping Redis cluster via `redis.ping()` dengan timeout 1000ms.
  3. Catat metrik proses Node.js (`heapUsed`, `rss`, `uptime`).
  4. Response Status:
     - **HTTP 200 OK**: Jika database dan redis sehat (`status: "healthy"`).
     - **HTTP 503 Service Unavailable**: Jika database atau redis gagal terhubung (`status: "unhealthy"`).

```json
{
  "status": "healthy",
  "timestamp": "2026-10-11T14:00:00.000Z",
  "uptime": 3600.5,
  "checks": {
    "database": { "status": "up", "latencyMs": 3.2 },
    "redis": { "status": "up", "latencyMs": 1.1 },
    "memory": { "heapUsedMb": 68.4, "rssMb": 128.2 }
  }
}
```

---

### 3.2 Asynchronous Background Queue (BullMQ / Redis)
**Problem**: Pengiriman email verifikasi, lead notification, dan weekly digest dieksekusi inline di main thread HTTP. Latensi eksternal dari SMTP/Resend membekukan event loop Node.js.  
**Specification**:
- **Queue Engine**: BullMQ berbasis Redis 7 Alpine.
- **Queues**:
  1. `email-queue`: Mengirim email transactional (verifikasi, reset password, lead notice) dengan exponential backoff retry (3x).
  2. `notification-queue`: Memproses in-app notification dispatch tanpa memblokir mutasi user.
  3. `view-analytics-queue`: Mengumpulkan telemetry view counter secara batch per menit, mengurangi penulisan ke PostgreSQL hingga 90%.

---

### 3.3 Redis Caching & Invalidation Layer
**Problem**: 95% akses ke portal marketplace properti adalah operasi baca (search, filter kota, detail properti, homepage stats). Setiap request saat ini mengeksekusi query database langsung.  
**Specification**:
- **Pola Caching**: Cache-Aside Pattern dengan TTL dinamis:
  - Homepage Stats (`/stats`): TTL 300 detik (5 menit).
  - Autocomplete Kota & Wilayah (`/wilayah/*`): TTL 86400 detik (24 jam).
  - Listing Search (`/properties?city=...`): TTL 60 detik dengan hashing parameter query sebagai Redis key.
- **Cache Invalidation (Event-Driven)**:
  - Saat ada properti dibuat, di-update, dihapus, atau disundul: publish event `property:mutated`.
  - Cache tag yang relevan (`properties:*`, `stats:*`) otomatis di-invalidate.

---

### 3.4 Database Connection Pooling & Resilience
**Problem**: Prisma Client secara default membuka koneksi langsung ke PostgreSQL per instance. Pada deployment multi-pod / autoscaling, batas `max_connections` (default 100) akan cepat habis.  
**Specification**:
- Mengintegrasikan PgBouncer di layer infrastruktur (`transaction` pooling mode).
- Mengatur konfigurasi Prisma connection pool di `DATABASE_URL`:
  `postgresql://postgres:postgres@localhost:5435/property?connection_limit=20&pool_timeout=10`
- Query timeout global 5000ms untuk mencegah slow query lock starvation.

---

### 3.5 Observability, APM & Request Tracing
**Problem**: Logging saat ini hanya berupa console output. Tidak ada korelasi ID per request, tidak ada pelacakan error terpusat, dan tidak ada alerting saat transaksi gagal.  
**Specification**:
- **Correlation ID (X-Request-Id)**: Middleware menambahkan UUID unik di setiap incoming request dan menyebarkannya ke seluruh downstream response & log.
- **Sentry Integration**: Pasang Sentry SDK di Backend (`@sentry/node`) dan Frontend (`@sentry/nextjs`) untuk automatic crash reporting dan performance transaction tracing.
- **Structured JSON Logging**: Winston / Pino logger di production untuk konsumsi Datadog / Grafana Loki.

---

### 3.6 Monetization Engine & Quota Lifecycle (Zero Hardcoding)

```mermaid
stateDiagram-v2
    [*] --> CreatePropertyRequest
    CreatePropertyRequest --> CheckActiveListings: User clicks Publish
    CheckActiveListings --> FreeQuotaAvailable: Active Listings < SiteSettings.freeListingQuota (3)
    FreeQuotaAvailable --> PublishSuccess: Published Free
    CheckActiveListings --> CheckSubscription: Active Listings >= Free Quota
    CheckSubscription --> HasRemainingQuota: Subscription ACTIVE & listingQuotaRemaining > 0
    HasRemainingQuota --> DeductQuotaInTx: Decrement listingQuotaRemaining by 1
    DeductQuotaInTx --> PublishSuccess: Published via Package
    CheckSubscription --> InsufficientQuota: No Subscription / Quota = 0
    InsufficientQuota --> RedirectToPackages: HTTP 403 Forbidden with Payload
```

#### Komponen UI & Frontend Funnel:
1. **Halaman `/dashboard/packages`**:
   - Menampilkan 3 kartu paket: Starter, Pro, Enterprise (data bersumber dinamis dari `GET /packages`).
   - Indikator Paket Aktif: Card "Langganan Anda Saat Ini" menampilkan sisa kuota listing, sisa kuota sundul, dan tanggal kadaluarsa.
   - Tombol "Beli Paket" memicu popup Midtrans Snap checkout atau mode log.
2. **Banner Kuota di Dashboard Overview**:
   - Menampilkan progress bar kuota listing: `3 / 10 Listing Terpakai`.

---

### 3.7 Listing Bump / "Sundul" Engine (Pilar 3)

**Tujuan**: Memberikan agen kemampuan menaikkan kembali listing organik ke urutan pertama pencarian tanpa harus membayar featured mingguan penuh.

#### Rules & Invariants:
1. **Cooldown Enforcement**: Properti hanya dapat disundul jika waktu `Date.now() - property.lastBoostedAt >= SiteSettings.bumpCooldownHours` (default: 6 jam).
2. **Quota Deduction**: Mengurangi 1 `bumpQuotaRemaining` dari langganan aktif agen dalam satu transaksi atomik.
3. **Immediate Ranking Refresh**:
   - `lastBoostedAt` diatur ke `new Date()`.
   - `freshnessScore` diatur kembali ke `100`.
   - Menjalankan `rankingService.updatePropertyRanking(propertyId)` secara real-time.

```mermaid
sequenceDiagram
    autonumber
    actor Agent as Agen Properti
    participant UI as Dashboard Properties UI
    participant API as PackagesController
    participant Svc as PackagesService
    participant DB as PostgreSQL (Prisma)
    participant Rank as RankingService

    Agent->>UI: Klik tombol "Sundul Listing"
    UI->>API: POST /packages/bump/:propertyId
    API->>Svc: bumpProperty(userId, propertyId)
    Svc->>DB: Cek kepemilikan & cooldown lastBoostedAt
    alt Masih dalam cooldown (< 6 jam)
        Svc-->>API: 400 Bad Request ("Cooldown tersisa X menit")
        API-->>UI: Toast error cooldown
    else Cooldown lewat & Kuota cukup
        Svc->>DB: Atomic Tx: update bumpQuotaRemaining - 1, update property lastBoostedAt, create bumpLog
        Svc->>Rank: updatePropertyRanking(propertyId)
        Rank->>DB: Recalculate & save rankScore
        Svc-->>API: 200 OK ("Listing berhasil disundul")
        API-->>UI: Toast sukses + UI status diperbarui
    end
```

---

### 3.8 Agent Verification & Anti-Fraud Pipeline (Pilar 4)

**Tujuan**: Membangun kredibilitas trust level platform seperti Rumah123 (Verified Agent badge) serta mencegah listing bodong/scammer.

#### Workflow:
1. **Pengajuan Dokumen oleh Agen (`POST /users/verification`)**:
   - Agen mengisi nomor NIK KTP dan nomor lisensi AREBI.
   - Mengunggah foto KTP dan sertifikat broker (Cloudinary).
   - Sistem otomatis memeriksa tabel `blacklists`: jika nomor telepon atau email ada di daftar hitam, pengajuan langsung ditolak.
2. **Review oleh Administrator (`PATCH /users/verification/:id/review`)**:
   - Status: `APPROVED` atau `REJECTED`.
   - Jika `APPROVED`: field `user.verified` otomatis menjadi `true`, mengirimkan notifikasi in-app.
   - Jika `REJECTED`: menyimpan alasan penolakan (`rejectionReason`) dan memberi kesempatan revisi dokumen.
3. **Badge Proyeksi Publik**:
   - Kartu listing properti dan halaman profil agen (`/agen/[handle]`) otomatis menampilkan badge "Agen Terverifikasi" warna biru dengan ikon centang terverifikasi.

---

### 3.9 Production Packaging & CI/CD Pipeline

#### Production Dockerfile (`Dockerfile.api` & `Dockerfile.web`):
- Multi-stage build berbasis Node.js 20 Alpine / Bun.
- Non-root user execution (`USER node`).
- Next.js Standalone Output (`output: 'standalone'`) untuk memangkas ukuran image dari 1GB+ menjadi ~120MB.

#### CI/CD Workflow (`.github/workflows/ci.yml`):
- Triggers: Push ke branch `main` & Pull Request.
- Jobs:
  1. **Lint & Typecheck**: `turbo lint` & `tsc --noEmit`.
  2. **Unit Tests**: `turbo test` (33 BE tests + 12 FE tests wajib 100% pass).
  3. **Build Check**: `turbo build`.

---

## 4. Database Schema Delta & Integrity Matrix

Tabel dan relasi yang mendukung operasional komersial enterprise:

| Tabel | Tujuan | Strategi Integritas |
|---|---|---|
| `ad_packages` | Katalog paket kuota agen | Configurable via Admin/DB, soft-disable via `isActive` |
| `user_subscriptions` | Kepemilikan kuota aktif agen | Index pada `[userId, status]` dan `[expiresAt]`, cascade delete aman |
| `property_bump_logs` | Audit trail riwayat sundul | Index pada `[propertyId, bumpedAt]`, pencegah manipulasi |
| `agent_verifications` | Berkas verifikasi KTP/AREBI | Unique constraint per user, status audit `[status]` |
| `blacklists` | Daftar hitam anti-fraud | Unique constraint pada nomor/email/IP, auto-rejection |
| `transactions` | Log keuangan Midtrans/Log | **`onDelete: Restrict`** (Dilarang hapus record keuangan) |
| `properties` | Listing marketplace | **Soft Delete (`deletedAt`)**, decoupled views counter |

---

## 5. Phased Implementation Roadmap (TDD Driven)

- **Sprint 1: Technical Hardening, SRE & Health Probes**
  - Implementasi real database ping pada `GET /health` dan `GET /health/ready`.
  - Pembuatan `Dockerfile.api`, `Dockerfile.web`, dan `.github/workflows/ci.yml`.
  - Setup Redis service di `docker-compose.yml` untuk caching dan background worker.
- **Sprint 2: Frontend Monetization & Agent Packages UI**
  - Pembuatan halaman `/dashboard/packages` dengan selector tier paket.
  - Integrasi modal pembayaran Midtrans Snap.
  - Komponen Progress Bar Kuota Listing di header dashboard.
- **Sprint 3: Agent Sundul & CRM Experience**
  - Penambahan tombol "Sundul Listing" pada kartu properti di `/dashboard/properties`.
  - Visual feedback countdown timer cooldown sundul.
- **Sprint 4: Verifikasi Agen UI & Admin Queue**
  - Form pengajuan KTP/AREBI di `/dashboard/profile`.
  - Halaman review verifikasi agen di `/admin/verifications`.

Dokumen ini diperbarui secara komprehensif dan siap ditinjau.
