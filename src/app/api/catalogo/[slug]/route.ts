export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { suppliers, products, categories } from "@/db/schema"
import { eq, and, ilike, asc } from "drizzle-orm"
import { redis, CACHE_TTL } from "@/lib/redis"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { searchParams } = new URL(req.url)
  const search = searchParams.get("q") ?? ""
  const categoryId = searchParams.get("categoria") ?? ""
  const page = Math.max(1, Number(searchParams.get("pagina") ?? "1"))
  const limit = 50
  const offset = (page - 1) * limit

  const cacheKey = `supplier:${slug}:catalog:${search}:${categoryId}:${page}`

  if (!search && !categoryId) {
    const cached = await redis.get(cacheKey)
    if (cached) return NextResponse.json(JSON.parse(cached))
  }

  const supplier = await db.query.suppliers.findFirst({
    where: and(eq(suppliers.slug, slug), eq(suppliers.active, true)),
  })

  if (!supplier) return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 })

  const where = and(
    eq(products.supplierId, supplier.id),
    eq(products.active, true),
    search ? ilike(products.name, `%${search}%`) : undefined,
    categoryId ? eq(products.categoryId, categoryId) : undefined,
  )

  const [items, cats] = await Promise.all([
    db.query.products.findMany({
      where,
      orderBy: asc(products.name),
      limit,
      offset,
      with: { category: true },
    }),
    db.query.categories.findMany({
      where: eq(categories.supplierId, supplier.id),
      orderBy: asc(categories.name),
    }),
  ])

  const result = {
    supplier: {
      id: supplier.id,
      name: supplier.name,
      slug: supplier.slug,
      description: supplier.description,
      logo: supplier.logo,
      phone: supplier.phone,
    },
    categories: cats,
    products: items,
    pagination: { page, limit, hasMore: items.length === limit },
  }

  if (!search && !categoryId) {
    await redis.setEx(cacheKey, CACHE_TTL.products, JSON.stringify(result))
  }

  return NextResponse.json(result)
}
