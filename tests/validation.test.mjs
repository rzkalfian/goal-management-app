import test from "node:test";
import assert from "node:assert/strict";
import { productInput, userInput, webUrl } from "../src/core/use-cases/validation.js";

test("only http(s) purchase URLs without credentials are accepted", () => {
  assert.equal(webUrl("https://example.com/item"), "https://example.com/item");
  assert.equal(webUrl("", true), null);
  for (const value of ["javascript:alert(1)", "data:text/html,x", "ftp://example.com", "https://user:pass@example.com", "broken"]) {
    assert.throws(() => webUrl(value));
  }
});

test("product status and category are required", () => {
  const input = { title: " Buku ", status: "WISHLIST", categoryId: "books", buyUrl: "https://example.com" };
  assert.equal(productInput(input).title, "Buku");
  assert.throws(() => productInput({ ...input, status: "UNKNOWN" }));
  assert.throws(() => productInput({ ...input, categoryId: "" }));
});

test("user role, email and password constraints apply on create and update", () => {
  const input = { email: " Owner@Example.com ", role: "DEVELOPER", password: "long-test-password" };
  assert.equal(userInput(input).email, "owner@example.com");
  assert.throws(() => userInput({ ...input, role: "OWNER" }));
  assert.throws(() => userInput({ ...input, password: "short" }));
  assert.throws(() => userInput({ ...input, email: "invalid" }));
  assert.deepEqual(userInput({ email: "a@example.com", role: "ADMIN", password: "" }, false), { email: "a@example.com", role: "ADMIN" });
});