"use client"

import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { api } from "@/lib/api-client"
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, MapPin, CreditCard, FileText, Phone } from "lucide-react"

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = Number(params?.id)
  const { data: order, isLoading } = useSWR(id ? `/orders/${id}` : null, () => api.orderById(id))

  const statusConfig = {
    pending: { label: "Order Placed", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
    confirmed: { label: "Order Confirmed", color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle },
    preparing: { label: "Being Prepared", color: "bg-orange-100 text-orange-800 border-orange-200", icon: Package },
    out_for_delivery: { label: "Out for Delivery", color: "bg-purple-100 text-purple-800 border-purple-200", icon: Truck },
    delivered: { label: "Delivered", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#00B761] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Order not found</h2>
          <p className="text-gray-500 mb-6">This order may have been deleted or doesn't exist</p>
          <button
            onClick={() => router.push("/orders/my-orders")}
            className="grofast-gradient text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            View My Orders
          </button>
        </div>
      </div>
    )
  }

  const status = statusConfig[order.status as keyof typeof statusConfig]
  const StatusIcon = status.icon

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
          <div>
            <h1 className="text-lg font-bold text-[#1A1A1A]">Order Details</h1>
            <p className="text-sm text-gray-500">#{order.order_number}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Order Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="text-center space-y-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${status.color}`}>
              <StatusIcon className="h-5 w-5" />
              <span className="font-semibold">{status.label}</span>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                Order placed on {new Date(order.created_at).toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              
              {order.estimated_delivery_time && (
                <div className="flex items-center justify-center gap-1 text-sm text-[#00B761] font-medium">
                  <Truck className="h-4 w-4" />
                  <span>
                    Expected by {new Date(order.estimated_delivery_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              
              {order.actual_delivery_time && (
                <div className="text-sm text-green-600 font-medium">
                  Delivered on {new Date(order.actual_delivery_time).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="font-semibold text-[#1A1A1A] mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2">
                <div className="h-12 w-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src="/assorted-grocery-products.png" 
                    alt={item.product_name}
                    className="object-cover h-full w-full"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[#1A1A1A] text-sm">{item.product_name}</h3>
                  <div className="text-xs text-gray-500">
                    {item.quantity} × ₹{item.price.toFixed(2)}
                  </div>
                </div>
                <div className="text-sm font-semibold text-[#1A1A1A]">
                  ₹{item.total_price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="font-semibold text-[#1A1A1A] mb-4">Delivery Information</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[#00B761] mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-[#1A1A1A] text-sm">Delivery Address</div>
                <div className="text-sm text-gray-600 mt-1">{order.delivery_address}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[#00B761] flex-shrink-0" />
              <div>
                <div className="font-medium text-[#1A1A1A] text-sm">Time Slot</div>
                <div className="text-sm text-gray-600">{order.delivery_time_slot}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-[#00B761] flex-shrink-0" />
              <div>
                <div className="font-medium text-[#1A1A1A] text-sm">Payment Method</div>
                <div className="text-sm text-gray-600 capitalize">{order.payment_method}</div>
              </div>
            </div>
            
            {order.special_instructions && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-[#00B761] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-[#1A1A1A] text-sm">Special Instructions</div>
                  <div className="text-sm text-gray-600 mt-1">{order.special_instructions}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bill Details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="font-semibold text-[#1A1A1A] mb-4">Bill Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal ({order.items.length} items)</span>
              <span className="text-[#1A1A1A]">₹{order.total_amount.toFixed(2)}</span>
            </div>
            {order.delivery_fee && (
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery fee</span>
                <span className="text-[#1A1A1A]">₹{order.delivery_fee.toFixed(2)}</span>
              </div>
            )}
            {order.tax_amount && (
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes & charges</span>
                <span className="text-[#1A1A1A]">₹{order.tax_amount.toFixed(2)}</span>
              </div>
            )}
            <hr className="my-3" />
            <div className="flex justify-between font-bold text-base">
              <span className="text-[#1A1A1A]">Total Paid</span>
              <span className="text-[#1A1A1A]">₹{order.final_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="font-semibold text-[#1A1A1A] mb-4">Need Help?</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-[#00B761] transition-colors">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#00B761]" />
                <span className="font-medium text-[#1A1A1A]">Contact Customer Support</span>
              </div>
            </button>
            
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-[#00B761] transition-colors">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-[#FF6B6B]" />
                  <span className="font-medium text-[#1A1A1A]">Cancel Order</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
