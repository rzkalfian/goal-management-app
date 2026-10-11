import { redirect } from "next/navigation";
import { DownloadIcon } from "@solar-icons/react/linear";
import { currentUser } from "@/data/auth/access";
import { listUsers } from "@/data/repositories/users";
import { listProducts } from "@/data/repositories/products";
import { listCategories } from "@/data/repositories/categories";
import { PageHeading } from "@/components/shell/page-heading";
import { Button } from "@/components/ui/button";
import { usePostgres } from "@/data/db/connection";
export const metadata = { title: "Sistem" };
export default async function System() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "DEVELOPER") redirect("/products");
  const cloud = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
  const [products, categories, users] = await Promise.all([listProducts(), listCategories(), listUsers()]);
  return <>
    <PageHeading title="Sistem" subtitle="Penyimpanan dan cadangan data aplikasi." />
    <dl className="system-details">
      <div><dt>Database</dt><dd>{usePostgres ? "PostgreSQL / Drizzle" : "SQLite / Drizzle"}</dd></div>
      <div><dt>Isi database</dt><dd>{products.length} barang, {categories.length} kategori, {users.length} pengguna</dd></div>
      <div><dt>Penyimpanan gambar</dt><dd>{cloud ? "Cloudinary" : process.env.NODE_ENV === "production" ? "Cloudinary belum dikonfigurasi" : "Folder lokal (development)"}</dd></div>
    </dl>
    <Button asChild variant="outline"><a href="/api/backup" download><DownloadIcon size={18} />Unduh cadangan database</a></Button>
    <p className="backup-note">Cadangan berisi data akun dan hash password. Simpan secara privat. Gambar perlu dicadangkan terpisah.</p>
  </>;
}