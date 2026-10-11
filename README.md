# Goals Management

Aplikasi Wishlist & Stuff Manager sesuai AGENT.md, ARCHITECTURE.md, dan DESIGN.md.
Next.js App Router, JavaScript, Tailwind CSS, komponen Shadcn/Radix, SQLite/PostgreSQL melalui Drizzle, dan Auth.js.

## Jalankan lokal

Node.js 22 atau lebih baru diperlukan.

```sh
npm install
npm run dev
```

Di Windows jika npm.ps1 diblokir, gunakan `npm.cmd`.
Buka http://localhost:3000. Setup pertama meminta email dan password Developer
(minimal 12 karakter). Tidak ada akun atau password bawaan.
Setup ditutup setelah akun pertama dibuat. Jalankan setup secara privat sebelum
membuka aplikasi ke internet.

## Akses

- Admin: CRUD barang/kategori, melihat tabel pengguna.
- Developer: semua akses Admin, CRUD akun/role, cadangan database.
- Akun sendiri tidak dapat dihapus atau diturunkan role-nya.
- Minimal satu Developer tetap tersedia.
- Perubahan akun mencabut semua sesi akun tersebut; login kembali diperlukan.
- Login dibatasi 8 percobaan per email per 15 menit.

Kategori awal: Buku, Camilan, Gaya Hidup, Seserahan. Barang mulai kosong.
Daftar barang bersama untuk seluruh akun, sesuai skema tanpa kepemilikan per user.

## Penyimpanan dan deployment

Untuk **Vercel + Supabase PostgreSQL + Cloudinary**, ikuti [DEPLOYMENT.md](DEPLOYMENT.md).
`DATABASE_URL` memilih PostgreSQL; jika kosong, lokal tetap memakai SQLite.
Vercel menolak startup tanpa PostgreSQL; migrasi schema dijalankan terpisah sebelum deploy.

SQLite disimpan di `.data/goals.sqlite`, gambar development di `.data/uploads`.
Gambar lokal dilayani melalui endpoint privat setelah login. JPEG/PNG/WebP maksimal
5 MB dan 20 megapiksel, dinormalisasi ke WebP maksimal 1200 piksel.

Untuk production, salin `.env.example` ke `.env.local` dan isi sendiri:

- `AUTH_URL`: URL HTTPS aplikasi yang sebenarnya.
- `AUTH_SECRET`: secret acak; jika kosong, secret lokal persisten disimpan di SQLite.
- `DATABASE_PATH`: lokasi SQLite pada disk persisten.
- `DATABASE_URL`: URL PostgreSQL untuk Supabase/Vercel; AUTH_SECRET minimal 32 karakter wajib.
- `ALLOW_INITIAL_SETUP`: `false` secara default di production; buka sementara hanya untuk setup privat.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: kredensial Cloudinary.

Jangan commit secret atau folder `.data`. Jangan masukkan kredensial ke chat.
Cloudinary wajib untuk unggahan baru di production. Gambar Cloudinary memakai URL
delivery publik: jangan unggah gambar sensitif. Unggahan lama tidak dihapus otomatis,
agar referensi/cadangan lama tidak kehilangan file. Bersihkan aset yatim secara manual.
Untuk SQLite, gunakan satu instance Node.js dengan volume persisten, bukan filesystem serverless sementara.
Tambahkan rate limiting di reverse proxy untuk deployment publik, khususnya per-IP.

```sh
npm run build
npm start
```

Developer dapat mengunduh snapshot SQLite atau ekspor JSON PostgreSQL di halaman Sistem.
Backup memuat hash password (dan secret lokal untuk SQLite), simpan secara privat.
Cadangkan gambar terpisah. Untuk SQLite, restore dilakukan saat server berhenti dengan mengganti SQLite dan menghapus file
WAL/SHM lama setelah memastikan cadangan aman. Tidak ada endpoint restore destruktif.

## PWA dan Mobile

Manifest standalone, service worker, favicon, ikon PNG 192/512 px, maskable, dan
Apple Touch Icon 180 px tersedia. Ikon memakai [ListChecks dari Lucide](https://lucide.dev/icons/list-checks) untuk
menandai daftar barang dan pembelian; biru mengikuti HomeUI. Aset dibuat ulang
oleh `npm run icons` (otomatis sebelum dev/build).

Android/Chrome/Edge: gunakan tombol Instal aplikasi ketika tersedia atau menu
browser untuk menginstal. iPhone/iPad: buka di Safari, Share, Add to Home Screen.
Instalasi pada perangkat lain memerlukan deployment HTTPS, bukan URL HTTP LAN.
PWA ini dapat dipasang ke home screen, bukan APK/IPA atau paket app store.

Saat offline, halaman fallback tersedia. CRUD, login, dan data barang tetap
memerlukan internet. Service worker hanya menyimpan halaman offline dan ikon;
API, halaman akun, gambar produk, dan mutasi tidak disimpan di cache offline.
Navigasi mobile di bawah layar mempunyai ruang konten dan safe-area inset.

## Tes

```sh
npm test
npm run lint
npx playwright install chromium
npm run test:e2e
```

Browser test memakai database terpisah di direktori temporer, bukan database pengguna.
Screenshot test disimpan di `test-results/`. Laporan Delivery Gate dan alasan visual
ada di VERIFICATION.md setelah pengujian.

# goals-manage-app