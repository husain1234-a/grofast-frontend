import { useState, useEffect } from 'react'
import { logger } from './logger'
import { toast } from '@/hooks/use-toast'
import { sendOrderStatusNotification } from './notifications'

// Types for real-time events
export interface OrderUpdate {
  id: number
  status: string
  updated_at: string
  delivery_partner_id?: number
  estimated_delivery_time?: string
  user_id: number
}

export interface DeliveryPartnerLocation {
  id: number
  delivery_partner_id: number
  latitude: number
  longitude: number
  timestamp: string
  order_id?: number
}

export interface RealTimeEventHandlers {
  onOrderUpdate?: (update: OrderUpdate) => void
  onDeliveryLocationUpdate?: (location: DeliveryPartnerLocation) => void
  onDeliveryPartnerStatusChange?: (partnerId: number, isAvailable: boolean) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: any) => void
}

class RealtimeService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private handlers: RealTimeEventHandlers = {}
  private isConnected = false
  private heartbeatInterval: NodeJS.Timeout | null = null

  connect(token: string, handlers?: RealTimeEventHandlers) {
    if (typeof window === 'undefined') return

    if (handlers) {
      this.handlers = { ...this.handlers, ...handlers }
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://staging-api.grofast.com/ws'
    
    try {
      this.ws = new WebSocket(`${wsUrl}?token=${token}`)
      
      this.ws.onopen = () => {
        logger.info('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.handlers.onConnect?.()
      }
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          logger.error('Failed to parse WebSocket message', error)
        }
      }
      
      this.ws.onclose = (event) => {
        logger.warn('WebSocket disconnected', { code: event.code, reason: event.reason })
        this.isConnected = false
        this.stopHeartbeat()
        this.handlers.onDisconnect?.()
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000) {
          this.reconnect(token)
        }
      }
      
      this.ws.onerror = (error) => {
        logger.error('WebSocket error', error)
        this.handlers.onError?.(error)
      }
    } catch (error) {
      logger.error('Failed to connect WebSocket', error)
      this.handlers.onError?.(error)
    }
  }

  private reconnect(token: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    setTimeout(() => {
      logger.info(`Reconnecting WebSocket (attempt ${this.reconnectAttempts})`)
      this.connect(token)
    }, this.reconnectDelay * this.reconnectAttempts)
  }

  private handleMessage(data: any) {
    logger.info('WebSocket message received', data)
    
    // Dispatch custom events for different message types
    switch (data.type) {
      case 'order_status_update':
        window.dispatchEvent(new CustomEvent('orderStatusUpdate', { detail: data }))
        break
      case 'delivery_location_update':
        window.dispatchEvent(new CustomEvent('deliveryLocationUpdate', { detail: data }))
        break
      case 'new_order':
        window.dispatchEvent(new CustomEvent('newOrder', { detail: data }))
        break
      default:
        window.dispatchEvent(new CustomEvent('realtimeMessage', { detail: data }))
    }
  }

  // Start heartbeat to keep connection alive
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // 30 seconds
  }

  // Stop heartbeat
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // Subscribe to order updates
  subscribeToOrder(orderId: number) {
    this.send({
      type: 'subscribe',
      channel: 'order_updates',
      payload: { order_id: orderId }
    })
    logger.info('Subscribed to order updates', { orderId })
  }

  // Subscribe to delivery partner location
  subscribeToDeliveryPartner(partnerId: number) {
    this.send({
      type: 'subscribe',
      channel: 'delivery_location',
      payload: { partner_id: partnerId }
    })
    logger.info('Subscribed to delivery partner location', { partnerId })
  }

  // Send delivery partner location update
  sendLocationUpdate(latitude: number, longitude: number, orderId?: number) {
    this.send({
      type: 'location_update',
      payload: { 
        latitude, 
        longitude, 
        order_id: orderId, 
        timestamp: new Date().toISOString() 
      }
    })
    logger.debug('Location update sent', { latitude, longitude, orderId })
  }

  // Update delivery partner availability status
  updateAvailabilityStatus(isAvailable: boolean, location?: { latitude: number; longitude: number }) {
    this.send({
      type: 'status_update',
      payload: { 
        is_available: isAvailable, 
        location,
        timestamp: new Date().toISOString() 
      }
    })
    logger.info('Availability status updated', { isAvailable })
  }

  // Get connection status
  isConnectedToWebSocket(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN
  }

  // Update event handlers
  setHandlers(handlers: RealTimeEventHandlers) {
    this.handlers = { ...this.handlers, ...handlers }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      logger.warn('WebSocket not connected, cannot send message')
    }
  }

  disconnect() {
    this.stopHeartbeat()
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting')
      this.ws = null
    }
    
    this.isConnected = false
    this.reconnectAttempts = 0
    logger.info('WebSocket disconnected by client')
  }
}

export const realtimeService = new RealtimeService()

// Hook for React components to use real-time features
export const useRealTime = (token?: string, handlers?: RealTimeEventHandlers) => {
  const connect = () => realtimeService.connect(token || '', handlers)
  const disconnect = () => realtimeService.disconnect()
  const isConnected = realtimeService.isConnectedToWebSocket()

  return {
    connect,
    disconnect,
    isConnected,
    subscribeToOrder: realtimeService.subscribeToOrder.bind(realtimeService),
    subscribeToDeliveryPartner: realtimeService.subscribeToDeliveryPartner.bind(realtimeService),
    sendLocationUpdate: realtimeService.sendLocationUpdate.bind(realtimeService),
    updateAvailabilityStatus: realtimeService.updateAvailabilityStatus.bind(realtimeService),
  }
}

// Hook for real-time order tracking
export const useOrderTracking = (orderId: number) => {
  const [orderStatus, setOrderStatus] = useState<any>(null)
  const [deliveryLocation, setDeliveryLocation] = useState<any>(null)

  useEffect(() => {
    const handleOrderUpdate = (event: CustomEvent) => {
      if (event.detail.order_id === orderId) {
        setOrderStatus(event.detail)
      }
    }

    const handleLocationUpdate = (event: CustomEvent) => {
      if (event.detail.order_id === orderId) {
        setDeliveryLocation(event.detail)
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