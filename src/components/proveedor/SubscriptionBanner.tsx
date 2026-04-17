"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type SubStatus = {
  plan: string
  status: string
  isActive: boolean
  currentPeriodEnd: string | null
  trialEndsAt: string | null
}

function daysLeft(date: string) {
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86400000))
}

export function SubscriptionBanner() {
  const [sub, setSub] = useState<SubStatus | null>(null)

  useEffect(() => {
    fetch("/api/suscripcion/estado")
      .then((r) => r.json())
      .then(setSub)
      .catch(() => null)
  }, [])

  if (!sub) return null

  // Trial activo — mostrar cuántos días quedan
  if (sub.status === "trialing" && sub.trialEndsAt) {
    const days = daysLeft(sub.trialEndsAt)
    if (days > 7) return null

    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">⏳</span>
          <p className="text-sm text-amber-800">
            <strong>Tu período de prueba vence en {days} día{days !== 1 ? "s" : ""}.</strong>
            {" "}Elegí un plan para seguir usando todas las funciones.
          </p>
        </div>
        <Link
          href="/precios"
          className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          Ver planes
        </Link>
      </div>
    )
  }

  // Suscripción vencida
  if (!sub.isActive && sub.status !== "trialing") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🚫</span>
          <p className="text-sm text-red-800">
            <strong>Tu suscripción venció.</strong> Renová tu plan para publicar y actualizar precios.
          </p>
        </div>
        <Link
          href="/precios"
          className="shrink-0 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          Renovar
        </Link>
      </div>
    )
  }

  // Plan activo con vencimiento próximo (≤7 días)
  if (sub.isActive && sub.currentPeriodEnd && daysLeft(sub.currentPeriodEnd) <= 7) {
    const days = daysLeft(sub.currentPeriodEnd)
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between mb-4 gap-3">
        <p className="text-sm text-blue-800">
          Tu suscripción <strong>{sub.plan}</strong> se renueva en <strong>{days} día{days !== 1 ? "s" : ""}</strong>.
        </p>
        <Link href="/precios" className="text-sm text-blue-600 hover:underline shrink-0">
          Gestionar plan
        </Link>
      </div>
    )
  }

  return null
}
