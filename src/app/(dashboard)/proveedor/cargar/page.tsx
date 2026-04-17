"use client"

import { useState, useRef } from "react"
import { Spinner } from "@/components/ui/Spinner"

type Tab = "excel" | "manual"

function formatPrice(value: string) {
  const num = value.replace(/\D/g, "")
  return num ? new Intl.NumberFormat("es-AR").format(Number(num)) : ""
}

function ExcelUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [logId, setLogId] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  async function handleUpload() {
    if (!file) return
    setStatus("loading")
    const form = new FormData()
    form.append("file", file)
    const res = await fetch("/api/proveedor/excel", { method: "POST", body: form })
    const data = await res.json()
    if (!res.ok) {
      setStatus("error")
      setMessage(data.error ?? "Error al subir el archivo")
      return
    }
    setStatus("success")
    setLogId(data.logId)
    setMessage(data.message)
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <div className="text-4xl mb-3">📊</div>
        {file ? (
          <div>
            <p className="font-medium text-slate-700">{file.name}</p>
            <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
        ) : (
          <div>
            <p className="text-slate-600 font-medium">Arrastrá tu archivo acá</p>
            <p className="text-sm text-slate-400 mt-1">o hacé clic para seleccionar</p>
            <p className="text-xs text-slate-400 mt-2">.xlsx · .xls · .csv · máx. 10MB</p>
          </div>
        )}
      </div>

      {/* Template hint */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
        <strong>Columnas esperadas:</strong> SKU · Nombre · Precio · Unidad · Categoría · Stock
        <br />
        <span className="text-amber-600">Las columnas son opcionales excepto Nombre y Precio.</span>
      </div>

      {status === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
          ✓ {message}
          <br />
          <a href="/proveedor/historial" className="underline text-green-600">Ver estado en el historial</a>
        </div>
      )}
      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">✗ {message}</div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || status === "loading"}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {status === "loading" && <Spinner size={16} />}
        {status === "loading" ? "Subiendo..." : "Procesar archivo"}
      </button>
    </div>
  )
}

function ManualForm() {
  const [form, setForm] = useState({
    sku: "", name: "", price: "", unit: "unidad", description: "", stock: "",
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState("")
  const [displayPrice, setDisplayPrice] = useState("")

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "")
    setDisplayPrice(formatPrice(e.target.value))
    set("price", raw)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setStatus("loading")

    const res = await fetch("/api/proveedor/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku: form.sku || undefined,
        name: form.name,
        price: Number(form.price),
        unit: form.unit,
        description: form.description || undefined,
        stock: form.stock ? Number(form.stock) : undefined,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Error al guardar")
      setStatus("error")
      return
    }

    setStatus("success")
    setForm({ sku: "", name: "", price: "", unit: "unidad", description: "", stock: "" })
    setDisplayPrice("")
    setTimeout(() => setStatus("idle"), 3000)
  }

  const units = ["unidad", "m²", "m³", "ml", "kg", "litro", "bolsa", "rollo", "caja", "barra"]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del producto *</label>
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Cemento Portland 50kg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">SKU / Código</label>
          <input
            value={form.sku}
            onChange={(e) => set("sku", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: CEM-001"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Precio (ARS) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              required
              value={displayPrice}
              onChange={handlePriceChange}
              className="w-full border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
          <select
            value={form.unit}
            onChange={(e) => set("unit", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Stock disponible</label>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Opcional"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Opcional"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}
      {status === "success" && (
        <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          ✓ Producto guardado correctamente
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {status === "loading" && <Spinner size={16} />}
        Guardar producto
      </button>
    </form>
  )
}

export default function CargarPage() {
  const [tab, setTab] = useState<Tab>("excel")

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Cargar precios</h1>
        <p className="text-sm text-slate-500 mt-0.5">Actualizá tu lista de precios desde un Excel o de forma manual</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {([["excel", "📊 Subir Excel"], ["manual", "✏️ Carga manual"]] as [Tab, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === value
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "excel" ? <ExcelUpload /> : <ManualForm />}
        </div>
      </div>
    </div>
  )
}
