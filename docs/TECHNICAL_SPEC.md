# Property Platform - Final Technical Specification

## 🎯 Business Model (Updated)

### Free Listing Model
- ✅ **Semua user bisa listing gratis** (unlimited)
- 💰 **Monetization via Ads:**
  - Featured listing (top placement)
  - Premium badge
  - Homepage spotlight
  - Boosted visibility

### Pricing Strategy
- **Free Tier:** Unlimited listings, basic visibility
- **Featured Ads:**
  - Rp 50k/listing/week - Top search results
  - Rp 100k/listing/week - Homepage placement
  - Rp 200k/listing/month - Premium badge + top placement

---

## 🛠️ Tech Stack (Final)

### Frontend
- **Next.js 15.1.6** (Latest stable, NOT 16.21 - doesn't exist yet)
- **React 19** (Latest)
- **TypeScript**
- **Tailwind CSS 4**
- **shadcn/ui**

### Backend
- **NestJS 10** (Latest)
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL** (Self-hosted)
- **JWT Authentication**

### Infrastructure
- **Development:** Local (localhost)
- **Database:** PostgreSQL (Docker local, then homelab)
- **Storage:** Local filesystem (dev), then homelab
- **Deploy:** GitHub → Homelab Deployer (Traefik + Cloudflare Tunnel)

---

## 📐 Next.js 15 SEO Configuration

### App Router Structure (SEO Optimized)

```typescript
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://yoursite.com'),
  title: {
    default: 'PropertyHub - Jual Beli Properti Terpercaya',
    template: '%s | PropertyHub'
  },
  description: 'Platform jual beli properti terlengkap di Indonesia. Temukan rumah, apartemen, tanah, dan properti komersial impian Anda.',
  keywords: ['jual rumah', 'beli rumah', 'properti', 'real estate', 'apartemen', 'tanah'],
  authors: [{ name: 'PropertyHub' }],
  creator: 'PropertyHub',
  publisher: 'PropertyHub',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://yoursite.com',
    title: 'PropertyHub - Jual Beli Properti Terpercaya',
    description: 'Platform jual beli properti terlengkap di Indonesia',
    siteName: 'PropertyHub',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'PropertyHub'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PropertyHub - Jual Beli Properti Terpercaya',
    description: 'Platform jual beli properti terlengkap di Indonesia',
    images: ['/og-image.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  verification: {
    google: 'your-google-verification-code',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
```

### Dynamic Property Pages (SEO Critical)

```typescript
// app/property/[id]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface Props {
  params: { id: string }
}

// Generate metadata for each property (SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const property = await getProperty(params.id)
  
  if (!property) return {}

  return {
    title: `${property.title} - ${property.city}`,
    description: property.description.substring(0, 160),
    keywords: [
      property.type,
      property.city,
      property.listingType,
      'properti',
      'rumah'
    ],
    openGraph: {
      title: property.title,
      description: property.description,
      images: [property.images[0]?.url],
      type: 'article',
      publishedTime: property.createdAt,
      modifiedTime: property.updatedAt,
    },
    alternates: {
      canonical: `/property/${property.id}`
    }
  }
}

// Static generation for popular properties
export async function generateStaticParams() {
  const properties = await getPopularProperties(100)
  return properties.map((p) => ({ id: p.id }))
}

export default async function PropertyPage({ params }: Props) {
  const property = await getProperty(params.id)
  
  if (!property) notFound()

  // JSON-LD for rich snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    image: property.images.map(img => img.url),
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city,
      addressRegion: property.province,
      addressCountry: 'ID'
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PropertyDetail property={property} />
    </>
  )
}
```

### Sitemap Generation

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): MetadataRoute.Sitemap {
  const properties = await getAllProperties()
  
  const propertyUrls = properties.map((property) => ({
    url: `https://yoursite.com/property/${property.id}`,
    lastModified: property.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [
    {
      url: 'https://yoursite.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://yoursite.com/properties',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    ...propertyUrls,
  ]
}
```

### Robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/'],
      },
    ],
    sitemap: 'https://yoursite.com/sitemap.xml',
  }
}
```

---

## 🗄️ Database Schema (PostgreSQL)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String
  name          String
  phone         String?
  avatar        String?
  role          Role      @default(USER)
  
  // Agent info (optional)
  company       String?
  license       String?
  verified      Boolean   @default(false)
  
  // Relations
  properties    Property[]
  leads         Lead[]
  favorites     Favorite[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([email])
  @@index([role])
}

enum Role {
  USER
  AGENT
  ADMIN
}

model Property {
  id              String          @id @default(uuid())
  userId          String
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Basic info
  title           String
  description     String          @db.Text
  slug            String          @unique
  
  // Type & listing
  propertyType    PropertyType
  listingType     ListingType
  
  // Price
  price           Decimal         @db.Decimal(15, 2)
  pricePerSqm     Decimal?        @db.Decimal(10, 2)
  
  // Location
  address         String
  city            String
  province        String
  postalCode      String?
  latitude        Decimal?        @db.Decimal(10, 8)
  longitude       Decimal?        @db.Decimal(11, 8)
  
  // Specs
  landArea        Int?            // sqm
  buildingArea    Int?            // sqm
  bedrooms        Int?
  bathrooms       Int?
  floors          Int?
  garage          Int?
  
  // Details
  certificateType String?
  yearBuilt       Int?
  furnishing      Furnishing?
  
  // Status
  status          PropertyStatus  @default(ACTIVE)
  
  // Featured (paid ads)
  featured        Boolean         @default(false)
  featuredUntil   DateTime?
  featuredType    FeaturedType?
  
  // Stats
  viewsCount      Int             @default(0)
  leadsCount      Int             @default(0)
  
  // SEO
  metaTitle       String?
  metaDescription String?
  
  // Relations
  images          PropertyImage[]
  features        PropertyFeature[]
  leads           Lead[]
  favorites       Favorite[]
  
  publishedAt     DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([userId])
  @@index([slug])
  @@index([city])
  @@index([propertyType])
  @@index([listingType])
  @@index([status])
  @@index([featured])
  @@index([price])
  @@index([createdAt])
  @@fulltext([title, description, address])
}

enum PropertyType {
  HOUSE
  APARTMENT
  LAND
  COMMERCIAL
  VILLA
  WAREHOUSE
}

enum ListingType {
  SALE
  RENT
}

enum Furnishing {
  UNFURNISHED
  SEMI_FURNISHED
  FULLY_FURNISHED
}

enum PropertyStatus {
  DRAFT
  ACTIVE
  SOLD
  RENTED
  INACTIVE
}

enum FeaturedType {
  BASIC       // Rp 50k/week - Top search
  PREMIUM     // Rp 100k/week - Homepage
  ULTIMATE    // Rp 200k/month - Premium badge + top
}

model PropertyImage {
  id          String    @id @default(uuid())
  propertyId  String
  property    Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  url         String
  isPrimary   Boolean   @default(false)
  order       Int       @default(0)
  createdAt   DateTime  @default(now())
  
  @@index([propertyId])
}

model PropertyFeature {
  id          String    @id @default(uuid())
  propertyId  String
  property    Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  feature     String    // swimming_pool, gym, security, etc
  
  @@index([propertyId])
}

model Lead {
  id          String      @id @default(uuid())
  propertyId  String
  property    Property    @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name        String
  email       String
  phone       String
  message     String      @db.Text
  
  status      LeadStatus  @default(NEW)
  source      String?     // website, whatsapp, phone
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  @@index([propertyId])
  @@index([userId])
  @@index([status])
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  CLOSED
  LOST
}

model Favorite {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  propertyId  String
  property    Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  
  @@unique([userId, propertyId])
  @@index([userId])
}

model Transaction {
  id              String            @id @default(uuid())
  userId          String
  propertyId      String?
  
  type            TransactionType
  amount          Decimal           @db.Decimal(15, 2)
  status          TransactionStatus @default(PENDING)
  
  paymentMethod   String?
  paymentProof    String?
  
  // Midtrans
  orderId         String?           @unique
  transactionId   String?
  
  paidAt          DateTime?
  expiresAt       DateTime?
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  @@index([userId])
  @@index([status])
}

enum TransactionType {
  FEATURED_BASIC
  FEATURED_PREMIUM
  FEATURED_ULTIMATE
}

enum TransactionStatus {
  PENDING
  PAID
  EXPIRED
  CANCELLED
}
```

---

## 📁 Project Structure

```
property-webapp/
├── frontend/                       # Next.js 15
│   ├── app/
│   │   ├── (public)/              # Public routes
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── properties/        # Property listing
│   │   │   │   └── page.tsx
│   │   │   ├── property/          # Property detail
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── about/
│   │   │   └── contact/
│   │   ├── (auth)/                # Auth routes
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/           # Protected routes
│   │   │   ├── dashboard/
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx       # My properties
│   │   │   │   ├── new/           # Add property
│   │   │   │   └── [id]/edit/     # Edit property
│   │   │   ├── leads/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   ├── lib/
│   └── package.json
│
├── backend/                        # NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── properties/
│   │   │   ├── leads/
│   │   │   └── transactions/
│   │   ├── common/
│   │   ├── config/
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── docs/
│   ├── BUSINESS_ANALYSIS.md
│   ├── ARCHITECTURE_DECISION.md
│   └── TECHNICAL_SPEC.md
│
└── README.md
```

---

## 🚀 Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Docker (optional, for local DB)

### Local Development

**1. Database (Docker):**
```bash
docker run --name property-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=property \
  -p 5432:5432 \
  -d postgres:15-alpine
```

**2. Backend:**
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev  # Port 3001
```

**3. Frontend:**
```bash
cd frontend
npm install
npm run dev  # Port 3000
```

---

## 🏠 Homelab Deployment

### Architecture
```
GitHub Push
    ↓
Homelab Deployer (Webhook)
    ↓
Docker Build
    ↓
Traefik (Reverse Proxy)
    ↓
Cloudflare Tunnel
    ↓
Public Access
```

### Docker Compose (Homelab)
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=https://api.property.yourdomain.com
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.property-frontend.rule=Host(`property.yourdomain.com`)"
  
  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/property
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.property-backend.rule=Host(`api.property.yourdomain.com`)"
  
  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=property

volumes:
  postgres-data:
```

---

## ✅ Next Steps

1. **Review & Approve** tech stack
2. **Setup projects** (frontend + backend)
3. **Database schema** implementation
4. **Start building** MVP features

**Ready to start?** Saya bisa langsung setup project structure sekarang!
