"use client"

import { useCart } from "@/hooks/use-api"
import { api } from "@/lib/api-client"
import { mutate } from "swr"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart, Clock, Truck } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { data: cart } = useCart()
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const updateQuantity = async (productId: number, action: 'add' | 'remove', quantity = 1) => {
    setLoading(`${productId}-${action}`)
    try {
      if (action === 'add') {
        await api.addToCart({ product_id: productId, quantity })
      } else {
        await api.removeFromCart({ product_id: productId, quantity })
      }
      await mutate("/cart")
    } finally {
      setLoading(null)
    }
  }

  const clearCart = async () => {
    setLoading('clear')
    try {
      await api.clearCart()
      await mutate("/cart")
    } finally {
      setLoading(null)
    }
  }

  if (!cart) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#00B761] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F9F9]">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-[#1A1A1A]">My Cart</h1>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="h-32 w-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-center mb-8 max-w-sm">
            Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
          </p>
          <Link
            href="/"
            className="grofast-gradient text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  const deliveryFee = 2.99
  const taxAmount = cart.total_amount * 0.08 // 8% tax
  const finalAmount = cart.total_amount + deliveryFee + taxAmount

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-[#1A1A1A]">My Cart</h1>
          </div>
          
          {cart.items.length > 0 && (
            <button
              onClick={clearCart}
              disabled={loading === 'clear'}
              className="text-[#FF6B6B] text-sm font-medium hover:underline disabled:opacity-50"
            >
              {loading === 'clear' ? 'Clearing...' : 'Clear Cart'}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Delivery info */}
        <div className="bg-[#E8F5E8] rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#00B761] rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-[#1A1A1A]">Delivery in 10-15 mins</div>
              <div className="text-sm text-gray-600">Shipment of {cart.total_items} item{cart.total_items !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>

        {/* Cart items */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="space-y-0">
            {cart.items.map((item, index) => (
              <div key={item.id} className={`p-4 ${index < cart.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center gap-4">
                  {/* Product image */}
                  <div className="h-16 w-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        width={64}
                        height={64}
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
                      <span className="text-[#1A1A1A] font-bold">
                        ₹{item.price.toFixed(2)}
                      </span>
                      <span className="text-gray-400 text-sm">
                        Total: ₹{item.total_price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-[#00B761] text-white rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product_id, 'remove', 1)}
                        disabled={loading === `${item.product_id}-remove`}
                        className="px-3 py-2 hover:bg-[#1FB574] disabled:opacity-50 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 py-2 font-semibold text-sm min-w-[40px] text-center">
                        {loading === `${item.product_id}-remove` || loading === `${item.product_id}-add` ? (
                          <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, 'add', 1)}
                        disabled={loading === `${item.product_id}-add`}
                        className="px-3 py-2 hover:bg-[#1FB574] disabled:opacity-50 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <h3 className="font-semibold text-[#1A1A1A] mb-3">Bill Details</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal ({cart.total_items} items)</span>
              <span className="text-[#1A1A1A]">₹{cart.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery fee</span>
              <span className="text-[#1A1A1A]">₹{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxes & charges</span>
              <span className="text-[#1A1A1A]">₹{taxAmount.toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold text-base">
              <span className="text-[#1A1A1A]">Grand Total</span>
              <span className="text-[#1A1A1A]">₹{finalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="bg-[#E8F5E8] p-3 rounded-xl mt-4">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-[#00B761]" />
              <span className="text-[#00B761] font-medium">
                Your order qualifies for FREE delivery!
              </span>
            </div>
          </div>
        </div>

        {/* Checkout button */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <Link
            href="/checkout"
            className="w-full grofast-gradient text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span>Proceed to Checkout</span>
            <span className="bg-white/20 px-2 py-1 rounded-md text-sm">
              ₹{finalAmount.toFixed(2)}
            </span>
          </Link>
          
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Delivery by {new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
