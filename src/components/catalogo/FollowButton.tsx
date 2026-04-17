"use client"

import { useEffect, useState } from "react"
import { Spinner } from "@/components/ui/Spinner"

export function FollowButton({ slug }: { slug: string }) {
  const [following, setFollowing] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [needsAuth, setNeedsAuth] = useState(false)

  useEffect(() => {
    fetch(`/api/catalogo/${slug}/seguir`)
      .then((r) => r.json())
      .then((d) => setFollowing(d.following))
      .catch(() => setFollowing(false))
  }, [slug])

  async function toggle() {
    setLoading(true)
    const res = await fetch(`/api/catalogo/${slug}/seguir`, { method: "POST" })
    if (res.status === 401) {
      setNeedsAuth(true)
      setLoading(false)
      return
    }
    const data = await res.json()
    setFollowing(data.following)
    setLoading(false)
  }

  if (needsAuth) {
    return (
      <a
        href="/registro"
        className="inline-flex items-center gap-2 border border-blue-500 text-blue-600 hover:bg-blue-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        🔔 Registrate para recibir alertas
      </a>
    )
  }

  if (following === null) {
    return <div className="w-36 h-9 bg-slate-100 rounded-lg animate-pulse" />
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
        following
          ? "bg-green-50 text-green-700 border border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      }`}
    >
      {loading ? <Spinner size={14} /> : following ? "✓ Siguiendo" : "🔔 Seguir proveedor"}
    </button>
  )
}
