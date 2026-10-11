import Database from "better-sqlite3";
import { dirname, resolve, basename } from "node:path";
import { readFile } from "node:fs/promises";
import { client, pg } from "../src/data/db/postgres.js";
import { importSnapshot, validateSnapshot } from "../src/data/migrations/import-snapshot.js";
import { saveImage } from "../src/data/storage/images.js";

const path = process.argv[2] || ".data/goals.sqlite";
let sqlite;
try {
  sqlite = new Database(path, { readonly: true, fileMustExist: true });
  const snapshot = sqlite.transaction(() => ({
    users: sqlite.prepare("SELECT id, email, password, role, session_version AS \"sessionVersion\", created_at AS \"createdAt\" FROM users").all(),
    categories: sqlite.prepare("SELECT id, name FROM categories").all(),
    products: sqlite.prepare("SELECT id, title, status, buy_url AS \"buyUrl\", affiliate_url AS \"affiliateUrl\", image_url AS \"imageUrl\", category_id AS \"categoryId\", created_at AS \"createdAt\", updated_at AS \"updatedAt\" FROM products").all(),
  }))();
  sqlite.close(); sqlite = null;
  const locals = snapshot.products.filter((product) => product.imageUrl?.startsWith("/api/images/"));
  if (locals.length && process.argv[3] !== "--upload-images") throw new Error("Use --upload-images with Cloudinary configured to migrate local images.");
  if (locals.length && !(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
    throw new Error("Cloudinary credentials are required to migrate local images.");
  }
  const occupied = await client`SELECT (SELECT count(*) FROM users) + (SELECT count(*) FROM categories) + (SELECT count(*) FROM products) AS total`;
  if (Number(occupied[0].total)) throw new Error("Destination must be empty; no existing data will be overwritten.");
  for (const product of locals) {
    const filename = basename(product.imageUrl);
    if (!/^[a-f0-9-]{36}\.webp$/.test(filename)) throw new Error("Invalid local image reference.");
    const image = await readFile(resolve(dirname(path), "uploads", filename));
    product.imageUrl = await saveImage(new File([image], filename, { type: "image/webp" }));
  }
  validateSnapshot(snapshot);
  const result = await importSnapshot(pg, snapshot);
  console.log(`Imported ${result.users} users, ${result.categories} categories, ${result.products} products. SQLite source unchanged.`);
} catch (error) {
  console.error(error.name === "ValidationError" || !error.cause ? error.message : "Import failed. Transaction rolled back; inspect database logs.");
  process.exitCode = 1;
} finally { sqlite?.close(); await client.end(); }