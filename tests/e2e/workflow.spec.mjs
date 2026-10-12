import { test, expect } from "@playwright/test";
import {
  developer,
  admin,
  origin,
  login,
  addProduct,
  removeItem,
  checkLayout,
} from "./helpers.mjs";
import { deliveryGate } from "./delivery-gate.mjs";
import { pwaGate } from "./pwa-gate.mjs";

test("setup, real product/category/user CRUD, role boundaries, and responsive themes", async ({
  page,
  browser,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveURL(/\/setup$/);
  await page.getByLabel("Email", { exact: true }).fill(developer.email);
  await page.getByLabel("Password", { exact: true }).fill(developer.password);
  await page.getByLabel("Konfirmasi password").fill("mismatched-password");
  await page.getByRole("button", { name: "Buat akun Developer" }).click();
  await expect(page.locator(".error-message")).toContainText("tidak cocok");
  await page.getByLabel("Konfirmasi password").fill(developer.password);
  await page.getByRole("button", { name: "Buat akun Developer" }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByText("Daftar barang masih kosong")).toBeVisible();
  await page
    .getByRole("button", { name: "Tambah barang", exact: true })
    .first()
    .click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await addProduct(page, "[TEST] Buku");
  const product = page.locator("article").first();
  await expect(
    product.getByRole("link", { name: "Beli [TEST] Buku" }),
  ).toHaveAttribute("href", "https://example.com/affiliate");
  await expect(
    product.getByRole("link", { name: "Affiliate [TEST] Buku" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Edit [TEST] Buku", exact: true })
    .click();
  await page.getByLabel("Status", { exact: true }).selectOption("SUDAH_DIBELI");
  await page
    .getByRole("button", { name: "Simpan barang", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: /^Wishlist/ }).click();
  await expect(page.getByText("Tidak ada barang yang cocok")).toBeVisible();
  await page.getByRole("button", { name: "Reset filter" }).click();
  for (let index = 2; index <= 5; index++)
    await addProduct(page, `[TEST] Barang ${index}`);
  expect(
    await page
      .locator(".grid")
      .evaluate(
        (grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length,
      ),
  ).toBe(5);
  await page.screenshot({
    path: testInfo.outputPath("desktop-light.png"),
    fullPage: true,
  });
  await page.getByLabel("Ganti tema").click();
  await expect(page.locator("html")).toHaveClass("dark");
  for (const width of [320, 390, 700, 900, 1150, 1440])
    await checkLayout(page, width);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: testInfo.outputPath("mobile-dark.png"),
    fullPage: true,
  });
  await page.getByLabel("Ganti tema").click();
  await checkLayout(page, 390);
  await page.getByLabel("Cari barang").fill("not-found-test");
  await expect(page.getByText("Tidak ada barang yang cocok")).toBeVisible();
  await page.getByRole("button", { name: "Reset filter" }).click();
  await page.getByRole("link", { name: "Kategori", exact: true }).click();
  await page
    .getByRole("button", { name: "Tambah kategori", exact: true })
    .first()
    .click();
  await page.getByLabel("Nama kategori").fill("[TEST] Kategori");
  await page.getByRole("button", { name: "Simpan kategori" }).click();
  await expect(
    page.getByRole("heading", { name: "[TEST] Kategori", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit [TEST] Kategori" }).click();
  await page.getByLabel("Nama kategori").fill("[TEST] Kategori baru");
  await page.getByRole("button", { name: "Simpan kategori" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await removeItem(page, "[TEST] Kategori baru");
  await page.getByRole("link", { name: "Pengguna", exact: true }).click();
  await page.getByRole("button", { name: "Tambah pengguna" }).click();
  await page.getByLabel("Email", { exact: true }).fill(admin.email);
  await page.getByLabel("Password", { exact: true }).fill(admin.password);
  await page.getByRole("button", { name: "Simpan pengguna" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const context = await browser.newContext({
    baseURL: "http://localhost:3101",
  });
  const adminPage = await context.newPage();
  await login(adminPage, admin);
  expect(
    (
      await adminPage.request.post("/api/users", {
        headers: origin,
        data: admin,
      })
    ).status(),
  ).toBe(403);
  expect((await adminPage.request.get("/api/backup")).status()).toBe(403);
  await adminPage.getByRole("link", { name: "Pengguna", exact: true }).click();
  await expect(adminPage.getByRole("table")).toBeVisible();
  await expect(
    adminPage.getByRole("button", { name: "Tambah pengguna" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: `Edit ${admin.email}`, exact: true })
    .click();
  await page
    .getByLabel("Password", { exact: false })
    .fill("new-test-admin-pass-123");
  await page.getByRole("button", { name: "Simpan pengguna" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect((await adminPage.request.get("/api/products")).status()).toBe(401);
  await context.close();
  await removeItem(page, admin.email);
  await page.getByRole("link", { name: "Sistem", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Unduh cadangan database" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "goals-backup.sqlite",
  );
  await page.getByRole("link", { name: "Barang", exact: true }).click();
  await removeItem(page, "[TEST] Buku");
  await page.getByLabel("Keluar", { exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await login(page);
  await deliveryGate(page, browser, testInfo);
  await pwaGate(page, testInfo);
  expect(errors).toEqual([]);
});

test("compact product cards use two mobile columns", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  if (page.url().endsWith("/setup")) {
    await page.getByLabel("Email", { exact: true }).fill(developer.email);
    await page.getByLabel("Password", { exact: true }).fill(developer.password);
    await page.getByLabel("Konfirmasi password").fill(developer.password);
    await page.getByRole("button", { name: "Buat akun Developer" }).click();
    await expect(page).toHaveURL(/\/products$/, { timeout: 30_000 });
  } else {
    await login(page);
  }
  const titles = [
    "[TEST] Compact barang dengan nama panjang tanpa terpotong",
    "[TEST] Compact barang kedua",
  ];
  for (const title of titles) await addProduct(page, title);
  await expect(
    page.getByRole("link", { name: `Beli ${titles[0]}`, exact: true }),
  ).toHaveAttribute("href", "https://example.com/affiliate");
  await page
    .getByRole("button", { name: `Edit ${titles[1]}`, exact: true })
    .click();
  await page.getByLabel("Link affiliate (opsional)").fill("");
  await page
    .getByRole("button", { name: "Simpan barang", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: `Beli ${titles[1]}`, exact: true }),
  ).toHaveAttribute("href", "https://example.com/product");
  await expect(page.getByRole("link", { name: /^Affiliate / })).toHaveCount(0);
  for (const dark of [false, true]) {
    await page.evaluate((enabled) => {
      document.documentElement.classList.toggle("dark", enabled);
    }, dark);
    for (const [width, columns] of [
      [320, 2],
      [390, 2],
      [639, 2],
      [640, 2],
      [700, 2],
      [900, 3],
      [1440, 5],
      [1920, 5],
      [2560, 5],
    ]) {
      await checkLayout(page, width);
      await expect(page.locator(".product-grid")).toHaveCSS(
        "grid-template-columns",
        new RegExp(`^(\\S+\\s+){${columns - 1}}\\S+$`),
      );
      if (width >= 640) {
        const widths = await page
          .locator(".product-card")
          .evaluateAll((cards) =>
            cards.map((card) => card.getBoundingClientRect().width),
          );
        expect(widths.every((cardWidth) => cardWidth <= 200)).toBe(true);
      }
      const overflowing = await page
        .locator(".product-card")
        .evaluateAll((cards) =>
          cards.flatMap((card) => {
            const bounds = card.getBoundingClientRect();
            return Array.from(
              card.querySelectorAll(
                "h2, .badge, .product-image-category, .product-actions .button",
              ),
            ).filter((element) => {
              if (!element.getClientRects().length) return false;
              const child = element.getBoundingClientRect();
              return (
                child.left < bounds.left ||
                child.right > bounds.right ||
                child.bottom > bounds.bottom
              );
            }).length;
          }),
        );
      expect(overflowing.every((count) => count === 0)).toBe(true);
      await expect(page.locator(".product-image-category:visible")).toHaveCount(
        width < 640 ? 2 : 0,
      );
      await expect(
        page.locator(".product-badges .badge-neutral:visible"),
      ).toHaveCount(width < 640 ? 0 : 2);
      if (width === 390 || width === 1440 || width === 2560) {
        await page.screenshot({
          path: testInfo.outputPath(
            `compact-${width}-${dark ? "dark" : "light"}.png`,
          ),
          fullPage: true,
        });
      }
    }
  }
  for (const title of titles) await removeItem(page, title);
});
