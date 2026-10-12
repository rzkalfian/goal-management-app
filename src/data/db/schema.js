import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), email: text("email").notNull().unique(),
  password: text("password").notNull(), role: text("role").notNull(),
  sessionVersion: integer("session_version").notNull().default(0),
  createdAt: text("created_at").notNull(),
});
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(), name: text("name").notNull().unique(), icon: text("icon"),
});
export const products = sqliteTable("products", {
  id: text("id").primaryKey(), title: text("title").notNull(),
  status: text("status").notNull(), buyUrl: text("buy_url").notNull(),
  affiliateUrl: text("affiliate_url"),
  categoryId: text("category_id").notNull().references(() => categories.id),
  createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
});