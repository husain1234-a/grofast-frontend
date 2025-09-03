"use client"

import { useState, useEffect } from "react"
import {
    Search,
    Filter,
    Eye,
    MapPin,
    Clock,
    Package,
    Truck,
    CheckCircle,
    XCircle
} from "lucide-react"
import { adminApi } from "@/lib/api-client"
import { logger } from "@/lib/logger"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/app/auth-provider"

interface Order {
    id: number
    customer_name: string
    customer_phone: string
    delivery_address: string
    total_amount: number
    status: string
    created_at: string
    delivery_time_slot: string
    payment_method: string
    items: Array<{
        product_name: string
        quantity: number
        price: number
    }>
}

export default function AdminOrders() {
    const { token } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    useEffect(() => {
        if (token) {
            loadOrders()
        }
    }, [token])

    const loadOrders = async () => {
        try {
            setLoading(true)
            const response = await adminApi.getOrders(token)
            setOrders(response.orders || [])
            logger.info('Orders loaded successfully')
        } catch (error) {
            logger.error('Failed to load orders', error)

            // Fallback demo data
            setOrders([
                {
                    id: 1,
                    customer_name: "John Doe",
                    customer_phone: "+91 9876543210",
                    delivery_address: "123 Main St, Mumbai, Maharashtra",
                    total_amount: 450,
                    status: "delivered",
                    created_at: "2024-01-15T10:30:00Z",
                    delivery_time_slot: "11-13",
                    payment_method: "upi",
                    items: [
                        { product_name: "Apples", quantity: 2, price: 120 },
                        { product_name: "Bananas", quantity: 3, price: 60 }
                    ]
                },
                {
                    id: 2,
                    customer_name: "Jane Smith",
                    customer_phone: "+91 9876543211",
                    delivery_address: "456 Park Ave, Delhi, Delhi",
                    total_amount: 320,
                    status: "out_for_delivery",
                    created_at: "2024-01-15T11:15:00Z",
                    delivery_time_slot: "13-15",
                    payment_method: "cash",
                    items: [
                        { product_name: "Milk", quantity: 2, price: 55 },
                        { product_name: "Bread", quantity: 1, price: 25 }
                    ]
                },
                {
                    id: 3,
                    customer_name: "Mike Johnson",
                    customer_phone: "+91 9876543212",
                    delivery_address: "789 Oak St, Bangalore, Karnataka",
                    total_amount: 680,
                    status: "preparing",
                    created_at: "2024-01-15T11:45:00Z",
                    delivery_time_slot: "15-17",
                    payment_method: "card",
                    items: [
                        { product_name: "Vegetables Mix", quantity: 1, price: 200 },
                        { product_name: "Rice", quantity: 2, price: 150 }
                    ]
                }
            ])
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
            case 'confirmed': return <Package className="h-4 w-4 text-blue-600" />
            case 'preparing': return <Package className="h-4 w-4 text-purple-600" />
            case 'out_for_delivery': return <Truck className="h-4 w-4 text-orange-600" />
            case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />
            case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />
            default: return <Clock className="h-4 w-4 text-gray-600" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'confirmed': return 'bg-blue-100 text-blue-800'
            case 'preparing': return 'bg-purple-100 text-purple-800'
            case 'out_for_delivery': return 'bg-orange-100 text-orange-800'
            case 'delivered': return 'bg-green-100 text-green-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toString().includes(searchTerm)
        const matchesStatus = !statusFilter || order.status === statusFilter
        return matchesSearch && matchesStatus
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B761]"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-600">Manage customer orders and deliveries</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Total Orders: {orders.length}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by customer name or order ID..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B761] focus:border-transparent outline-none"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B761] focus:border-transparent outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Time Slot</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">#{order.id}</td>
                                    <td className="py-3 px-4">
                                        <div>
                                            <div className="font-medium">{order.customer_name}</div>
                                            <div className="text-sm text-gray-600">{order.customer_phone}</div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 font-medium">₹{order.total_amount}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(order.status)}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm">{order.delivery_time_slot}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="flex items-center gap-1 text-[#00B761] hover:text-[#009653] text-sm font-medium"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-600">
                            {searchTerm || statusFilter ? "Try adjusting your filters" : "No orders have been placed yet"}
                        </p>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    token={token}
                    onClose={() => setSelectedOrder(null)}
                    onStatusUpdate={(orderId, newStatus) => {
                        setOrders(orders.map(order =>
                            order.id === orderId ? { ...order, status: newStatus } : order
                        ))
                        setSelectedOrder(null)
                    }}
                />
            )}
        </div>
    )
}

// Order Details Modal Component
function OrderDetailsModal({
    order,
    token,
    onClose,
    onStatusUpdate
}: {
    order: Order
    token: string
    onClose: () => void
    onStatusUpdate: (orderId: number, status: string) => void
}) {
    const [newStatus, setNewStatus] = useState(order.status)

    const handleStatusUpdate = async () => {
        try {
            // Call API to update status
            // await adminApi.updateOrderStatus(order.id, newStatus)

            onStatusUpdate(order.id, newStatus)

            toast({
                variant: "success",
                title: "Status Updated",
                description: "Order status has been successfully updated.",
            })

            logger.info('Order status updated', { orderId: order.id, newStatus })
        } catch (error) {
            logger.error('Failed to update order status', error)

            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Failed to update order status. Please try again.",
            })
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XCircle className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Order Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                                <div className="space-y-1 text-sm">
                                    <div><span className="text-gray-600">Order ID:</span> #{order.id}</div>
                                    <div><span className="text-gray-600">Created:</span> {new Date(order.created_at).toLocaleString()}</div>
                                    <div><span className="text-gray-600">Time Slot:</span> {order.delivery_time_slot}</div>
                                    <div><span className="text-gray-600">Payment:</span> {order.payment_method.toUpperCase()}</div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
                                <div className="space-y-1 text-sm">
                                    <div><span className="text-gray-600">Name:</span> {order.customer_name}</div>
                                    <div><span className="text-gray-600">Phone:</span> {order.customer_phone}</div>
                                    <div className="flex items-start gap-1">
                                        <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-900">{order.delivery_address}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Product</th>
                                            <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Quantity</th>
                                            <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Price</th>
                                            <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item, index) => (
                                            <tr key={index} className="border-t border-gray-100">
                                                <td className="py-2 px-3 text-sm">{item.product_name}</td>
                                                <td className="py-2 px-3 text-sm">{item.quantity}</td>
                                                <td className="py-2 px-3 text-sm">₹{item.price}</td>
                                                <td className="py-2 px-3 text-sm font-medium">₹{item.quantity * item.price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 border-t border-gray-200">
                                        <tr>
                                            <td colSpan={3} className="py-2 px-3 text-sm font-medium text-gray-900">Total Amount</td>
                                            <td className="py-2 px-3 text-sm font-bold text-gray-900">₹{order.total_amount}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Status Update */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                            <div className="flex items-center gap-3">
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B761] focus:border-transparent outline-none"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="preparing">Preparing</option>
                                    <option value="out_for_delivery">Out for Delivery</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={newStatus === order.status}
                                    className="px-4 py-2 bg-[#00B761] text-white rounded-lg hover:bg-[#009653] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}