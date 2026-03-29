# TODO — Fitur untuk Bersaing dengan Brand Besar

Status: `[ ]` belum | `[x]` selesai | `[-]` skip (tidak relevan)

---

## 🚀 Quick Wins
- [x] Canonical URL
- [x] Alt text gambar
- [x] Tombol WhatsApp langsung
- [x] Timestamp "Diperbarui"

## 💰 High Impact
- [x] Kalkulasi KPR inline
- [x] Saved search + notifikasi email
- [x] Laporan listing (report spam/scam)
- [x] Price history — chart di detail page

## 🏆 Trust & Konversi
- [x] Badge "Agen Terverifikasi"
- [x] Profil publik agen `/agen/[id]`
- [x] Review & rating agen (1-5 bintang)
- [x] Jumlah listing aktif di card agen

## 🔍 Discovery & Search
- [x] Perbandingan properti side-by-side `/bandingkan`
- [x] Autocomplete lokasi (543 kota/kabupaten offline)
- [x] Pencarian by radius / "Dekat Saya" (Haversine SQL)

## 📋 Listing Quality
- [x] Minimum foto enforcement (3 foto, frontend + backend)
- [x] Embed video YouTube/virtual tour
- [x] Floor plan upload (edit mode)
- [-] Validasi harga wajar — skip, terlalu subjektif

## 🔔 Notifikasi & Engagement
- [x] Notifikasi in-app (bell icon)
- [x] Email digest mingguan (cron Senin 08:00 WIB)
- [ ] "Properti serupa baru masuk" — email ke user yang pernah favorit area serupa

## 🛡️ Moderasi & Keamanan
- [x] Auto-flag listing mencurigakan
- [x] Rate limit upload gambar (20/10mnt, max 20 foto)
- [ ] Blacklist nomor telepon/email (admin)

## 📈 SEO Teknis
- [x] Canonical URL
- [x] Breadcrumb JSON-LD (BreadcrumbList)
- [x] Sitemap dinamis dengan `lastmod` dari `updatedAt`
- [x] Open Graph image dinamis (edge runtime, foto+harga+lokasi)

## ⚙️ Best Practices
- [x] ISR revalidate (homepage 60s, listing 30s, detail 60s)
- [x] loading.tsx di semua route
- [x] `cache()` React untuk deduplication Server Components
- [x] Helmet HTTP security headers
- [x] ClassSerializerInterceptor + DecimalSerializerInterceptor
- [x] Swagger docs `/api/docs`
- [x] Health check `GET /health`
- [x] Refresh token (access 15min + refresh 7d)
- [x] Social proof homepage (real stats dari DB)
- [x] Export leads CSV

## 🏗️ Infrastruktur
- [ ] Docker production setup
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring (Sentry, uptime)
- [ ] Database backup otomatis
- [ ] Redis caching (saat traffic tinggi)
