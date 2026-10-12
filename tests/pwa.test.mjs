import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import manifest from "../src/app/manifest.js";

test("manifest defines standalone, scoped app with installable icon sizes", () => {
  const data = manifest();
  assert.equal(data.display, "standalone");
  assert.equal(data.start_url, "/");
  assert.equal(data.scope, "/");
  assert.ok(data.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(
    data.icons.some(
      (icon) => icon.sizes === "512x512" && icon.purpose === "maskable",
    ),
  );
});
test("service worker bypasses APIs, RSC, cross-origin and mutations", () => {
  const listeners = {};
  runInNewContext(readFileSync("public/sw.js", "utf8"), {
    URL,
    self: {
      location: { origin: "https://goals.test" },
      addEventListener: (name, callback) => {
        listeners[name] = callback;
      },
    },
  });
  for (const [url, options] of [
    ["https://goals.test/api/products", {}],
    ["https://goals.test/products", { method: "POST" }],
    ["https://external.test/", {}],
    ["https://goals.test/products", { headers: { RSC: "1" } }],
  ]) {
    let intercepted = false;
    listeners.fetch({
      request: new Request(url, options),
      respondWith: () => {
        intercepted = true;
      },
    });
    assert.equal(intercepted, false, url);
  }
});

test("failed navigation serves offline fallback without caching private pages", async () => {
  const listeners = {};
  const matched = [];
  const offline = new Response("Offline");
  runInNewContext(readFileSync("public/sw.js", "utf8"), {
    URL,
    self: {
      location: { origin: "https://goals.test" },
      addEventListener: (name, callback) => {
        listeners[name] = callback;
      },
    },
    fetch: async () => {
      throw new Error("Offline");
    },
    caches: {
      match: async (path) => {
        matched.push(path);
        return offline;
      },
    },
  });
  let response;
  listeners.fetch({
    request: {
      url: "https://goals.test/products",
      method: "GET",
      mode: "navigate",
      headers: new Headers(),
    },
    respondWith: (promise) => {
      response = promise;
    },
  });
  assert.equal(await response, offline);
  assert.deepEqual(matched, ["/offline.html"]);
});
