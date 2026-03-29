# TODO - PropertyHub

**Last Updated:** 2026-03-29 WIB

---

## ✅ Semua Fitur Sudah Selesai

Backend dan frontend sudah production-ready. Lihat [STATUS.md](../STATUS.md) untuk detail lengkap.

---

## 🚀 Deployment (Belum)

### Docker Production
- [ ] `Dockerfile` backend (multi-stage, NestJS + Bun)
- [ ] `Dockerfile` frontend (multi-stage, Next.js standalone output)
- [ ] `docker-compose.prod.yml` (BE + FE + PostgreSQL)

### CI/CD (GitHub Actions)
- [ ] Workflow: push ke `main` → build → deploy ke homelab/VPS

### Monitoring
- [ ] Sentry error tracking (BE + FE)
- [ ] Uptime monitoring
- [ ] Database backup harian otomatis

---

## 📈 Fitur Lanjutan (Nice to Have)

- [ ] Views trend di analytics (saat ini hanya leads per hari)
- [ ] Radius slider UI yang lebih lengkap di halaman listing
- [ ] "Properti serupa baru masuk" — email ke user yang pernah favorit area serupa
- [ ] Blacklist nomor telepon/email (admin)
- [ ] Soft delete properti (audit trail)
- [ ] Redis caching (saat traffic > 1000 req/mnt)

---

## ⚙️ Cara Aktifkan Fitur Production

### Email (Resend)
```env
# server/.env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxx
```

### Payment (Midtrans)
```env
# server/.env
PAYMENT_PROVIDER=midtrans
MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx

# client/.env.local
NEXT_PUBLIC_PAYMENT_PROVIDER=midtrans
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx
```

### OAuth Google
```env
# server/.env
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
FRONTEND_URL=http://localhost:3000
```
Google Console: Authorized redirect URI = `{APP_URL}/auth/google/callback`
