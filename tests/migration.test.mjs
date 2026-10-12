import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import {
  importSnapshot,
  validateSnapshot,
} from "../src/data/migrations/import-snapshot.js";
import { users, categories } from "../src/data/db/postgres-schema.js";

const engine = new PGlite();
await engine.exec(readFileSync("src/data/db/postgres.sql", "utf8"));
const db = drizzle(engine);
after(() => engine.close());
const snapshot = {
  users: [
    {
      id: "owner",
      email: "owner@example.test",
      password: `${"a".repeat(32)}:${"b".repeat(128)}`,
      role: "DEVELOPER",
      sessionVersion: 2,
      createdAt: "2026-10-11",
    },
  ],
  categories: [{ id: "books", name: "Buku" }],
  products: [
    {
      id: "book",
      title: "Buku",
      status: "WISHLIST",
      categoryId: "books",
      buyUrl: "https://example.test",
      createdAt: "2026-10-11",
      updatedAt: "2026-10-11",
    },
  ],
};
test("invalid relational import rolls back every inserted row", async () => {
  const broken = {
    ...snapshot,
    products: [{ ...snapshot.products[0], categoryId: "missing" }],
  };
  await assert.rejects(() => importSnapshot(db, broken));
  assert.equal((await db.select().from(users)).length, 0);
  assert.equal((await db.select().from(categories)).length, 0);
});
test("import preserves ids and hashes, revokes sessions, and never overwrites target", async () => {
  assert.deepEqual(await importSnapshot(db, snapshot), {
    users: 1,
    categories: 1,
    products: 1,
  });
  const owner = (await db.select().from(users))[0];
  assert.equal(owner.id, "owner");
  assert.equal(owner.password, snapshot.users[0].password);
  assert.equal(owner.sessionVersion, 3);
  await assert.rejects(() => importSnapshot(db, snapshot));
  assert.equal((await db.select().from(users)).length, 1);
});
test("missing Developer is rejected before migration", () => {
  assert.throws(() =>
    validateSnapshot({
      ...snapshot,
      users: [{ ...snapshot.users[0], role: "ADMIN" }],
    }),
  );
});
