"use client"

import Link from "next/link"
import { useCart } from "@/hooks/use-api"
import { ShoppingCart, ArrowRight } from "lucide-react"
import { useState } from "react"

export function FloatingCart() {
  const { data } = useCart()
  const [isVisible, setIsVisible] = useState(true)

  // Don't show if cart is empty
  if (!data?.total_items || data.total_items === 0) {
    return null
  }

  if (!isVisible) {
    // Minimized state - just a small cart icon
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 grofast-gradient rounded-full grofast-shadow-lg flex items-center justify-center pulse-green"
        aria-label="Show cart"
      >
        <ShoppingCart className="h-5 w-5 text-white" />
        <span className="absolute -top-2 -right-2 h-5 w-5 bg-[#F8CB46] text-[#1A1A1A] rounded-full flex items-center justify-center text-xs font-bold">
          {data.total_items}
        </span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="mx-auto max-w-md pointer-events-auto">
        <div className="bg-white rounded-2xl grofast-shadow-lg border border-gray-100 overflow-hidden">
          {/* Cart header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 grofast-gradient rounded-full flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-[#1A1A1A]">
                  {data.total_items} {data.total_items === 1 ? 'item' : 'items'}
                </div>
                <div className="text-sm text-gray-500">
                  ₹{data.total_amount?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 text-xl font-light"
              aria-label="Minimize cart"
            >
              ×
            </button>
          </div>
          
          {/* View cart button */}
          <Link
            href="/cart"
            className="block p-4 grofast-gradient text-white font-semibold text-center hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center justify-center gap-2">
              <span>View Cart</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
