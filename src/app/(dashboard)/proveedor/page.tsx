"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/Badge"
import { Spinner } from "@/components/ui/Spinner"

type Product = {
  id: string
  sku: string | null
  name: string
  unit: string
  currentPrice: string
  stock: number | null
  active: boolean
  updatedAt: string
  category: { name: string } | null
}

function formatPrice(price: string) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(Number(price))
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/proveedor/productos")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku ?? "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mis productos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{products.length} productos en tu catálogo</p>
        </div>
        <div className="flex gap-2">
          <Link href="/proveedor/cargar" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + Cargar precios
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-2">📦</p>
            <p className="text-sm">No hay productos aún.</p>
            <Link href="/proveedor/cargar" className="text-blue-600 text-sm hover:underline mt-1 inline-block">
              Cargar tu primera lista de precios
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Producto</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Categoría</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Unidad</th>
                  <th className="text-right px-4 py-3">Precio</th>
                  <th className="text-right px-4 py-3 hidden sm:table-cell">Stock</th>
                  <th className="text-center px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{p.name}</div>
                      {p.sku && <div className="text-xs text-slate-400">SKU: {p.sku}</div>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-slate-500">
                      {p.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-500">{p.unit}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      {formatPrice(p.currentPrice)}
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell text-slate-500">
                      {p.stock ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge label={p.active ? "Activo" : "Inactivo"} variant={p.active ? "green" : "gray"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
