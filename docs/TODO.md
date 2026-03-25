# TODO - PropertyHub

**Last Updated:** 2026-03-25 WIB

---

## 🔥 Prioritas Sekarang (Quick Wins)

- [ ] **Footer** — tambah footer dengan link navigasi, sosmed, copyright
- [ ] **Auth pages styling** — login/register form yang lebih polished
- [ ] **Search header fungsional** — autocomplete ke listing page
- [ ] **Email notifikasi lead** — trigger `emailService.sendLeadNotification()` saat lead baru masuk (EmailService sudah siap, tinggal tambah method + trigger di leads.service.ts)
- [ ] **Password reset** — `POST /auth/forgot-password` + `POST /auth/reset-password?token=xxx`

---

## 📈 Fitur Lanjutan

### Analytics
- [ ] Chart views/leads per hari di dashboard properti pemilik
- [ ] Export data leads ke CSV

### Featured Listing
- [ ] Tipe: BASIC / PREMIUM / ULTIMATE dengan harga berbeda
- [ ] Badge "Featured" di listing card
- [ ] Auto-expire setelah periode berakhir
- [ ] Payment via Midtrans

### Auth
- [ ] OAuth Google (`passport-google-oauth20`)
- [ ] Refresh token (access 15min + refresh 7d)

---

## 🚀 Deployment

### Docker
```
docker-compose.prod.yml
├── traefik (reverse proxy)
├── postgres
├── redis (session cache)
├── backend (NestJS)
└── frontend (Next.js)
```

- [ ] `Dockerfile` untuk backend (multi-stage)
- [ ] `Dockerfile` untuk frontend (multi-stage, standalone output)
- [ ] `docker-compose.prod.yml`
- [ ] Environment secrets via Docker secrets / `.env.prod`

### CI/CD (GitHub Actions)
- [ ] Workflow: push ke `main` → test → build → deploy
- [ ] Separate workflow untuk BE dan FE (monorepo path filter)

### Monitoring
- [ ] Sentry error tracking (BE + FE)
- [ ] Uptime monitoring
- [ ] Database backup harian otomatis

---

## 💡 Cara Lanjutkan Project

### Setup Development
```bash
# Clone
git clone https://github.com/abibinyun/propertyweb-nestjs server
git clone https://github.com/abibinyun/propertyweb-nextjs client

# Backend
cd server && cp .env.example .env
bun install
bunx prisma migrate deploy
bunx prisma db seed
bun run start:dev

# Frontend
cd client && cp .env.example .env.local
bun install
bun run dev
```

### Tambah Email Provider Baru
1. Buat file `server/src/email/smtp.provider.ts` implement `EmailProvider`
2. Tambah case di `EmailService` constructor
3. Set `EMAIL_PROVIDER=smtp` di `.env`

### Tambah Endpoint Admin Baru
1. Tambah method di `admin.service.ts`
2. Tambah route di `admin.controller.ts` (sudah ada `@Roles('ADMIN')` guard)
3. Tambah di `lib/api/admin.ts` (client) dan `lib/server/api.ts` (server)

### Deploy ke Homelab
Lihat `/home/abibinyun/data/homelab/docs/DEPLOY_GUIDE.md` dan `EXAMPLE_DEPLOY.md`

---

## ✅ Sudah Selesai

Lihat [TASKS.md](../TASKS.md) untuk daftar lengkap (TASK-001 s/d TASK-099).

Ringkasan:
- Backend: 51 endpoints, 9 tabel, auth + email verification + properties + leads + favorites + admin
- Frontend: 15+ halaman, dashboard lengkap, admin panel enterprise-grade
- Data wilayah offline (ibnux/data-indonesia) — dropdown + map sync
- Email system modular (log default, resend via config)
- Admin panel: dashboard dengan charts, properties/users/moderation/leads table
