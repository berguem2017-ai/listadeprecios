"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp } from "@/lib/auth-client"
import { Spinner } from "@/components/ui/Spinner"

export default function RegistroPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "cliente" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error } = await signUp.email({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    } as any)
    setLoading(false)
    if (error) {
      setError("No se pudo crear la cuenta. Verificá los datos.")
      return
    }
    router.push(form.role === "proveedor" ? "/proveedor" : "/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-600">ListaPrecios.ar</Link>
          <p className="text-slate-500 text-sm mt-1">Creá tu cuenta</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo / Empresa</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Materiales Rodríguez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de cuenta</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "cliente", label: "Soy comprador", icon: "🛒" },
                  { value: "proveedor", label: "Soy proveedor", icon: "🏭" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set("role", opt.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-sm transition-colors ${
                      form.role === opt.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading && <Spinner size={16} />}
              Crear cuenta
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-500">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Ingresá
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
