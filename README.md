# 🏠 PropertyHub

**Modern Property Listing Platform with Advanced SEO & Anti-Gaming System**

[![Backend](https://img.shields.io/badge/Backend-100%25-success)](./STATUS.md)
[![Frontend](https://img.shields.io/badge/Frontend-58%25-yellow)](./STATUS.md)
[![API Endpoints](https://img.shields.io/badge/API-43_endpoints-blue)](./docs/API.md)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

---

## 🎯 Overview

PropertyHub adalah platform listing properti modern yang dirancang untuk bersaing dengan pemain besar seperti 99.co dan rumah123. Dilengkapi dengan sistem SEO canggih, anti-gaming mechanisms, dan smart ranking algorithm.

### ✨ Key Features

- 🔍 **SEO-Optimized URLs** - Hierarchical structure untuk maximum visibility
- 🛡️ **Anti-Gaming System** - Spam detection, keyword stuffing prevention
- 📊 **Smart Ranking** - Quality, freshness, engagement-based scoring
- 👮 **Admin Moderation** - Review queue, approve/reject/flag system
- 🖼️ **Image Upload** - Cloudinary integration (max 5MB)
- 🔐 **Secure Auth** - JWT + RBAC (Role-Based Access Control)
- 📱 **Responsive** - Mobile-first design (coming soon)

---

## 🚀 Tech Stack

### Backend
- **Framework:** NestJS 10
- **Language:** TypeScript
- **Database:** PostgreSQL 15
- **ORM:** Prisma 6.19.2
- **Auth:** JWT + Passport
- **Upload:** Cloudinary
- **Validation:** class-validator

### Frontend
- **Framework:** Next.js 16.2.1 (App Router)
- **Language:** TypeScript
- **UI:** shadcn/ui + Tailwind CSS v4
- **State:** React Query + Auth Context
- **HTTP:** Axios
- **Forms:** React Hook Form + Zod

### DevOps
- **Runtime:** Bun (backend) + Node.js (frontend)
- **Database:** Docker (PostgreSQL)
- **Deployment:** Docker Compose (planned)

---

## 📁 Project Structure

```
property-webapp/
├── server/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # User management
│   │   ├── properties/    # Property CRUD + SEO
│   │   ├── leads/         # Contact forms
│   │   ├── favorites/     # Bookmarks
│   │   ├── admin/         # Admin panel + moderation
│   │   ├── cloudinary/    # Image upload
│   │   └── prisma/        # Database service
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   ├── seed.ts        # Seed data
│   │   └── migrations/    # Database migrations
│   └── package.json
│
├── client/                # Next.js Frontend (58% complete)
│   ├── app/
│   │   ├── page.tsx          # Homepage
│   │   ├── login/            # Login page
│   │   ├── register/         # Register page
│   │   ├── properties/       # Listing page (SEO URLs)
│   │   ├── property/         # Detail page
│   │   └── dashboard/        # User dashboard
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Header, Footer
│   │   └── property/         # PropertyCard
│   └── lib/
│       ├── api/              # API services (auth, properties)
│       ├── context/          # Auth context
│       └── providers/        # React Query provider
│
└── docs/                  # Documentation
    ├── API.md            # API documentation (43 endpoints)
    ├── ERD.md            # Database schema
    ├── SEO_STRATEGY.md   # SEO implementation guide
    ├── DEPLOY_GUIDE.md   # Deployment instructions
    └── TODO.md           # Task list
```

---

## 🔧 Installation

### Prerequisites
- Bun >= 1.0.0
- PostgreSQL >= 15
- Docker (optional)

### 1. Clone Repository
```bash
git clone <repository-url>
cd property-webapp
```

### 2. Setup Database
```bash
# Using Docker
docker run -d \
  --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=property \
  -p 5432:5432 \
  postgres:15-alpine

# Or use existing PostgreSQL instance
```

### 3. Backend Setup
```bash
cd server

# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run migrations
bunx prisma migrate dev

# Seed database
bun run seed

# Start development server
bun run start:dev
```

Backend will run on `http://localhost:3001`

### 4. Frontend Setup
```bash
cd client

# Install dependencies
bun install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Start development server
bun run dev
```

Frontend will run on `http://localhost:3000`

---

## 📚 API Documentation

### Base URL
```
http://localhost:3001
```

### Quick Start

#### 1. Register User
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### 3. Create Property
```bash
curl -X POST http://localhost:3001/properties \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Rumah Modern 3 Kamar di Jakarta",
    "description": "Rumah minimalis dengan desain modern",
    "propertyType": "HOUSE",
    "listingType": "SALE",
    "price": 2500000000,
    "address": "Jl. Sudirman No. 123",
    "city": "Jakarta Selatan",
    "district": "Kebayoran Baru",
    "province": "DKI Jakarta",
    "postalCode": "12190",
    "landArea": 150,
    "buildingArea": 120,
    "bedrooms": 3,
    "bathrooms": 2,
    "floors": 2,
    "certificateType": "SHM",
    "yearBuilt": 2023,
    "furnishing": "UNFURNISHED"
  }'
```

#### 4. Browse Properties
```bash
# All for sale
curl http://localhost:3001/properties/jual

# Houses for sale
curl http://localhost:3001/properties/jual/rumah

# Houses in Jakarta Selatan
curl http://localhost:3001/properties/jual/rumah/jakarta-selatan

# Houses in specific district
curl http://localhost:3001/properties/jual/rumah/jakarta-selatan/kebayoran-baru
```

**Full API Documentation:** [docs/API.md](./docs/API.md)

---

## 🎨 SEO Features

### 1. Hierarchical URL Structure
```
/{status}/{jenis}/{kota}/{kecamatan}/{title}

Examples:
/jual/rumah/jakarta-selatan/kebayoran-baru/rumah-modern-3-kamar
/sewa/apartemen/jakarta-pusat/menteng/apartemen-mewah-2-kamar
```

### 2. Category Pages (5 Levels)
- Level 1: `/jual` (all for sale)
- Level 2: `/jual/rumah` (all houses for sale)
- Level 3: `/jual/rumah/jakarta-selatan` (houses in Jakarta Selatan)
- Level 4: `/jual/rumah/jakarta-selatan/kebayoran-baru` (houses in Kebayoran Baru)
- Level 5: `/jual/rumah/jakarta-selatan/kebayoran-baru/rumah-modern` (specific property)

### 3. Smart Ranking Algorithm
Properties ranked by:
- **Quality Score (35%)** - Completeness of listing
- **Freshness Score (25%)** - Recently updated
- **Engagement Score (25%)** - Views, leads, favorites
- **User Reputation (15%)** - Average quality of user's listings
- **Featured Boost** - +50% for paid ads

### 4. Anti-Gaming System
- ✅ Spam keyword detection (20+ keywords)
- ✅ Keyword stuffing prevention (max 2 repetitions)
- ✅ Phone number & URL filtering
- ✅ All caps detection (max 50%)
- ✅ Duplicate title prevention (30 days)
- ✅ Admin moderation queue

**Full SEO Strategy:** [docs/SEO_STRATEGY.md](./docs/SEO_STRATEGY.md)

---

## 👮 Admin Features

### Moderation System
- **Review Queue** - View pending properties
- **Approve** - Activate quality listings
- **Reject** - Block spam/low-quality
- **Flag** - Mark for further review
- **Audit Logs** - Track all moderation actions
- **Ban Users** - Deactivate spam accounts

### Dashboard
- User statistics
- Property statistics
- Lead tracking
- Recent activities
- Moderation queue status

**Admin Credentials (Development):**
```
Email: admin@propertyhub.com
Password: admin123
```

---

## 🧪 Testing

### Backend Tests
```bash
cd server

# Run all tests
bun test

# Run with coverage
bun test:cov

# E2E tests
bun test:e2e
```

### Manual Testing
```bash
# Health check
curl http://localhost:3001/

# Stats
curl http://localhost:3001/stats

# Test all endpoints
./scripts/test-endpoints.sh
```

---

## 📊 Database Schema

### Core Tables
- **users** - User accounts (admin, user)
- **properties** - Property listings
- **property_images** - Property photos
- **property_features** - Property amenities
- **leads** - Contact inquiries
- **favorites** - User bookmarks
- **transactions** - Payment records
- **ModerationLog** - Moderation audit trail

**Full ERD:** [docs/ERD.md](./docs/ERD.md)

---

## 🔐 Security

- ✅ JWT authentication
- ✅ Role-based access control (RBAC)
- ✅ Password hashing (bcrypt)
- ✅ Input validation (class-validator)
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Rate limiting (ready)

---

## 📈 Performance

- ✅ Database indexes (12 indexes)
- ✅ Query optimization
- ✅ Pagination (all list endpoints)
- ✅ Lazy loading (images)
- ✅ Caching ready (Redis)
- ✅ CDN ready (Cloudflare)

---

## 🚀 Deployment

### Docker Compose (Recommended)
```bash
docker-compose up -d
```

### Manual Deployment
See [docs/DEPLOY_GUIDE.md](./docs/DEPLOY_GUIDE.md)

---

## 📝 Environment Variables

### Backend (`server/.env`)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/property"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
PORT=3001
NODE_ENV="development"
```

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Backend Developer** - AI Assistant
- **Frontend Developer** - Coming soon
- **UI/UX Designer** - Coming soon

---

## 📞 Support

- **Documentation:** [docs/](./docs/)
- **Issues:** GitHub Issues
- **Email:** support@propertyhub.com (placeholder)

---

## 🎉 Acknowledgments

- NestJS team for amazing framework
- Prisma team for excellent ORM
- Next.js team for powerful React framework
- shadcn for beautiful UI components

---

**Built with ❤️ using NestJS, Next.js, and PostgreSQL**
