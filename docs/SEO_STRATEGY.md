# SEO Strategy & Anti-Gaming System

**Last Updated:** 2026-03-23  
**Status:** Planned (Implementation Phase 1-4)

---

## 🎯 Objective

Build SEO-optimized property listing platform that can compete with major brands (99.co, rumah123, lamudi) while preventing user SEO manipulation and keyword stuffing.

---

## 📐 URL Structure (Phase 1)

### Final Structure (Approved)
```
/{status}/{jenis}/{kota}/{kecamatan}/{title}
```

**All components are REQUIRED for consistency and maximum SEO.**

### Language Support (Dual Language)
```
Indonesian (Primary): /jual/rumah/jakarta-selatan/kebagusan/rumah-minimalis-modern
English (Secondary):  /sale/house/south-jakarta/kebagusan/modern-minimalist-house
```

**Implementation:** Detect from Accept-Language header or user preference.

### Examples
```
✅ /jual/rumah/jakarta-selatan/kebagusan/rumah-minimalis-modern
✅ /sewa/apartemen/bandung/dago/apartemen-studio-furnished
✅ /jual/tanah/tangerang/bsd/kavling-siap-bangun-200m
✅ /sewa/rumah/surabaya/gubeng/rumah-kost-eksklusif-10-kamar
✅ /jual/apartemen/jakarta-pusat/menteng/apartemen-mewah-3-kamar
```

### Slug Generation Logic
```typescript
async generateSlug(data: CreatePropertyDto): Promise<string> {
  // 1. Translate to Indonesian (primary language)
  const status = this.translateListingType(data.listingType);     // "SALE" → "jual"
  const jenis = this.translatePropertyType(data.propertyType);    // "HOUSE" → "rumah"
  const kota = this.slugify(data.city);                           // "Jakarta Selatan" → "jakarta-selatan"
  const kecamatan = this.slugify(data.district);                  // "Kebagusan" → "kebagusan" (REQUIRED)
  const title = this.slugify(data.title);                         // "Rumah Minimalis Modern" → "rumah-minimalis-modern"
  
  // 2. Combine all components
  let baseSlug = `${status}-${jenis}-${kota}-${kecamatan}-${title}`;
  
  // 3. Handle duplicates (auto-increment)
  let counter = 1;
  let finalSlug = baseSlug;
  
  while (await this.exists(finalSlug)) {
    counter++;
    finalSlug = `${baseSlug}-${counter}`;
  }
  
  return finalSlug;
}

// Translation helpers
translateListingType(type: string, lang: 'id' | 'en' = 'id'): string {
  const map = {
    'SALE': { id: 'jual', en: 'sale' },
    'RENT': { id: 'sewa', en: 'rent' },
  };
  return map[type]?.[lang] || type.toLowerCase();
}

translatePropertyType(type: string, lang: 'id' | 'en' = 'id'): string {
  const map = {
    'HOUSE': { id: 'rumah', en: 'house' },
    'APARTMENT': { id: 'apartemen', en: 'apartment' },
    'LAND': { id: 'tanah', en: 'land' },
    'COMMERCIAL': { id: 'komersial', en: 'commercial' },
    'VILLA': { id: 'villa', en: 'villa' },
    'WAREHOUSE': { id: 'gudang', en: 'warehouse' },
  };
  return map[type]?.[lang] || type.toLowerCase();
}
```

### Database Schema
```prisma
model Property {
  slug String @unique  // Full slug: "jual-rumah-jakarta-selatan-kebagusan-rumah-minimalis-modern"
  
  // Location (ALL REQUIRED)
  city String          // "Jakarta Selatan"
  district String      // "Kebagusan" (REQUIRED, not optional)
  province String      // "DKI Jakarta"
  
  // Type & Status
  propertyType PropertyType
  listingType ListingType
  
  // SEO indexes
  @@index([slug])
  @@index([listingType])
  @@index([propertyType])
  @@index([city])
  @@index([district])
  @@index([listingType, propertyType])
  @@index([listingType, propertyType, city])
  @@index([listingType, propertyType, city, district])
}
```

---

## 🗂️ Category Pages (Phase 1)

### Page Structure
```
/                                              → Homepage (featured properties)
/jual                                          → All properties for sale
/sewa                                          → All properties for rent

/jual/rumah                                    → All houses for sale
/jual/apartemen                                → All apartments for sale
/sewa/rumah                                    → All houses for rent

/jual/rumah/jakarta-selatan                    → Houses for sale in Jakarta Selatan
/jual/rumah/jakarta-selatan/kebagusan          → Houses for sale in Kebagusan

/jual/rumah/jakarta-selatan/kebagusan/{slug}   → Individual property
```

### Filter Pages (Phase 1 - SEO Boost)
```
/jual/rumah/jakarta-selatan/harga-1m-2m        → Houses 1M-2M
/jual/rumah/jakarta-selatan/harga-2m-5m        → Houses 2M-5M
/jual/rumah/jakarta-selatan/harga-5m-10m       → Houses 5M-10M
/jual/rumah/jakarta-selatan/harga-10m-plus     → Houses 10M+

/jual/rumah/jakarta-selatan/2-kamar            → 2 bedroom houses
/jual/rumah/jakarta-selatan/3-kamar            → 3 bedroom houses
/jual/rumah/jakarta-selatan/4-kamar-plus       → 4+ bedroom houses

/jual/rumah/jakarta-selatan/luas-50-100        → 50-100 sqm
/jual/rumah/jakarta-selatan/luas-100-200       → 100-200 sqm
/jual/rumah/jakarta-selatan/luas-200-plus      → 200+ sqm

/sewa/apartemen/bandung/studio                 → Studio apartments
/sewa/apartemen/bandung/furnished              → Furnished apartments
```

### Dual Language Routes
```
Indonesian (Primary):
/jual/rumah/jakarta-selatan/kebagusan

English (Secondary):
/sale/house/south-jakarta/kebagusan

Implementation: Same data, different URL based on language preference
```

### SEO Benefits
- ✅ Thousands of indexed pages
- ✅ Long-tail keyword targeting
- ✅ Better internal linking
- ✅ Compete with major brands
- ✅ Dual language = 2x indexed pages

### Implementation Routes
```typescript
// Category routes
GET /:status                                    // /jual, /sewa
GET /:status/:type                              // /jual/rumah
GET /:status/:type/:city                        // /jual/rumah/jakarta-selatan
GET /:status/:type/:city/:district              // /jual/rumah/jakarta-selatan/kebagusan

// Filter routes
GET /:status/:type/:city/harga-:range           // /jual/rumah/jakarta-selatan/harga-1m-2m
GET /:status/:type/:city/:bedrooms-kamar        // /jual/rumah/jakarta-selatan/3-kamar
GET /:status/:type/:city/luas-:size             // /jual/rumah/jakarta-selatan/luas-100-200

// Individual property
GET /:status/:type/:city/:district/:slug        // /jual/rumah/jakarta-selatan/kebagusan/rumah-minimalis-modern

// English routes (mirror)
GET /en/:status/:type/:city/:district/:slug     // /en/sale/house/south-jakarta/kebagusan/modern-house
```

---

## 🛡️ Anti-Gaming System (Phase 2)

### Problem: User SEO Manipulation

**Bad Example:**
```
❌ "RUMAH MURAH!!! JAKARTA SELATAN DEKAT MRT NEGO CEPAT WA SEKARANG SIAP HUNI SHM"
```

**Good Example:**
```
✅ "Rumah Minimalis Modern di Jakarta Selatan"
```

---

## ✅ Title Validation Rules (Phase 2)

### 1. Length Constraints
```typescript
minLength: 10 characters
maxLength: 100 characters
```

### 2. Keyword Stuffing Detection
```typescript
// Max repeated words
maxRepeatedWords: 3

// Example violations:
❌ "Rumah murah rumah murah rumah murah"  // "rumah" repeated 6x
❌ "Dijual dijual dijual cepat cepat"     // Multiple repeats
```

### 3. Capitalization Rules
```typescript
// No ALL CAPS
❌ "RUMAH DIJUAL CEPAT"
✅ "Rumah Dijual Cepat"

// Max consecutive caps
maxConsecutiveCaps: 3
❌ "Rumah DIJUAL CEPAT NEGO"
✅ "Rumah Dijual Cepat"
```

### 4. Punctuation Rules
```typescript
// No excessive punctuation
maxConsecutivePunctuation: 1

❌ "Rumah Murah!!!"
❌ "Dijual???"
✅ "Rumah Murah!"
```

### 5. Spam Keywords Detection
```typescript
// Blacklist (max 2 occurrences)
spamKeywords: [
  'murah', 'nego', 'cepat', 'segera', 'wa', 'whatsapp',
  'hubungi', 'call', 'promo', 'diskon', 'bonus'
]

// Example violations:
❌ "Rumah murah nego cepat WA segera"  // 4 spam keywords
✅ "Rumah murah di Jakarta"            // 1 spam keyword (OK)
```

### 6. Forbidden Patterns
```typescript
forbiddenPatterns: [
  /\d{10,}/,              // Phone numbers
  /wa\.me/i,              // WhatsApp links
  /bit\.ly/i,             // Short links
  /\b(jual|beli)\s+\1/i,  // Repeated words
]

❌ "Rumah 081234567890"
❌ "Hubungi wa.me/628123"
❌ "Jual jual cepat"
```

### Implementation
```typescript
// DTO Validation
export class CreatePropertyDto {
  @IsString()
  @MinLength(10, { message: 'Title too short (min 10 characters)' })
  @MaxLength(100, { message: 'Title too long (max 100 characters)' })
  @Matches(/^[a-zA-Z0-9\s\-]+$/, { message: 'Title contains invalid characters' })
  @ValidateTitle() // Custom validator
  title: string;
}

// Custom Validator
@ValidatorConstraint({ name: 'titleValidator', async: false })
export class TitleValidator implements ValidatorConstraintInterface {
  validate(title: string) {
    // Check keyword stuffing
    if (this.hasKeywordStuffing(title)) return false;
    
    // Check spam keywords
    if (this.hasExcessiveSpamKeywords(title)) return false;
    
    // Check forbidden patterns
    if (this.hasForbiddenPatterns(title)) return false;
    
    return true;
  }
  
  defaultMessage() {
    return 'Title violates SEO guidelines (keyword stuffing or spam detected)';
  }
}
```

---

## 📊 SEO Ranking Algorithm (Phase 3)

### Ranking Formula
```typescript
finalScore = 
  (qualityScore * 0.4) +      // 40% - Content quality
  (engagementScore * 0.3) +   // 30% - User engagement
  (freshnessScore * 0.2) +    // 20% - Recency
  (featuredBonus * 0.1) +     // 10% - Paid promotion
  reputationBonus -           // Bonus for good users
  spamPenalty                 // Penalty for violations
```

### 1. Quality Score (0-100)
```typescript
qualityScore = 
  (hasImages ? 20 : 0) +           // Has images
  (imageCount >= 5 ? 10 : 0) +     // Multiple images
  (descriptionLength > 200 ? 15 : 0) + // Detailed description
  (hasAllSpecs ? 15 : 0) +         // Complete specs (bedrooms, bathrooms, etc)
  (hasFeatures ? 10 : 0) +         // Has features (pool, gym, etc)
  (hasLocation ? 10 : 0) +         // Has lat/long
  (hasCertificate ? 10 : 0) +      // Has certificate type
  (ownerVerified ? 10 : 0)         // Owner verified
```

### 2. Engagement Score (0-100)
```typescript
engagementScore = 
  (viewsCount / maxViews * 40) +      // 40% - Views
  (leadsCount / maxLeads * 40) +      // 40% - Leads
  (favoritesCount / maxFavorites * 20) // 20% - Favorites
```

### 3. Freshness Score (0-100)
```typescript
daysSinceUpdate = (now - updatedAt) / (1000 * 60 * 60 * 24)

freshnessScore = 
  daysSinceUpdate < 7 ? 100 :
  daysSinceUpdate < 30 ? 80 :
  daysSinceUpdate < 90 ? 60 :
  daysSinceUpdate < 180 ? 40 : 20
```

### 4. Featured Bonus (0-10)
```typescript
featuredBonus = 
  featured && featuredType === 'ULTIMATE' ? 10 :
  featured && featuredType === 'PREMIUM' ? 7 :
  featured && featuredType === 'BASIC' ? 5 : 0
```

### 5. Reputation Bonus (-50 to +30)
```typescript
reputationBonus = 
  (userVerified ? 10 : 0) +
  (profileComplete ? 5 : 0) +
  (responseRate > 80 ? 10 : 0) +
  (avgRating > 4 ? 5 : 0) -
  (spamReports * 10) -
  (fakeListing ? 50 : 0)
```

### 6. Spam Penalty (-100 to 0)
```typescript
spamPenalty = 
  (titleViolation ? 20 : 0) +
  (duplicateContent ? 30 : 0) +
  (lowQuality ? 20 : 0) +
  (userReports > 3 ? 30 : 0)
```

### Example Calculation
```typescript
// Property A: High quality, verified owner
qualityScore: 85
engagementScore: 70
freshnessScore: 100
featuredBonus: 0
reputationBonus: 25
spamPenalty: 0
→ finalScore: 85*0.4 + 70*0.3 + 100*0.2 + 0 + 25 - 0 = 80

// Property B: Keyword stuffing, spam title
qualityScore: 60
engagementScore: 80
freshnessScore: 100
featuredBonus: 0
reputationBonus: 0
spamPenalty: 50
→ finalScore: 60*0.4 + 80*0.3 + 100*0.2 + 0 + 0 - 50 = 18

// Result: Property A ranks higher despite lower engagement
```

---

## 🔍 Admin Moderation System (Phase 4)

### Auto-Flag System
```typescript
// Automatically flag for review if:
autoFlag = 
  titleLength > 80 ||
  keywordDensity > 5% ||
  spamKeywordCount > 2 ||
  duplicateContentScore > 80% ||
  userSpamReports > 2
```

### Moderation Queue
```typescript
// Property status flow
DRAFT → (auto-check) → PENDING_REVIEW → (admin approve) → ACTIVE
                    ↓
                  (auto-approve if clean)
                    ↓
                  ACTIVE
```

### Admin Actions
```typescript
// Admin can:
- Approve property (PENDING_REVIEW → ACTIVE)
- Reject property (PENDING_REVIEW → INACTIVE)
- Edit title (sanitize spam)
- Ban user (repeated violations)
- Whitelist user (trusted, skip review)
```

---

## 📋 Meta Tags & Structured Data

### Per-Property Meta Tags
```typescript
// Auto-generate from property data
metaTitle: "{title} - {city} | PropertyHub"
// Example: "Rumah Minimalis Modern - Jakarta Selatan | PropertyHub"

metaDescription: "{propertyType} {listingType} di {city}. {bedrooms} kamar, {bathrooms} kamar mandi. Harga {price}. {description_excerpt}"
// Example: "Rumah dijual di Jakarta Selatan. 3 kamar, 2 kamar mandi. Harga Rp 2.5M. Rumah minimalis 2 lantai dengan desain modern..."
```

### Structured Data (Schema.org)
```json
{
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  "name": "Rumah Minimalis Modern",
  "description": "Rumah minimalis 2 lantai...",
  "url": "https://propertyhub.com/properties/jakarta-selatan/rumah/rumah-minimalis-modern",
  "image": [
    "https://cloudinary.com/.../image1.jpg",
    "https://cloudinary.com/.../image2.jpg"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jl. Raya Kebagusan No. 123",
    "addressLocality": "Jakarta Selatan",
    "addressRegion": "DKI Jakarta",
    "postalCode": "12520",
    "addressCountry": "ID"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "-6.2884",
    "longitude": "106.8233"
  },
  "price": "2500000000",
  "priceCurrency": "IDR",
  "numberOfRooms": "3",
  "numberOfBathroomsTotal": "2",
  "floorSize": {
    "@type": "QuantitativeValue",
    "value": "120",
    "unitCode": "MTK"
  }
}
```

### Canonical URLs
```html
<link rel="canonical" href="https://propertyhub.com/properties/jakarta-selatan/rumah/rumah-minimalis-modern" />
```

---

## 🚀 Implementation Phases

### Phase 1: URL & Category Pages (Week 1)
- [x] Hierarchical URL structure
- [ ] Slug generation with auto-increment
- [ ] Category pages (/city, /type, /city/type)
- [ ] Update Property service
- [ ] Update frontend routes

**Estimated Time:** 2-3 hours

### Phase 2: Title Validation (Week 1)
- [ ] DTO validators
- [ ] Custom title validator
- [ ] Keyword stuffing detection
- [ ] Spam keyword filter
- [ ] Forbidden pattern check

**Estimated Time:** 2 hours

### Phase 3: Ranking Algorithm (Week 2)
- [ ] Quality score calculation
- [ ] Engagement tracking
- [ ] Freshness score
- [ ] Reputation system
- [ ] Update search/listing endpoints

**Estimated Time:** 4-5 hours

### Phase 4: Admin Moderation (Week 2-3)
- [ ] Auto-flag system
- [ ] Moderation queue
- [ ] Admin review interface
- [ ] User reputation tracking
- [ ] Ban/whitelist system

**Estimated Time:** 6-8 hours

---

## 📈 Success Metrics

### SEO Performance
- Google Search Console impressions
- Click-through rate (CTR)
- Average position for target keywords
- Indexed pages count

### Quality Metrics
- % properties with complete data
- % properties flagged for spam
- Average quality score
- User satisfaction rating

### Business Metrics
- Organic traffic growth
- Lead conversion rate
- Featured ads revenue
- User retention rate

---

## 🎯 Target Keywords

### Primary Keywords
- "rumah dijual jakarta"
- "apartemen sewa bandung"
- "properti jakarta selatan"
- "rumah murah tangerang"

### Long-tail Keywords
- "rumah minimalis 2 lantai jakarta selatan"
- "apartemen studio dekat kampus bandung"
- "rumah subsidi dp murah tangerang"

### Competitor Analysis
- 99.co: Strong in Jakarta, modern UI
- rumah123: Established brand, high DA
- lamudi: International presence
- olx properti: High traffic, low quality

**Our Advantage:**
- Better SEO structure (hierarchical URLs)
- Quality over quantity (anti-spam)
- User reputation system
- Modern tech stack (faster loading)

---

## 📝 Notes

### Current Status
- Phase 1: Not started
- Phase 2: Not started
- Phase 3: Not started
- Phase 4: Not started

### Dependencies
- Phase 2 depends on Phase 1 (slug generation)
- Phase 3 depends on Phase 2 (quality score needs validation)
- Phase 4 depends on Phase 3 (moderation uses ranking score)

### Future Enhancements
- AI-powered title suggestions
- Automatic image optimization
- Voice search optimization
- Local SEO (Google My Business integration)
- AMP pages for mobile

---

**Document Owner:** Development Team  
**Review Frequency:** Monthly  
**Next Review:** 2026-04-23
