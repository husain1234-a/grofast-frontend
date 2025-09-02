"use client"

import Image from "next/image"
import { type ProductResponse, api } from "@/lib/api-client"
import { useCart } from "@/hooks/use-api"
import { mutate } from "swr"
import { useState } from "react"
import { Plus, Minus } from "lucide-react"

export function ProductCard({ product }: { product: ProductResponse }) {
  const { data: cart } = useCart()
  const existing = cart?.items?.find((i) => i.product_id === product.id)
  const [loading, setLoading] = useState(false)

  const add = async (qty = 1) => {
    setLoading(true)
    try {
      await api.addToCart({ product_id: product.id, quantity: qty })
      await mutate("/cart")
    } finally {
      setLoading(false)
    }
  }

  const remove = async (qty = 1) => {
    setLoading(true)
    try {
      await api.removeFromCart({ product_id: product.id, quantity: qty })
      await mutate("/cart")
    } finally {
      setLoading(false)
    }
  }

  const hasDiscount = product.original_price && product.original_price > product.price
  const isOutOfStock = product.stock_quantity === 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col hover:grofast-shadow transition-all duration-300 relative group">
      {/* Discount badge */}
      {hasDiscount && product.discount_percentage && (
        <div className="absolute top-2 left-2 bg-[#FF6B6B] text-white text-xs font-bold px-2 py-1 rounded-md z-10">
          {Math.round(product.discount_percentage)}% OFF
        </div>
      )}
      
      {/* Out of stock overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-2xl flex items-center justify-center z-10">
          <span className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            Out of Stock
          </span>
        </div>
      )}

      {/* Product image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl mb-3 bg-gray-50">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <img 
            src="/assorted-grocery-products.png" 
            alt={product.name} 
            className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300" 
          />
        )}
      </div>
      
      {/* Product info */}
      <div className="flex-1 space-y-2">
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {product.unit}
        </div>
        <h3 className="text-[#1A1A1A] font-semibold text-sm leading-tight line-clamp-2">
          {product.name}
        </h3>
        
        {/* Price section */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[#1A1A1A] font-bold text-lg">
              ₹{product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-gray-400 line-through text-sm">
                ₹{product.original_price!.toFixed(2)}
              </span>
            )}
          </div>
          {hasDiscount && (
            <div className="text-[#00B761] text-xs font-medium">
              You save ₹{(product.original_price! - product.price).toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* Add to cart controls */}
      <div className="mt-4">
        {!existing || existing.quantity === 0 ? (
          <button
            disabled={loading || isOutOfStock}
            onClick={() => add(1)}
            className="w-full grofast-gradient text-white text-sm font-semibold py-2.5 px-4 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>ADD</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center justify-between bg-[#00B761] text-white rounded-xl overflow-hidden">
            <button
              aria-label="Decrease quantity"
              onClick={() => remove(1)}
              disabled={loading}
              className="px-4 py-2.5 hover:bg-[#1FB574] disabled:opacity-50 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-semibold text-sm px-2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                existing.quantity
              )}
            </span>
            <button
              aria-label="Increase quantity"
              onClick={() => add(1)}
              disabled={loading}
              className="px-4 py-2.5 hover:bg-[#1FB574] disabled:opacity-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
