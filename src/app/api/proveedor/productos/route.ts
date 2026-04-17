export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { products, priceHistory, suppliers } from "@/db/schema"
import { eq, and, asc } from "drizzle-orm"
import { invalidateSupplierCache } from "@/lib/redis"
import { notifyFollowers } from "@/lib/notify-price-changes"
import { headers } from "next/headers"

async function getSupplier(userId: string) {
  return db.query.suppliers.findFirst({
    where: eq(suppliers.userId, userId),
  })
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const supplier = await getSupplier(session.user.id)
  if (!supplier) return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 })

  const items = await db.query.products.findMany({
    where: eq(products.supplierId, supplier.id),
    orderBy: asc(products.name),
    with: { category: true },
  })

  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const supplier = await getSupplier(session.user.id)
  if (!supplier) return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 })

  const body = await req.json()
  const { sku, name, description, unit, price, categoryId, stock } = body

  if (!name || !price) {
    return NextResponse.json({ error: "Nombre y precio son obligatorios" }, { status: 400 })
  }

  const [product] = await db.insert(products).values({
    supplierId: supplier.id,
    sku: sku ?? null,
    name,
    description: description ?? null,
    unit: unit ?? "unidad",
    currentPrice: String(price),
    categoryId: categoryId ?? null,
    stock: stock ?? null,
  }).returning()

  await db.insert(priceHistory).values({
    productId: product.id,
    supplierId: supplier.id,
    previousPrice: null,
    newPrice: String(price),
    method: "manual",
    updatedBy: session.user.id,
  })

  await invalidateSupplierCache(supplier.id)

  return NextResponse.json(product, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const supplier = await getSupplier(session.user.id)
  if (!supplier) return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 })

  const body = await req.json()
  const { id, price, ...rest } = body

  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

  const existing = await db.query.products.findFirst({
    where: and(eq(products.id, id), eq(products.supplierId, supplier.id)),
  })
  if (!existing) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })

  const priceChanged = price && String(price) !== existing.currentPrice

  const [updated] = await db.update(products).set({
    ...rest,
    ...(price ? { currentPrice: String(price) } : {}),
    updatedAt: new Date(),
  }).where(and(eq(products.id, id), eq(products.supplierId, supplier.id))).returning()

  if (priceChanged) {
    await db.insert(priceHistory).values({
      productId: id,
      supplierId: supplier.id,
      previousPrice: existing.currentPrice,
      newPrice: String(price),
      method: "manual",
      updatedBy: session.user.id,
    })
  }

  await invalidateSupplierCache(supplier.id)

  if (priceChanged) {
    notifyFollowers(supplier.id, [{
      productId: id,
      productName: existing.name,
      unit: existing.unit,
      previousPrice: existing.currentPrice,
      newPrice: String(price),
    }]).catch(console.error)
  }

  return NextResponse.json(updated)
}
