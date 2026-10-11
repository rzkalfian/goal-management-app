import test from "node:test";
import assert from "node:assert/strict";
import { initialSetupAllowed } from "../src/core/use-cases/setup.js";

test("production setup is closed unless explicitly enabled", () => {
  const original = { node: process.env.NODE_ENV, setup: process.env.ALLOW_INITIAL_SETUP };
  try {
    process.env.NODE_ENV = "production";
    delete process.env.ALLOW_INITIAL_SETUP;
    assert.equal(initialSetupAllowed(), false);
    process.env.ALLOW_INITIAL_SETUP = "false";
    assert.equal(initialSetupAllowed(), false);
    process.env.ALLOW_INITIAL_SETUP = "true";
    assert.equal(initialSetupAllowed(), true);
    process.env.NODE_ENV = "development";
    assert.equal(initialSetupAllowed(), true);
  } finally {
    for (const [key, value] of [["NODE_ENV", original.node], ["ALLOW_INITIAL_SETUP", original.setup]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});