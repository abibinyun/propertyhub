# Entity Relationship Diagram (ERD)

**Last Updated:** 2026-03-29 WIB
**Database:** PostgreSQL 15+ via Prisma ORM
**Total Tables:** 17

---

## Diagram

```
User ──────────────────────────────────────────────────────────────────┐
 │                                                                      │
 ├─1:N─► Property ──1:N─► PropertyImage                                │
 │            │ ──1:N─► PropertyFeature                                 │
 │            │ ──1:N─► PropertyView                                    │
 │            │ ──1:N─► Lead ◄──N:1── User                             │
 │            │ ──1:N─► Transaction ◄──N:1── User                      │
 │            │ ──1:N─► Favorite ◄──N:1── User                         │
 │            │ ──1:N─► ModerationLog ◄──N:1── User (admin)            │
 │            │ ──1:N─► Report ◄──N:1── User                           │
 │            │ ──1:N─► PriceHistory                                    │
 │            │                                                         │
 ├─1:N─► SavedSearch                                                    │
 ├─1:N─► Notification                                                   │
 ├─1:N─► Review (as author) ◄──N:1── User (as agent) ──────────────────┘

SiteSettings (singleton, id='default')
```

---

## Tables

### User
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| email | VARCHAR UNIQUE | |
| password | VARCHAR | bcrypt hashed |
| name | VARCHAR | |
| phone | VARCHAR? | |
| avatar | VARCHAR? | Cloudinary URL |
| role | ENUM | USER, ADMIN |
| company | VARCHAR? | Agen info |
| license | VARCHAR? | Agen info |
| verified | BOOLEAN | Default false |
| emailVerified | BOOLEAN | Default false |
| verificationToken | VARCHAR? UNIQUE | |
| verificationTokenExpiry | TIMESTAMP? | |
| resetToken | VARCHAR? UNIQUE | |
| resetTokenExpiry | TIMESTAMP? | |
| refreshToken | VARCHAR? UNIQUE | |
| refreshTokenExpiry | TIMESTAMP? | |
| isBanned | BOOLEAN | Default false |
| banReason | VARCHAR? | |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

---

### Property
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| userId | UUID FK | → User |
| title | VARCHAR | |
| description | TEXT | |
| slug | VARCHAR UNIQUE | SEO URL |
| propertyType | ENUM | HOUSE/APARTMENT/LAND/COMMERCIAL/VILLA/WAREHOUSE |
| listingType | ENUM | SALE/RENT |
| price | DECIMAL(15,2) | |
| address | VARCHAR | |
| city | VARCHAR | |
| district | VARCHAR | |
| province | VARCHAR | |
| postalCode | VARCHAR? | |
| latitude | DECIMAL? | |
| longitude | DECIMAL? | |
| landArea | INT? | m² |
| buildingArea | INT? | m² |
| bedrooms | INT? | |
| bathrooms | INT? | |
| floors | INT? | |
| garage | INT? | |
| certificateType | VARCHAR? | SHM/HGB/dll |
| yearBuilt | INT? | |
| furnishing | ENUM? | UNFURNISHED/SEMI/FULLY |
| videoUrl | VARCHAR? | YouTube URL |
| floorPlanUrl | VARCHAR? | Cloudinary URL |
| status | ENUM | DRAFT/ACTIVE/SOLD/RENTED/INACTIVE |
| moderationStatus | ENUM | PENDING/APPROVED/REJECTED/FLAGGED |
| moderatedBy | VARCHAR? | Admin user ID |
| moderatedAt | TIMESTAMP? | |
| moderationNotes | TEXT? | |
| flagReason | VARCHAR? | Auto-flag reason |
| flaggedAt | TIMESTAMP? | |
| featured | BOOLEAN | Default false |
| featuredUntil | TIMESTAMP? | |
| featuredType | ENUM? | BASIC/PREMIUM/ULTIMATE |
| viewsCount | INT | Default 0 (all-time counter) |
| leadsCount | INT | Default 0 |
| qualityScore | INT | 0-100, lihat Ranking Algorithm |
| freshnessScore | INT | 0-100, freeze saat featured=true |
| rankScore | DECIMAL | Combined score, dipakai untuk sort |
| lastBoostedAt | TIMESTAMP | Reset saat properti diupdate |
| metaTitle | VARCHAR? | |
| metaDescription | VARCHAR? | |
| publishedAt | TIMESTAMP? | |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

**Indexes:**
- `(status, moderationStatus, rankScore)` — query listing utama
- `(featured, featuredUntil)` — cron expire featured
- `(listingType, propertyType, city, district)` — SEO URL query

---

### PropertyImage
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| propertyId | UUID FK | → Property (cascade) |
| url | VARCHAR | Cloudinary URL |
| isPrimary | BOOLEAN | Default false |
| order | INT | Display order |
| createdAt | TIMESTAMP | |

Max 20 foto per properti (enforced di service layer).

---

### PropertyFeature
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| propertyId | UUID FK | → Property (cascade) |
| feature | VARCHAR | e.g. swimming_pool, security_24h |

---

### PropertyView
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| propertyId | UUID FK | → Property (cascade) |
| viewedAt | TIMESTAMP | Default now() |
| referrer | VARCHAR? | Max 500 char |
| userAgent | VARCHAR? | Max 500 char |
| country | VARCHAR? | Opsional, untuk geo analytics |

Digunakan untuk analytics per properti: views per hari, top referrers, conversion rate.
Views pemilik properti tidak direcord.

---

### Lead
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| propertyId | UUID FK | → Property (cascade) |
| userId | UUID FK | → User (sender) |
| name | VARCHAR | |
| email | VARCHAR | |
| phone | VARCHAR | |
| message | TEXT | |
| status | ENUM | NEW/CONTACTED/QUALIFIED/CLOSED/LOST |
| source | VARCHAR? | website/whatsapp/phone |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

Rate limit: 3/menit, 10/hari per user. Self-lead dicegah.

---

### Transaction
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| userId | UUID FK | → User |
| propertyId | UUID FK? | → Property |
| type | ENUM | FEATURED_BASIC/PREMIUM/ULTIMATE |
| amount | DECIMAL(15,2) | Diambil dari SiteSettings saat transaksi dibuat |
| status | ENUM | PENDING/PAID/EXPIRED/CANCELLED |
| orderId | VARCHAR? UNIQUE | Midtrans order ID |
| transactionId | VARCHAR? | Midtrans transaction ID |
| paidAt | TIMESTAMP? | |
| expiresAt | TIMESTAMP? | 24 jam setelah dibuat |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

---

### Favorite
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| userId | UUID FK | → User |
| propertyId | UUID FK | → Property |
| createdAt | TIMESTAMP | |

Unique constraint: (userId, propertyId). Self-favorite dicegah.

---

### ModerationLog
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| propertyId | UUID FK | → Property |
| moderatorId | UUID FK | → User (admin) |
| action | ENUM | APPROVED/REJECTED/FLAGGED |
| reason | VARCHAR? | |
| notes | TEXT? | |
| createdAt | TIMESTAMP | |

---

### Report
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| propertyId | UUID FK | → Property |
| userId | UUID FK | → User (reporter) |
| reason | VARCHAR | |
| notes | TEXT? | |
| resolved | BOOLEAN | Default false |
| createdAt | TIMESTAMP | |

Unique constraint: (userId, propertyId) — 1 laporan per user per properti.

---

### SavedSearch
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| userId | UUID FK | → User |
| name | VARCHAR | |
| url | VARCHAR | Path + query string |
| lastSentAt | TIMESTAMP? | Untuk email digest |
| createdAt | TIMESTAMP | |

---

### Notification
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| userId | UUID FK | → User |
| type | VARCHAR | lead_received / property_approved / property_rejected / property_flagged / featured_activated / featured_expired |
| title | VARCHAR | |
| body | VARCHAR | |
| url | VARCHAR? | Deep link |
| read | BOOLEAN | Default false |
| createdAt | TIMESTAMP | |

---

### PriceHistory
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| propertyId | UUID FK | → Property (cascade) |
| price | DECIMAL(15,2) | |
| createdAt | TIMESTAMP | |

Trigger: otomatis dibuat saat `Property.price` berubah via update endpoint.

---

### Review
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| authorId | UUID FK | → User (reviewer) |
| agentId | UUID FK | → User (agen yang direview) |
| rating | INT | 1-5 |
| comment | VARCHAR? | |
| createdAt | TIMESTAMP | |

Unique constraint: (authorId, agentId) — 1 review per pasang user-agen. Self-review dicegah.

---

### SiteSettings
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR PK | Selalu 'default' (singleton) |
| siteName | VARCHAR | Default 'PropertyHub' |
| tagline | VARCHAR | |
| logoUrl | VARCHAR? | Cloudinary URL |
| faviconUrl | VARCHAR? | Cloudinary URL |
| email | VARCHAR? | |
| phone | VARCHAR? | |
| whatsapp | VARCHAR? | Nomor saja |
| address | VARCHAR? | |
| instagram | VARCHAR? | Full URL |
| facebook | VARCHAR? | Full URL |
| tiktok | VARCHAR? | Full URL |
| youtube | VARCHAR? | Full URL |
| twitter | VARCHAR? | Full URL |
| heroTitle | VARCHAR | Teks hero homepage |
| heroSubtitle | VARCHAR | Subteks hero homepage |
| priceBasic | INT | Harga featured BASIC (Rp) |
| pricePremium | INT | Harga featured PREMIUM (Rp) |
| priceUltimate | INT | Harga featured ULTIMATE (Rp) |
| colorTheme | VARCHAR | Fase 2: modern/ocean/forest/sunset |
| homepageLayout | VARCHAR | Fase 2: hero-search/map-first/grid-featured |
| listingLayout | VARCHAR | Fase 2: card-grid/card-list |
| detailLayout | VARCHAR | Fase 2: gallery-top/gallery-side |
| maintenanceMode | BOOLEAN | Default false |
| maintenanceMsg | VARCHAR | Pesan saat maintenance |
| umamiUrl | VARCHAR? | URL Umami analytics |
| umamiSiteId | VARCHAR? | Site ID Umami |
| updatedAt | TIMESTAMP | |

---

## Enums

```
Role:              USER | ADMIN
PropertyType:      HOUSE | APARTMENT | LAND | COMMERCIAL | VILLA | WAREHOUSE
ListingType:       SALE | RENT
Furnishing:        UNFURNISHED | SEMI_FURNISHED | FULLY_FURNISHED
PropertyStatus:    DRAFT | ACTIVE | SOLD | RENTED | INACTIVE
ModerationStatus:  PENDING | APPROVED | REJECTED | FLAGGED
FeaturedType:      BASIC | PREMIUM | ULTIMATE
LeadStatus:        NEW | CONTACTED | QUALIFIED | CLOSED | LOST
TransactionStatus: PENDING | PAID | EXPIRED | CANCELLED
TransactionType:   FEATURED_BASIC | FEATURED_PREMIUM | FEATURED_ULTIMATE
```

---

## Key Business Rules

| Rule | Enforcement |
|---|---|
| Self-favorite dicegah | Service layer |
| Self-lead dicegah | Service layer |
| Self-review dicegah | Service layer |
| 1 review per agen | DB unique constraint |
| Max 20 foto per properti | Service layer |
| Min 3 foto untuk publish | Service layer |
| Views tidak increment untuk pemilik | Service layer |
| Views pemilik tidak direcord ke PropertyView | Service layer |
| Auto-flag: foto<3 / desc<50char / harga<10jt | Service layer saat create/publish |
| Price history trigger | Service layer saat update harga |
| Ban user → semua properti INACTIVE | Service layer (admin.banUser) |
| Banned user → 401 di semua endpoint | JWT strategy (validateUser) |
| Featured expire → featured=false + ranking recalculate | Cron setiap jam |
| Harga featured dari SiteSettings DB | PaymentService.getFeaturedPrices() |

---

## Ranking Algorithm

Setiap properti punya `rankScore` yang dihitung dari 4 komponen:

```
rankScore = (quality × 0.35) + (freshness × 0.25) + (engagement × 0.25) + (reputation × 0.15)
```

| Komponen | Sumber | Keterangan |
|---|---|---|
| qualityScore (0-100) | Kelengkapan listing | Foto, deskripsi, lokasi, spesifikasi, fitur |
| freshnessScore (0-100) | lastBoostedAt | Decay 100→0 dalam 90 hari. **Freeze di 100 saat featured=true** |
| engagementScore (0-100) | viewsCount, leadsCount, favorites | Weighted: leads paling berharga |
| userReputation (0-100) | Avg quality score semua listing user | Bonus untuk user dengan banyak listing berkualitas |

**Featured boost per tier:**

| Tier | Boost | Harga Default | Durasi |
|---|---|---|---|
| BASIC | ×1.3 | Rp 99.000 | 7 hari |
| PREMIUM | ×1.5 | Rp 299.000 | 7 hari |
| ULTIMATE | ×2.0 | Rp 599.000 | 30 hari |

Harga dapat diubah admin via SiteSettings tanpa deploy ulang.
