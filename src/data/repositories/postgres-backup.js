import { pg } from "../db/postgres.js";
import { users, categories, products } from "../db/postgres-schema.js";

export function exportPostgres() {
  return pg.transaction(
    async (tx) => ({
      format: "goals-management",
      version: 1,
      exportedAt: new Date().toISOString(),
      users: await tx.select().from(users),
      categories: await tx.select().from(categories),
      products: await tx.select().from(products),
    }),
    { isolationLevel: "repeatable read", readOnly: true },
  );
}
