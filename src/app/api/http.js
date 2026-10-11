import { requireUser, HttpError } from "@/data/auth/access";
import { ValidationError } from "@/core/use-cases/validation";
import { isSameOrigin } from "@/core/use-cases/origin";

export function api(handler, { developer = false, publicAccess = false } = {}) {
  return async (request, context) => {
    try {
      if (!["GET", "HEAD"].includes(request.method)) {
        if (!isSameOrigin(request, process.env.AUTH_URL)) throw new HttpError("Asal permintaan tidak diizinkan.", 403);
      }
      const user = publicAccess ? null : await requireUser(developer);
      const params = context?.params ? await context.params : {};
      const result = await handler(request, { user, params });
      return result instanceof Response ? result : Response.json(result, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      const status = error instanceof ValidationError ? 400 : error.status || 500;
      if (status === 500) console.error("API request failed:", error.cause?.code || error.code || error.name);
      return Response.json({ error: status === 500 ? "Permintaan gagal. Silakan coba lagi." : error.message }, { status });
    }
  };
}

async function boundedBody(request, limit) {
  if (Number(request.headers.get("content-length")) > limit) throw new HttpError("Ukuran unggahan terlalu besar.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new ValidationError("Data permintaan kosong.");
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) { await reader.cancel(); throw new HttpError("Ukuran unggahan terlalu besar.", 413); }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
export async function jsonBody(request) {
  try {
    const result = JSON.parse((await boundedBody(request, 8192)).toString());
    if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error();
    return result;
  } catch (error) {
    if (error instanceof HttpError || error instanceof ValidationError) throw error;
    throw new ValidationError("Format data tidak valid.");
  }
}
export async function productBody(request) {
  try {
    const body = await boundedBody(request, 6 * 1024 * 1024);
    return await new Request(request.url, { method: "POST", headers: request.headers, body }).formData();
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new ValidationError("Form produk tidak valid.");
  }
}
export function found(value) {
  if (!value) throw new HttpError("Data tidak ditemukan.", 404);
  return value;
}