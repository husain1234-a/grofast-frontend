"use client"

import { useCart } from "@/hooks/use-api"
import { api } from "@/lib/api-client"
import { mutate } from "swr"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingCart, Clock, Truck, ArrowRight } from "lucide-react"

interface CartDrawerProps {
  isOpen?: boolean
  onClose?: () => void
}

export function CartDrawer({ isOpen = true, onClose }: CartDrawerProps) {
  const { data, isLoading } = useCart()
  const [busy, setBusy] = useState<string | null>(null)

  const updateQuantity = async (productId: number, action: 'add' | 'remove', quantity = 1) => {
    setBusy(`${productId}-${action}`)
    try {
      if (action === 'add') {
        await api.addToCart({ product_id: productId, quantity })
      } else {
        await api.removeFromCart({ product_id: productId, quantity })
      }
      await mutate("/cart")
    } finally {
      setBusy(null)
    }
  }

  const clear = async () => {
    setBusy('clear')
    try {
      await api.clearCart()
      await mutate("/cart")
    } finally {
      setBusy(null)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-t-3xl p-6 min-h-[300px] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#00B761] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!data || (data.items?.length ?? 0) === 0) {
    return (
      <div className="bg-white rounded-t-3xl p-6 text-center space-y-4">
        <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <ShoppingCart className="h-10 w-10 text-gray-400" />
        </div>
        <div>
          <h3 className="font-semibold text-[#1A1A1A] mb-2">Your cart is empty</h3>
          <p className="text-gray-500 text-sm">Add some items to get started!</p>
        </div>
        <Link
          href="/"
          className="inline-block grofast-gradient text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          onClick={onClose}
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  const deliveryFee = 2.99
  const taxAmount = data.total_amount * 0.08 // 8% tax
  const finalAmount = data.total_amount + deliveryFee + taxAmount

  return (
    <div className={`bg-white rounded-t-3xl transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      {/* Handle bar */}
      <div className="flex justify-center pt-3 pb-2">
        <div className="w-12 h-1 bg-gray-300 rounded-full" />
      </div>

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A]">My Cart</h2>
            <p className="text-sm text-gray-500">{data.total_items} item{data.total_items !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={clear}
            disabled={busy === 'clear'}
            className="text-[#FF6B6B] text-sm font-medium hover:underline disabled:opacity-50 flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            {busy === 'clear' ? 'Clearing...' : 'Clear'}
          </button>
        </div>
      </div>

      {/* Cart items */}
      <div className="max-h-96 overflow-y-auto px-6">
        <div className="space-y-4 py-4">
          {data.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              {/* Product image */}
              <div className="h-14 w-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                {item.product_image ? (
                  <Image
                    src={item.product_image}
                    alt={item.product_name}
                    width={56}
                    height={56}
                    className="object-cover h-full w-full"
                  />
                ) : (
                  <img 
                    src="/assorted-grocery-products.png" 
                    alt={item.product_name}
                    className="object-cover h-full w-full"
                  />
                )}
              </div>

              {/* Product details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#1A1A1A] text-sm truncate">
                  {item.product_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[#1A1A1A] font-bold text-sm">
                    ₹{item.price.toFixed(2)}
                  </span>
                  <span className="text-gray-400 text-xs">
                    Total: ₹{item.total_price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center bg-[#00B761] text-white rounded-xl overflow-hidden">
                <button
                  onClick={() => updateQuantity(item.product_id, 'remove', 1)}
                  disabled={busy === `${item.product_id}-remove`}
                  className="px-2.5 py-1.5 hover:bg-[#1FB574] disabled:opacity-50 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="px-2.5 py-1.5 font-semibold text-sm min-w-[30px] text-center">
                  {busy === `${item.product_id}-remove` || busy === `${item.product_id}-add` ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    item.quantity
                  )}
                </span>
                <button
                  onClick={() => updateQuantity(item.product_id, 'add', 1)}
                  disabled={busy === `${item.product_id}-add`}
                  className="px-2.5 py-1.5 hover:bg-[#1FB574] disabled:opacity-50 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with pricing and checkout */}
      <div className="px-6 py-4 border-t border-gray-100 space-y-4">
        {/* Delivery info */}
        <div className="bg-[#E8F5E8] rounded-xl p-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-[#00B761]" />
            <span className="text-[#00B761] font-medium">
              Delivery in 10-15 mins
            </span>
          </div>
        </div>

        {/* Bill summary */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-[#1A1A1A]">₹{data.total_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery fee</span>
            <span className="text-[#1A1A1A]">₹{deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Taxes</span>
            <span className="text-[#1A1A1A]">₹{taxAmount.toFixed(2)}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-semibold text-base">
            <span className="text-[#1A1A1A]">Total</span>
            <span className="text-[#1A1A1A]">₹{finalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout button */}
        <Link
          href="/checkout"
          className="w-full grofast-gradient text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          onClick={onClose}
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
