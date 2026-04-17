import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ListaPrecios.ar — Catálogos digitales para proveedores",
  description: "Plataforma para que proveedores publiquen sus listas de precios de forma simple y actualizada.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
