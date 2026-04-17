export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { suppliers, supplierFollowers } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { headers } from "next/headers"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Necesitás iniciar sesión para seguir a un proveedor" }, { status: 401 })

  const { slug } = await params

  const supplier = await db.query.suppliers.findFirst({
    where: eq(suppliers.slug, slug),
  })
  if (!supplier) return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 })

  const existing = await db.query.supplierFollowers.findFirst({
    where: and(
      eq(supplierFollowers.userId, session.user.id),
      eq(supplierFollowers.supplierId, supplier.id)
    ),
  })

  if (existing) {
    await db.delete(supplierFollowers).where(eq(supplierFollowers.id, existing.id))
    return NextResponse.json({ following: false })
  }

  await db.insert(supplierFollowers).values({
    userId: session.user.id,
    supplierId: supplier.id,
    notifyPriceChanges: true,
  })

  return NextResponse.json({ following: true })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ following: false })

  const { slug } = await params

  const supplier = await db.query.suppliers.findFirst({
    where: eq(suppliers.slug, slug),
  })
  if (!supplier) return NextResponse.json({ following: false })

  const existing = await db.query.supplierFollowers.findFirst({
    where: and(
      eq(supplierFollowers.userId, session.user.id),
      eq(supplierFollowers.supplierId, supplier.id)
    ),
  })

  return NextResponse.json({ following: !!existing })
}
