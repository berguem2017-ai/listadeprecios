"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Spinner } from "@/components/ui/Spinner"
import { Badge } from "@/components/ui/Badge"

type Notif = {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  createdAt: string
  supplier: { name: string; slug: string } | null
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  return `hace ${Math.floor(hours / 24)}d`
}

export default function NotificacionesPage() {
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/notificaciones")
      .then((r) => r.json())
      .then((d) => {
        if (d.notifications) {
          setNotifs(d.notifications)
          setUnread(d.unread)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function markAllRead() {
    await fetch("/api/notificaciones", { method: "PATCH" })
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnread(0)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-blue-600">ListaPrecios.ar</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Notificaciones</h1>
            {unread > 0 && (
              <p className="text-sm text-slate-500 mt-0.5">{unread} sin leer</p>
            )}
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-blue-600 hover:underline"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Spinner />
            </div>
          ) : notifs.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-4xl mb-2">🔔</p>
              <p className="text-sm">No tenés notificaciones.</p>
              <p className="text-sm mt-1">
                Seguí a un proveedor para recibir alertas de cambios de precio.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifs.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 flex gap-3 transition-colors ${n.read ? "" : "bg-blue-50"}`}
                >
                  <div className="mt-0.5 text-xl shrink-0">
                    {n.type === "price_update" ? "💰" : "🔔"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${n.read ? "text-slate-700" : "font-semibold text-slate-900"}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{n.body}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                      {n.supplier && (
                        <Link
                          href={`/catalogo/${n.supplier.slug}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Ver catálogo →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
