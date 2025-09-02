"use client"

import { useCart } from "@/hooks/use-api"
import { api } from "@/lib/api-client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-provider"
import { ArrowLeft, MapPin, Clock, CreditCard, Wallet, Smartphone, Banknote, Edit, Truck } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"

const checkoutSchema = z.object({
  delivery_address: z.string().min(10, "Address must be at least 10 characters").max(200, "Address too long"),
  delivery_time_slot: z.enum(["9-11", "11-13", "13-15", "15-17", "17-19", "19-21"]),
  payment_method: z.enum(["cash", "card", "upi", "wallet"]),
  special_instructions: z.string().max(500, "Instructions too long").optional()
})

type CheckoutForm = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const { data: cart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderCreated, setOrderCreated] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      delivery_address: user?.address || "",
      delivery_time_slot: "15-17",
      payment_method: "card"
    }
  })

  const selectedTimeSlot = watch("delivery_time_slot")
  const selectedPaymentMethod = watch("payment_method")

  if (!cart || !cart.items?.length) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some items to proceed with checkout</p>
          <button
            onClick={() => router.push("/")}
            className="grofast-gradient text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Start Shopping
          </button>
        </div>
      </div>
    )
  }

  const deliveryFee = 2.99
  const taxAmount = cart.total_amount * 0.08 // 8% tax
  const finalAmount = cart.total_amount + deliveryFee + taxAmount

  const timeSlots = [
    { value: "9-11", label: "9:00 AM - 11:00 AM", available: true },
    { value: "11-13", label: "11:00 AM - 1:00 PM", available: true },
    { value: "13-15", label: "1:00 PM - 3:00 PM", available: true },
    { value: "15-17", label: "3:00 PM - 5:00 PM", available: true },
    { value: "17-19", label: "5:00 PM - 7:00 PM", available: false },
    { value: "19-21", label: "7:00 PM - 9:00 PM", available: true }
  ] as const

  const paymentMethods = [
    { value: "card", label: "Credit/Debit Card", icon: CreditCard },
    { value: "upi", label: "UPI", icon: Smartphone },
    { value: "wallet", label: "Wallet", icon: Wallet },
    { value: "cash", label: "Cash on Delivery", icon: Banknote }
  ] as const

  const onSubmit = async (data: CheckoutForm) => {
    setIsSubmitting(true)
    try {
      const order = await api.createOrder(data)
      setOrderCreated(true)
      // Redirect to order confirmation page
      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error("Failed to create order:", error)
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A1A]">Checkout</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-[#00B761] rounded-full flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-[#1A1A1A]">Delivery in 10-15 mins</div>
              <div className="text-sm text-gray-500">{cart.total_items} items • ₹{finalAmount.toFixed(2)}</div>
            </div>
          </div>
          
          {/* Cart items preview */}
          <div className="space-y-3">
            {cart.items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-50 rounded-lg overflow-hidden">
                  {item.product_image ? (
                    <Image
                      src={item.product_image}
                      alt={item.product_name}
                      width={40}
                      height={40}
                      className="object-cover h-full w-full"
                    />
                  ) : (
                    <img src="/assorted-grocery-products.png" alt={item.product_name} className="object-cover h-full w-full" />
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <div className="font-medium text-[#1A1A1A] truncate">{item.product_name}</div>
                  <div className="text-gray-500">{item.quantity} × ₹{item.price.toFixed(2)}</div>
                </div>
                <div className="text-sm font-semibold text-[#1A1A1A]">
                  ₹{item.total_price.toFixed(2)}
                </div>
              </div>
            ))}
            {cart.items.length > 3 && (
              <div className="text-sm text-gray-500 text-center py-2">
                +{cart.items.length - 3} more items
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Delivery Address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-[#00B761]" />
              <h2 className="font-semibold text-[#1A1A1A]">Delivery Address</h2>
            </div>
            
            <div className="space-y-3">
              <textarea
                {...register("delivery_address")}
                placeholder="Enter your complete delivery address..."
                rows={3}
                className="w-full rounded-xl border-2 border-gray-100 px-3 py-2.5 text-sm focus:border-[#00B761] focus:outline-none transition-colors resize-none"
              />
              {errors.delivery_address && (
                <p className="text-[#FF6B6B] text-sm">{errors.delivery_address.message}</p>
              )}
              
              {user?.address && user.address !== watch("delivery_address") && (
                <button
                  type="button"
                  onClick={() => setValue("delivery_address", user.address)}
                  className="text-[#00B761] text-sm font-medium hover:underline flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Use saved address
                </button>
              )}
            </div>
          </div>

          {/* Delivery Time Slot */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-[#00B761]" />
              <h2 className="font-semibold text-[#1A1A1A]">Delivery Time</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot) => (
                <label
                  key={slot.value}
                  className={`
                    relative flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all
                    ${slot.available ? 'hover:border-[#00B761]' : 'opacity-50 cursor-not-allowed'}
                    ${selectedTimeSlot === slot.value ? 'border-[#00B761] bg-[#E8F5E8]' : 'border-gray-100'}
                  `}
                >
                  <input
                    {...register("delivery_time_slot")}
                    type="radio"
                    value={slot.value}
                    disabled={!slot.available}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="font-medium text-[#1A1A1A] text-sm">{slot.label}</div>
                    {!slot.available && (
                      <div className="text-xs text-[#FF6B6B] mt-1">Not Available</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-[#00B761]" />
              <h2 className="font-semibold text-[#1A1A1A]">Payment Method</h2>
            </div>
            
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                return (
                  <label
                    key={method.value}
                    className={`
                      flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all hover:border-[#00B761]
                      ${selectedPaymentMethod === method.value ? 'border-[#00B761] bg-[#E8F5E8]' : 'border-gray-100'}
                    `}
                  >
                    <input
                      {...register("payment_method")}
                      type="radio"
                      value={method.value}
                      className="sr-only"
                    />
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-[#1A1A1A]">{method.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="font-semibold text-[#1A1A1A] mb-3">Special Instructions (Optional)</h2>
            <textarea
              {...register("special_instructions")}
              placeholder="Any specific delivery instructions..."
              rows={2}
              className="w-full rounded-xl border-2 border-gray-100 px-3 py-2.5 text-sm focus:border-[#00B761] focus:outline-none transition-colors resize-none"
            />
            {errors.special_instructions && (
              <p className="text-[#FF6B6B] text-sm mt-2">{errors.special_instructions.message}</p>
            )}
          </div>

          {/* Bill Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="font-semibold text-[#1A1A1A] mb-4">Bill Details</h2>
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
              <hr className="my-3" />
              <div className="flex justify-between font-bold text-base">
                <span className="text-[#1A1A1A]">Grand Total</span>
                <span className="text-[#1A1A1A]">₹{finalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="bg-[#E8F5E8] p-3 rounded-xl mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-[#00B761]" />
                <span className="text-[#00B761] font-medium">
                  Free delivery on orders above ₹199
                </span>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <button
              type="submit"
              disabled={isSubmitting || orderCreated}
              className="w-full grofast-gradient text-white font-semibold py-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : orderCreated ? (
                <span>Order Placed!</span>
              ) : (
                <>
                  <span>Place Order</span>
                  <span className="bg-white/20 px-2 py-1 rounded-md text-sm">
                    ₹{finalAmount.toFixed(2)}
                  </span>
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Expected delivery by {new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
