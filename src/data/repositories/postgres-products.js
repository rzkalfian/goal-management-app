import { eq, desc } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { pg } from "../db/postgres.js";
import { products, categories } from "../db/postgres-schema.js";
import { ValidationError } from "../../core/use-cases/validation.js";

export async function listProducts() {
  const rows = await pg
    .select({
      product: products,
      category: categories.name,
      categoryIcon: categories.icon,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));
  return rows.map(({ product, category, categoryIcon }) => ({
    ...product,
    category,
    categoryIcon,
  }));
}
export async function findProduct(id) {
  return (await pg.select().from(products).where(eq(products.id, id)))[0];
}
export async function saveProduct(input, id) {
  if (
    !(
      await pg
        .select()
        .from(categories)
        .where(eq(categories.id, input.categoryId))
    )[0]
  ) {
    throw new ValidationError("Kategori tidak ditemukan.");
  }
  const now = new Date().toISOString();
  try {
    if (id)
      return (
        await pg
          .update(products)
          .set({ ...input, updatedAt: now })
          .where(eq(products.id, id))
          .returning()
      )[0];
    return (
      await pg
        .insert(products)
        .values({ ...input, id: randomUUID(), createdAt: now, updatedAt: now })
        .returning()
    )[0];
  } catch (error) {
    if ((error.cause?.code || error.code) === "23503")
      throw new ValidationError("Kategori tidak ditemukan.");
    throw error;
  }
}
export async function deleteProduct(id) {
  return (await pg.delete(products).where(eq(products.id, id)).returning())[0];
}
