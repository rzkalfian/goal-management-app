import { eq, asc, count } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db, usePostgres } from "../db/connection.js";
import { categories, products } from "../db/schema.js";
import { ValidationError } from "../../core/use-cases/validation.js";
const pgRepo = usePostgres ? await import("./postgres-categories.js") : null;

export function listCategories() {
  if (pgRepo) return pgRepo.listCategories();
  return db.select({ id: categories.id, name: categories.name, productCount: count(products.id) })
    .from(categories).leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id).orderBy(asc(categories.name)).all();
}
export function saveCategory(name, id) {
  if (pgRepo) return pgRepo.saveCategory(name, id);
  const duplicate = db.select().from(categories).where(eq(categories.name, name)).get();
  if (duplicate && duplicate.id !== id) throw new ValidationError("Nama kategori sudah digunakan.");
  if (id) return db.update(categories).set({ name }).where(eq(categories.id, id)).returning().get();
  return db.insert(categories).values({ id: randomUUID(), name }).returning().get();
}
export function deleteCategory(id) {
  if (pgRepo) return pgRepo.deleteCategory(id);
  if (db.select().from(products).where(eq(products.categoryId, id)).get()) {
    throw new ValidationError("Kategori masih digunakan produk. Pindahkan produknya terlebih dahulu.");
  }
  return db.delete(categories).where(eq(categories.id, id)).returning().get();
}