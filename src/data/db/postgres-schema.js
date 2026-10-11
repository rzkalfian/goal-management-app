import { pgTable, text, integer, bigint } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), email: text("email").notNull().unique(),
  password: text("password").notNull(), role: text("role").notNull(),
  sessionVersion: integer("session_version").notNull().default(0), createdAt: text("created_at").notNull(),
});
export const categories = pgTable("categories", {
  id: text("id").primaryKey(), name: text("name").notNull().unique(),
});
export const products = pgTable("products", {
  id: text("id").primaryKey(), title: text("title").notNull(), status: text("status").notNull(),
  buyUrl: text("buy_url").notNull(), affiliateUrl: text("affiliate_url"), imageUrl: text("image_url"),
  categoryId: text("category_id").notNull().references(() => categories.id),
  createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
});
export const settings = pgTable("settings", { key: text("key").primaryKey(), value: text("value").notNull() });
export const loginAttempts = pgTable("login_attempts", {
  email: text("email").primaryKey(), attempts: integer("attempts").notNull(), expires: bigint("expires", { mode: "number" }).notNull(),
});