# AGENTS.MD - Proyek Wishlist & Stuff Manager (Updated)

Dokumen ini berisi panduan teknis, arsitektur, dan spesifikasi fitur untuk AI Agent atau Developer yang mengimplementasikan aplikasi manajemen list barang.

## 1. Ringkasan Proyek
Aplikasi web berbasis JavaScript untuk mengelola daftar barang (wishlist/pembelian) yang ditujukan untuk persiapan pernikahan, motivasi kerja, atau kebutuhan pribadi.

## 2. Fitur & Tampilan Antarmuka (UI/UX)
*   **Akses & Role Management**:
    *   **Admin**: Mengelola daftar barang (CRUD) dan kategori.
    *   **Developer**: Memiliki akses penuh termasuk manajemen user/role dan pemeliharaan sistem.
*   **Tampilan Manajemen Produk (Card View Only)**:
    *   Disajikan dalam bentuk **Grid Card** (layout responsive: 5 kartu per baris di layar desktop/large screen).
    *   Setiap card menampilkan gambar produk, nama, badge status, badge kategori, serta tombol aksi ke link pembelian/affiliate.
*   **Tampilan Manajemen User (Table View Only)**:
    *   Format **Tabel** khusus digunakan untuk halaman kelola user/role (Khusus akses Developer/Admin).
*   **Form Produk**:
    *   Input: Nama Produk, Status (`Sudah Dibeli`, `Wishlist`, `Sering Dibeli`), Kategori (`Buku`, `Camilan`, `Gaya Hidup`, `Seserahan`), Link Pembelian, Link Affiliate (opsional), dan Upload Gambar.

## 3. Tech Stack
*   **Framework**: Next.js (App Router)
*   **Styling**: Tailwind CSS + Shadcn UI
*   **Database & ORM**: PostgreSQL / SQLite via Prisma / Drizzle ORM
*   **Auth**: NextAuth.js / Auth.js
*   **Storage**: Cloudinary / Supabase Storage / Uploadthing

## 4. Layout Grid (Responsive 5 Card Layout)
Penggunaan Tailwind CSS untuk tampilan produk 5 card per baris:
`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4`

## 5. Skema Database (Database Schema)

```prisma
// Contoh schema Prisma

enum Status {
  SUDAH_DIBELI
  WISHLIST
  SERING_DIBELI
}

enum Role {
  DEVELOPER
  ADMIN
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      Role     @default(ADMIN)
  createdAt DateTime @default(now())
}

model Category {
  id        String    @id @default(uuid())
  name      String    @unique
  products  Product[]
}

model Product {
  id            String   @id @default(uuid())
  title         String
  status        Status   @default(WISHLIST)
  buyUrl        String
  affiliateUrl  String?
  imageUrl      String?
  categoryId    String
  category      Category @relation(fields: [categoryId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}