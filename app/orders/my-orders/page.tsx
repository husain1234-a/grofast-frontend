"use client"

import { useMyOrders } from "@/hooks/use-api"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MyOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined)
  const { data: ordersData, isLoading } = useMyOrders({ 
    page: 1, 
    size: 20, 
    status: selectedStatus as any 
  })
  const router = useRouter()

  const statusConfig = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
    preparing: { label: "Preparing", color: "bg-orange-100 text-orange-800", icon: Package },
    out_for_delivery: { label: "Out for Delivery", color: "bg-purple-100 text-purple-800", icon: Truck },
    delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle }
  }

  const statusFilters = [
    { value: undefined, label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
  ]

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
          <h1 className="text-lg font-bold text-[#1A1A1A]">My Orders</h1>
        </div>
        
        {/* Status filters */}
        <div className="flex gap-2 overflow-x-auto mt-4 pb-2 scroll-hidden">
          {statusFilters.map((filter) => (
            <button
              key={filter.value || 'all'}
              onClick={() => setSelectedStatus(filter.value)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${selectedStatus === filter.value 
                  ? 'bg-[#00B761] text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#00B761]'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !ordersData?.orders?.length ? (
          <div className="text-center py-16">
            <div className="h-32 w-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">No orders found</h2>
            <p className="text-gray-500 mb-6">
              {selectedStatus 
                ? `No ${statusConfig[selectedStatus as keyof typeof statusConfig]?.label.toLowerCase()} orders found`
                : "You haven't placed any orders yet"
              }
            </p>
            <Link
              href="/"
              className="grofast-gradient text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {ordersData.orders.map((order) => {
              const status = statusConfig[order.status as keyof typeof statusConfig]
              const StatusIcon = status.icon
              
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 p-4 hover:grofast-shadow transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    {/* Order icon */}
                    <div className="h-16 w-16 grofast-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="h-8 w-8 text-white" />
                    </div>

                    {/* Order details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#1A1A1A] text-sm">
                          Order #{order.order_number}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>{order.items.length} item{order.items.length !== 1 ? 's' : ''} • ₹{order.final_amount.toFixed(2)}</div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {order.estimated_delivery_time && (
                          <div className="flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            <span>Expected by {new Date(order.estimated_delivery_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
