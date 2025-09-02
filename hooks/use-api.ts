"use client"

import useSWR from "swr"
import {
  api,
  type CartResponse,
  type CategoryResponse,
  type ProductResponse,
  type OrderResponse,
} from "@/lib/api-client"

export function useCategories() {
  return useSWR<{ categories: CategoryResponse[] }>("/products/categories", () => api.getCategories())
}

export function useProducts(params: Parameters<typeof api.getProducts>[0]) {
  const key = `/products?${new URLSearchParams(params as any).toString()}`
  return useSWR<{ products: ProductResponse[]; total: number }>(key, () => api.getProducts(params))
}

export function useCart() {
  return useSWR<CartResponse>("/cart", () => api.getCart(), { revalidateOnFocus: true })
}

export function useMyOrders(params?: { page?: number; size?: number; status?: any }) {
  const q = new URLSearchParams(params as any).toString()
  const key = `/orders/my-orders${q ? `?${q}` : ""}`
  return useSWR<{ orders: OrderResponse[]; total: number }>(key, () => api.myOrders(params))
}
