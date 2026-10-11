import { count, eq } from "drizzle-orm";
import { users, categories, products, settings } from "../db/postgres-schema.js";
import { ROLES } from "../../core/entities/product.js";
import { productInput, webUrl, text, ValidationError } from "../../core/use-cases/validation.js";

export function validateSnapshot(snapshot) {
  for (const key of ["users", "categories", "products"]) {
    if (!Array.isArray(snapshot[key])) throw new ValidationError("Snapshot tidak valid.");
  }
  if (snapshot.users.length && !snapshot.users.some((user) => user.role === "DEVELOPER")) {
    throw new ValidationError("Snapshot harus memiliki minimal satu Developer.");
  }
  for (const user of snapshot.users) {
    text(user.id, "ID"); text(user.email, "Email", 254);
    if (!ROLES.includes(user.role) || !/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(user.password)) {
      throw new ValidationError("Role atau hash password snapshot tidak valid.");
    }
  }
  for (const category of snapshot.categories) { text(category.id, "ID"); text(category.name, "Kategori", 60); }
  for (const product of snapshot.products) {
    productInput(product); text(product.id, "ID");
    if (product.imageUrl) {
      if (!product.imageUrl.startsWith("https://")) throw new ValidationError("Pindahkan gambar lokal ke Cloudinary sebelum impor.");
      webUrl(product.imageUrl);
    }
  }
  return snapshot;
}
export async function importSnapshot(db, snapshot) {
  validateSnapshot(snapshot);
  return db.transaction(async (tx) => {
    await tx.select().from(settings).where(eq(settings.key, "users_lock")).for("update");
    for (const table of [users, categories, products]) {
      if ((await tx.select({ count: count() }).from(table))[0].count) {
        throw new ValidationError("Database tujuan harus kosong. Tidak ada data yang ditimpa.");
      }
    }
    for (const category of snapshot.categories) await tx.insert(categories).values({ id: category.id, name: category.name });
    for (const user of snapshot.users) await tx.insert(users).values({
      id: user.id, email: user.email, password: user.password, role: user.role,
      createdAt: user.createdAt, sessionVersion: (user.sessionVersion || 0) + 1,
    });
    for (const product of snapshot.products) await tx.insert(products).values({
      ...productInput(product), id: product.id, imageUrl: product.imageUrl || null,
      createdAt: product.createdAt, updatedAt: product.updatedAt,
    });
    return { users: snapshot.users.length, categories: snapshot.categories.length, products: snapshot.products.length };
  });
}