import { createClient } from "redis"

let _client: ReturnType<typeof createClient> | null = null

function getClient() {
  if (!_client) {
    _client = createClient({ url: process.env.REDIS_URL ?? "redis://localhost:6379" })
    _client.on("error", (err) => console.error("Redis error:", err))
    _client.connect().catch(console.error)
  }
  return _client
}

export const redis = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    return (getClient() as any)[prop]
  },
})

export const CACHE_TTL = {
  products: 60 * 5,
  supplier: 60 * 10,
  categories: 60 * 30,
} as const

export async function invalidateSupplierCache(supplierId: string) {
  try {
    const client = getClient()
    const keys = await client.keys(`supplier:${supplierId}:*`)
    if (keys.length > 0) await client.del(keys)
  } catch (err) {
    console.error("Cache invalidation error:", err)
  }
}
