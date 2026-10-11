// Menurunkan ukuran gambar di browser agar muat batas body Vercel (4,5 MB); gagal = kirim file asli.
export async function compressImage(file, maxSide = 1600) {
  if (!file?.size || !file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    return blob && blob.size < file.size ? new File([blob], "product.webp", { type: "image/webp" }) : file;
  } catch { return file; }
}
