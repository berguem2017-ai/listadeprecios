import { Worker } from "bullmq"
import * as XLSX from "xlsx"
import { db } from "@/db"
import { products, priceHistory, updateLogs, categories } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { invalidateSupplierCache } from "@/lib/redis"
import { notifyFollowers, type PriceChange } from "@/lib/notify-price-changes"
import type { ExcelImportJob } from "@/lib/queue"

const connection = {
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
}

export const excelWorker = new Worker<ExcelImportJob>(
  "excel-import",
  async (job) => {
    const { supplierId, userId, fileUrl, fileName, updateLogId } = job.data

    await db
      .update(updateLogs)
      .set({ status: "processing" })
      .where(eq(updateLogs.id, updateLogId))

    const response = await fetch(fileUrl)
    const buffer = await response.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

    let created = 0
    let updated = 0
    let skipped = 0
    const priceChanges: PriceChange[] = []

    for (const row of rows) {
      const sku = String(row["SKU"] ?? row["Código"] ?? "").trim()
      const name = String(row["Nombre"] ?? row["Producto"] ?? "").trim()
      const priceRaw = row["Precio"] ?? row["Price"] ?? row["Importe"]
      const unit = String(row["Unidad"] ?? row["Unit"] ?? "unidad").trim()
      const categoryName = String(row["Categoría"] ?? row["Categoria"] ?? "General").trim()
      const stock = row["Stock"] !== undefined ? Number(row["Stock"]) : undefined

      if (!name || !priceRaw) { skipped++; continue }

      const price = String(Number(String(priceRaw).replace(/[^\d.,]/g, "").replace(",", ".")))
      if (isNaN(Number(price))) { skipped++; continue }

      let categoryId: string | null = null
      if (categoryName) {
        const existingCat = await db.query.categories.findFirst({
          where: (c) => and(eq(c.supplierId, supplierId), eq(c.name, categoryName)),
        })
        if (existingCat) {
          categoryId = existingCat.id
        } else {
          const [newCat] = await db.insert(categories).values({
            supplierId,
            name: categoryName,
            slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
          }).returning()
          categoryId = newCat.id
        }
      }

      const existing = sku
        ? await db.query.products.findFirst({
            where: (p) => and(eq(p.supplierId, supplierId), eq(p.sku, sku)),
          })
        : await db.query.products.findFirst({
            where: (p) => and(eq(p.supplierId, supplierId), eq(p.name, name)),
          })

      if (existing) {
        if (existing.currentPrice !== price) {
          await db.insert(priceHistory).values({
            productId: existing.id,
            supplierId,
            previousPrice: existing.currentPrice,
            newPrice: price,
            method: "excel",
            fileName,
            updatedBy: userId,
          })
          await db.update(products).set({
            currentPrice: price,
            categoryId,
            unit,
            stock: stock ?? existing.stock,
            updatedAt: new Date(),
          }).where(eq(products.id, existing.id))
          priceChanges.push({
            productId: existing.id,
            productName: existing.name,
            unit: existing.unit,
            previousPrice: existing.currentPrice,
            newPrice: price,
          })
          updated++
        } else {
          skipped++
        }
      } else {
        const [newProduct] = await db.insert(products).values({
          supplierId,
          categoryId,
          sku: sku || null,
          name,
          unit,
          currentPrice: price,
          stock,
        }).returning()
        await db.insert(priceHistory).values({
          productId: newProduct.id,
          supplierId,
          previousPrice: null,
          newPrice: price,
          method: "excel",
          fileName,
          updatedBy: userId,
        })
        created++
      }
    }

    await db.update(updateLogs).set({
      status: "completed",
      productsUpdated: updated,
      productsCreated: created,
      productsSkipped: skipped,
      completedAt: new Date(),
    }).where(eq(updateLogs.id, updateLogId))

    await invalidateSupplierCache(supplierId)
    await notifyFollowers(supplierId, priceChanges)

    return { created, updated, skipped }
  },
  { connection, concurrency: 3 }
)
