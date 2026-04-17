export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { suppliers, updateLogs } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { headers } from "next/headers"

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const supplier = await db.query.suppliers.findFirst({
    where: eq(suppliers.userId, session.user.id),
  })
  if (!supplier) return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 100)
  const offset = Number(searchParams.get("offset") ?? "0")

  const logs = await db.query.updateLogs.findMany({
    where: eq(updateLogs.supplierId, supplier.id),
    orderBy: desc(updateLogs.createdAt),
    limit,
    offset,
  })

  return NextResponse.json(logs)
}
