# Task Tracker — PropertyHub

**Last Updated:** 2026-03-24 20:00 WIB

---

## ✅ Selesai

### Backend
- TASK-001~036: Backend core, leads system, seeder, rate limiting
- TASK-037: `OptionalJwtAuthGuard` — views tidak increment jika pemilik
- TASK-038: Self-favorite prevention di `addFavorite`
- TASK-039: `GET /properties/my` support sort (views/leads/favorites/rank)
- TASK-040: `GET /favorites/property-counts` — count per properti
- TASK-041: `getUserStats` fix — views aggregate, leads received, receivedFavorites

### Frontend
- TASK-042~071: UI overhaul, detail page, leads dashboard, favorites
- TASK-072: Dashboard layout dengan sidebar (desktop sticky + mobile FAB Sheet)
- TASK-073: Dashboard overview redesign — stats, alert leads baru, recent leads, recent properties
- TASK-074: Dashboard properties — stats bar, search + filter + sort + pagination
- TASK-075: PropertyList — URL-based pagination, sort dropdown (views/leads/favorites/rank)
- TASK-076: FavoriteButton — `initialLiked` dari server (favoriteIds)
- TASK-077: FavoriteList — load more, redesign card
- TASK-078: Stats konsisten — semua pakai `getUserStats` bukan hitung dari list
- TASK-079: Per-properti favorite count di property list
- TASK-080: Access control table — views/favorites/leads per role

---

## 📋 Backlog

- [ ] Footer redesign
- [ ] Auth pages styling
- [ ] Email notifications (Resend/Nodemailer)
- [ ] Search header fungsional
- [ ] Profile page
- [ ] Email verification
- [ ] Docker production setup
- [ ] CI/CD pipeline
- [ ] Monitoring (Sentry)
