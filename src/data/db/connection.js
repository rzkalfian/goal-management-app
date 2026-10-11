import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import { DEFAULT_CATEGORIES } from "../../core/entities/product.js";
import * as schema from "./schema.js";

const path = process.env.DATABASE_PATH || join(process.cwd(), ".data", "goals.sqlite");
const usePostgres = Boolean(process.env.DATABASE_URL || process.env.GOALS_TEST_POSTGRES);
if (process.env.VERCEL && !usePostgres) throw new Error("Vercel requires DATABASE_URL. SQLite cannot run on temporary storage.");
if (usePostgres && (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32)) {
  throw new Error("AUTH_SECRET must contain at least 32 characters when using PostgreSQL.");
}
let sqlite;
let db;
let authSecret = process.env.AUTH_SECRET;
if (!usePostgres) {
  const { default: Database } = await import("better-sqlite3");
  const { drizzle } = await import("drizzle-orm/better-sqlite3");
  mkdirSync(dirname(path), { recursive: true });
  sqlite = new Database(path);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.exec(readFileSync(join(process.cwd(), "src/data/db/migration.sql"), "utf8"));
  sqlite.transaction(() => {
    if (!sqlite.prepare("SELECT 1 FROM settings WHERE key = 'initialized'").get()) {
      const insert = sqlite.prepare("INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)");
      for (const name of DEFAULT_CATEGORIES) insert.run(randomUUID(), name);
      sqlite.prepare("INSERT INTO settings (key, value) VALUES ('initialized', '1')").run();
    }
    sqlite.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('auth_secret', ?)")
      .run(randomBytes(32).toString("hex"));
  }).immediate();
  authSecret ||= sqlite.prepare("SELECT value FROM settings WHERE key = 'auth_secret'").get().value;
  db = drizzle(sqlite, { schema });
}
export { sqlite, db, authSecret, usePostgres };