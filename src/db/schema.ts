import {
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  integer,
  boolean,
  pgEnum,
  index,
} from "drizzle-orm/pg-core"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["admin", "proveedor", "cliente"])
export const updateMethodEnum = pgEnum("update_method", ["manual", "excel", "api"])
export const planEnum = pgEnum("plan", ["free", "starter", "pro"])
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "past_due", "cancelled", "trialing"])

// ─── Usuarios ─────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: roleEnum("role").notNull().default("cliente"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const verifications = pgTable("verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ─── Proveedores ──────────────────────────────────────────────────────────────

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  logo: text("logo"),
  phone: text("phone"),
  address: text("address"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Categorías ───────────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ─── Productos ────────────────────────────────────────────────────────────────

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    supplierId: uuid("supplier_id").notNull().references(() => suppliers.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    sku: text("sku"),
    name: text("name").notNull(),
    description: text("description"),
    unit: text("unit").notNull().default("unidad"),
    currentPrice: numeric("current_price", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("ARS"),
    stock: integer("stock"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_products_supplier").on(t.supplierId),
    index("idx_products_category").on(t.categoryId),
    index("idx_products_sku").on(t.sku),
  ]
)

// ─── Historial de precios ─────────────────────────────────────────────────────

export const priceHistory = pgTable(
  "price_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    supplierId: uuid("supplier_id").notNull().references(() => suppliers.id, { onDelete: "cascade" }),
    previousPrice: numeric("previous_price", { precision: 14, scale: 2 }),
    newPrice: numeric("new_price", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("ARS"),
    method: updateMethodEnum("method").notNull(),
    fileName: text("file_name"),
    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_price_history_product").on(t.productId),
    index("idx_price_history_supplier").on(t.supplierId),
    index("idx_price_history_created").on(t.createdAt),
  ]
)

// ─── Logs de actualizaciones (resumen por carga) ──────────────────────────────

export const updateLogs = pgTable(
  "update_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    supplierId: uuid("supplier_id").notNull().references(() => suppliers.id, { onDelete: "cascade" }),
    method: updateMethodEnum("method").notNull(),
    fileName: text("file_name"),
    fileUrl: text("file_url"),
    productsUpdated: integer("products_updated").notNull().default(0),
    productsCreated: integer("products_created").notNull().default(0),
    productsSkipped: integer("products_skipped").notNull().default(0),
    status: text("status").notNull().default("pending"),
    errorMessage: text("error_message"),
    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (t) => [
    index("idx_update_logs_supplier").on(t.supplierId),
    index("idx_update_logs_created").on(t.createdAt),
  ]
)

// ─── Suscripciones ────────────────────────────────────────────────────────────

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    supplierId: uuid("supplier_id").notNull().references(() => suppliers.id, { onDelete: "cascade" }),
    plan: planEnum("plan").notNull().default("free"),
    status: subscriptionStatusEnum("status").notNull().default("trialing"),
    mpPreferenceId: text("mp_preference_id"),
    mpPaymentId: text("mp_payment_id"),
    mpSubscriptionId: text("mp_subscription_id"),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    trialEndsAt: timestamp("trial_ends_at"),
    cancelledAt: timestamp("cancelled_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_subscriptions_supplier").on(t.supplierId),
    index("idx_subscriptions_status").on(t.status),
  ]
)

export const paymentEvents = pgTable("payment_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierId: uuid("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  mpPaymentId: text("mp_payment_id").notNull(),
  mpStatus: text("mp_status").notNull(),
  mpStatusDetail: text("mp_status_detail"),
  amount: numeric("amount", { precision: 14, scale: 2 }),
  currency: text("currency").default("ARS"),
  raw: text("raw"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ─── Favoritos de clientes ────────────────────────────────────────────────────

export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ─── Seguimiento de proveedores ───────────────────────────────────────────────

export const supplierFollowers = pgTable(
  "supplier_followers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    supplierId: uuid("supplier_id").notNull().references(() => suppliers.id, { onDelete: "cascade" }),
    notifyPriceChanges: boolean("notify_price_changes").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_followers_user").on(t.userId),
    index("idx_followers_supplier").on(t.supplierId),
  ]
)

// ─── Notificaciones ───────────────────────────────────────────────────────────

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    supplierId: uuid("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
    type: text("type").notNull().default("price_update"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_notifications_user").on(t.userId),
    index("idx_notifications_read").on(t.read),
  ]
)

// ─── Relations ───────────────────────────────────────────────────────────────

import { relations } from "drizzle-orm"

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  products: many(products),
  categories: many(categories),
  updateLogs: many(updateLogs),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  supplier: one(suppliers, { fields: [categories.supplierId], references: [suppliers.id] }),
  products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  supplier: one(suppliers, { fields: [products.supplierId], references: [suppliers.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  priceHistory: many(priceHistory),
}))

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
  product: one(products, { fields: [priceHistory.productId], references: [products.id] }),
  supplier: one(suppliers, { fields: [priceHistory.supplierId], references: [suppliers.id] }),
}))

export const updateLogsRelations = relations(updateLogs, ({ one }) => ({
  supplier: one(suppliers, { fields: [updateLogs.supplierId], references: [suppliers.id] }),
}))

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  supplier: one(suppliers, { fields: [subscriptions.supplierId], references: [suppliers.id] }),
}))

export const supplierFollowersRelations = relations(supplierFollowers, ({ one }) => ({
  user: one(users, { fields: [supplierFollowers.userId], references: [users.id] }),
  supplier: one(suppliers, { fields: [supplierFollowers.supplierId], references: [suppliers.id] }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  supplier: one(suppliers, { fields: [notifications.supplierId], references: [suppliers.id] }),
}))

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect
export type Supplier = typeof suppliers.$inferSelect
export type Category = typeof categories.$inferSelect
export type Product = typeof products.$inferSelect
export type PriceHistory = typeof priceHistory.$inferSelect
export type UpdateLog = typeof updateLogs.$inferSelect
export type SupplierFollower = typeof supplierFollowers.$inferSelect
export type Notification = typeof notifications.$inferSelect
export type Subscription = typeof subscriptions.$inferSelect
