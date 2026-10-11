import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { api } from "../../http";
import { HttpError } from "@/data/auth/access";
import { uploadDirectory } from "@/data/storage/images";
export const GET = api(async (request, { params }) => {
  if (!/^[a-f0-9-]{36}\.webp$/.test(params.filename)) throw new HttpError("Gambar tidak ditemukan.", 404);
  try {
    return new Response(await readFile(resolve(uploadDirectory, params.filename)), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff" },
    });
  } catch { throw new HttpError("Gambar tidak ditemukan.", 404); }
});