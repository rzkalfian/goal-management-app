import { eq, asc, count } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { pg } from "../db/postgres.js";
import { users, settings } from "../db/postgres-schema.js";
import { DEFAULT_CATEGORIES } from "../../core/entities/product.js";
import { categories } from "../db/postgres-schema.js";
import { ValidationError } from "../../core/use-cases/validation.js";

const publicFields = {
  id: users.id,
  email: users.email,
  role: users.role,
  createdAt: users.createdAt,
};
export const listUsers = () =>
  pg.select(publicFields).from(users).orderBy(asc(users.createdAt));
export const userCount = async () =>
  (await pg.select({ count: count() }).from(users))[0].count;
export const findUser = async (id) =>
  (await pg.select().from(users).where(eq(users.id, id)))[0];
export const findUserByEmail = async (email) =>
  (await pg.select().from(users).where(eq(users.email, email)))[0];

async function lock(tx) {
  if (
    !(
      await tx
        .select()
        .from(settings)
        .where(eq(settings.key, "users_lock"))
        .for("update")
    )[0]
  ) {
    throw new Error("Run db:migrate before using PostgreSQL.");
  }
}
async function protectLastDeveloper(tx, current, nextRole) {
  if (
    current?.role === "DEVELOPER" &&
    nextRole !== "DEVELOPER" &&
    (
      await tx
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, "DEVELOPER"))
    )[0].count <= 1
  ) {
    throw new ValidationError("Minimal satu Developer harus tetap tersedia.");
  }
}
export async function saveUser(input, id, actorId) {
  try {
    return await pg.transaction(async (tx) => {
      await lock(tx);
      const current = id
        ? (await tx.select().from(users).where(eq(users.id, id)))[0]
        : null;
      if (id && !current)
        throw new ValidationError("Pengguna tidak ditemukan.");
      if (id && id === actorId && input.role !== current.role)
        throw new ValidationError("Anda tidak dapat mengubah role sendiri.");
      await protectLastDeveloper(tx, current, input.role);
      if (id)
        return (
          await tx
            .update(users)
            .set({ ...input, sessionVersion: current.sessionVersion + 1 })
            .where(eq(users.id, id))
            .returning(publicFields)
        )[0];
      return (
        await tx
          .insert(users)
          .values({
            ...input,
            id: randomUUID(),
            createdAt: new Date().toISOString(),
          })
          .returning(publicFields)
      )[0];
    });
  } catch (error) {
    if ((error.cause?.code || error.code) === "23505")
      throw new ValidationError("Email sudah digunakan.");
    throw error;
  }
}
export function deleteUser(id, actorId) {
  return pg.transaction(async (tx) => {
    await lock(tx);
    if (id === actorId)
      throw new ValidationError("Anda tidak dapat menghapus akun sendiri.");
    const current = (await tx.select().from(users).where(eq(users.id, id)))[0];
    await protectLastDeveloper(tx, current, null);
    return (
      await tx.delete(users).where(eq(users.id, id)).returning(publicFields)
    )[0];
  });
}
export function createFirstUser(input) {
  return pg.transaction(async (tx) => {
    await lock(tx);
    if ((await tx.select({ count: count() }).from(users))[0].count)
      throw new ValidationError("Setup sudah selesai. Silakan login.");
    const rows = await tx.select().from(categories);
    if (!rows.length)
      await tx
        .insert(categories)
        .values(DEFAULT_CATEGORIES.map((name) => ({ id: randomUUID(), name })));
    return (
      await tx
        .insert(users)
        .values({
          ...input,
          role: "DEVELOPER",
          id: randomUUID(),
          createdAt: new Date().toISOString(),
        })
        .returning(publicFields)
    )[0];
  });
}
