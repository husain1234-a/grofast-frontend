"use client"

import { useState, useEffect } from "react"
import { deliveryApi } from "@/lib/api-client"
import { useAuth } from "@/app/auth-provider"
import { MapPin, Clock, Package, ToggleLeft, ToggleRight } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function DeliveryDashboard() {
  const { user, token } = useAuth()
  const [partner, setPartner] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      loadData()
      getCurrentLocation()
    }
  }, [token])

  const loadData = async () => {
    try {
      const [partnerData, ordersData] = await Promise.all([
        deliveryApi.me(token),
        deliveryApi.getOrders(token)
      ])
      setPartner(partnerData)
      setOrders(ordersData.orders)
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load data" })
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => console.error("Location error:", error)
      )
    }
  }

  const toggleAvailability = async () => {
    try {
      await deliveryApi.updateStatus({
        is_available: !partner.is_available,
        current_location: location ? { latitude: location.lat, longitude: location.lng } : undefined
      }, token)
      setPartner({ ...partner, is_available: !partner.is_available })
      toast({ title: partner.is_available ? "Gone Offline" : "Now Online" })
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update status" })
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
              <p className="text-gray-600">Welcome, {partner?.name || user?.name}</p>
            </div>
            <button
              onClick={toggleAvailability}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                partner?.is_available 
                  ? "bg-green-100 text-green-700" 
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {partner?.is_available ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
              {partner?.is_available ? "Online" : "Offline"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === 'assigned').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === 'delivered').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-sm font-medium">{location ? "GPS Active" : "No Location"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Assigned Orders</h2>
          </div>
          <div className="divide-y">
            {orders.map((order) => (
              <div key={order.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">{order.delivery_address}</p>
                    <p className="text-sm text-gray-500">₹{order.total_amount}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'picked_up' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No orders assigned
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}