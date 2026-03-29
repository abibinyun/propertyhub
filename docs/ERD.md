# Entity Relationship Diagram (ERD)

**Last Updated:** 2026-03-29 WIB
**Database:** PostgreSQL 15+ via Prisma ORM
**Total Tables:** 14

---

## Diagram

```
User ──────────────────────────────────────────────────────────────────┐
 │                                                                      │
 ├─1:N─► Property ──1:N─► PropertyImage                                │
 │            │ ──1:N─► PropertyFeature                                 │
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
| videoUrl | VARCHAR? | YouTube/video URL |
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
| viewsCount | INT | Default 0 |
| leadsCount | INT | Default 0 |
| qualityScore | INT | 0-100 |
| freshnessScore | INT | Decays over time |
| rankScore | DECIMAL | Combined ranking |
| lastBoostedAt | TIMESTAMP | |
| metaTitle | VARCHAR? | |
| metaDescription | VARCHAR? | |
| publishedAt | TIMESTAMP? | |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

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
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

Rate limit: 10 leads/hari per user.

---

### Transaction
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| userId | UUID FK | → User |
| propertyId | UUID FK? | → Property |
| type | ENUM | FEATURED_BASIC/PREMIUM/ULTIMATE |
| amount | DECIMAL(15,2) | |
| status | ENUM | PENDING/PAID/EXPIRED/CANCELLED |
| orderId | VARCHAR? UNIQUE | Midtrans order ID |
| transactionId | VARCHAR? | Midtrans transaction ID |
| paidAt | TIMESTAMP? | |
| expiresAt | TIMESTAMP? | |
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

Unique constraint: (userId, propertyId). Self-favorite dicegah di service.

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
| description | TEXT? | |
| resolved | BOOLEAN | Default false |
| resolvedAt | TIMESTAMP? | |
| createdAt | TIMESTAMP | |

---

### SavedSearch
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| userId | UUID FK | → User |
| name | VARCHAR | |
| filters | JSON | Query params tersimpan |
| createdAt | TIMESTAMP | |

---

### Notification
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| userId | UUID FK | → User |
| type | VARCHAR | lead_new/approved/rejected/price_drop |
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

Unique constraint: (authorId, agentId) — 1 review per pasang user-agen.

---

## Enums

```
Role:             USER | ADMIN
PropertyType:     HOUSE | APARTMENT | LAND | COMMERCIAL | VILLA | WAREHOUSE
ListingType:      SALE | RENT
Furnishing:       UNFURNISHED | SEMI_FURNISHED | FULLY_FURNISHED
PropertyStatus:   DRAFT | ACTIVE | SOLD | RENTED | INACTIVE
ModerationStatus: PENDING | APPROVED | REJECTED | FLAGGED
FeaturedType:     BASIC | PREMIUM | ULTIMATE
LeadStatus:       NEW | CONTACTED | QUALIFIED | CLOSED | LOST
TransactionStatus: PENDING | PAID | EXPIRED | CANCELLED
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
| Auto-flag: foto<3 / desc<50char / harga<10jt | Service layer saat create/publish |
| Price history trigger | Service layer saat update harga |
