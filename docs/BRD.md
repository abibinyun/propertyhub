# Business Requirements Document (BRD)

## 1. Executive Summary

**Project Name:** PropertyHub  
**Version:** 1.0  
**Date:** March 23, 2026  
**Status:** Planning Phase

### Purpose
Build a property listing platform where users can list properties for free and pay only for featured/promoted listings.

### Business Objectives
1. Provide free property listing platform
2. Generate revenue through featured ads (Rp 50k-200k)
3. Achieve 1,000 users and Rp 10jt monthly revenue in 6 months
4. Establish market presence in property listing space

---

## 2. Stakeholders

| Role | Name | Responsibility |
|------|------|----------------|
| Product Owner | Client | Business strategy, requirements |
| Principal Engineer | Development Team | Architecture, development |
| End Users | Property Listers | List properties, purchase ads |
| End Users | Property Seekers | Search and contact |

---

## 3. Business Requirements

### 3.1 Functional Requirements

#### FR-001: User Management
- **Priority:** High
- **Description:** Users can register, login, and manage profiles
- **Acceptance Criteria:**
  - User can register with email/password
  - User can login with credentials
  - User can update profile (name, phone, avatar)
  - User can change password
  - Email verification (optional for MVP)

#### FR-002: Property Listing (Free)
- **Priority:** High
- **Description:** Users can create unlimited property listings for free
- **Acceptance Criteria:**
  - User can create property with all details
  - User can upload up to 20 images per property
  - User can edit own properties
  - User can delete own properties
  - User can set property status (active, sold, rented)
  - Properties are immediately visible after creation

#### FR-003: Property Search & Filter
- **Priority:** High
- **Description:** Users can search and filter properties
- **Acceptance Criteria:**
  - Search by keyword (title, description, location)
  - Filter by property type (house, apartment, land, etc)
  - Filter by listing type (sale, rent)
  - Filter by price range
  - Filter by location (city, province)
  - Filter by specs (bedrooms, bathrooms, area)
  - Sort by (newest, price low-high, price high-low)

#### FR-004: Property Detail Page
- **Priority:** High
- **Description:** Users can view complete property information
- **Acceptance Criteria:**
  - Display all property details
  - Image gallery with lightbox
  - Show property location on map
  - Display owner/agent information
  - Contact form to send inquiry
  - View count tracking
  - Share buttons (WhatsApp, Facebook, Twitter)

#### FR-005: Lead Management
- **Priority:** High
- **Description:** Property owners receive and manage inquiries
- **Acceptance Criteria:**
  - Inquiry form on property detail page
  - Owner receives email notification
  - Owner can view all leads in dashboard
  - Owner can mark lead status (new, contacted, qualified, closed, lost)
  - Lead includes: name, email, phone, message, timestamp

#### FR-006: Featured Ads (Paid)
- **Priority:** Medium
- **Description:** Users can promote properties with featured ads
- **Acceptance Criteria:**
  - Three tiers: Basic (Rp 50k/week), Premium (Rp 100k/week), Ultimate (Rp 200k/month)
  - Featured properties appear in top search results
  - Featured properties appear on homepage
  - Featured badge displayed on property card
  - Auto-expire after duration
  - Payment via Midtrans

#### FR-007: Payment Integration
- **Priority:** Medium
- **Description:** Users can pay for featured ads
- **Acceptance Criteria:**
  - Integration with Midtrans
  - Support multiple payment methods (bank transfer, e-wallet, credit card)
  - Payment verification (manual or automatic)
  - Transaction history
  - Invoice generation

#### FR-008: User Dashboard
- **Priority:** High
- **Description:** Users can manage their properties and leads
- **Acceptance Criteria:**
  - View statistics (total properties, views, leads)
  - List of my properties with actions (edit, delete, promote)
  - List of leads received
  - Transaction history
  - Profile settings

#### FR-009: Admin Panel
- **Priority:** Medium
- **Description:** Admin can moderate and manage platform
- **Acceptance Criteria:**
  - View all users
  - View all properties
  - Approve/reject properties (if moderation enabled)
  - View all transactions
  - Platform statistics (users, properties, revenue)
  - Manage featured ads

#### FR-010: Email Notifications
- **Priority:** Medium
- **Description:** Users receive email notifications
- **Acceptance Criteria:**
  - Welcome email on registration
  - New lead notification to property owner
  - Payment confirmation
  - Featured ad expiration reminder

### 3.2 Non-Functional Requirements

#### NFR-001: Performance
- Page load time < 3 seconds
- API response time < 500ms
- Support 1,000 concurrent users
- Image optimization (WebP, lazy loading)

#### NFR-002: Security
- HTTPS only
- Password hashing (bcrypt)
- JWT authentication
- Input validation
- SQL injection prevention
- XSS prevention
- Rate limiting (100 req/min per IP)

#### NFR-003: SEO
- Server-side rendering (Next.js)
- Dynamic meta tags per property
- Sitemap generation
- Robots.txt
- Structured data (JSON-LD)
- Open Graph tags

#### NFR-004: Scalability
- Modular architecture
- Horizontal scaling capability
- Database indexing
- Caching strategy (future)

#### NFR-005: Maintainability
- Clean code architecture
- Comprehensive documentation
- Type safety (TypeScript)
- Automated testing (future)

#### NFR-006: Usability
- Mobile-first responsive design
- Intuitive navigation
- Fast property listing creation (< 5 minutes)
- Accessible (WCAG 2.1 AA)

---

## 4. User Stories

### Epic 1: User Management

**US-001:** As a user, I want to register an account so that I can list properties.  
**Acceptance Criteria:**
- Registration form with email, password, name
- Email validation
- Password strength validation
- Success message and redirect to login

**US-002:** As a user, I want to login so that I can access my dashboard.  
**Acceptance Criteria:**
- Login form with email and password
- Remember me option
- Error message for invalid credentials
- Redirect to dashboard on success

### Epic 2: Property Listing

**US-003:** As a user, I want to create a property listing so that I can sell/rent my property.  
**Acceptance Criteria:**
- Multi-step form (basic info, details, location, images)
- Image upload with preview
- Form validation
- Save as draft option
- Publish immediately

**US-004:** As a user, I want to edit my property listing so that I can update information.  
**Acceptance Criteria:**
- Pre-filled form with existing data
- Can update all fields
- Can add/remove images
- Save changes

**US-005:** As a user, I want to delete my property listing so that I can remove sold properties.  
**Acceptance Criteria:**
- Delete button with confirmation
- Soft delete (keep in database)
- Remove from public listings

### Epic 3: Property Search

**US-006:** As a visitor, I want to search properties so that I can find what I need.  
**Acceptance Criteria:**
- Search bar on homepage
- Autocomplete suggestions
- Search by location, type, price
- Display results in grid

**US-007:** As a visitor, I want to filter properties so that I can narrow down results.  
**Acceptance Criteria:**
- Filter sidebar
- Multiple filters can be applied
- Filter count badge
- Clear all filters button

### Epic 4: Lead Generation

**US-008:** As a visitor, I want to contact property owner so that I can inquire about the property.  
**Acceptance Criteria:**
- Contact form on property detail page
- Required fields: name, email, phone, message
- Submit button
- Success message

**US-009:** As a property owner, I want to receive lead notifications so that I can respond quickly.  
**Acceptance Criteria:**
- Email notification with lead details
- Lead appears in dashboard
- Lead status management

### Epic 5: Featured Ads

**US-010:** As a user, I want to promote my property so that it gets more visibility.  
**Acceptance Criteria:**
- Promote button on property card
- Select tier (Basic, Premium, Ultimate)
- Payment page
- Featured badge after payment

---

## 5. Business Rules

### BR-001: Property Listing
- All users can list unlimited properties for free
- Properties are immediately visible (no moderation by default)
- Property must have minimum 3 images
- Property must have complete information (title, price, location, type)

### BR-002: Featured Ads
- Featured ads are paid promotions
- Three tiers with different prices and benefits
- Featured ads expire after duration
- User can renew featured ads
- Only active properties can be featured

### BR-003: Lead Management
- Leads are sent to property owner's email
- Leads are stored in database
- Property owner can manage lead status
- Visitors can send multiple leads to same property

### BR-004: User Roles
- **User:** Can list properties, receive leads
- **Admin:** Can moderate, manage users, view analytics

### BR-005: Payment
- Payment via Midtrans
- Support multiple payment methods
- Manual verification for bank transfer
- Automatic verification for e-wallet/credit card

---

## 6. Assumptions & Constraints

### Assumptions
- Users have internet access
- Users have valid email addresses
- Users can upload images (max 5MB per image)
- Payment gateway (Midtrans) is available

### Constraints
- Budget: Minimal (use free tiers)
- Timeline: 2-3 months for MVP
- Team: 1-2 developers
- Infrastructure: Self-hosted (homelab)

---

## 7. Success Metrics (KPIs)

### Phase 1 (Month 1-2)
- 100 registered users
- 200 properties listed
- 1,000 property views
- 50 leads generated

### Phase 2 (Month 3-4)
- 500 registered users
- 2,000 properties listed
- 20,000 monthly visitors
- 500 leads/month
- 50 featured ads purchased

### Phase 3 (Month 5-6)
- 1,000 registered users
- 5,000 properties listed
- 50,000 monthly visitors
- 2,000 leads/month
- Rp 10jt monthly revenue

---

## 8. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low user adoption | High | Medium | Free listing, marketing, referral program |
| Payment gateway issues | Medium | Low | Modular design, easy to switch |
| Server downtime | High | Low | Monitoring, backups, redundancy |
| Spam listings | Medium | Medium | Moderation, reporting system |
| Competition | Medium | High | Better UX, free listing, faster iteration |

---

## 9. Out of Scope (Future Phases)

- Mobile app (native)
- Chat system (real-time messaging)
- Virtual tours (360° photos)
- Mortgage calculator
- Property comparison tool
- Agent verification system
- Property valuation (AI)
- Multi-language support

---

## 10. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | Client | _________ | _____ |
| Principal Engineer | Dev Team | _________ | _____ |

---

**Document Version:** 1.0  
**Last Updated:** March 23, 2026  
**Status:** Approved for Development
