import { defineConfig } from "@playwright/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.GOALS_E2E_DIR ||= mkdtempSync(join(tmpdir(), "goals-browser-"));
export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  fullyParallel: false,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3101",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node node_modules/next/dist/bin/next dev -p 3101",
    url: "http://localhost:3101",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      GOALS_E2E: "1",
      DATABASE_URL: "",
      DATABASE_PATH: join(process.env.GOALS_E2E_DIR, "browser.sqlite"),
      AUTH_URL: "http://localhost:3101",
    },
  },
});
