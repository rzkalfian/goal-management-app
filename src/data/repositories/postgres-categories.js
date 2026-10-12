import { eq, asc, count } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { pg } from "../db/postgres.js";
import { categories, products } from "../db/postgres-schema.js";
import { ValidationError } from "../../core/use-cases/validation.js";

export function listCategories() {
  return pg
    .select({
      id: categories.id,
      name: categories.name,
      icon: categories.icon,
      productCount: count(products.id),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));
}
export async function saveCategory(input, id) {
  try {
    if (id)
      return (
        await pg
          .update(categories)
          .set(input)
          .where(eq(categories.id, id))
          .returning()
      )[0];
    return (
      await pg
        .insert(categories)
        .values({ ...input, id: randomUUID() })
        .returning()
    )[0];
  } catch (error) {
    if ((error.cause?.code || error.code) === "23505")
      throw new ValidationError("Nama kategori sudah digunakan.");
    throw error;
  }
}
export async function deleteCategory(id) {
  try {
    return (
      await pg.delete(categories).where(eq(categories.id, id)).returning()
    )[0];
  } catch (error) {
    if ((error.cause?.code || error.code) === "23503")
      throw new ValidationError(
        "Kategori masih digunakan produk. Pindahkan produknya terlebih dahulu.",
      );
    throw error;
  }
}
