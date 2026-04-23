export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { suppliers } from "@/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const existing = await db.query.suppliers.findFirst({
    where: eq(suppliers.userId, session.user.id),
  })
  if (existing) return NextResponse.json(existing)

  const baseSlug = slugify(session.user.name || session.user.email.split("@")[0])

  // Evitar slug duplicado
  let slug = baseSlug
  let attempt = 0
  while (true) {
    const taken = await db.query.suppliers.findFirst({ where: eq(suppliers.slug, slug) })
    if (!taken) break
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  const [supplier] = await db.insert(suppliers).values({
    userId: session.user.id,
    name: session.user.name || session.user.email.split("@")[0],
    slug,
  }).returning()

  return NextResponse.json(supplier, { status: 201 })
}
