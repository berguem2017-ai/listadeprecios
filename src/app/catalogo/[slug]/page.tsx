"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/Spinner"
import { Badge } from "@/components/ui/Badge"
import { FollowButton } from "@/components/catalogo/FollowButton"
import Link from "next/link"

type Category = { id: string; name: string }
type Product = {
  id: string
  sku: string | null
  name: string
  unit: string
  currentPrice: string
  stock: number | null
  description: string | null
  category: Category | null
  updatedAt: string
}
type Supplier = {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  phone: string | null
}
type CatalogData = {
  supplier: Supplier
  categories: Category[]
  products: Product[]
  pagination: { page: number; limit: number; hasMore: boolean }
}

function formatPrice(price: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(price))
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date))
}

export default function CatalogoPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [data, setData] = useState<CatalogData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [search, setSearch] = useState(searchParams.get("q") ?? "")
  const [activeCategory, setActiveCategory] = useState(searchParams.get("categoria") ?? "")
  const [page, setPage] = useState(Number(searchParams.get("pagina") ?? "1"))

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("q", search)
    if (activeCategory) params.set("categoria", activeCategory)
    params.set("pagina", String(page))

    const res = await fetch(`/api/catalogo/${slug}?${params}`)
    if (res.status === 404) { setNotFound(true); setLoading(false); return }
    const json = await res.json()
    setData(json)
    setLoading(false)
  }, [slug, search, activeCategory, page])

  useEffect(() => { fetchData() }, [fetchData])

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPage(1)
    setActiveCategory("")
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-xl font-bold text-slate-800">Catálogo no encontrado</h1>
          <p className="text-slate-500 mt-2 text-sm">El proveedor que buscás no existe o está inactivo.</p>
          <Link href="/" className="text-blue-600 text-sm hover:underline mt-4 inline-block">Volver al inicio</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm font-bold text-blue-600">ListaPrecios.ar</Link>
          <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            Iniciar sesión
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Supplier info */}
        {data && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                🏭
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-slate-900">{data.supplier.name}</h1>
                {data.supplier.description && (
                  <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{data.supplier.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {data.supplier.phone && (
                    <a href={`tel:${data.supplier.phone}`} className="text-sm text-blue-600 hover:underline">
                      📞 {data.supplier.phone}
                    </a>
                  )}
                  <Badge label={`${data.products.length}+ productos`} variant="blue" />
                </div>
                <div className="mt-3">
                  <FollowButton slug={slug} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          {/* Sidebar categorías */}
          {data && data.categories.length > 0 && (
            <aside className="hidden md:block w-48 shrink-0">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 px-2">Categorías</p>
                <button
                  onClick={() => { setActiveCategory(""); setPage(1) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!activeCategory ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  Todos
                </button>
                {data.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setPage(1) }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat.id ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </aside>
          )}

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Buscar
                </button>
                {(search || activeCategory) && (
                  <button
                    type="button"
                    onClick={() => { setSearch(""); setActiveCategory(""); setPage(1) }}
                    className="text-slate-500 hover:text-slate-700 border border-slate-200 bg-white text-sm px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </form>

            {/* Mobile categorías */}
            {data && data.categories.length > 0 && (
              <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-4">
                <button
                  onClick={() => { setActiveCategory(""); setPage(1) }}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!activeCategory ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
                >
                  Todos
                </button>
                {data.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setPage(1) }}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCategory === cat.id ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <Spinner />
              </div>
            ) : !data || data.products.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
                <p className="text-4xl mb-2">🔍</p>
                <p className="text-sm">No se encontraron productos</p>
              </div>
            ) : (
              <>
                <div className="text-xs text-slate-400 mb-3">
                  {data.products.length} resultado{data.products.length !== 1 ? "s" : ""}
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
                        <th className="text-left px-4 py-3">Producto</th>
                        <th className="text-left px-4 py-3 hidden sm:table-cell">Categoría</th>
                        <th className="text-left px-4 py-3 hidden md:table-cell">Unidad</th>
                        <th className="text-right px-4 py-3">Precio</th>
                        <th className="text-right px-4 py-3 hidden sm:table-cell">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.products.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-800">{p.name}</div>
                            {p.sku && <div className="text-xs text-slate-400">SKU: {p.sku}</div>}
                            {p.description && <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{p.description}</div>}
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-slate-500 text-xs">
                            {p.category?.name ?? "—"}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-slate-500 text-xs">{p.unit}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="font-bold text-slate-900">{formatPrice(p.currentPrice)}</div>
                            <div className="text-xs text-slate-400">por {p.unit}</div>
                          </td>
                          <td className="px-4 py-3 text-right hidden sm:table-cell">
                            {p.stock != null ? (
                              <Badge
                                label={p.stock > 0 ? `${p.stock} disp.` : "Sin stock"}
                                variant={p.stock > 0 ? "green" : "red"}
                              />
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 bg-white px-3 py-1.5 rounded-lg disabled:opacity-40 transition-colors"
                  >
                    ← Anterior
                  </button>
                  <span className="text-xs text-slate-400">Página {page}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!data.pagination.hasMore}
                    className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 bg-white px-3 py-1.5 rounded-lg disabled:opacity-40 transition-colors"
                  >
                    Siguiente →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CTA registro para clientes */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
          <p className="text-sm text-blue-700 font-medium">¿Querés guardar este catálogo y recibir alertas de cambios de precio?</p>
          <Link
            href="/registro"
            className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </div>
    </div>
  )
}
