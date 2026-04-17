import Link from "next/link"

const features = [
  { icon: "📊", title: "Subí tu Excel", desc: "Importá tu lista de precios existente. Detectamos columnas automáticamente." },
  { icon: "⚡", title: "Actualización instantánea", desc: "Los precios se actualizan en tiempo real. Sin PDFs, sin WhatsApps." },
  { icon: "🔍", title: "Fácil de buscar", desc: "Tus clientes encuentran cualquier producto en segundos con búsqueda y filtros." },
  { icon: "📋", title: "Historial de cambios", desc: "Registro completo de cuándo y cómo actualizaste cada precio." },
  { icon: "🏭", title: "Tu página propia", desc: "Cada proveedor tiene su catálogo en listadeprecios.ar/catalogo/tu-empresa." },
  { icon: "💰", title: "Precio fijo mensual", desc: "Sin comisiones por venta. Pagás una suscripción y listo." },
]

const sectors = ["Materiales de construcción", "Electricidad y ferretería", "Pintura y revestimientos", "Sanitarios y griferías", "Maderas y aberturas", "Herramientas"]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">ListaPrecios.ar</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/precios" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Precios</Link>
            <Link href="/registro" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          🇦🇷 Hecho para el mercado argentino
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight max-w-3xl mx-auto">
          Tu lista de precios siempre{" "}
          <span className="text-blue-600">actualizada</span>,{" "}
          online y sin PDFs
        </h1>
        <p className="text-lg text-slate-500 mt-5 max-w-xl mx-auto leading-relaxed">
          Publicá tu catálogo de productos en minutos. Tus clientes buscan y ven los precios actuales desde cualquier dispositivo. Sin más PDFs por WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/registro" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-xl text-base transition-colors">
            Crear mi catálogo gratis
          </Link>
          <Link href="/catalogo/materiales-rodriguez" className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-7 py-3 rounded-xl text-base transition-colors">
            Ver demo →
          </Link>
        </div>
        <p className="text-xs text-slate-400 mt-4">Sin tarjeta de crédito · Configuración en 5 minutos</p>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Todo lo que necesitás</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-slate-800 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Ideal para distribuidoras y mayoristas</h2>
          <p className="text-slate-500 text-sm mb-8">Rubros donde el precio cambia constantemente y los clientes siempre preguntan</p>
          <div className="flex flex-wrap justify-center gap-3">
            {sectors.map((s) => (
              <span key={s} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-10">Cómo funciona</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Registrá tu empresa", desc: "Creá tu cuenta de proveedor en 2 minutos." },
              { step: "2", title: "Subí tus precios", desc: "Importá tu Excel o cargá manualmente. Quedá online al instante." },
              { step: "3", title: "Compartí el link", desc: "Enviá el link de tu catálogo a tus clientes. Ellos ven siempre el precio actualizado." },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center bg-blue-600 rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-white mb-3">
            Empezá hoy, sin costo
          </h2>
          <p className="text-blue-100 text-sm mb-6">
            Probalo gratis. Cuando estés satisfecho, elegís el plan que mejor te convenga.
          </p>
          <Link href="/registro" className="inline-block bg-white text-blue-600 font-semibold px-7 py-3 rounded-xl text-base hover:bg-blue-50 transition-colors">
            Crear mi catálogo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 px-4 text-center text-xs text-slate-400">
        <span className="font-semibold text-slate-500">ListaPrecios.ar</span> · Hecho en Argentina · 2024
      </footer>
    </div>
  )
}
