# Entity Relationship Diagram (ERD)

## Database Schema Design

### Overview
This document describes the database schema for PropertyHub platform.

---

## Entities & Relationships

```
┌─────────────┐
│    User     │
└─────────────┘
      │ 1
      │
      │ N
┌─────────────┐       ┌─────────────────┐
│  Property   │───N───│ PropertyImage   │
└─────────────┘       └─────────────────┘
      │ 1
      │
      │ N
┌─────────────┐
│PropertyFeature│
└─────────────┘

┌─────────────┐
│    User     │
└─────────────┘
      │ 1
      │
      │ N
┌─────────────┐
│    Lead     │
└─────────────┘
      │ N
      │
      │ 1
┌─────────────┐
│  Property   │
└─────────────┘

┌─────────────┐
│    User     │
└─────────────┘
      │ 1
      │
      │ N
┌─────────────┐
│ Transaction │
└─────────────┘
      │ N
      │
      │ 1
┌─────────────┐
│  Property   │
└─────────────┘

┌─────────────┐
│    User     │
└─────────────┘
      │ 1
      │
      │ N
┌─────────────┐
│  Favorite   │
└─────────────┘
      │ N
      │
      │ 1
┌─────────────┐
│  Property   │
└─────────────┘
```

---

## Entity Details

### 1. User

**Description:** Stores user account information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| name | VARCHAR(100) | NOT NULL | Full name |
| phone | VARCHAR(20) | NULL | Phone number |
| avatar | VARCHAR(500) | NULL | Avatar URL |
| role | ENUM | NOT NULL, DEFAULT 'USER' | USER, ADMIN |
| company | VARCHAR(100) | NULL | Company name (optional) |
| license | VARCHAR(50) | NULL | License number (optional) |
| verified | BOOLEAN | DEFAULT FALSE | Email verified |
| createdAt | TIMESTAMP | DEFAULT NOW() | Registration date |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (email)
- INDEX (role)

**Relationships:**
- 1:N with Property (user can have many properties)
- 1:N with Lead (user can have many leads)
- 1:N with Transaction (user can have many transactions)
- 1:N with Favorite (user can have many favorites)

---

### 2. Property

**Description:** Stores property listing information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK, NOT NULL | Owner user ID |
| title | VARCHAR(200) | NOT NULL | Property title |
| description | TEXT | NOT NULL | Property description |
| slug | VARCHAR(250) | UNIQUE, NOT NULL | URL-friendly slug |
| propertyType | ENUM | NOT NULL | HOUSE, APARTMENT, LAND, COMMERCIAL, VILLA, WAREHOUSE |
| listingType | ENUM | NOT NULL | SALE, RENT |
| price | DECIMAL(15,2) | NOT NULL | Price in IDR |
| pricePerSqm | DECIMAL(10,2) | NULL | Price per sqm |
| address | VARCHAR(500) | NOT NULL | Full address |
| city | VARCHAR(100) | NOT NULL | City |
| province | VARCHAR(100) | NOT NULL | Province |
| postalCode | VARCHAR(10) | NULL | Postal code |
| latitude | DECIMAL(10,8) | NULL | GPS latitude |
| longitude | DECIMAL(11,8) | NULL | GPS longitude |
| landArea | INTEGER | NULL | Land area (sqm) |
| buildingArea | INTEGER | NULL | Building area (sqm) |
| bedrooms | INTEGER | NULL | Number of bedrooms |
| bathrooms | INTEGER | NULL | Number of bathrooms |
| floors | INTEGER | NULL | Number of floors |
| garage | INTEGER | NULL | Garage capacity |
| certificateType | VARCHAR(50) | NULL | SHM, HGB, etc |
| yearBuilt | INTEGER | NULL | Year built |
| furnishing | ENUM | NULL | UNFURNISHED, SEMI_FURNISHED, FULLY_FURNISHED |
| status | ENUM | DEFAULT 'ACTIVE' | DRAFT, ACTIVE, SOLD, RENTED, INACTIVE |
| featured | BOOLEAN | DEFAULT FALSE | Is featured |
| featuredUntil | TIMESTAMP | NULL | Featured expiry date |
| featuredType | ENUM | NULL | BASIC, PREMIUM, ULTIMATE |
| viewsCount | INTEGER | DEFAULT 0 | View counter |
| leadsCount | INTEGER | DEFAULT 0 | Lead counter |
| metaTitle | VARCHAR(200) | NULL | SEO meta title |
| metaDescription | VARCHAR(500) | NULL | SEO meta description |
| publishedAt | TIMESTAMP | NULL | Publish date |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation date |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (userId) REFERENCES User(id)
- UNIQUE INDEX (slug)
- INDEX (userId)
- INDEX (city)
- INDEX (propertyType)
- INDEX (listingType)
- INDEX (status)
- INDEX (featured)
- INDEX (price)
- INDEX (createdAt)
- FULLTEXT INDEX (title, description, address)

**Relationships:**
- N:1 with User (property belongs to one user)
- 1:N with PropertyImage (property has many images)
- 1:N with PropertyFeature (property has many features)
- 1:N with Lead (property has many leads)
- 1:N with Transaction (property has many transactions)
- 1:N with Favorite (property has many favorites)

---

### 3. PropertyImage

**Description:** Stores property images

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| propertyId | UUID | FK, NOT NULL | Property ID |
| url | VARCHAR(500) | NOT NULL | Image URL |
| isPrimary | BOOLEAN | DEFAULT FALSE | Is primary image |
| order | INTEGER | DEFAULT 0 | Display order |
| createdAt | TIMESTAMP | DEFAULT NOW() | Upload date |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (propertyId) REFERENCES Property(id) ON DELETE CASCADE
- INDEX (propertyId)
- INDEX (isPrimary)

**Relationships:**
- N:1 with Property (image belongs to one property)

---

### 4. PropertyFeature

**Description:** Stores property features/amenities

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| propertyId | UUID | FK, NOT NULL | Property ID |
| feature | VARCHAR(100) | NOT NULL | Feature name |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (propertyId) REFERENCES Property(id) ON DELETE CASCADE
- INDEX (propertyId)

**Relationships:**
- N:1 with Property (feature belongs to one property)

**Common Features:**
- swimming_pool
- gym
- security_24h
- parking
- garden
- balcony
- elevator
- playground
- jogging_track
- cctv

---

### 5. Lead

**Description:** Stores property inquiries

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| propertyId | UUID | FK, NOT NULL | Property ID |
| userId | UUID | FK, NOT NULL | Property owner ID |
| name | VARCHAR(100) | NOT NULL | Inquirer name |
| email | VARCHAR(255) | NOT NULL | Inquirer email |
| phone | VARCHAR(20) | NOT NULL | Inquirer phone |
| message | TEXT | NOT NULL | Inquiry message |
| status | ENUM | DEFAULT 'NEW' | NEW, CONTACTED, QUALIFIED, CLOSED, LOST |
| source | VARCHAR(50) | NULL | website, whatsapp, phone |
| createdAt | TIMESTAMP | DEFAULT NOW() | Inquiry date |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (propertyId) REFERENCES Property(id) ON DELETE CASCADE
- FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
- INDEX (propertyId)
- INDEX (userId)
- INDEX (status)
- INDEX (createdAt)

**Relationships:**
- N:1 with Property (lead belongs to one property)
- N:1 with User (lead belongs to one property owner)

---

### 6. Transaction

**Description:** Stores payment transactions for featured ads

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK, NOT NULL | User ID |
| propertyId | UUID | FK, NULL | Property ID |
| type | ENUM | NOT NULL | FEATURED_BASIC, FEATURED_PREMIUM, FEATURED_ULTIMATE |
| amount | DECIMAL(15,2) | NOT NULL | Amount in IDR |
| status | ENUM | DEFAULT 'PENDING' | PENDING, PAID, EXPIRED, CANCELLED |
| paymentMethod | VARCHAR(50) | NULL | bank_transfer, e_wallet, credit_card |
| paymentProof | VARCHAR(500) | NULL | Payment proof URL |
| orderId | VARCHAR(100) | UNIQUE, NULL | Midtrans order ID |
| transactionId | VARCHAR(100) | NULL | Midtrans transaction ID |
| paidAt | TIMESTAMP | NULL | Payment date |
| expiresAt | TIMESTAMP | NULL | Expiry date |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation date |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
- FOREIGN KEY (propertyId) REFERENCES Property(id) ON DELETE SET NULL
- UNIQUE INDEX (orderId)
- INDEX (userId)
- INDEX (status)
- INDEX (createdAt)

**Relationships:**
- N:1 with User (transaction belongs to one user)
- N:1 with Property (transaction belongs to one property)

---

### 7. Favorite

**Description:** Stores user's favorite properties

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| userId | UUID | FK, NOT NULL | User ID |
| propertyId | UUID | FK, NOT NULL | Property ID |
| createdAt | TIMESTAMP | DEFAULT NOW() | Favorite date |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
- FOREIGN KEY (propertyId) REFERENCES Property(id) ON DELETE CASCADE
- UNIQUE INDEX (userId, propertyId)
- INDEX (userId)
- INDEX (propertyId)

**Relationships:**
- N:1 with User (favorite belongs to one user)
- N:1 with Property (favorite belongs to one property)

---

## Enums

### Role
```typescript
enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}
```

### PropertyType
```typescript
enum PropertyType {
  HOUSE = 'HOUSE',
  APARTMENT = 'APARTMENT',
  LAND = 'LAND',
  COMMERCIAL = 'COMMERCIAL',
  VILLA = 'VILLA',
  WAREHOUSE = 'WAREHOUSE'
}
```

### ListingType
```typescript
enum ListingType {
  SALE = 'SALE',
  RENT = 'RENT'
}
```

### Furnishing
```typescript
enum Furnishing {
  UNFURNISHED = 'UNFURNISHED',
  SEMI_FURNISHED = 'SEMI_FURNISHED',
  FULLY_FURNISHED = 'FULLY_FURNISHED'
}
```

### PropertyStatus
```typescript
enum PropertyStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  RENTED = 'RENTED',
  INACTIVE = 'INACTIVE'
}
```

### FeaturedType
```typescript
enum FeaturedType {
  BASIC = 'BASIC',           // Rp 50k/week
  PREMIUM = 'PREMIUM',       // Rp 100k/week
  ULTIMATE = 'ULTIMATE'      // Rp 200k/month
}
```

### LeadStatus
```typescript
enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  CLOSED = 'CLOSED',
  LOST = 'LOST'
}
```

### TransactionType
```typescript
enum TransactionType {
  FEATURED_BASIC = 'FEATURED_BASIC',
  FEATURED_PREMIUM = 'FEATURED_PREMIUM',
  FEATURED_ULTIMATE = 'FEATURED_ULTIMATE'
}
```

### TransactionStatus
```typescript
enum TransactionStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}
```

---

## Database Constraints

### Referential Integrity
- All foreign keys have ON DELETE CASCADE or ON DELETE SET NULL
- Orphaned records are automatically cleaned up

### Data Integrity
- Email must be valid format
- Phone must be valid format
- Price must be positive
- Area must be positive
- Coordinates must be valid GPS coordinates

### Business Rules
- User can only edit/delete own properties
- Featured ads must have valid expiry date
- Transaction amount must match featured type price
- Lead must have valid email and phone

---

## Performance Considerations

### Indexes
- All foreign keys are indexed
- Frequently queried columns are indexed (city, propertyType, status, etc)
- Full-text search on title, description, address

### Partitioning (Future)
- Partition Property table by createdAt (yearly)
- Partition Transaction table by createdAt (monthly)

### Caching (Future)
- Cache popular properties (Redis)
- Cache search results (Redis)
- Cache user sessions (Redis)

---

## Data Migration Strategy

### Phase 1: Initial Schema
- Create all tables
- Create indexes
- Create constraints

### Phase 2: Seed Data
- Create admin user
- Create sample properties
- Create sample features

### Phase 3: Production Data
- Import existing data (if any)
- Validate data integrity
- Update statistics

---

## Backup Strategy

### Daily Backups
- Full database backup at 2 AM
- Retention: 7 days

### Weekly Backups
- Full database backup every Sunday
- Retention: 4 weeks

### Monthly Backups
- Full database backup on 1st of month
- Retention: 12 months

---

**Document Version:** 1.0  
**Last Updated:** March 23, 2026  
**Database:** PostgreSQL 15+


## 📐 URL STRUCTURE UPDATE (2026-03-23)

### Final Decision:
**Structure:** /{status}/{jenis}/{kota}/{kecamatan}/{title}

**Components (ALL REQUIRED):**
1. Status: jual/sewa (sale/rent)
2. Jenis: rumah/apartemen/tanah/komersial/villa/gudang
3. Kota: jakarta-selatan, bandung, surabaya, etc
4. Kecamatan: kebagusan, dago, gubeng, etc (REQUIRED)
5. Title: rumah-minimalis-modern, etc

**Examples:**
- /jual/rumah/jakarta-selatan/kebagusan/rumah-minimalis-modern
- /sewa/apartemen/bandung/dago/apartemen-studio-furnished

**Dual Language Support:**
- Indonesian (Primary): /jual/rumah/...
- English (Secondary): /sale/house/...

**Filter Pages:**
- /jual/rumah/jakarta-selatan/harga-1m-2m
- /jual/rumah/jakarta-selatan/3-kamar
- /jual/rumah/jakarta-selatan/luas-100-200

**Schema Changes:**
- Added: district field (REQUIRED)
- Added: SEO indexes for category pages

**See:** docs/SEO_STRATEGY.md for complete documentation


