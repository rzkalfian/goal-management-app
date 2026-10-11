import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";
import { tmpdir } from "node:os";
import sharp from "sharp";

const directory = mkdtempSync(join(tmpdir(), "goals-images-"));
process.env.DATABASE_PATH = join(directory, "test.sqlite");
const { saveImage, uploadDirectory } = await import("../src/data/storage/images.js");
after(() => rmSync(directory, { recursive: true, force: true }));

test("valid image is normalized to WebP in isolated storage", async () => {
  const png = await sharp({ create: { width: 10, height: 10, channels: 3, background: "white" } }).png().toBuffer();
  const url = await saveImage(new File([png], "photo.png", { type: "image/png" }));
  assert.match(url, /^\/api\/images\/[a-f0-9-]{36}\.webp$/);
  assert.equal((await sharp(readFileSync(join(uploadDirectory, basename(url)))).metadata()).format, "webp");
  assert.equal(await saveImage(new File([], "")), null);
});

test("oversized files and disguised non-images are rejected", async () => {
  await assert.rejects(() => saveImage(new File(["not an image"], "fake.png", { type: "image/png" })));
  await assert.rejects(() => saveImage({ size: 6 * 1024 * 1024 }));
});