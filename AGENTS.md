# Operating Guidelines for AI Agents

**Target System:** PropertyHub — Fullstack Property Listing Monorepo  
**Authoritative Index:** `docs/00_MOC.md`  
**Current Milestone:** Production-Ready Core Monorepo Baseline  

---

## 1. Prime Directives

1. **Strict Architectural Boundary:**
   - **Next.js (`apps/web`) = UI Layer Only.** Server Components by default; `"use client"` only for interaction. Never place domain business logic or database queries inside Next.js.
   - **NestJS (`apps/api`) = Business Logic & API Layer.** All mutations, validations, database queries (Prisma), ranking algorithms, and auth logic live here.
2. **Single Source of Truth for Models:**
   - Shared entities, enums, DTOs, and API response envelopes MUST reside in `packages/shared`.
   - Never define ad-hoc duplicate types or cast `(user as any)`. Import from `@propertyhub/shared`.
3. **No Hardcoded URLs or Ports:**
   - Client and server code in `apps/web` MUST import `API_URL` and `APP_URL` from `@/lib/config`.
   - Backend code in `apps/api` MUST use NestJS `ConfigService` with centralized fallbacks.
   - Standard assigned development ports:
     - Backend API: `3003` (`http://localhost:3003`)
     - Frontend Web: `3004` (`http://localhost:3004`)
     - Docker PostgreSQL: `5435` (`localhost:5435`)
4. **Living Documentation in `docs/`:**
   - Every architectural modification, schema migration, or new invariant must be documented in `docs/` and cross-referenced in `docs/00_MOC.md`.
5. **Language Conventions:**
   - Technical specifications, code, type definitions, and commit messages in **English**.
   - User chat communication remains in **Indonesian** unless requested otherwise.

---

## 2. Monorepo Structure

```text
property-webapp/
├── Makefile                # Canonical entrypoint (make dev, make build, make docker-up)
├── docker-compose.yml      # Local infrastructure (PostgreSQL on port 5435, optional Umami)
├── AGENTS.md               # AI operating directives (this file)
├── README.md               # Developer orientation and quickstart
├── docs/                   # Architecture, ERD, API specs, and MOC
│   ├── 00_MOC.md           # Map of Content
│   ├── ARCHITECTURE.md     # Modular backend architecture
│   ├── FRONTEND_GUIDELINES.md # UI constraints & data fetching rules
│   └── ...
├── packages/
│   └── shared/             # @propertyhub/shared (enums, domain models, DTOs)
└── apps/
    ├── api/                # NestJS + Prisma REST API
    └── web/                # Next.js 16 (Turbopack) + Tailwind v4 + shadcn/ui
```

---

## 3. Tooling & Development Workflow

- **Package Manager:** Bun (`bun install`, `bun dev`, `bun run build`).
- **Orchestration:** Turborepo via top-level `Makefile`:
  - `make docker-up`: Start PostgreSQL on port 5435.
  - `make db-migrate`: Run Prisma migrations.
  - `make db-seed`: Seed database with 4 users and 100 Indonesian listings.
  - `make dev`: Run both frontend (`:3004`) and backend (`:3003`) in watch mode.
  - `make build`: Compile all workspace packages (`@propertyhub/shared`, `@propertyhub/api`, `@propertyhub/web`).
