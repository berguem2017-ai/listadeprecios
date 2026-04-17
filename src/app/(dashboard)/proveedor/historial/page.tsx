"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/Badge"
import { Spinner } from "@/components/ui/Spinner"

type UpdateLog = {
  id: string
  method: "manual" | "excel" | "api"
  fileName: string | null
  productsCreated: number
  productsUpdated: number
  productsSkipped: number
  status: string
  errorMessage: string | null
  createdAt: string
  completedAt: string | null
}

const methodLabel: Record<string, string> = {
  manual: "Carga manual",
  excel: "Excel",
  api: "API",
}

const statusVariant: Record<string, "green" | "yellow" | "red" | "gray"> = {
  completed: "green",
  processing: "yellow",
  pending: "yellow",
  failed: "red",
}

const statusLabel: Record<string, string> = {
  completed: "Completado",
  processing: "Procesando",
  pending: "Pendiente",
  failed: "Fallido",
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export default function HistorialPage() {
  const [logs, setLogs] = useState<UpdateLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/proveedor/historial")
      .then((r) => r.json())
      .then(setLogs)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Historial de actualizaciones</h1>
        <p className="text-sm text-slate-500 mt-0.5">Registro de cada vez que actualizaste tu lista de precios</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Spinner />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-2">📋</p>
            <p className="text-sm">Todavía no hay actualizaciones registradas.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-800">
                      {methodLabel[log.method]}
                      {log.fileName && (
                        <span className="text-slate-400 font-normal"> — {log.fileName}</span>
                      )}
                    </span>
                    <Badge
                      label={statusLabel[log.status] ?? log.status}
                      variant={statusVariant[log.status] ?? "gray"}
                    />
                  </div>

                  <p className="text-xs text-slate-400 mt-1">{formatDate(log.createdAt)}</p>

                  {log.status === "completed" && (
                    <div className="flex gap-4 mt-2 text-xs">
                      <span className="text-green-600">
                        <strong>+{log.productsCreated}</strong> creados
                      </span>
                      <span className="text-blue-600">
                        <strong>{log.productsUpdated}</strong> actualizados
                      </span>
                      <span className="text-slate-400">
                        <strong>{log.productsSkipped}</strong> sin cambios
                      </span>
                    </div>
                  )}

                  {log.errorMessage && (
                    <p className="text-xs text-red-500 mt-1 bg-red-50 px-2 py-1 rounded">
                      {log.errorMessage}
                    </p>
                  )}
                </div>

                <div className="text-right text-xs text-slate-400 shrink-0">
                  {log.completedAt && (
                    <span>Completado {formatDate(log.completedAt)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
