import { logger } from './logger'
import {
  getSecureToken,
  setSecureToken,
  clearSecureTokens,
  hasValidToken
} from './secure-storage'

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

const API_BASE =
  (typeof window !== "undefined" && (window as any).__GROFAST_API__) ||
  process.env.NEXT_PUBLIC_GROFAST_API_URL ||
  "https://staging-api.grofast.com"

// Validate API base URL
if (!API_BASE) {
  throw new Error('API base URL is not configured. Please set NEXT_PUBLIC_GROFAST_API_URL environment variable.')
}

// Validate security context in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    logger.error('Application must run over HTTPS in production')
    throw new Error('Insecure context detected. HTTPS required in production.')
  }
}

/**
 * Get stored token securely
 * @deprecated Use getSecureToken instead
 */
export function getStoredToken() {
  logger.warn('getStoredToken is deprecated, use secure storage instead')
  return getSecureToken()
}

/**
 * Set stored token securely
 * @deprecated Use setSecureToken instead
 */
export function setStoredToken(token: string) {
  logger.warn('setStoredToken is deprecated, use secure storage instead')
  setSecureToken(token)
}

/**
 * Clear stored token securely
 * @deprecated Use clearSecureTokens instead
 */
export function clearStoredToken() {
  logger.warn('clearStoredToken is deprecated, use secure storage instead')
  clearSecureTokens()
}

/**
 * Get Firebase token with security checks
 */
function getFirebaseToken() {
  if (typeof window === "undefined") return undefined

  // Get token from secure storage
  const token = getSecureToken()

  return token || process.env.NEXT_PUBLIC_DEV_FIREBASE_TOKEN || undefined
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

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  auth?: boolean
  headers?: Record<string, string>
  timeout?: number
}

async function request<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const method = opts.method || "GET"
  const url = `${API_BASE}${path}`

  // Log API request
  logger.apiRequest(method, url, opts.body)

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    'X-Requested-With': 'XMLHttpRequest',
    ...(opts.headers || {}),
  }

  if (opts.auth) {
    const token = getFirebaseToken()
    if (token) {
      // Backend expects firebase_token header, not Authorization Bearer
      headers['firebase_token'] = token
    } else {
      logger.warn('Auth required but no token available', { path, method })
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), opts.timeout || 30000)

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const contentType = res.headers.get("content-type") || ""
    const isJson = contentType.includes("application/json")
    const data = isJson ? await res.json().catch(() => undefined) : undefined

    // Log API response
    logger.apiResponse(method, url, res.status, data)

    if (!res.ok) {
      const message = (data && (data.error || data.message)) || `Request failed: ${res.status}`

      if (typeof window !== "undefined" && res.status === 401) {
        logger.warn('Unauthorized request, clearing tokens and redirecting', { path, method })
        clearSecureTokens()

        if (!window.location.pathname.startsWith("/auth")) {
          // Add a small delay to prevent rapid redirects
          setTimeout(() => {
            window.location.href = "/auth/login"
          }, 100)
        }
      }

      throw new ApiError(message, res.status, data?.code, data?.details)
    }

    return data as T
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof Error && error.name === 'AbortError') {
      logger.error('API request timeout', { path, method, timeout: opts.timeout })
      throw new ApiError('Request timeout', 408)
    }

    logger.error('API request failed', { path, method, error })
    throw new ApiError('Network error', 0, 'NETWORK_ERROR', error)
  }
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
  googleLogin(payload: { google_id_token: string }) {
    return request<{ id: number } & Record<string, any>>("/auth/google-login", {
      method: "POST",
      body: payload,
    })
  },
  me(firebase_token?: string) {
    if (firebase_token) {
      // Use query parameter method for /auth/me endpoint
      return request(`/auth/me?firebase_token=${firebase_token}`)
    }
    return request("/auth/me", { auth: true })
  },
  updateProfile(payload: { name?: string; email?: string; phone?: string }, firebase_token: string) {
    return request(`/auth/me?firebase_token=${firebase_token}`, {
      method: "PUT",
      body: payload,
    })
  },
  logout(firebase_token: string) {
    return request(`/auth/logout?firebase_token=${firebase_token}`, {
      method: "POST",
    })
  },
  validateToken(firebase_token: string) {
    return request(`/auth/validate-token?firebase_token=${firebase_token}`, {
      method: "POST",
    })
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
      method: "DELETE",
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
  me(firebase_token?: string) {
    if (firebase_token) {
      return request<DeliveryPartnerResponse>(`/delivery/me?firebase_token=${firebase_token}`)
    }
    return request<DeliveryPartnerResponse>("/delivery/me", { auth: true })
  },
  updateStatus(payload: { status: 'available' | 'busy' | 'offline'; current_location?: { latitude?: number; longitude?: number } }, firebase_token?: string) {
    if (firebase_token) {
      return request<DeliveryPartnerResponse>(`/delivery/status?firebase_token=${firebase_token}`, {
        method: "PUT",
        body: payload,
      })
    }
    return request<DeliveryPartnerResponse>("/delivery/status", {
      method: "PUT",
      body: payload,
      auth: true,
    })
  },
  sendLocation(payload: { latitude: number; longitude: number; order_id?: number }, firebase_token?: string) {
    if (firebase_token) {
      return request<{ message: string; timestamp: string }>(`/delivery/location?firebase_token=${firebase_token}`, {
        method: "POST",
        body: payload,
      })
    }
    return request<{ message: string; timestamp: string }>("/delivery/location", {
      method: "POST",
      body: payload,
      auth: true,
    })
  },
  getOrders(firebase_token?: string) {
    if (firebase_token) {
      return request<{ orders: OrderResponse[] }>(`/delivery/orders?firebase_token=${firebase_token}`)
    }
    return request<{ orders: OrderResponse[] }>("/delivery/orders", { auth: true })
  },
}

// Admin API endpoints
export const adminApi = {
  getStats(firebase_token?: string) {
    if (firebase_token) {
      return request(`/admin/stats?firebase_token=${firebase_token}`)
    }
    return request("/admin/stats", { auth: true })
  },
  getProducts(params?: { page?: number; size?: number }, firebase_token?: string) {
    const q = new URLSearchParams()
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") q.set(k, String(v))
    })
    const queryString = q.toString()

    if (firebase_token) {
      const separator = queryString ? '&' : ''
      return request(`/admin/products?${queryString}${separator}firebase_token=${firebase_token}`)
    }
    return request(`/admin/products${queryString ? `?${queryString}` : ''}`, { auth: true })
  },
  createProduct(payload: {
    name: string
    description: string
    price: number
    category_id: number
    image_url?: string
    stock_quantity?: number
  }, firebase_token?: string) {
    if (firebase_token) {
      return request(`/admin/products?firebase_token=${firebase_token}`, {
        method: "POST",
        body: payload,
      })
    }
    return request("/admin/products", {
      method: "POST",
      body: payload,
      auth: true,
    })
  },
  updateProduct(productId: number, payload: {
    name?: string
    description?: string
    price?: number
    category_id?: number
    image_url?: string
    stock_quantity?: number
  }, firebase_token?: string) {
    if (firebase_token) {
      return request(`/admin/products/${productId}?firebase_token=${firebase_token}`, {
        method: "PUT",
        body: payload,
      })
    }
    return request(`/admin/products/${productId}`, {
      method: "PUT",
      body: payload,
      auth: true,
    })
  },
  deleteProduct(productId: number, firebase_token?: string) {
    if (firebase_token) {
      return request(`/admin/products/${productId}?firebase_token=${firebase_token}`, {
        method: "DELETE",
      })
    }
    return request(`/admin/products/${productId}`, {
      method: "DELETE",
      auth: true,
    })
  },
  getAllOrders(params?: { page?: number; size?: number; status?: string }, firebase_token?: string) {
    const q = new URLSearchParams()
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") q.set(k, String(v))
    })
    const queryString = q.toString()

    if (firebase_token) {
      const separator = queryString ? '&' : ''
      return request(`/admin/orders?${queryString}${separator}firebase_token=${firebase_token}`)
    }
    return request(`/admin/orders${queryString ? `?${queryString}` : ''}`, { auth: true })
  },
}

// Notification API endpoints
export const notificationApi = {
  sendNotification(payload: {
    user_id: number
    title: string
    body: string
    data?: Record<string, any>
  }, firebase_token?: string) {
    if (firebase_token) {
      return request(`/notifications/send?firebase_token=${firebase_token}`, {
        method: "POST",
        body: payload,
      })
    }
    return request("/notifications/send", {
      method: "POST",
      body: payload,
      auth: true,
    })
  },
  getUserNotifications(firebase_token?: string) {
    if (firebase_token) {
      return request(`/notifications/user?firebase_token=${firebase_token}`)
    }
    return request("/notifications/user", { auth: true })
  },
  markAsRead(notificationId: number, firebase_token?: string) {
    if (firebase_token) {
      return request(`/notifications/${notificationId}/read?firebase_token=${firebase_token}`, {
        method: "PUT",
      })
    }
    return request(`/notifications/${notificationId}/read`, {
      method: "PUT",
      auth: true,
    })
  },
}
