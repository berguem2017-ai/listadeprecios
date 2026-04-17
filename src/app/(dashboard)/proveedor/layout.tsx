import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SubscriptionBanner } from "@/components/proveedor/SubscriptionBanner"

const navItems = [
  { href: "/proveedor", label: "Productos", icon: "📦" },
  { href: "/proveedor/cargar", label: "Cargar precios", icon: "⬆️" },
  { href: "/proveedor/historial", label: "Historial", icon: "📋" },
  { href: "/precios", label: "Mi plan", icon: "⭐" },
]

export default async function ProveedorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-bold text-blue-600">ListaPrecios.ar</Link>
          <span className="text-slate-300">|</span>
          <span className="text-sm text-slate-500">Panel proveedor</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 hidden sm:block">{session.user.name}</span>
          <Link
            href="/api/auth/sign-out"
            className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Salir
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-52 bg-white border-r border-slate-200 py-4 hidden md:block">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center gap-1 py-2 text-xs text-slate-500 hover:text-blue-600 transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <SubscriptionBanner />
          {children}
        </main>
      </div>
    </div>
  )
}
