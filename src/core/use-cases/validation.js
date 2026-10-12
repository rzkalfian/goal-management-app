import dynamicIconImports from "lucide-react/dynamicIconImports.mjs";
import { ROLES, STATUSES } from "../entities/product.js";

export class ValidationError extends Error {}

export function text(value, label, max = 160) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw new ValidationError(
      `${label} wajib diisi, maksimal ${max} karakter.`,
    );
  }
  return value.trim();
}

export function webUrl(value, optional = false) {
  if (optional && (value === "" || value == null)) return null;
  const input = text(value, "Link", 2048);
  try {
    const url = new URL(input);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw new Error();
    return url.href;
  } catch {
    throw new ValidationError(
      "Link harus berupa URL http atau https yang valid.",
    );
  }
}

export function productInput(input) {
  const status = input.status;
  if (!Object.hasOwn(STATUSES, status))
    throw new ValidationError("Status produk tidak valid.");
  return {
    title: text(input.title, "Nama produk"),
    status,
    categoryId: text(input.categoryId, "Kategori", 80),
    buyUrl: webUrl(input.buyUrl),
    affiliateUrl: webUrl(input.affiliateUrl, true),
  };
}

export function categoryInput(input) {
  const icon = typeof input.icon === "string" && input.icon ? input.icon : null;
  if (icon && !Object.hasOwn(dynamicIconImports, icon))
    throw new ValidationError("Ikon tidak tersedia di Lucide.");
  return { name: text(input.name, "Nama kategori", 60), icon };
}

export function userInput(input, requirePassword = true) {
  const email = text(input.email, "Email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new ValidationError("Email tidak valid.");
  if (!ROLES.includes(input.role))
    throw new ValidationError("Role tidak valid.");
  const password = input.password;
  if (requirePassword || password) {
    if (
      typeof password !== "string" ||
      password.length < 12 ||
      password.length > 128
    ) {
      throw new ValidationError("Password harus 12 sampai 128 karakter.");
    }
  }
  return { email, role: input.role, ...(password ? { password } : {}) };
}
