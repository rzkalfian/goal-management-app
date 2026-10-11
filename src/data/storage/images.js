import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";
import { ValidationError } from "../../core/use-cases/validation.js";

export const uploadDirectory = resolve(dirname(process.env.DATABASE_PATH || ".data/goals.sqlite"), "uploads");
export async function saveImage(file) {
  if (!file || !file.size) return null;
  if (file.size > 5 * 1024 * 1024) throw new ValidationError("Gambar maksimal 5 MB.");
  let image;
  try {
    const input = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 20_000_000 });
    const metadata = await input.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format)) throw new Error();
    image = await input.rotate().resize(1200, 1200, { fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  } catch {
    throw new ValidationError("Gunakan gambar JPEG, PNG, atau WebP yang valid (maksimal 20 megapiksel).");
  }
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (cloud && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const publicId = `goals/${randomUUID()}`;
    const signature = createHash("sha1").update(`public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`).digest("hex");
    const form = new FormData();
    form.set("file", new Blob([image], { type: "image/webp" }), "product.webp");
    form.set("public_id", publicId); form.set("timestamp", timestamp);
    form.set("api_key", process.env.CLOUDINARY_API_KEY); form.set("signature", signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`, {
      method: "POST", body: form, signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error("Penyimpanan Cloudinary gagal.");
    const result = await response.json();
    return result.secure_url;
  }
  if (process.env.NODE_ENV === "production") throw new ValidationError("Penyimpanan gambar belum dikonfigurasi. Isi pengaturan Cloudinary.");
  await mkdir(uploadDirectory, { recursive: true });
  const filename = `${randomUUID()}.webp`;
  await writeFile(resolve(uploadDirectory, filename), image);
  return `/api/images/${filename}`;
}