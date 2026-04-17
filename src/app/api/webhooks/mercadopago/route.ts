export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { subscriptions, paymentEvents, suppliers } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getPayment } from "@/lib/mercadopago"
import crypto from "crypto"

function verifySignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true // omitir en dev si no está configurado

  const xSignature = req.headers.get("x-signature") ?? ""
  const xRequestId = req.headers.get("x-request-id") ?? ""
  const dataId = new URL(req.url).searchParams.get("data.id") ?? ""

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${xSignature.split(",").find((s) => s.startsWith("ts="))?.split("=")[1] ?? ""};`
  const hash = crypto.createHmac("sha256", secret).update(manifest).digest("hex")
  const v1 = xSignature.split(",").find((s) => s.startsWith("v1="))?.split("=")[1] ?? ""

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(v1))
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  if (!verifySignature(req, rawBody)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 })
  }

  const body = JSON.parse(rawBody)
  const type = body.type ?? body.topic

  if (type !== "payment") {
    return NextResponse.json({ ok: true })
  }

  const paymentId = String(body.data?.id ?? body.id)
  if (!paymentId) return NextResponse.json({ ok: true })

  try {
    const payment = await getPayment(paymentId)
    const supplierId = payment.external_reference ?? payment.metadata?.supplierId
    const planId = payment.metadata?.planId as string | undefined

    const supplier = supplierId
      ? await db.query.suppliers.findFirst({ where: eq(suppliers.id, supplierId) })
      : null

    await db.insert(paymentEvents).values({
      supplierId: supplier?.id ?? null,
      mpPaymentId: paymentId,
      mpStatus: payment.status ?? "unknown",
      mpStatusDetail: payment.status_detail ?? null,
      amount: String(payment.transaction_amount ?? 0),
      currency: payment.currency_id ?? "ARS",
      raw: JSON.stringify(payment),
    })

    if (payment.status === "approved" && supplier && planId) {
      const periodStart = new Date()
      const periodEnd = new Date()
      periodEnd.setDate(periodEnd.getDate() + 30)

      const existing = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.supplierId, supplier.id),
      })

      if (existing) {
        await db.update(subscriptions).set({
          plan: planId as "starter" | "pro",
          status: "active",
          mpPaymentId: paymentId,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          updatedAt: new Date(),
        }).where(eq(subscriptions.supplierId, supplier.id))
      } else {
        await db.insert(subscriptions).values({
          supplierId: supplier.id,
          plan: planId as "starter" | "pro",
          status: "active",
          mpPaymentId: paymentId,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        })
      }
    }
  } catch (err) {
    console.error("Webhook MP error:", err)
  }

  return NextResponse.json({ ok: true })
}
