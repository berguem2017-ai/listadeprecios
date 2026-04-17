import Link from "next/link"

export default function PagoExitoPage() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="text-6xl mb-5">🎉</div>
      <h1 className="text-2xl font-bold text-slate-900 mb-3">¡Pago confirmado!</h1>
      <p className="text-slate-500 mb-6">
        Tu suscripción está activa. Ya podés cargar productos ilimitados y tus clientes recibirán notificaciones de cambios de precio.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/proveedor"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          Ir a mi panel
        </Link>
        <Link
          href="/proveedor/cargar"
          className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-6 py-3 rounded-xl transition-colors"
        >
          Cargar precios
        </Link>
      </div>
    </div>
  )
}
