'use client';

import { useState, useEffect } from 'react';
import { MapPin, Package, DollarSign, Clock, Navigation } from 'lucide-react';
import { useApi } from '@/hooks/use-api';

export default function DeliveryPartnerPage() {
  const [partner, setPartner] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const { get, post } = useApi();

  useEffect(() => {
    loadPartnerData();
    getCurrentLocation();
  }, []);

  const loadPartnerData = async () => {
    try {
      const [partnerRes, ordersRes] = await Promise.all([
        get('/delivery/me'),
        get('/delivery/orders')
      ]);
      setPartner(partnerRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Failed to load partner data:', error);
    }
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      setLocation(newLocation);
      updateLocation(newLocation);
    });
  };

  const updateLocation = async (coords: { lat: number; lng: number }) => {
    try {
      await post('/delivery/location', coords);
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await post(`/delivery/orders/${orderId}/status`, { status });
      loadPartnerData();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  if (!partner) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Delivery Dashboard</h1>
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
            Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
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
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'picked_up' ? 'bg-blue-100 text-blue-800' :
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