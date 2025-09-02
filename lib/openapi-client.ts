import createClient, { type Middleware } from "openapi-fetch"
import type { paths, components } from "@/types/grofast"
import { getStoredToken } from "./api-client"

export const API_BASE =
  (typeof window !== "undefined" && (window as any).__GROFAST_API__) ||
  process.env.NEXT_PUBLIC_GROFAST_API_URL ||
  "https://staging-api.grofast.com"

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    // ensure headers object
    const headers = new Headers(request.headers || {})
    const token = getStoredToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
    headers.set("Accept", "application/json")
    headers.set("Content-Type", "application/json")
    return { request: new Request(request, { headers }) }
  },
}

export const client = createClient<paths>({ baseUrl: API_BASE })
client.use(authMiddleware)

// Handy re-exports of common OpenAPI-derived types
export type CategoryResponse = components["schemas"]["CategoryResponse"]
export type ProductResponse = components["schemas"]["ProductResponse"]
export type CartResponse = components["schemas"]["CartResponse"]
export type OrderResponse = components["schemas"]["OrderResponse"]
export type OrderStatus = OrderResponse["status"]
export type DeliveryPartnerResponse = components["schemas"]["DeliveryPartnerResponse"]
