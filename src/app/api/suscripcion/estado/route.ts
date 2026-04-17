export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { suppliers, subscriptions } from "@/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const supplier = await db.query.suppliers.findFirst({
    where: eq(suppliers.userId, session.user.id),
  })
  if (!supplier) return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 })

  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.supplierId, supplier.id),
  })

  const isActive =
    sub?.status === "active" ||
    sub?.status === "trialing" ||
    (sub?.trialEndsAt ? new Date(sub.trialEndsAt) > new Date() : false)

  return NextResponse.json({
    plan: sub?.plan ?? "free",
    status: sub?.status ?? "trialing",
    isActive,
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
    trialEndsAt: sub?.trialEndsAt ?? null,
  })
}
