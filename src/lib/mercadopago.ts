import MercadoPagoConfig, { Preference, Payment } from "mercadopago"

export const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export const PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 15000,
    currency: "ARS",
    description: "Hasta 500 productos · 1 catálogo · Historial 30 días",
    maxProducts: 500,
    features: [
      "Hasta 500 productos",
      "1 catálogo público",
      "Subida por Excel",
      "Historial 30 días",
      "Soporte por email",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 35000,
    currency: "ARS",
    description: "Productos ilimitados · Notificaciones a clientes · Historial completo",
    maxProducts: Infinity,
    features: [
      "Productos ilimitados",
      "1 catálogo público",
      "Subida por Excel y API",
      "Notificaciones a clientes",
      "Historial completo",
      "Soporte prioritario",
    ],
  },
} as const

export type PlanId = keyof typeof PLANS

export async function createPreference(
  planId: PlanId,
  supplierId: string,
  supplierEmail: string
) {
  const plan = PLANS[planId]
  const preference = new Preference(mp)

  const result = await preference.create({
    body: {
      items: [
        {
          id: planId,
          title: `ListaPrecios.ar — Plan ${plan.name}`,
          description: plan.description,
          quantity: 1,
          unit_price: plan.price,
          currency_id: "ARS",
        },
      ],
      payer: { email: supplierEmail },
      external_reference: supplierId,
      back_urls: {
        success: `${APP_URL}/proveedor/suscripcion/exito`,
        failure: `${APP_URL}/proveedor/suscripcion/error`,
        pending: `${APP_URL}/proveedor/suscripcion/pendiente`,
      },
      auto_return: "approved",
      notification_url: `${APP_URL}/api/webhooks/mercadopago`,
      metadata: { supplierId, planId },
    },
  })

  return result
}

export async function getPayment(paymentId: string) {
  const payment = new Payment(mp)
  return payment.get({ id: paymentId })
}
