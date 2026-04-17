"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PLANS } from "@/lib/mercadopago"
import { Spinner } from "@/components/ui/Spinner"

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n)
}

function PlanCard({
  planId,
  plan,
  highlighted = false,
}: {
  planId: string
  plan: typeof PLANS[keyof typeof PLANS]
  highlighted?: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    const res = await fetch("/api/suscripcion/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    })

    if (res.status === 401) {
      router.push(`/registro?plan=${planId}`)
      return
    }

    const data = await res.json()
    if (data.sandboxInitPoint && process.env.NODE_ENV !== "production") {
      window.location.href = data.sandboxInitPoint
    } else if (data.initPoint) {
      window.location.href = data.initPoint
    }
    setLoading(false)
  }

  return (
    <div
      className={`relative rounded-2xl border p-7 flex flex-col ${
        highlighted
          ? "border-blue-500 shadow-lg shadow-blue-100 bg-white"
          : "border-slate-200 bg-white"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
            MÁS POPULAR
          </span>
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
        <div className="mt-3 flex items-end gap-1">
          <span className="text-4xl font-bold text-slate-900">{formatARS(plan.price)}</span>
          <span className="text-slate-400 text-sm mb-1">/mes</span>
        </div>
        <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
      </div>

      <ul className="space-y-2.5 flex-1 mb-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
            <span className="text-green-500 font-bold mt-0.5">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 ${
          highlighted
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-slate-100 hover:bg-slate-200 text-slate-800"
        }`}
      >
        {loading && <Spinner size={16} />}
        {loading ? "Redirigiendo..." : "Empezar ahora"}
      </button>
    </div>
  )
}

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">ListaPrecios.ar</Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">Iniciar sesión</Link>
            <Link href="/registro" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900">Planes simples, sin sorpresas</h1>
          <p className="text-slate-500 mt-3 text-base">Empezá gratis 14 días. Sin tarjeta de crédito.</p>
        </div>

        {/* Free + Paid plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Free */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-slate-900">Gratis</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-bold text-slate-900">$0</span>
                <span className="text-slate-400 text-sm mb-1">/mes</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">Para probar la plataforma</p>
            </div>
            <ul className="space-y-2.5 flex-1 mb-6">
              {["Hasta 20 productos", "1 catálogo público", "Historial 7 días", "Sin notificaciones a clientes"].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-slate-400 mt-0.5">○</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/registro"
              className="w-full text-center font-semibold py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              Empezar gratis
            </Link>
          </div>

          {/* Starter */}
          <PlanCard planId="starter" plan={PLANS.starter} />

          {/* Pro */}
          <PlanCard planId="pro" plan={PLANS.pro} highlighted />
        </div>

        {/* FAQs */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {[
              {
                q: "¿Puedo cancelar cuando quiero?",
                a: "Sí, cancelás cuando quieras desde tu panel. Tu catálogo queda activo hasta el fin del período pagado.",
              },
              {
                q: "¿Qué pasa si supero el límite de productos?",
                a: "Te avisamos antes de llegar al límite y podés actualizar tu plan en cualquier momento.",
              },
              {
                q: "¿Los pagos son seguros?",
                a: "Todos los pagos se procesan a través de MercadoPago. Nunca almacenamos datos de tarjetas.",
              },
              {
                q: "¿Puedo cambiar de plan?",
                a: "Sí, podés hacer upgrade o downgrade en cualquier momento. Los cambios aplican al próximo ciclo.",
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-800 text-sm mb-1">{faq.q}</h3>
                <p className="text-sm text-slate-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
