import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const directory = mkdtempSync(join(tmpdir(), "goals-test-"));
process.env.DATABASE_PATH = join(directory, "test.sqlite");
process.env.DATABASE_URL = "";
delete process.env.GOALS_TEST_POSTGRES;
const { sqlite } = await import("../src/data/db/connection.js");
const userRepo = await import("../src/data/repositories/users.js");
const categoryRepo = await import("../src/data/repositories/categories.js");
const productRepo = await import("../src/data/repositories/products.js");
const { hashPassword, verifyPassword } = await import("../src/data/auth/password.js");
after(() => { sqlite.close(); rmSync(directory, { recursive: true, force: true }); });

test("first developer is unique, password hashes verify, and public responses omit passwords", async () => {
  const password = await hashPassword("test-only-password");
  assert.equal(await verifyPassword("test-only-password", password), true);
  assert.equal(await verifyPassword("wrong", password), false);
  const user = userRepo.createFirstUser({ email: "test@example.com", password });
  assert.equal(user.role, "DEVELOPER");
  assert.equal("password" in user, false);
  assert.throws(() => userRepo.createFirstUser({ email: "other@example.com", password }));
  assert.throws(() => userRepo.deleteUser(user.id, "other"));
  assert.throws(() => userRepo.saveUser({ email: user.email, role: "ADMIN" }, user.id, "other"));
  assert.throws(() => userRepo.deleteUser(user.id, user.id));
});

test("product persistence and category deletion retain referential integrity", () => {
  const category = categoryRepo.listCategories()[0];
  const product = productRepo.saveProduct({ title: "Test product", status: "WISHLIST", categoryId: category.id, buyUrl: "https://example.com" });
  assert.equal(productRepo.listProducts()[0].category, category.name);
  assert.throws(() => categoryRepo.deleteCategory(category.id));
  productRepo.saveProduct({ status: "SUDAH_DIBELI", categoryId: category.id }, product.id);
  assert.equal(productRepo.findProduct(product.id).status, "SUDAH_DIBELI");
  productRepo.deleteProduct(product.id);
  assert.equal(productRepo.listProducts().length, 0);
});

test("category icon is stored and returned with products", () => {
  const category = categoryRepo.saveCategory({ name: "Icon test", icon: "book-open" });
  assert.equal(categoryRepo.listCategories().find((item) => item.id === category.id).icon, "book-open");
  const product = productRepo.saveProduct({ title: "Icon", status: "WISHLIST", categoryId: category.id, buyUrl: "https://example.com" });
  assert.equal(productRepo.listProducts()[0].categoryIcon, "book-open");
  productRepo.deleteProduct(product.id);
  categoryRepo.deleteCategory(category.id);
});