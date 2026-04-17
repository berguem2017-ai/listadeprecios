import { db } from "@/db"
import { suppliers, subscriptions } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getSupplierSubscription(userId: string) {
  const supplier = await db.query.suppliers.findFirst({
    where: eq(suppliers.userId, userId),
  })
  if (!supplier) return null

  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.supplierId, supplier.id),
  })

  const now = new Date()
  const isActive =
    sub?.status === "active" ||
    (sub?.status === "trialing" && sub?.trialEndsAt ? new Date(sub.trialEndsAt) > now : false) ||
    sub?.status === "trialing"

  return { supplier, subscription: sub ?? null, isActive, plan: sub?.plan ?? "free" }
}

export async function ensureSupplierSubscription(supplierId: string) {
  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.supplierId, supplierId),
  })
  if (existing) return existing

  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 14)

  const [sub] = await db.insert(subscriptions).values({
    supplierId,
    plan: "free",
    status: "trialing",
    trialEndsAt,
  }).returning()

  return sub
}
