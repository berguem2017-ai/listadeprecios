export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { suppliers, updateLogs } from "@/db/schema"
import { eq } from "drizzle-orm"
import { enqueueExcelImport } from "@/lib/queue"
import { headers } from "next/headers"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const supplier = await db.query.suppliers.findFirst({
    where: eq(suppliers.userId, session.user.id),
  })
  if (!supplier) return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 })
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "El archivo no puede superar 10MB" }, { status: 413 })
  }

  const allowed = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
  ]
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Solo se aceptan archivos .xlsx, .xls o .csv" }, { status: 415 })
  }

  // En producción: subir a R2/S3 y usar la URL real.
  // Por ahora guardamos un placeholder hasta integrar storage.
  const fileUrl = `local://${file.name}`

  const [log] = await db.insert(updateLogs).values({
    supplierId: supplier.id,
    method: "excel",
    fileName: file.name,
    fileUrl,
    status: "pending",
    updatedBy: session.user.id,
  }).returning()

  await enqueueExcelImport({
    supplierId: supplier.id,
    userId: session.user.id,
    fileUrl,
    fileName: file.name,
    updateLogId: log.id,
  })

  return NextResponse.json({
    message: "Archivo recibido. Procesando en segundo plano.",
    logId: log.id,
  }, { status: 202 })
}
