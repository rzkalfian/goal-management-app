# AGENTS.MD - Proyek Wishlist & Stuff Manager (Modular & Clean Architecture)

Dokumen ini berisi panduan teknis dan standar arsitektur untuk AI Agent atau Developer yang mengimplementasikan aplikasi manajemen list barang.

## 1. Arsitektur & Prinsip Kode
Aplikasi dibangun menggunakan **Clean Architecture** yang dipisahkan berdasarkan layer dan modul (*Component-Based Architecture*).

*   **Aturan Baris Kode**: Setiap file diusahakan **kurang dari 100 baris kode**. Jika melampaui, pecah menjadi sub-komponen, *hooks*, *services*, atau *utilities* terpisah.
*   **Separation of Concerns**: Logika bisnis, akses database, dan UI dipisahkan secara tegas.

## 2. Struktur Folder Clean Architecture (Next.js App Router)

```text
src/
├── app/                        # Delivery Layer (Routing & Pages)
│   ├── (auth)/login/
│   ├── (dashboard)/
│   │   ├── products/           # Page CRUD Produk (Grid Card 5 Kolom)
│   │   └── users/              # Page CRUD User (Table View)
│   └── api/                    # Controllers / API Handlers
├── core/                       # Domain Layer (Pure Business Logic & Entities)
│   ├── entities/               # Product & User types/interfaces
│   └── use-cases/              # Pure logic (e.g., product validation, status filter logic)
├── data/                       # Infrastructure Layer (Data & DB)
│   ├── db/                     # Connection (Prisma/Drizzle)
│   └── repositories/           # DB Queries (ProductRepo, UserRepo)
└── components/                 # Presentation Layer (UI Component-Based)
    ├── ui/                     # Atomic UI (Button, Input, Badge, Select)
    ├── forms/                  # Small modular forms
    ├── products/               # Product Card, Product Grid, Product Filters
    └── users/                  # User Table, User Actions