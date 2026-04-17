export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { suppliers, subscriptions } from "@/db/schema"
import { eq } from "drizzle-orm"
import { createPreference, PLANS, type PlanId } from "@/lib/mercadopago"
import { headers } from "next/headers"

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { planId } = await req.json() as { planId: PlanId }
  if (!PLANS[planId]) return NextResponse.json({ error: "Plan inválido" }, { status: 400 })

  const supplier = await db.query.suppliers.findFirst({
    where: eq(suppliers.userId, session.user.id),
  })
  if (!supplier) return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 })

  const preference = await createPreference(planId, supplier.id, session.user.email)

  await db
    .update(subscriptions)
    .set({ mpPreferenceId: preference.id ?? null, updatedAt: new Date() })
    .where(eq(subscriptions.supplierId, supplier.id))

  return NextResponse.json({
    preferenceId: preference.id,
    initPoint: preference.init_point,
    sandboxInitPoint: preference.sandbox_init_point,
  })
}
