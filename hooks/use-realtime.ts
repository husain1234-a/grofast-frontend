"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/auth-provider'
import { realtimeService } from '@/lib/realtime'
import { logger } from '@/lib/logger'

export function useRealtime() {
  const { token } = useAuth()
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (token) {
      realtimeService.connect(token)
      setConnected(true)
      
      return () => {
        realtimeService.disconnect()
        setConnected(false)
      }
    }
  }, [token])

  return { connected }
}

export function useOrderTracking(orderId: number) {
  const [orderStatus, setOrderStatus] = useState<any>(null)
  const [deliveryLocation, setDeliveryLocation] = useState<any>(null)

  useEffect(() => {
    const handleOrderUpdate = (event: CustomEvent) => {
      if (event.detail.order_id === orderId) {
        setOrderStatus(event.detail)
        logger.info('Order status updated', event.detail)
      }
    }

    const handleLocationUpdate = (event: CustomEvent) => {
      if (event.detail.order_id === orderId) {
        setDeliveryLocation(event.detail)
        logger.info('Delivery location updated', event.detail)
      }
    }

    window.addEventListener('orderStatusUpdate', handleOrderUpdate as EventListener)
    window.addEventListener('deliveryLocationUpdate', handleLocationUpdate as EventListener)

    return () => {
      window.removeEventListener('orderStatusUpdate', handleOrderUpdate as EventListener)
      window.removeEventListener('deliveryLocationUpdate', handleLocationUpdate as EventListener)
    }
  }, [orderId])

  return { orderStatus, deliveryLocation }
}