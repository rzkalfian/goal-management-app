import { expect } from "@playwright/test";
export const developer = { email: "developer@example.test", password: "test-only-password-123" };
export const admin = { email: "admin@example.test", password: "test-only-admin-pass-123" };
export const origin = { Origin: "http://localhost:3101" };

export async function login(page, account = developer) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(account.email);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByRole("button", { name: "Tambah barang", exact: true }).first()).toBeEnabled();
}
export async function addProduct(page, title) {
  await page.getByRole("button", { name: "Tambah barang", exact: true }).first().click();
  await page.getByLabel("Nama produk", { exact: true }).fill(title);
  await page.getByLabel("Link pembelian", { exact: true }).fill("https://example.com/product");
  await page.getByLabel("Link affiliate (opsional)").fill("https://example.com/affiliate");
  await page.getByRole("button", { name: "Simpan barang", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
}
export async function removeItem(page, label) {
  await page.getByRole("button", { name: `Hapus ${label}`, exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Hapus", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}
export async function checkLayout(page, width) {
  await page.setViewportSize({ width, height: 900 });
  const layout = await page.evaluate(() => ({ viewport: innerWidth, page: document.documentElement.scrollWidth }));
  expect(layout.page).toBeLessThanOrEqual(layout.viewport);
  const controls = await page.locator("button:visible, input:visible, select:visible, nav a:visible").evaluateAll((items) => items.map((item) => ({ label: item.getAttribute("aria-label") || item.textContent, height: item.getBoundingClientRect().height })));
  expect(controls.filter((item) => item.height < 43.5)).toEqual([]);
}