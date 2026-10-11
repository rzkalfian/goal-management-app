import { sqlite, usePostgres } from "../db/connection.js";
const pgAttempts = usePostgres ? await import("./postgres-attempts.js") : null;

export function allowLogin(email) {
  if (pgAttempts) return pgAttempts.allowLogin(email);
  const now = Date.now();
  return sqlite.transaction(() => {
    sqlite.prepare("DELETE FROM login_attempts WHERE expires < ?").run(now);
    const row = sqlite.prepare("SELECT attempts FROM login_attempts WHERE email = ?").get(email);
    if (row?.attempts >= 8) return false;
    sqlite.prepare("INSERT INTO login_attempts (email, attempts, expires) VALUES (?, 1, ?) ON CONFLICT(email) DO UPDATE SET attempts = attempts + 1")
      .run(email, now + 15 * 60 * 1000);
    return true;
  }).immediate();
}
export function clearAttempts(email) {
  if (pgAttempts) return pgAttempts.clearAttempts(email);
  sqlite.prepare("DELETE FROM login_attempts WHERE email = ?").run(email);
}