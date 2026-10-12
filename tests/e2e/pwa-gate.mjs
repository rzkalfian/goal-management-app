import { expect } from "@playwright/test";
import sharp from "sharp";
import { checkLayout } from "./helpers.mjs";

export async function pwaGate(page, testInfo) {
  const manifestLink = await page
    .locator('link[rel="manifest"]')
    .getAttribute("href");
  const response = await page.request.get(manifestLink);
  expect(response.status()).toBe(200);
  const manifest = await response.json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.scope).toBe("/");
  for (const icon of manifest.icons) {
    const image = await page.request.get(icon.src);
    expect(image.status()).toBe(200);
    const pixels = sharp(await image.body());
    const metadata = await pixels.metadata();
    expect(`${metadata.width}x${metadata.height}`).toBe(icon.sizes);
    expect(
      (await pixels.stats()).channels.some((channel) => channel.stdev > 10),
    ).toBe(true);
  }
  const appleIcon = await page.request.get(
    await page.locator('link[rel="apple-touch-icon"]').getAttribute("href"),
  );
  expect((await sharp(await appleIcon.body()).metadata()).width).toBe(180);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    )
    .toBe(true);
  const worker = await page.request.get("/sw.js");
  expect(worker.headers()["cache-control"]).toContain("no-store");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    event.prompt = async () => {
      document.documentElement.dataset.installRequested = "yes";
    };
    event.userChoice = Promise.resolve({ outcome: "accepted" });
    window.dispatchEvent(event);
  });
  await expect(
    page.getByLabel("Instal aplikasi", { exact: true }),
  ).toBeVisible();
  await checkLayout(page, 320);
  await page.getByLabel("Instal aplikasi", { exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-install-requested",
    "yes",
  );
  await expect(page.getByLabel("Instal aplikasi", { exact: true })).toHaveCount(
    0,
  );
  for (const width of [320, 390, 700, 900, 1440])
    await checkLayout(page, width);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const unobstructed = await page.evaluate(() => {
    const nav = document.querySelector("nav").getBoundingClientRect();
    const footer = document.querySelector("footer").getBoundingClientRect();
    return footer.bottom <= nav.top;
  });
  expect(unobstructed).toBe(true);
  await page.getByRole("link", { name: "Pengguna", exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await checkLayout(page, 390);
  await page.getByRole("link", { name: "Barang", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(4);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath("pwa-mobile.png"),
    fullPage: true,
  });
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys();
    return (
      await Promise.all(
        keys
          .filter((key) => key.startsWith("goals-public-"))
          .map(async (key) =>
            (await (await caches.open(key)).keys()).map(
              (request) => new URL(request.url).pathname,
            ),
          ),
      )
    ).flat();
  });
  expect(cached).toContain("/offline.html");
  expect(
    cached.every(
      (path) => path === "/offline.html" || path.startsWith("/icons/"),
    ),
  ).toBe(true);
  await page.context().setOffline(true);
  await page.goto("/products");
  await expect(
    page.getByRole("heading", { name: "Anda sedang offline" }),
  ).toBeVisible();
  expect(
    await page.locator("img").evaluate((image) => image.naturalWidth),
  ).toBeGreaterThan(0);
  await page.screenshot({ path: testInfo.outputPath("pwa-offline.png") });
  await page.context().setOffline(false);
  await page.getByRole("button", { name: "Coba lagi", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Daftar barang", exact: true }),
  ).toBeVisible();
  await expect(page.locator("article")).toHaveCount(4);
}
