import { eq, lt, sql } from "drizzle-orm";
import { pg } from "../db/postgres.js";
import { loginAttempts } from "../db/postgres-schema.js";

export async function allowLogin(email) {
  const now = Date.now();
  await pg.delete(loginAttempts).where(lt(loginAttempts.expires, now));
  const rows = await pg
    .insert(loginAttempts)
    .values({ email, attempts: 1, expires: now + 15 * 60 * 1000 })
    .onConflictDoUpdate({
      target: loginAttempts.email,
      set: { attempts: sql`${loginAttempts.attempts} + 1` },
    })
    .returning();
  return rows[0].attempts <= 8;
}
export function clearAttempts(email) {
  return pg.delete(loginAttempts).where(eq(loginAttempts.email, email));
}
