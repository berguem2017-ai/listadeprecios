import Link from "next/link"

export default function PagoErrorPage() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="text-6xl mb-5">😕</div>
      <h1 className="text-2xl font-bold text-slate-900 mb-3">El pago no se completó</h1>
      <p className="text-slate-500 mb-6">
        Algo salió mal con el proceso de pago. No se realizó ningún cobro. Podés intentarlo nuevamente cuando quieras.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/precios"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          Intentar de nuevo
        </Link>
        <Link
          href="/proveedor"
          className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-6 py-3 rounded-xl transition-colors"
        >
          Volver al panel
        </Link>
      </div>
    </div>
  )
}
