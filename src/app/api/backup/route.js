import { api } from "../http";
import { sqlite, usePostgres } from "@/data/db/connection";
export const GET = api(
  async () => {
    if (usePostgres) {
      const { exportPostgres } =
        await import("@/data/repositories/postgres-backup");
      return new Response(JSON.stringify(await exportPostgres()), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": "attachment; filename=goals-backup.json",
          "Cache-Control": "no-store",
        },
      });
    }
    return new Response(sqlite.serialize(), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": "attachment; filename=goals-backup.sqlite",
        "Cache-Control": "no-store",
      },
    });
  },
  { developer: true },
);
