import test from "node:test";
import assert from "node:assert/strict";
import { isSameOrigin } from "../src/core/use-cases/origin.js";

test("incoming host controls local same-origin checks when Next normalizes the URL", () => {
  const request = new Request("http://localhost:3000/api/setup", {
    headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" },
  });
  assert.equal(isSameOrigin(request), true);
  assert.equal(isSameOrigin(request, "http://localhost:3000"), false);
});
test("missing, null and foreign origins remain blocked", () => {
  for (const origin of ["", "null", "http://evil.example", "http://localhost:3001"]) {
    assert.equal(isSameOrigin(new Request("http://localhost:3000/api/setup", { headers: { host: "localhost:3000", origin } })), false);
  }
});
test("configured public HTTPS origin takes precedence over internal host", () => {
  const request = new Request("http://internal:3000/api/setup", {
    headers: { host: "internal:3000", origin: "https://goals.example" },
  });
  assert.equal(isSameOrigin(request, "https://goals.example"), true);
  assert.equal(isSameOrigin(request), false);
});