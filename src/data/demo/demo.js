import { timingSafeEqual } from "node:crypto";

export const DEMO_ID = "demo";
export const DEMO_EMAIL = "demo@goals.local";
export const DEMO_PASSWORD = "demo-goals";
const at = "2026-01-01T00:00:00.000Z";

export const demoUser = {
  id: DEMO_ID,
  email: DEMO_EMAIL,
  role: "DEMO",
  sessionVersion: 0,
  createdAt: at,
};
const demoCategories = [
  { id: "c1", name: "Buku", icon: null, productCount: 2 },
  { id: "c2", name: "Gadget", icon: null, productCount: 2 },
  { id: "c3", name: "Gaya Hidup", icon: null, productCount: 1 },
];
const item = (id, title, status, categoryIndex, affiliateUrl = null) => ({
  id,
  title,
  status,
  buyUrl: "https://example.com/demo",
  affiliateUrl,
  categoryId: demoCategories[categoryIndex].id,
  category: demoCategories[categoryIndex].name,
  categoryIcon: null,
  createdAt: at,
  updatedAt: at,
});
const demoProducts = [
  item("p1", "Atomic Habits", "SUDAH_DIBELI", 0),
  item("p2", "Deep Work", "WISHLIST", 0, "https://example.com/aff"),
  item("p3", "Headphone Nirkabel", "WISHLIST", 1),
  item("p4", "Power Bank 20.000 mAh", "SERING_DIBELI", 1),
  item("p5", "Botol Minum Stainless", "SUDAH_DIBELI", 2),
];

export function isDemoLogin(email, password) {
  const a = Buffer.from(String(password));
  const b = Buffer.from(DEMO_PASSWORD);
  return email === DEMO_EMAIL && a.length === b.length && timingSafeEqual(a, b);
}
export function demoList(pathname) {
  if (pathname === "/api/products") return demoProducts;
  if (pathname === "/api/categories") return demoCategories;
  if (pathname === "/api/users") return [demoUser];
  return null;
}
