"use client"

import useSWR from "swr"
import {
  api,
  type CartResponse,
  type CategoryResponse,
  type ProductResponse,
  type OrderResponse,
  type OrderStatus,
} from "@/lib/api-client"
import { logger } from "@/lib/logger"

export function useCategories() {
  return useSWR<{ categories: CategoryResponse[] }>(
    "/products/categories",
    () => api.getCategories(),
    {
      onError: (error) => logger.error('Failed to fetch categories', error),
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  )
}

export function useProducts(params: Parameters<typeof api.getProducts>[0]) {
  const searchParams = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const key = `/products?${searchParams.toString()}`
  return useSWR<{ products: ProductResponse[]; total: number }>(
    key,
    () => api.getProducts(params),
    {
      onError: (error) => logger.error('Failed to fetch products', error),
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  )
}

export function useCart() {
  return useSWR<CartResponse>(
    "/cart",
    () => api.getCart(),
    {
      revalidateOnFocus: true,
      onError: (error) => logger.error('Failed to fetch cart', error),
    }
  )
}

export function useMyOrders(params?: { page?: number; size?: number; status?: OrderStatus }) {
  const searchParams = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const key = `/orders/my-orders${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
  return useSWR<{ orders: OrderResponse[]; total: number }>(
    key,
    () => api.myOrders(params),
    {
      onError: (error) => logger.error('Failed to fetch orders', error),
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )
}
