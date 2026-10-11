import { mkdir } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ListChecks } from "lucide-react";
import sharp from "sharp";

await mkdir("public/icons", { recursive: true });
const glyph = renderToStaticMarkup(createElement(ListChecks, { size: 280, color: "#ffffff", strokeWidth: 2.2 }));
const icon = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#3f75ff"/><g transform="translate(116 116)">${glyph}</g></svg>`);
for (const size of [192, 512]) {
  await sharp(icon).resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
}
await sharp(icon).png().toFile("public/icons/maskable-512.png");
await sharp(icon).resize(180, 180).png().toFile("public/icons/apple-touch-icon.png");
await sharp(icon).resize(32, 32).png().toFile("public/icons/favicon-32.png");
console.log("Generated ListChecks app icons (192, 512, maskable, Apple, favicon).");