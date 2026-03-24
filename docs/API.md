# PropertyHub API Documentation

**Base URL:** `http://localhost:3001`  
**Version:** 1.0.0  
**Last Updated:** 2026-03-23

**Total Endpoints:** 43

---

## 📊 Summary

- **Auth:** 3 endpoints
- **Users:** 3 endpoints
- **Properties:** 14 endpoints (including SEO routes)
- **Leads:** 4 endpoints
- **Favorites:** 4 endpoints
- **Admin:** 12 endpoints (including moderation)
- **System:** 3 endpoints

---

## 🔐 Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 📋 Endpoints

### System

#### Health Check
```http
GET /
```

#### Stats
```http
GET /stats
```

**Response:**
```json
{
  "users": 3,
  "properties": 10,
  "message": "PropertyHub API is running!"
}
```

---

### Auth

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+6281234567890" // optional
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "token": "jwt_token"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "verified": true
}
```

---

### Users

#### Get Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+6281234567890",
  "avatar": null,
  "role": "USER",
  "company": "ABC Property",
  "license": "PPAT-12345",
  "verified": true,
  "createdAt": "2026-03-23T07:17:18.291Z"
}
```

#### Update Profile
```http
PATCH /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+6281111111111",
  "avatar": "https://...",
  "company": "XYZ Property",
  "license": "PPAT-67890"
}
```

#### Get User Stats
```http
GET /users/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "properties": 5,
  "leads": 12
}
```

---

### Properties

#### Create Property
```http
POST /properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Rumah Minimalis Modern",
  "description": "Rumah dengan desain modern...",
  "propertyType": "HOUSE", // HOUSE, APARTMENT, LAND, COMMERCIAL, VILLA, WAREHOUSE
  "listingType": "SALE", // SALE, RENT
  "price": 2500000000,
  "address": "Jl. Raya No. 123",
  "city": "Jakarta Selatan",
  "province": "DKI Jakarta",
  "postalCode": "12520", // optional
  "landArea": 100, // optional
  "buildingArea": 120, // optional
  "bedrooms": 3, // optional
  "bathrooms": 2, // optional
  "floors": 2, // optional
  "garage": 1, // optional
  "certificateType": "SHM", // optional
  "yearBuilt": 2022, // optional
  "furnishing": "SEMI_FURNISHED", // optional: UNFURNISHED, SEMI_FURNISHED, FULLY_FURNISHED
  "features": ["swimming_pool", "gym", "security_24h"] // optional
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Rumah Minimalis Modern",
  "slug": "rumah-minimalis-modern-1774252124679",
  "status": "DRAFT",
  "price": "2500000000",
  "city": "Jakarta Selatan",
  "features": [
    { "id": "uuid", "feature": "swimming_pool" }
  ],
  "images": [],
  "createdAt": "2026-03-23T..."
}
```

#### List Properties (with filters)
```http
GET /properties?city=Jakarta&propertyType=HOUSE&listingType=SALE&minPrice=1000000&maxPrice=5000000000&page=1&limit=10
```

**Query Parameters:**
- `city` (string, optional): Filter by city (case-insensitive)
- `propertyType` (string, optional): HOUSE, APARTMENT, LAND, etc.
- `listingType` (string, optional): SALE or RENT
- `minPrice` (number, optional): Minimum price
- `maxPrice` (number, optional): Maximum price
- `page` (number, default: 1): Page number
- `limit` (number, default: 10): Items per page

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Rumah Minimalis Modern",
      "slug": "rumah-minimalis-modern-...",
      "price": "2500000000",
      "city": "Jakarta Selatan",
      "propertyType": "HOUSE",
      "listingType": "SALE",
      "status": "ACTIVE",
      "images": [
        {
          "url": "https://...",
          "isPrimary": true
        }
      ],
      "user": {
        "name": "John Doe",
        "phone": "+6281234567890",
        "company": "ABC Property"
      }
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### Get My Properties
```http
GET /properties/my
Authorization: Bearer <token>
```

**Response:** Array of properties (same structure as list)

#### Get Property Detail
```http
GET /properties/:slug
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Rumah Minimalis Modern",
  "slug": "rumah-minimalis-modern-...",
  "description": "Full description...",
  "price": "2500000000",
  "propertyType": "HOUSE",
  "listingType": "SALE",
  "address": "Jl. Raya No. 123",
  "city": "Jakarta Selatan",
  "province": "DKI Jakarta",
  "landArea": 100,
  "buildingArea": 120,
  "bedrooms": 3,
  "bathrooms": 2,
  "status": "ACTIVE",
  "viewsCount": 42,
  "leadsCount": 5,
  "images": [
    {
      "id": "uuid",
      "url": "https://...",
      "isPrimary": true,
      "order": 0
    }
  ],
  "features": [
    { "id": "uuid", "feature": "swimming_pool" }
  ],
  "user": {
    "name": "John Doe",
    "phone": "+6281234567890",
    "email": "john@example.com",
    "company": "ABC Property"
  },
  "createdAt": "2026-03-23T..."
}
```

#### Update Property
```http
PATCH /properties/:slug
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 2800000000,
  "status": "ACTIVE" // DRAFT, ACTIVE, SOLD, RENTED, INACTIVE
}
```

**Note:** Only property owner can update

#### Delete Property
```http
DELETE /properties/:slug
Authorization: Bearer <token>
```

**Note:** Only property owner can delete

---

### Leads

#### Create Lead (Contact Property Owner)
```http
POST /leads
Authorization: Bearer <token>
Content-Type: application/json

{
  "propertyId": "uuid",
  "name": "Buyer Name",
  "email": "buyer@example.com",
  "phone": "+6281234567890",
  "message": "Saya tertarik dengan properti ini",
  "source": "website" // optional
}
```

**Response:**
```json
{
  "id": "uuid",
  "propertyId": "uuid",
  "userId": "uuid",
  "name": "Buyer Name",
  "email": "buyer@example.com",
  "phone": "+6281234567890",
  "message": "Saya tertarik...",
  "status": "NEW",
  "source": "website",
  "property": {
    "title": "Rumah Minimalis Modern",
    "slug": "rumah-minimalis-modern-...",
    "city": "Jakarta Selatan"
  },
  "createdAt": "2026-03-23T..."
}
```

#### Get My Leads (Buyer Perspective)
```http
GET /leads/my
Authorization: Bearer <token>
```

**Response:** Array of leads with property details

#### Get Property Leads (Owner Perspective)
```http
GET /leads/property/:propertyId
Authorization: Bearer <token>
```

**Note:** Only property owner can access

**Response:** Array of leads for that property

#### Update Lead Status
```http
PATCH /leads/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CONTACTED" // NEW, CONTACTED, QUALIFIED, CLOSED, LOST
}
```

**Note:** Only property owner can update

---

### Favorites

#### Add to Favorites
```http
POST /favorites/:propertyId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "propertyId": "uuid",
  "createdAt": "2026-03-23T...",
  "property": {
    // Full property details with images
  }
}
```

#### Remove from Favorites
```http
DELETE /favorites/:propertyId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Removed from favorites"
}
```

#### Get All Favorites
```http
GET /favorites
Authorization: Bearer <token>
```

**Response:** Array of favorites with property details

#### Check if Favorited
```http
GET /favorites/check/:propertyId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "isFavorite": true
}
```

---

### System

#### Health Check
```http
GET /
```

**Response:**
```
Hello World!
```

#### System Stats
```http
GET /stats
```

**Response:**
```json
{
  "users": 3,
  "properties": 25,
  "message": "PropertyHub API is running!"
}
```

---

## 🔒 Authorization Rules

### Properties
- Anyone can view active properties
- Only authenticated users can create properties
- Only property owner can update/delete their properties

### Leads
- Only authenticated users can create leads
- Users can view their own leads (buyer perspective)
- Property owners can view leads for their properties

### Favorites
- Only authenticated users can manage favorites
- Users can only access their own favorites

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "message": ["email must be an email", "password must be longer than 6 characters"],
  "error": "Bad Request",
  "statusCode": 400
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "message": "You can only update your own properties",
  "error": "Forbidden",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "message": "Property not found",
  "error": "Not Found",
  "statusCode": 404
}
```

### 409 Conflict
```json
{
  "message": "Email already registered",
  "error": "Conflict",
  "statusCode": 409
}
```

---

## 🧪 Testing

### Test Accounts
```
Admin:
- Email: admin@propertyhub.com
- Password: admin123

Agent:
- Email: agent@example.com
- Password: admin123

User:
- Email: newuser@test.com
- Password: test123
```

### Example cURL Commands

**Login:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@propertyhub.com","password":"admin123"}'
```

**Get Properties:**
```bash
curl http://localhost:3001/properties?city=Jakarta
```

**Create Property:**
```bash
TOKEN="your_jwt_token"
curl -X POST http://localhost:3001/properties \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Property",
    "description": "Test description",
    "propertyType": "HOUSE",
    "listingType": "SALE",
    "price": 1000000,
    "address": "Test Address",
    "city": "Jakarta",
    "province": "DKI Jakarta"
  }'
```

---

**Total Endpoints:** 23  
**Authentication:** JWT Bearer Token  
**Rate Limiting:** Not implemented yet  
**API Version:** v1

---

## 🛡️ Admin Moderation

**Role Required:** ADMIN

### Get Moderation Queue
```http
GET /admin/moderation/queue?status=PENDING&page=1&limit=20
Authorization: Bearer <admin_token>
```

**Query Params:**
- `status`: PENDING | APPROVED | REJECTED | FLAGGED (default: PENDING)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Property Title",
      "moderationStatus": "PENDING",
      "user": {
        "id": "uuid",
        "name": "User Name",
        "email": "user@example.com"
      },
      "images": [...],
      "createdAt": "2026-03-23T10:00:00Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### Approve Property
```http
PATCH /admin/moderation/:id/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "notes": "Good quality listing" // optional
}
```

**Response:**
```json
{
  "message": "Property approved"
}
```

### Reject Property
```http
PATCH /admin/moderation/:id/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Spam title detected", // required
  "notes": "Contains forbidden keywords" // optional
}
```

**Response:**
```json
{
  "message": "Property rejected"
}
```

### Flag Property
```http
PATCH /admin/moderation/:id/flag
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Suspicious pricing", // required
  "notes": "Price seems too low" // optional
}
```

**Response:**
```json
{
  "message": "Property flagged"
}
```

### Get Moderation Logs
```http
GET /admin/moderation/logs?page=1&limit=50
Authorization: Bearer <admin_token>
```

**Query Params:**
- `propertyId`: Filter by property (optional)
- `moderatorId`: Filter by moderator (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "action": "APPROVED",
      "reason": null,
      "notes": "Good quality listing",
      "property": {
        "title": "Property Title",
        "slug": "property-slug"
      },
      "moderator": {
        "name": "Admin Name",
        "email": "admin@example.com"
      },
      "createdAt": "2026-03-23T10:00:00Z"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

### Ban User
```http
PATCH /admin/users/:id/ban
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Spam account" // required
}
```

**Response:**
```json
{
  "message": "User banned and all properties deactivated"
}
```

---

## 📈 SEO Features

### Hierarchical URL Structure

Properties accessible via SEO-friendly URLs:

```
/properties/jual                                    → All for sale
/properties/jual/rumah                              → All houses for sale
/properties/jual/rumah/jakarta-selatan              → Houses in Jakarta Selatan
/properties/jual/rumah/jakarta-selatan/kebagusan    → Houses in Kebagusan
/properties/jual/rumah/jakarta-selatan/kebagusan/rumah-modern-minimalis → Specific property
```

**Translations:**
- `jual` = SALE, `sewa` = RENT
- `rumah` = HOUSE, `apartemen` = APARTMENT, `tanah` = LAND, `komersial` = COMMERCIAL

### Ranking System

Properties automatically ranked by:
- **Quality Score (35%):** Completeness of listing
- **Freshness Score (25%):** Recently updated
- **Engagement Score (25%):** Views, leads, favorites
- **User Reputation (15%):** Average quality of user's listings
- **Featured Boost:** +50% for paid ads

All listings sorted by: `featured DESC, rankScore DESC, createdAt DESC`

### Title Validation

Automatic spam detection:
- ✅ Length: 10-100 characters
- ✅ No spam keywords (murah banget, gratis, bonus, etc)
- ✅ No keyword stuffing (max 2 repetitions)
- ✅ No phone numbers or URLs
- ✅ Max 50% uppercase
- ✅ No duplicate titles (30 days)

---

## 🔢 Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 Notes

- All timestamps in ISO 8601 format (UTC)
- Pagination: default page=1, limit=20
- Prices in IDR (Decimal format)
- Images via Cloudinary (max 5MB, jpg/jpeg/png/webp)
- Featured listings require payment (via Midtrans)

