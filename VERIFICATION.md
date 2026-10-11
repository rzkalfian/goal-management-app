# Verifikasi Goals Management

Tanggal: 2026-10-11. Antislop: during (pilihan sesi, bukan preferensi global).
Design Read: pengelola wishlist pribadi, bahasa visual HomeUI, ENERGY 1 / RHYTHM 1 / MOTION 1.

## Pemeriksaan yang dijalankan

- `npm.cmd test`: 21/21 test lulus, termasuk PostgreSQL/PGlite, rollback impor, origin, manifest dan bypass API pada service worker.
- `npm.cmd run lint`: bersih.
- `npm.cmd run build`: Next.js 16.4.0 berhasil membangun semua route.
- `npm.cmd run test:e2e`: workflow Playwright lulus, database dan gambar temporer.
- `npm.cmd audit --omit=dev`: 0 kerentanan production.
- Diagnostik VS Code: tidak ada error.
- Lebar browser: 320, 390, 700, 900, 1150, 1440 px; tanpa overflow halaman.
- Screenshot desktop terang/gelap dan mobile gelap diperiksa; foto test mempunyai naturalWidth positif.
- Semua angka di aplikasi berasal dari SQLite; fixture browser berlabel [TEST], bukan data aplikasi pengguna.

## Click-through dan batas akses

- Setup: konfirmasi berbeda ditolak; akun pertama dibuat; setup berikutnya ditutup.
- Login/logout: menuju daftar barang/login; login ulang berhasil.
- Tambah/edit barang: form disimpan; status berubah; PNG diunggah dan tampil sebagai WebP.
- Hapus barang: dialog konfirmasi menghapus data; Escape, tombol tutup, dan Batal menutup editor.
- Pencarian/filter status/kategori: hasil berubah; hasil kosong dan Reset filter bekerja.
- Pembelian/affiliate: masing-masing membuka tab dengan URL yang benar; tujuan eksternal diintersep sebagai fixture [TEST].
- Kategori: tambah, ubah nama, hapus; kategori yang dipakai produk ditolak saat dihapus.
- Pengguna: tambah Admin, reset password, hapus; tabel Admin tanpa kontrol mutasi.
- API Admin: manajemen pengguna dan backup ditolak 403; pencabutan sesi setelah perubahan akun menghasilkan 401.
- Sistem: snapshot SQLite berhasil diunduh; gambar dicadangkan terpisah.
- Tema: terang/gelap berubah, bertahan setelah reload, dan lolos pemeriksaan kontras teks.
- Keyboard: fokus awal, Tab/Shift+Tab, outline 3 px, Escape; form kosong diblokir validasi native.
- Empty/loading/error: daftar kosong, request tertahan, error terintersep, dan retry berhasil diuji.
- API: origin hilang/asing ditolak, tanpa sesi 401, payload terlalu besar 413, URL javascript ditolak 400.
- Server lokal 127.0.0.1: payload setup kosong melewati origin lalu ditolak validasi field (400); header DENY/frame-ancestors/nosniff aktif.

## Alasan Visual

- Biru #3F75FF mengikuti HomeUI dan memusatkan perhatian pada aksi tambah/simpan.
- Teks gelap pada tombol biru mempunyai kontras 5.04:1; teks putih kecil pada biru tidak dipakai.
- Roboto lokal menjaga identitas HomeUI tanpa ketergantungan font jaringan saat build.
- Grid 1/2/3/5 kolom mengikuti spesifikasi dan menjaga perbandingan barang tetap teratur.
- Kartu 16 px, media/input 8 px, tombol/badge pill mengikuti hierarki radius HomeUI.
- Foto square stabil membantu mengenali barang; tanpa foto ditandai "Belum ada gambar", bukan gambar fiktif.
- Badge hanya untuk status/kategori; ikon belanja/edit/hapus menyatakan aksi, bukan dekorasi.
- Spasi membedakan judul, filter, koleksi, dan akun; tidak ada hero atau statistik dekoratif.
- Hover sederhana memberi umpan balik, tanpa animasi berulang; reduced-motion didukung.
- Tema terang untuk pengelolaan sehari-hari, tema gelap sebagai pilihan pengguna; bukan dark-only.

## Delivery Gate

- R-02 PASS: teks implementasi memakai ASCII dan tidak memakai em dash.
- R-03 PASS: enam lebar browser tanpa overflow; kontrol aplikasi minimal 44 px.
- R-17 PASS: jumlah barang/kategori/pengguna dibaca dari database, tanpa statistik buatan.
- R-18 PASS: tidak ada testimonial, avatar, atau identitas pelanggan fiktif.
- R-23 PASS: nama aplikasi berupa teks; gambar dari upload; navigasi mengikuti spesifikasi.
- R-24 PASS: Barang/Kategori/Pengguna/Sistem menuju route nyata dan dikunjungi browser.
- R-25 PASS: pasangan teks terlihat >=4.5:1; border input terang 4.31:1, gelap 5.81:1.
- R-26 PASS: CRUD, link eksternal, dialog, filter, tema, logout, backup, retry mempunyai aksi teruji.
- R-27 PASS: empty/loading/error dan pemulihan error diuji dengan intersepsi request.
- R-28 PASS: tidak ada FAQ yang tidak diminta.
- R-32 PASS: Tab/Shift+Tab, fokus terlihat, dan Escape diuji pada dialog.
- R-33 PASS: implementasi ditulis langsung di source, tanpa script pengganti CSS/source.
- R-34 PASS: dua tema diuji untuk layout, kontras, toggle, dan persistence.
- R-35 PASS: build dan workflow browser lulus; click-through dicatat di atas.
- R-36 PASS: tidak ada klaim keamanan/kinerja/kepatuhan atau testimoni buatan.
- R-37 PASS: DESIGN.md dibaca dan Design Read/dials diumumkan sebelum UI dibuat.
- R-38 PASS: daftar production mulai kosong; data tes terisolasi dan berlabel [TEST].
- R-01 PASS: biru berasal dari HomeUI; tidak ada gradient/glow tanpa tujuan.
- R-04 PASS: ikon aksi Lucide dipilih untuk belanja, edit, hapus, kategori, pengguna, backup.
- R-06 PASS: Roboto mengikuti sumber desain; ukuran heading aplikasi tetap proporsional.
- R-07 PASS: tidak ada background grid/dekorasi teknis generik.
- R-08 PASS: ikon external-link hanya menandai affiliate; tidak ada panah dekoratif pada CTA.
- R-09 PASS: badge menampilkan status, kategori, atau role nyata.
- R-10 PASS: tidak ada backdrop blur atau tumpukan glassmorphism.
- R-12 PASS: kartu memakai border, tanpa shadow berlebihan.
- R-13 PASS: tidak ada glow berulang pada kartu/ikon/badge/background.
- R-14 PASS: kartu seragam untuk perbandingan barang yang setara, bukan feature marketing.
- R-19 PASS: hanya transisi hover; reduced-motion tersedia, sesuai MOTION 1.
- R-22 PASS: tidak ada ilustrasi generik; media merupakan upload atau placeholder jujur.
- Liveliness/dials PASS: ENERGY 1 / RHYTHM 1 / MOTION 1 dinyatakan eksplisit.
- Liveliness/consistency PASS: screenshot menunjukkan grid teratur dan motion hanya hover.
- Liveliness/focal PASS: aksi tambah atau form aktif menjadi fokus tiap halaman.
- Liveliness/whitespace PASS: judul/filter/koleksi/akun terpisah secara struktural.
- Liveliness/accent PASS: biru menandai aksi dan pilihan aktif, bukan semua permukaan.
- Liveliness/motif PASS: gambar square dengan badge wishlist/pembelian berulang sesuai domain.
- Liveliness/Design Read PASS: deklarasi arah mendahului pembuatan komponen.
- C-1 PASS: keputusan warna/layout/typografi/spasi mempunyai alasan tertulis.
- C-2 PASS: aksi interaktif diuji dan dicatat pada click-through.
- C-3 PASS: setiap halaman melayani barang, kategori, akun, atau backup; tanpa section pengisi.
- C-4 PASS: breakpoint, zoom, state, tema, dan keyboard diuji di browser.
- C-5 PASS: data/angka berasal dari database, tidak ada klaim pelanggan buatan.
- R-05 PASS: aplikasi langsung ke pekerjaan utama, tanpa hero/template marketing.
- R-11 PASS: kartu 16 px, field 8 px, tombol/badge pill, sesuai hierarki HomeUI.
- R-15 PASS: CTA memakai Tambah/Simpan/Hapus, bukan CTA marketing generik.
- R-16 PASS: teks aplikasi tidak memakai jargon marketing.
- R-20 PASS: gambar barang dan badge wishlist/pembelian membentuk identitas koleksi.
- R-21 PASS: tema terang/gelap dapat dipilih, bukan dark-only.
- R-29 PASS: palette HomeUI biru dan neutral, dengan merah hanya untuk error.
- R-30 PASS: struktur mengikuti kebutuhan produk dan MD pengguna, bukan clone produk populer.
- R-31 PASS: alasan setiap keputusan utama tercatat di bagian Alasan Visual.

## PWA dan Mobile (2026-10-11)

- Manifest PASS: /manifest.webmanifest terbangun statis, display standalone, scope dan start_url /.
- Ikon PASS: PNG 192/512 px, maskable 512 px dan Apple 180 px diperiksa dimensi serta variasi pikselnya.
- R-23/R-31 PASS: permintaan pengguna mencakup ikon; ListChecks Lucide menyatakan daftar/pembelian, biru mengikuti HomeUI.
- Service worker PASS: terdaftar dan mengontrol halaman; sw.js menggunakan no-store untuk pembaruan.
- Privasi cache PASS: cache hanya berisi offline.html dan ikon; API/RSC/mutasi/cross-origin dilewati.
- Instal PASS: event instal simulasi menampilkan tombol; klik memanggil prompt; tombol hilang sesudah pilihan diterima.
- Offline PASS: navigasi offline membuka fallback dengan ikon; Coba lagi saat online mengembalikan data dan sesi.
- R-03/R-32 PASS: navigasi bawah pada mobile; footer tetap di atas bar ketika scroll terakhir; kontrol minimal 44 px.
- R-25/R-34 PASS: tes kontras tema terang/gelap dan zoom 200% tetap lulus setelah perubahan mobile.
- R-26/R-27/R-35 PASS: workflow CRUD, semua navigasi, modal, filter, retry, loading/error dan alur PWA lulus.
- Liveliness PASS: ENERGY 1 / RHYTHM 1 / MOTION 1 tetap; navigasi mobile mendukung pemakaian berulang tanpa dekorasi baru.
- Hard Gate/Purpose-Gate/Quality Locks PASS: status per aturan di atas tetap berlaku; tidak ada data/demo fiktif tambahan.
- Screenshot PASS: pwa-mobile.png, pwa-offline.png, desktop terang/gelap dan ikon 512 px diperiksa visual.
- Build PASS: Next.js production build berhasil; prebuild membuat semua ikon aplikasi secara otomatis.

PWA bukan APK/IPA. Install prompt native OS, Safari/iOS fisik dan safe-area hardware belum diuji.
HTTPS diperlukan untuk instalasi dari perangkat lain; localhost/127.0.0.1 hanya untuk komputer lokal.
Data dan CRUD tetap memerlukan jaringan; offline tidak menyimpan data privat atau antrean mutasi.

## Kesiapan Vercel dan PostgreSQL

- Database PASS: DATABASE_URL memilih PostgreSQL; SQLite tidak diinisialisasi pada mode PostgreSQL.
- Repository PASS: CRUD, constraint status/kategori, hash/account fields dan session version diuji dalam PostgreSQL tertanam.
- Transaksi PASS: guard row dikunci untuk mutasi akun/setup; Developer terakhir dan perubahan role sendiri tetap dilindungi.
- Supabase RLS PASS: RLS aktif pada lima tabel; role anonim dengan SELECT grant tidak mendapat baris akun.
- Import PASS: tujuan berisi data ditolak; kegagalan foreign key membatalkan semua insert; ID/hash dipertahankan.
- Gambar PASS: impor menolak referensi lokal sebelum dipindahkan ke Cloudinary; database sumber dibuka read-only oleh script.
- Backup PASS: PostgreSQL diekspor dengan transaksi repeatable-read; SQLite tetap snapshot .sqlite.
- Setup PASS: production ditutup secara default; hanya ALLOW_INITIAL_SETUP=true yang membuka setup awal.
- Build PASS: Next.js production build lulus dengan VERCEL=1 dan DATABASE_URL dummy, tanpa koneksi atau migration runtime.
- Regresi PASS: workflow browser SQLite tetap lulus untuk login, CRUD, akses, mobile, tema dan PWA.
- Lint PASS: source, scripts dan tests bersih; log error API tidak mencetak parameter query.
- Publikasi PASS: git check-ignore memastikan .env.local dan .data/goals.sqlite tidak masuk staging biasa.
- Dependensi PASS: audit production setelah penambahan driver PostgreSQL melaporkan 0 kerentanan.

GitHub CLI belum tersedia; folder proyek masih bagian dari repository Git induk.
Tidak ada commit, push, repository remote baru, atau deployment cloud yang dilakukan.
Koneksi TCP/TLS Supabase, pooler, upload Cloudinary migrasi dan restore cloud belum diuji dengan akun nyata.
Tes database memakai PGlite; browser workflow belum dijalankan terhadap Supabase production.
Ikuti DEPLOYMENT.md untuk konfigurasi dan smoke test setelah kredensial disiapkan secara privat.

## Batas Integrasi Eksternal

Cloudinary belum diuji dengan kredensial nyata. Unggahan lokal dan validasi gambar diuji.
Perangkat fisik/keyboard virtual mobile belum diuji; browser emulasi dan zoom 200% diuji.
Lima temuan audit high tetap pada dependensi dev ESLint (braces/fast-glob); tidak dipaksakan downgrade.
SQLite memerlukan disk persisten dan satu instance; Cloudinary memakai URL delivery publik.
Setup pertama harus diselesaikan secara privat sebelum deployment dibuka ke internet.