import { eq, asc, count } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db, sqlite, usePostgres } from "../db/connection.js";
import { users } from "../db/schema.js";
import { ValidationError } from "../../core/use-cases/validation.js";
const pgRepo = usePostgres ? await import("./postgres-users.js") : null;

const publicFields = { id: users.id, email: users.email, role: users.role, createdAt: users.createdAt };
export const listUsers = () => pgRepo ? pgRepo.listUsers() : db.select(publicFields).from(users).orderBy(asc(users.createdAt)).all();
export const userCount = () => pgRepo ? pgRepo.userCount() : db.select({ count: count() }).from(users).get().count;
export const findUser = (id) => pgRepo ? pgRepo.findUser(id) : db.select().from(users).where(eq(users.id, id)).get();
export const findUserByEmail = (email) => pgRepo ? pgRepo.findUserByEmail(email) : db.select().from(users).where(eq(users.email, email)).get();

export function saveUser(input, id, actorId) {
  if (pgRepo) return pgRepo.saveUser(input, id, actorId);
  return sqlite.transaction(() => {
    const current = id ? findUser(id) : null;
    if (id && !current) throw new ValidationError("Pengguna tidak ditemukan.");
    const duplicate = findUserByEmail(input.email);
    if (duplicate && duplicate.id !== id) throw new ValidationError("Email sudah digunakan.");
    if (id && id === actorId && input.role !== current.role) throw new ValidationError("Anda tidak dapat mengubah role sendiri.");
    protectLastDeveloper(current, input.role);
    if (id) return db.update(users).set({ ...input, sessionVersion: current.sessionVersion + 1 })
      .where(eq(users.id, id)).returning(publicFields).get();
    return db.insert(users).values({ ...input, id: randomUUID(), createdAt: new Date().toISOString() })
      .returning(publicFields).get();
  }).immediate();
}
function protectLastDeveloper(current, nextRole) {
  if (current?.role === "DEVELOPER" && nextRole !== "DEVELOPER" &&
    db.select({ count: count() }).from(users).where(eq(users.role, "DEVELOPER")).get().count <= 1) {
    throw new ValidationError("Minimal satu Developer harus tetap tersedia.");
  }
}
export function deleteUser(id, actorId) {
  if (pgRepo) return pgRepo.deleteUser(id, actorId);
  return sqlite.transaction(() => {
    if (id === actorId) throw new ValidationError("Anda tidak dapat menghapus akun sendiri.");
    protectLastDeveloper(findUser(id), null);
    return db.delete(users).where(eq(users.id, id)).returning(publicFields).get();
  }).immediate();
}
export function createFirstUser(input) {
  if (pgRepo) return pgRepo.createFirstUser(input);
  return sqlite.transaction(() => {
    if (userCount()) throw new ValidationError("Setup sudah selesai. Silakan login.");
    return saveUser({ ...input, role: "DEVELOPER" });
  }).immediate();
}