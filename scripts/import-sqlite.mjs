import Database from "better-sqlite3";
import { client, pg } from "../src/data/db/postgres.js";
import {
  importSnapshot,
  validateSnapshot,
} from "../src/data/migrations/import-snapshot.js";

const path = process.argv[2] || ".data/goals.sqlite";
let sqlite;
try {
  sqlite = new Database(path, { readonly: true, fileMustExist: true });
  const snapshot = sqlite.transaction(() => ({
    users: sqlite
      .prepare(
        'SELECT id, email, password, role, session_version AS "sessionVersion", created_at AS "createdAt" FROM users',
      )
      .all(),
    categories: sqlite.prepare("SELECT id, name, icon FROM categories").all(),
    products: sqlite
      .prepare(
        'SELECT id, title, status, buy_url AS "buyUrl", affiliate_url AS "affiliateUrl", category_id AS "categoryId", created_at AS "createdAt", updated_at AS "updatedAt" FROM products',
      )
      .all(),
  }))();
  sqlite.close();
  sqlite = null;
  const occupied =
    await client`SELECT (SELECT count(*) FROM users) + (SELECT count(*) FROM categories) + (SELECT count(*) FROM products) AS total`;
  if (Number(occupied[0].total))
    throw new Error(
      "Destination must be empty; no existing data will be overwritten.",
    );
  validateSnapshot(snapshot);
  const result = await importSnapshot(pg, snapshot);
  console.log(
    `Imported ${result.users} users, ${result.categories} categories, ${result.products} products. SQLite source unchanged.`,
  );
} catch (error) {
  console.error(
    error.name === "ValidationError" || !error.cause
      ? error.message
      : "Import failed. Transaction rolled back; inspect database logs.",
  );
  process.exitCode = 1;
} finally {
  sqlite?.close();
  await client.end();
}
