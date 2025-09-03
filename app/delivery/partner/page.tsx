'use client';

import { useState, useEffect } from 'react';
import { MapPin, Package, DollarSign, Clock, Navigation, RefreshCw } from 'lucide-react';
import { deliveryApi, type DeliveryPartnerResponse, type OrderResponse } from '@/lib/api-client';
import { useAuth } from '@/app/auth-provider';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export default function DeliveryPartnerPage() {
  const { token } = useAuth();
  const [partner, setPartner] = useState<DeliveryPartnerResponse | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [status, setStatus] = useState<'available' | 'busy' | 'offline'>('offline');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadPartnerData();
      getCurrentLocation();
    }
  }, [token]);

  const loadPartnerData = async () => {
    try {
      const [partnerData, ordersData] = await Promise.all([
        deliveryApi.me(token),
        deliveryApi.getOrders(token)
      ]);
      setPartner(partnerData);
      setOrders(ordersData.orders);
      setStatus(partnerData.status || 'offline');
    } catch (error) {
      logger.error('Failed to load partner data', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load delivery partner data" });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(newLocation);
          updateLocation(newLocation);
          toast({ title: "Location Updated", description: "Your location has been updated successfully" });
        },
        (error) => {
          logger.error('Geolocation error', error);
          toast({ variant: "destructive", title: "Location Error", description: "Failed to get your location" });
        }
      );
    }
  };

  const updateLocation = async (coords: { latitude: number; longitude: number }) => {
    try {
      await deliveryApi.sendLocation(coords, token);
    } catch (error) {
      logger.error('Failed to update location', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update location" });
    }
  };

  const toggleAvailability = async () => {
    try {
      const newStatus = status === 'offline' ? 'available' : 'offline';
      await deliveryApi.updateStatus({ 
        status: newStatus, 
        current_location: location 
      }, token);
      setStatus(newStatus);
      toast({ 
        title: newStatus === 'available' ? "You're now available" : "You're now offline",
        description: newStatus === 'available' ? "You can receive new orders" : "You won't receive new orders"
      });
    } catch (error) {
      logger.error('Failed to update availability', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update availability status" });
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      // Note: This endpoint may need to be implemented in the backend
      // For now, we'll simulate it by calling the order API
      await fetch(`${process.env.NEXT_PUBLIC_GROFAST_API_URL}/delivery/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'firebase_token': token
        },
        body: JSON.stringify({ status })
      });
      
      // Refresh the orders list
      await loadPartnerData();
      toast({ 
        title: "Order Status Updated", 
        description: `Order ${orderId} status changed to ${status.replace('_', ' ')}` 
      });
    } catch (error) {
      logger.error('Failed to update order status', error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to update order status" 
      });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
        <div>Loading delivery dashboard...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Delivery Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <button
                  onClick={toggleAvailability}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                    status === 'available'
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : status === 'busy'
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {status === 'offline' ? 'Offline' : status}
                </button>
              </div>
              <button
                onClick={loadPartnerData}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Package className="w-8 h-8 text-grofast-green mx-auto mb-2" />
              <div className="text-2xl font-bold">{partner.todayOrders || 0}</div>
              <div className="text-sm text-gray-600">Today's Orders</div>
            </div>
            <div className="text-center">
              <DollarSign className="w-8 h-8 text-grofast-yellow mx-auto mb-2" />
              <div className="text-2xl font-bold">₹{partner.todayEarnings || 0}</div>
              <div className="text-sm text-gray-600">Today's Earnings</div>
            </div>
            <div className="text-center">
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{partner.avgDeliveryTime || 0}m</div>
              <div className="text-sm text-gray-600">Avg Time</div>
            </div>
            <div className="text-center">
              <MapPin className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{partner.rating || 0}</div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
          </div>
        </div>

        {/* Location Update */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Current Location</h2>
            <button
              onClick={getCurrentLocation}
              className="flex items-center gap-2 bg-grofast-green text-white px-4 py-2 rounded-xl text-sm"
            >
              <Navigation className="w-4 h-4" />
              Update Location
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
          </p>
        </div>

        {/* Active Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Active Orders</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.address}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">₹{order.total}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${order.status === 'picked_up' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'out_for_delivery' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {order.status === 'assigned' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'picked_up')}
                      className="bg-grofast-green text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Mark Picked Up
                    </button>
                  )}
                  {order.status === 'picked_up' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Out for Delivery
                    </button>
                  )}
                  {order.status === 'out_for_delivery' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}