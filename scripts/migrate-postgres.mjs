import { readFileSync } from "node:fs";
import postgres from "postgres";

if (!process.env.DATABASE_URL)
  throw new Error("Set DATABASE_URL in .env.local before migration.");
const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
try {
  await client.unsafe(readFileSync("src/data/db/postgres.sql", "utf8"));
  console.log("PostgreSQL schema ready. Existing data was not modified.");
} catch {
  console.error(
    "Migration failed. Check PostgreSQL connectivity, permissions, and database logs.",
  );
  process.exitCode = 1;
} finally {
  await client.end();
}
