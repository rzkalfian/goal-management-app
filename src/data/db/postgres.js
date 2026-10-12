import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./postgres-schema.js";

const test = globalThis.__goalsPostgresTest;
if (!test && !process.env.DATABASE_URL)
  throw new Error("DATABASE_URL is required for PostgreSQL.");
export const client = test
  ? null
  : postgres(process.env.DATABASE_URL, {
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 15,
    });
export const pg = test?.db || drizzle(client, { schema });
