export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

const API_BASE =
  (typeof window !== "undefined" && (window as any).__GROFAST_API__) ||
  process.env.NEXT_PUBLIC_GROFAST_API_URL ||
  "https://staging-api.grofast.com"

export function getStoredToken() {
  if (typeof window === "undefined") return undefined
  return localStorage.getItem("firebase_token") || undefined
}

export function setStoredToken(token: string) {
  if (typeof window === "undefined") return
  localStorage.setItem("firebase_token", token)
  window.dispatchEvent(new StorageEvent("storage", { key: "firebase_token", newValue: token }))
}

export function clearStoredToken() {
  if (typeof window === "undefined") return
  localStorage.removeItem("firebase_token")
  window.dispatchEvent(new StorageEvent("storage", { key: "firebase_token", newValue: null as any }))
}

function getFirebaseToken() {
  if (typeof window === "undefined") return undefined
  return getStoredToken() || process.env.NEXT_PUBLIC_DEV_FIREBASE_TOKEN || undefined
}

export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown
  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

async function request<T>(
  path: string,
  opts: { method?: HttpMethod; body?: any; auth?: boolean; headers?: Record<string, string> } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  }

  if (opts.auth) {
    const token = getFirebaseToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  })

  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")
  const data = isJson ? await res.json().catch(() => undefined) : undefined

  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `Request failed: ${res.status}`

    if (typeof window !== "undefined" && res.status === 401) {
      clearStoredToken()
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login"
      }
    }

    throw new ApiError(message, res.status, data?.code, data?.details)
  }

  return data as T
}

/**
 * Public endpoints
 */
export const api = {
  // Auth
  verifyOtp(payload: { firebase_id_token: string }) {
    return request<{ id: number } & Record<string, any>>("/auth/verify-otp", {
      method: "POST",
      body: payload,
    })
  },
  me() {
    return request("/auth/me", { auth: true })
  },

  // Categories & Products
  getCategories() {
    return request<{ categories: components["schemas"]["CategoryResponse"][]; fallback?: boolean }>(
      "/products/categories",
    )
  },
  getProducts(params: {
    page?: number
    size?: number
    category_id?: number
    search?: string
    min_price?: number
    max_price?: number
    sort_by?: "name" | "price" | "created_at" | "popularity"
    sort_order?: "asc" | "desc"
  }) {
    const q = new URLSearchParams()
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") q.set(k, String(v))
    })
    return request<{
      products: components["schemas"]["ProductResponse"][]
      total: number
      page: number
      size: number
      total_pages: number
      fallback?: boolean
    }>(`/products?${q.toString()}`)
  },
  getProduct(product_id: number) {
    return request<components["schemas"]["ProductResponse"]>(`/products/${product_id}`)
  },

  // Cart
  getCart() {
    return request<components["schemas"]["CartResponse"]>("/cart", { auth: true })
  },
  addToCart(payload: { product_id: number; quantity?: number }) {
    return request<components["schemas"]["CartResponse"]>("/cart/add", { method: "POST", body: payload, auth: true })
  },
  removeFromCart(payload: { product_id: number; quantity?: number }) {
    return request<components["schemas"]["CartResponse"]>("/cart/remove", { method: "POST", body: payload, auth: true })
  },
  clearCart() {
    return request<{ message: string; cart: components["schemas"]["CartResponse"] }>("/cart/clear", {
      method: "POST",
      auth: true,
    })
  },

  // Orders
  createOrder(payload: {
    delivery_address: string
    delivery_time_slot: "9-11" | "11-13" | "13-15" | "15-17" | "17-19" | "19-21"
    payment_method: "cash" | "card" | "upi" | "wallet"
    special_instructions?: string
  }) {
    return request<components["schemas"]["OrderResponse"]>("/orders/create", {
      method: "POST",
      body: payload,
      auth: true,
    })
  },
  myOrders(params?: { page?: number; size?: number; status?: components["schemas"]["OrderResponse"]["status"] }) {
    const q = new URLSearchParams()
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") q.set(k, String(v))
    })
    const qs = q.toString()
    return request<{
      orders: components["schemas"]["OrderResponse"][]
      total: number
      page: number
      size: number
      total_pages: number
    }>(`/orders/my-orders${qs ? `?${qs}` : ""}`, { auth: true })
  },
  orderById(order_id: number) {
    return request<components["schemas"]["OrderResponse"]>(`/orders/${order_id}`, { auth: true })
  },
}

/**
 * Minimal types adapted from the OpenAPI schemas (subset used by the UI).
 * For a complete mapping you can replace these with generated types later.
 */
import type { components } from "@/types/grofast"
export type CategoryResponse = components["schemas"]["CategoryResponse"]
export type ProductResponse = components["schemas"]["ProductResponse"]
export type CartItemResponse = components["schemas"]["CartItemResponse"]
export type CartResponse = components["schemas"]["CartResponse"]
export type OrderStatus = components["schemas"]["OrderResponse"]["status"]
export type OrderResponse = components["schemas"]["OrderResponse"]

// Delivery Partner endpoints and types
export type DeliveryPartnerResponse = components["schemas"]["DeliveryPartnerResponse"]

export const deliveryApi = {
  me() {
    return request<DeliveryPartnerResponse>("/delivery/me", { auth: true })
  },
  updateStatus(payload: { is_available: boolean; current_location?: { latitude?: number; longitude?: number } }) {
    return request<DeliveryPartnerResponse>("/delivery/status", {
      method: "PUT",
      body: payload,
      auth: true,
    })
  },
  sendLocation(payload: { latitude: number; longitude: number; order_id?: number }) {
    return request<{ message: string; timestamp: string }>("/delivery/location", {
      method: "POST",
      body: payload,
      auth: true,
    })
  },
}
