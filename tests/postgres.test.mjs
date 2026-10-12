import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

const engine = new PGlite();
await engine.exec(readFileSync("src/data/db/postgres.sql", "utf8"));
process.env.GOALS_TEST_POSTGRES = "1";
process.env.AUTH_SECRET = "test-only-secret-not-for-production-123";
globalThis.__goalsPostgresTest = { db: drizzle(engine) };
const users = await import("../src/data/repositories/users.js");
const categories = await import("../src/data/repositories/categories.js");
const products = await import("../src/data/repositories/products.js");
const attempts = await import("../src/data/auth/attempts.js");
const { exportPostgres } =
  await import("../src/data/repositories/postgres-backup.js");
const { sqlite } = await import("../src/data/db/connection.js");
after(async () => {
  await engine.close();
  delete globalThis.__goalsPostgresTest;
});

test("PostgreSQL first user, public fields, role locks and revoked sessions", async () => {
  assert.equal(sqlite, undefined);
  const owner = await users.createFirstUser({
    email: "owner@example.test",
    password: "hash",
  });
  assert.equal(owner.role, "DEVELOPER");
  assert.equal("password" in owner, false);
  await assert.rejects(() =>
    users.createFirstUser({ email: "another@example.test", password: "hash" }),
  );
  await assert.rejects(() => users.deleteUser(owner.id, "other"));
  await assert.rejects(() =>
    users.saveUser({ email: owner.email, role: "ADMIN" }, owner.id, "other"),
  );
  const admin = await users.saveUser({
    email: "admin@example.test",
    role: "ADMIN",
    password: "hash",
  });
  await users.saveUser(
    { email: admin.email, role: "ADMIN", password: "new hash" },
    admin.id,
    owner.id,
  );
  assert.equal((await users.findUser(admin.id)).sessionVersion, 1);
  await assert.rejects(() =>
    users.saveUser({ email: owner.email, role: "ADMIN", password: "hash" }),
  );
  await users.deleteUser(admin.id, owner.id);
  assert.equal(await users.userCount(), 1);
});
test("PostgreSQL CRUD retains category constraints and status validation", async () => {
  const category = (await categories.listCategories())[0];
  const product = await products.saveProduct({
    title: "Test",
    status: "WISHLIST",
    categoryId: category.id,
    buyUrl: "https://example.test",
  });
  assert.equal((await products.listProducts())[0].category, category.name);
  await assert.rejects(() => categories.deleteCategory(category.id));
  await assert.rejects(() =>
    products.saveProduct({
      title: "Test",
      status: "INVALID",
      categoryId: category.id,
      buyUrl: "https://example.test",
    }),
  );
  await products.saveProduct(
    { status: "SUDAH_DIBELI", categoryId: category.id },
    product.id,
  );
  assert.equal((await products.findProduct(product.id)).status, "SUDAH_DIBELI");
  await products.deleteProduct(product.id);
  assert.equal((await products.listProducts()).length, 0);
  assert.equal(await products.findProduct("missing"), undefined);
});
test("PostgreSQL login limit is persisted and reset after authentication", async () => {
  for (let index = 0; index < 8; index++)
    assert.equal(await attempts.allowLogin("test@example.test"), true);
  assert.equal(await attempts.allowLogin("test@example.test"), false);
  await attempts.clearAttempts("test@example.test");
  assert.equal(await attempts.allowLogin("test@example.test"), true);
});
test("PostgreSQL backup is consistent and no table is publicly accessible through RLS", async () => {
  const backup = await exportPostgres();
  assert.equal(backup.format, "goals-management");
  assert.equal(backup.users.length, 1);
  assert.equal(backup.categories.length, 4);
  const result = await engine.query(
    "SELECT count(*)::int AS count FROM pg_class WHERE relname IN ('users', 'categories', 'products', 'settings', 'login_attempts') AND relrowsecurity",
  );
  assert.equal(result.rows[0].count, 5);
  await engine.exec(
    "CREATE ROLE goals_anon; GRANT USAGE ON SCHEMA public TO goals_anon; GRANT SELECT ON ALL TABLES IN SCHEMA public TO goals_anon; SET ROLE goals_anon;",
  );
  try {
    assert.equal((await engine.query("SELECT * FROM users")).rows.length, 0);
  } finally {
    await engine.exec("RESET ROLE");
  }
});
