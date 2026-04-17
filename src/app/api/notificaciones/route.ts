export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { notifications } from "@/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { headers } from "next/headers"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const items = await db.query.notifications.findMany({
    where: eq(notifications.userId, session.user.id),
    orderBy: desc(notifications.createdAt),
    limit: 30,
    with: { supplier: true },
  })

  const unread = items.filter((n) => !n.read).length

  return NextResponse.json({ notifications: items, unread })
}

export async function PATCH() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, session.user.id), eq(notifications.read, false)))

  return NextResponse.json({ ok: true })
}
