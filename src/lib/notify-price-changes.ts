import { db } from "@/db"
import { supplierFollowers, notifications, users, suppliers, products } from "@/db/schema"
import { eq, and, inArray } from "drizzle-orm"
import { sendPriceUpdateEmail } from "./email"

export interface PriceChange {
  productId: string
  productName: string
  unit: string
  previousPrice: string
  newPrice: string
}

export async function notifyFollowers(supplierId: string, changes: PriceChange[]) {
  if (changes.length === 0) return

  const supplier = await db.query.suppliers.findFirst({
    where: eq(suppliers.id, supplierId),
  })
  if (!supplier) return

  const followers = await db.query.supplierFollowers.findMany({
    where: and(
      eq(supplierFollowers.supplierId, supplierId),
      eq(supplierFollowers.notifyPriceChanges, true)
    ),
    with: { user: true },
  })

  if (followers.length === 0) return

  // Insertar notificaciones in-app en batch
  await db.insert(notifications).values(
    followers.map((f) => ({
      userId: f.userId,
      supplierId,
      type: "price_update",
      title: `${supplier.name} actualizó sus precios`,
      body: `${changes.length} producto${changes.length !== 1 ? "s" : ""} cambiaron de precio.`,
    }))
  )

  // Enviar emails (sin bloquear — fire and forget)
  for (const follower of followers) {
    sendPriceUpdateEmail({
      to: follower.user.email,
      userName: follower.user.name,
      supplierName: supplier.name,
      supplierSlug: supplier.slug,
      changes,
    }).catch((err) => console.error("Email error:", err))
  }
}
