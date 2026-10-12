# Vercel + Supabase

Kode mendukung PostgreSQL melalui DATABASE_URL. SQLite tetap digunakan jika URL kosong.
Tidak ada migration saat request/build; siapkan schema terlebih dahulu.
Tidak ada kredensial default, koneksi cloud atau upload GitHub yang dilakukan otomatis.

## 1. Siapkan Supabase

Buat project Supabase. Dari Connect, ambil connection string **Transaction pooler**
untuk Vercel (umumnya port 6543), dengan `sslmode=require`. Gunakan URL khusus
migrasi **Session pooler** (umumnya port 5432) bila transaction pooler tidak
mendukung DDL/migrasi pada konfigurasi Anda. Password yang mengandung karakter
khusus harus di-URL-encode. Simpan kredensial hanya di .env.local/Vercel Environment Variables.

Adapter memakai `prepare: false` agar kompatibel dengan transaction pooling,
dan maksimal satu koneksi per instance serverless. Region fungsi Vercel diatur di
vercel.json (`syd1`) agar dekat dengan Supabase ap-southeast-2; ubah jika region Supabase berbeda.
Koneksi harus memakai role database server yang memiliki BYPASSRLS (misalnya postgres),
bukan Supabase anon key. Migration mengaktifkan RLS tanpa policy publik pada semua
tabel aplikasi, sehingga Data API anonim tidak mendapat akses akun atau barang.
Semua akses pengguna tetap melewati Auth.js dan pemeriksaan role di server.

## 2. Siapkan environment lokal

Salin .env.example menjadi .env.local melalui editor, jangan commit file tersebut.
Isi sendiri DATABASE_URL dan AUTH_SECRET minimal 32 karakter. Buat AUTH_SECRET acak lewat password manager atau generator lokal,
jangan memakai contoh dokumentasi sebagai secret. Jangan kirim secret ke chat.
AUTH_URL lokal: http://127.0.0.1:3000 (sesuaikan alamat yang digunakan browser).

```sh
npm install
npm run db:migrate
```

Migration memakai CREATE IF NOT EXISTS, bukan DROP; data yang ada tidak ditimpa.
Schema versi berikutnya tetap memerlukan migration khusus untuk perubahan kolom.

## 3. Pindahkan data SQLite yang sudah ada

Cadangkan database terlebih dahulu, lalu hentikan perubahan
barang/akun selama impor agar snapshot tidak tertinggal dari data lokal.
Gunakan database PostgreSQL baru yang **kosong**, termasuk tabel kategori.
Jangan jalankan setup akun pertama pada PostgreSQL sebelum impor.

```sh
npm run db:import-sqlite -- .data/goals.sqlite
```

SQLite dibuka read-only. Import PostgreSQL dilakukan dalam satu transaksi,
menolak tujuan yang tidak kosong, mempertahankan ID/hash password/status/tanggal,
dan menaikkan session version agar login ulang diperlukan. Secret SQLite tidak disalin.

Setelah impor, jalankan lokal dengan DATABASE_URL dan login memakai akun lama.
Pastikan jumlah barang/kategori/pengguna cocok sebelum membuka deploy.

## 4. Repository GitHub rzkalfian

Folder ini saat ini berada dalam repository Git induk. Buat repository khusus
di folder ini agar proyek lain tidak ikut dipublikasikan. **Private disarankan.**
Di https://github.com/new, pilih owner rzkalfian, nama goals-management,
tanpa README/.gitignore tambahan. Setelah login GitHub/Git Credential Manager:

```sh
git init .
git add .
git status --short
git commit -m "Prepare Goals Management for Vercel"
git branch -M main
git remote add origin https://github.com/rzkalfian/goals-management.git
git push -u origin main
```

Tinjau staging sebelum commit. .gitignore mengecualikan .env.local, .data,
node_modules, build Next.js dan hasil tes. Jangan force-push repository yang sudah berisi.
Jika remote sudah ada, periksa `git remote -v` dan gunakan repository yang benar.

## 5. Import ke Vercel

Hubungkan akun GitHub dan import repository rzkalfian/goals-management.
Framework: Next.js. Node.js: 22.x atau versi LTS yang kompatibel. Root directory: root repository. Build command: npm run build.
Environment production:

| Variable | Nilai |
| --- | --- |
| DATABASE_URL | Transaction pooler PostgreSQL dengan SSL |
| AUTH_SECRET | Secret acak yang sama pada instance production |
| AUTH_URL | URL HTTPS deploy/custom domain yang benar |
| ALLOW_INITIAL_SETUP | false |

Jangan gunakan prefix NEXT_PUBLIC_ untuk secret. Vercel mengisi VERCEL otomatis.
Setiap push berikutnya akan memicu deployment. Jangan sambungkan preview tak
terpercaya ke database production; pakai database dan AUTH_SECRET terpisah serta
AUTH_URL yang cocok dengan hostname preview. Aktifkan Deployment Protection
untuk preview dan setup awal. PWA dapat dipasang setelah deploy HTTPS berhasil.

Jika mulai dengan database kosong, buka setup sementara hanya pada deploy yang
dilindungi: ALLOW_INITIAL_SETUP=true, buat Developer, lalu ubah kembali false dan
redeploy sebelum membuka akses publik. Impor akun lama tidak memerlukan setup.

## Pemeriksaan dan backup

Jalankan npm test, npm run lint, npm run build dan npm run test:e2e sebelum push.
Tes PostgreSQL memakai PGlite terisolasi; browser tes tetap SQLite temporer.
Supabase/network production memerlukan smoke test tersendiri setelah konfigurasi.
Periksa login/logout, CRUD, akses Admin, backup JSON, instal PWA dan HTTPS.
Backup PostgreSQL JSON memuat hash password; untuk disaster recovery gunakan
backup Supabase/pg_dump juga. Tidak ada endpoint restore destruktif.