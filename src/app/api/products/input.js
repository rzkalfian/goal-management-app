import { productBody } from "../http";
import { productInput, ValidationError } from "@/core/use-cases/validation";
import { saveImage } from "@/data/storage/images";

export async function readProduct(request, current) {
  const form = await productBody(request);
  const input = productInput(Object.fromEntries(form));
  const file = form.get("image");
  if (file && typeof file === "string") throw new ValidationError("Berkas gambar tidak valid.");
  const uploaded = await saveImage(file);
  return { ...input, imageUrl: uploaded || (form.get("removeImage") === "true" ? null : current?.imageUrl || null) };
}