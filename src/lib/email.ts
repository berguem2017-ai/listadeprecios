import { Resend } from "resend"

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key || key === "re_placeholder") return null
  return new Resend(key)
}

const FROM = "ListaPrecios.ar <notificaciones@listadeprecios.ar>"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export interface PriceUpdateEmailData {
  to: string
  userName: string
  supplierName: string
  supplierSlug: string
  changes: Array<{
    productName: string
    previousPrice: string
    newPrice: string
    unit: string
  }>
}

function formatARS(price: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(price))
}

function priceDiff(prev: string, next: string) {
  const diff = ((Number(next) - Number(prev)) / Number(prev)) * 100
  return diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`
}

export async function sendPriceUpdateEmail(data: PriceUpdateEmailData) {
  const { to, userName, supplierName, supplierSlug, changes } = data
  const catalogUrl = `${APP_URL}/catalogo/${supplierSlug}`

  const rows = changes
    .slice(0, 10)
    .map(
      (c) => `
      <tr style="border-bottom:1px solid #f1f5f9">
        <td style="padding:10px 12px;font-size:14px;color:#334155">${c.productName}</td>
        <td style="padding:10px 12px;font-size:14px;color:#94a3b8;text-decoration:line-through">${formatARS(c.previousPrice)}</td>
        <td style="padding:10px 12px;font-size:14px;color:#0f172a;font-weight:600">${formatARS(c.newPrice)}</td>
        <td style="padding:10px 12px;font-size:13px;color:${Number(c.newPrice) > Number(c.previousPrice) ? "#dc2626" : "#16a34a"};font-weight:500">
          ${priceDiff(c.previousPrice, c.newPrice)}
        </td>
      </tr>`
    )
    .join("")

  const moreText = changes.length > 10
    ? `<p style="font-size:13px;color:#64748b;margin-top:8px">+ ${changes.length - 10} productos más en el catálogo.</p>`
    : ""

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif">
      <div style="max-width:560px;margin:40px auto;background:white;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">

        <div style="background:#2563eb;padding:24px 28px">
          <p style="margin:0;font-size:18px;font-weight:700;color:white">ListaPrecios.ar</p>
        </div>

        <div style="padding:28px">
          <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a">
            ${supplierName} actualizó sus precios
          </h1>
          <p style="margin:0 0 20px;font-size:14px;color:#64748b">
            Hola ${userName}, hay cambios en los productos de un proveedor que seguís.
          </p>

          <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;margin-bottom:8px">
            <thead>
              <tr style="background:#f1f5f9">
                <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase">Producto</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase">Antes</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase">Ahora</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase">Dif.</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          ${moreText}

          <div style="margin-top:24px;text-align:center">
            <a href="${catalogUrl}" style="display:inline-block;background:#2563eb;color:white;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none">
              Ver catálogo completo
            </a>
          </div>
        </div>

        <div style="padding:16px 28px;border-top:1px solid #f1f5f9;font-size:12px;color:#94a3b8;text-align:center">
          Recibís esto porque seguís a ${supplierName} en ListaPrecios.ar.<br>
          <a href="${APP_URL}/notificaciones" style="color:#64748b">Administrar notificaciones</a>
        </div>
      </div>
    </body>
    </html>
  `

  const resend = getResend()
  if (!resend) {
    console.warn("Email skipped: RESEND_API_KEY not configured")
    return
  }

  return resend.emails.send({
    from: FROM,
    to,
    subject: `${supplierName} actualizó ${changes.length} precio${changes.length !== 1 ? "s" : ""}`,
    html,
  })
}
