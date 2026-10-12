import { hashPassword } from "../src/data/auth/password.js";

const [email, password] = process.argv.slice(2);
if (!email || !password || password.length < 12 || password.length > 128) {
  console.error(
    "Usage: npm run db:reset-password -- <email> <new-password (12-128 chars)>",
  );
  process.exit(1);
}
const hash = await hashPassword(password);
let changed;
if (process.env.DATABASE_URL) {
  const { default: postgres } = await import("postgres");
  const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
  try {
    changed = (
      await client`UPDATE users SET password = ${hash}, session_version = session_version + 1 WHERE email = ${email} RETURNING id`
    ).length;
  } finally {
    await client.end();
  }
} else {
  const { default: Database } = await import("better-sqlite3");
  const db = new Database(process.env.DATABASE_PATH || ".data/goals.sqlite");
  changed = db
    .prepare(
      "UPDATE users SET password = ?, session_version = session_version + 1 WHERE email = ?",
    )
    .run(hash, email).changes;
  db.close();
}
if (!changed) {
  console.error("Email tidak ditemukan.");
  process.exit(1);
}
console.log("Password direset. Login ulang diperlukan.");
