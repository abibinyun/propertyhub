# Panduan Setup Umami Analytics

**Umami** adalah analytics self-hosted, open source, privacy-first — tidak perlu cookie banner.

---

## Cara Jalankan

```bash
# Dari root monorepo
docker compose -f docker-compose.umami.yml up -d
```

Umami berjalan di `http://localhost:3002`

---

## Setup Awal

1. Buka `http://localhost:3002`
2. Login default: **admin / umami**
3. Ganti password segera di Settings → Profile
4. Pergi ke **Settings → Websites → Add Website**
5. Isi nama situs dan domain (contoh: `propertyhub.id`)
6. Copy **Website ID** (format UUID)

---

## Integrasi ke PropertyHub

1. Buka Admin Panel → **Pengaturan → Tab Analytics**
2. Isi **Umami URL**: `https://umami.yourdomain.com` (atau `http://localhost:3002` untuk dev)
3. Isi **Umami Site ID**: UUID dari langkah di atas
4. Klik **Simpan**

Script Umami otomatis diinjek ke semua halaman frontend.

---

## Data yang Tersedia di Umami

| Metrik | Keterangan |
|---|---|
| Pageviews | Total halaman dilihat |
| Unique visitors | Pengunjung unik |
| Bounce rate | % yang langsung keluar |
| Top pages | Halaman paling banyak dikunjungi |
| Referrers | Sumber traffic (Google, sosmed, dll) |
| Device | Desktop / Mobile / Tablet |
| Browser | Chrome, Safari, Firefox, dll |
| OS | Windows, iOS, Android, dll |
| Country | Negara pengunjung |
| Real-time | Pengunjung aktif saat ini |

---

## Deploy Production

Untuk production, ganti `APP_SECRET` di `docker-compose.umami.yml` dengan string random:

```bash
openssl rand -hex 32
```

Lalu expose via reverse proxy (Nginx/Caddy) dengan HTTPS.

---

## Built-in Analytics (Per Properti)

Selain Umami (sitewide), PropertyHub juga punya analytics per properti di dashboard:

| Metrik | Keterangan |
|---|---|
| Views 30 hari | Dari tabel `PropertyView` |
| Leads 30 hari | Dari tabel `Lead` |
| Conversion rate | Views → Leads (%) |
| Rank score | Skor ranking properti |
| Top referrers | Sumber traffic per properti |

Akses: **Dashboard → Properti Saya → ikon chart** di tiap properti.
