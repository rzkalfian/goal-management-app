import { eq, desc } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db, usePostgres } from "../db/connection.js";
import { products, categories } from "../db/schema.js";
import { ValidationError } from "../../core/use-cases/validation.js";
const pgRepo = usePostgres ? await import("./postgres-products.js") : null;

export function listProducts() {
  if (pgRepo) return pgRepo.listProducts();
  return db.select({ product: products, category: categories.name }).from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id)).orderBy(desc(products.createdAt)).all()
    .map(({ product, category }) => ({ ...product, category }));
}
export function findProduct(id) {
  if (pgRepo) return pgRepo.findProduct(id);
  return db.select().from(products).where(eq(products.id, id)).get();
}
export function saveProduct(input, id) {
  if (pgRepo) return pgRepo.saveProduct(input, id);
  if (!db.select().from(categories).where(eq(categories.id, input.categoryId)).get()) {
    throw new ValidationError("Kategori tidak ditemukan.");
  }
  const now = new Date().toISOString();
  if (id) return db.update(products).set({ ...input, updatedAt: now }).where(eq(products.id, id)).returning().get();
  return db.insert(products).values({ ...input, id: randomUUID(), createdAt: now, updatedAt: now }).returning().get();
}
export function deleteProduct(id) {
  if (pgRepo) return pgRepo.deleteProduct(id);
  return db.delete(products).where(eq(products.id, id)).returning().get();
}