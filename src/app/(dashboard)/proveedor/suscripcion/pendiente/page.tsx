import Link from "next/link"

export default function PagoPendientePage() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="text-6xl mb-5">⏳</div>
      <h1 className="text-2xl font-bold text-slate-900 mb-3">Pago en proceso</h1>
      <p className="text-slate-500 mb-6">
        Tu pago está siendo procesado. Te avisaremos por email cuando se confirme. Mientras tanto, podés seguir usando la plataforma.
      </p>
      <Link
        href="/proveedor"
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
      >
        Ir a mi panel
      </Link>
    </div>
  )
}
