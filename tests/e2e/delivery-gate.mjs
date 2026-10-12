import { expect } from "@playwright/test";
import { origin, checkLayout } from "./helpers.mjs";
import { checkContrast } from "./contrast.mjs";

export async function deliveryGate(page, browser, testInfo) {
  const categories = await (await page.request.get("/api/categories")).json();
  const users = await (await page.request.get("/api/users")).json();
  expect(
    users.every((user) => !("password" in user) && !("sessionVersion" in user)),
  ).toBe(true);
  const anonymous = await browser.newContext({
    baseURL: "http://localhost:3101",
  });
  expect((await anonymous.request.get("/api/products")).status()).toBe(401);
  expect(
    (
      await anonymous.request.delete("/api/products/missing", {
        headers: origin,
      })
    ).status(),
  ).toBe(401);
  await anonymous.close();
  expect(
    (
      await page.request.post("/api/categories", { data: { name: "Blocked" } })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post("/api/categories", {
        headers: { Origin: "https://untrusted.example" },
        data: { name: "Blocked" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post("/api/setup", { headers: origin, data: {} })
    ).status(),
  ).toBe(400);
  expect(
    (
      await page.request.post("/api/users", {
        headers: origin,
        data: { email: "x".repeat(9000) },
      })
    ).status(),
  ).toBe(413);
  expect(
    (
      await page.request.post("/api/products", {
        headers: origin,
        multipart: {
          title: "Unsafe",
          status: "WISHLIST",
          categoryId: categories[0].id,
          buyUrl: "javascript:alert(1)",
        },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await page.request.delete(`/api/categories/${categories[0].id}`, {
        headers: origin,
      })
    ).status(),
  ).toBe(400);
  await page.getByRole("button", { name: /^Sering Dibeli/ }).click();
  await expect(page.getByText("Tidak ada barang yang cocok")).toBeVisible();
  await page.getByRole("button", { name: "Reset filter" }).click();
  await page.getByLabel("Filter kategori").selectOption(categories[1].id);
  await expect(page.getByText("Tidak ada barang yang cocok")).toBeVisible();
  await page.getByRole("button", { name: "Reset filter" }).click();
  await page
    .getByRole("button", { name: "Tambah barang", exact: true })
    .first()
    .click();
  const title = page.getByLabel("Nama produk", { exact: true });
  await expect(title).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Status", { exact: true })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(
    await title.evaluate((element) => getComputedStyle(element).outlineWidth),
  ).toBe("3px");
  await page
    .getByRole("button", { name: "Simpan barang", exact: true })
    .click();
  expect(await title.evaluate((element) => element.validity.valueMissing)).toBe(
    true,
  );
  await checkContrast(page);
  await checkLayout(page, 390);
  await page.getByLabel("Tutup dialog").click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Tambah barang", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Batal", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  for (const dark of [false, true]) {
    if (
      (await page
        .locator("html")
        .evaluate((element) => element.classList.contains("dark"))) !== dark
    )
      await page.getByLabel("Ganti tema").click();
    for (const width of [390, 1440]) {
      await checkLayout(page, width);
      await checkContrast(page);
    }
    await page.screenshot({
      path: testInfo.outputPath(
        dark ? "desktop-dark.png" : "desktop-final-light.png",
      ),
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 320, height: 900 });
  const zoom = await page.addStyleTag({
    content: "html { font-size: 200% !important; }",
  });
  await checkLayout(page, 320);
  await zoom.evaluate((element) => element.remove());
  await page
    .context()
    .route("https://example.com/**", (route) =>
      route.fulfill({ body: "[TEST] External destination" }),
    );
  const popupPromise = page.waitForEvent("popup");
  await page
    .locator("article")
    .first()
    .getByRole("link", { name: /^Beli / })
    .click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/example.com\/affiliate/);
  await popup.close();
  await page.context().unroute("https://example.com/**");
  await page.route("**/api/products", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "[TEST] Koneksi gagal" }),
    }),
  );
  await page.reload();
  await expect(page.locator(".error-message")).toContainText(
    "[TEST] Koneksi gagal",
  );
  await page.unroute("**/api/products");
  await page.getByRole("button", { name: "Coba lagi", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(4);
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/api/products", async (route) => {
    await pending;
    await route.continue();
  });
  await page.reload();
  await expect(page.getByText("Memuat data...", { exact: true })).toBeVisible();
  release();
  await expect(page.locator("article")).toHaveCount(4);
  await page.unroute("**/api/products");
}
