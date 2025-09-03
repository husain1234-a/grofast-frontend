import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging'
import { logger } from './logger'
import { notificationApi } from './api-client'
import { toast } from '@/hooks/use-toast'

let messaging: any = null

// Notification preferences interface
export interface NotificationPreferences {
  orderUpdates: boolean
  promotions: boolean
  deliveryUpdates: boolean
  accountUpdates: boolean
  sound: boolean
}

// Notification types
export const NotificationTypes = {
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_PREPARING: 'order_preparing',
  ORDER_OUT_FOR_DELIVERY: 'order_out_for_delivery',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  DELIVERY_PARTNER_ASSIGNED: 'delivery_partner_assigned',
  PROMOTION: 'promotion',
  ACCOUNT_UPDATE: 'account_update',
} as const

export type NotificationType = typeof NotificationTypes[keyof typeof NotificationTypes]

const NOTIFICATION_PREFS_KEY = 'grofast_notification_preferences'

export const initializeNotifications = async () => {
  if (typeof window === 'undefined') return

  try {
    const { default: app } = await import('./firebase')
    if (!app) return

    messaging = getMessaging(app)
    
    // Request permission
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      logger.info('Notification permission granted')
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      })
      
      if (token) {
        logger.info('FCM token received')
        // Store token for backend
        localStorage.setItem('fcm_token', token)
        setupForegroundMessageListener()
        return token
      }
    } else {
      logger.warn('Notification permission denied')
    }
  } catch (error) {
    logger.error('Failed to initialize notifications', error)
  }
}

// Set up foreground message listener
const setupForegroundMessageListener = () => {
  if (!messaging) return

  onMessage(messaging, (payload: MessagePayload) => {
    logger.info('Message received in foreground', payload)
    
    const { notification, data } = payload
    const prefs = getNotificationPreferences()
    
    // Check if this type of notification is enabled
    const notificationType = data?.type as NotificationType
    if (!shouldShowNotification(notificationType, prefs)) {
      return
    }
    
    if (notification) {
      // Show toast notification
      toast({
        title: notification.title || 'New Notification',
        description: notification.body || '',
        duration: 5000,
      })

      // Also show browser notification if permission is granted
      if (Notification.permission === 'granted') {
        const browserNotification = new Notification(notification.title || 'GroFast', {
          body: notification.body || '',
          icon: notification.icon || '/logo.png',
          badge: '/logo.png',
          tag: data?.orderId || 'grofast-notification',
          requireInteraction: true,
        })

        // Handle notification click
        browserNotification.onclick = () => {
          window.focus()
          if (data?.url) {
            window.location.href = data.url
          }
          browserNotification.close()
        }

        // Play sound if enabled
        if (prefs.sound) {
          playNotificationSound()
        }
      }
    }
  })
}

export const onMessageListener = () => {
  if (!messaging) return Promise.reject('Messaging not initialized')

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      logger.info('Foreground message received', payload)
      
      // Show toast notification
      toast({
        title: payload.notification?.title || 'New Notification',
        description: payload.notification?.body || '',
      })
      
      resolve(payload)
    })
  })
}

export const sendNotification = async (userId: number, title: string, body: string, data?: any) => {
  try {
    const token = localStorage.getItem('grofast_auth_token')
    if (!token) throw new Error('No auth token')

    await notificationApi.sendNotification({
      user_id: userId,
      title,
      body,
      data
    }, token)
    
    logger.info('Notification sent successfully')
  } catch (error) {
    logger.error('Failed to send notification', error)
    throw error
  }
}

// Helper function to determine if notification should be shown
const shouldShowNotification = (type: NotificationType, prefs: NotificationPreferences): boolean => {
  switch (type) {
    case NotificationTypes.ORDER_CONFIRMED:
    case NotificationTypes.ORDER_PREPARING:
    case NotificationTypes.ORDER_OUT_FOR_DELIVERY:
    case NotificationTypes.ORDER_DELIVERED:
    case NotificationTypes.ORDER_CANCELLED:
      return prefs.orderUpdates
    case NotificationTypes.DELIVERY_PARTNER_ASSIGNED:
      return prefs.deliveryUpdates
    case NotificationTypes.PROMOTION:
      return prefs.promotions
    case NotificationTypes.ACCOUNT_UPDATE:
      return prefs.accountUpdates
    default:
      return true
  }
}

// Notification preferences management
export const getNotificationPreferences = (): NotificationPreferences => {
  if (typeof window === 'undefined') {
    return {
      orderUpdates: true,
      promotions: true,
      deliveryUpdates: true,
      accountUpdates: true,
      sound: true,
    }
  }

  try {
    const saved = localStorage.getItem(NOTIFICATION_PREFS_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    logger.error('Failed to load notification preferences', error)
  }

  // Default preferences
  return {
    orderUpdates: true,
    promotions: true,
    deliveryUpdates: true,
    accountUpdates: true,
    sound: true,
  }
}

export const saveNotificationPreferences = (preferences: NotificationPreferences) => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(preferences))
    logger.info('Notification preferences saved', preferences)
  } catch (error) {
    logger.error('Failed to save notification preferences', error)
  }
}

// Play notification sound
const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/notification.mp3')
    audio.volume = 0.5
    audio.play().catch(error => {
      logger.warn('Could not play notification sound', error)
    })
  } catch (error) {
    logger.warn('Notification sound not available', error)
  }
}

// Get notification messages for different types
export const getNotificationMessage = (type: NotificationType, orderData?: any) => {
  switch (type) {
    case NotificationTypes.ORDER_CONFIRMED:
      return {
        title: 'Order Confirmed! 🎉',
        body: `Your order #${orderData?.id} has been confirmed and is being prepared.`,
      }
    case NotificationTypes.ORDER_PREPARING:
      return {
        title: 'Order Being Prepared 👨‍🍳',
        body: `Your order #${orderData?.id} is being prepared with care.`,
      }
    case NotificationTypes.ORDER_OUT_FOR_DELIVERY:
      return {
        title: 'Order Out for Delivery 🚚',
        body: `Your order #${orderData?.id} is on its way! Expected delivery: ${orderData?.deliveryTime || '30 mins'}`,
      }
    case NotificationTypes.ORDER_DELIVERED:
      return {
        title: 'Order Delivered! ✅',
        body: `Your order #${orderData?.id} has been delivered successfully. Enjoy your meal!`,
      }
    case NotificationTypes.ORDER_CANCELLED:
      return {
        title: 'Order Cancelled ❌',
        body: `Your order #${orderData?.id} has been cancelled. Refund will be processed shortly.`,
      }
    case NotificationTypes.DELIVERY_PARTNER_ASSIGNED:
      return {
        title: 'Delivery Partner Assigned 🛵',
        body: `${orderData?.partnerName} is assigned to deliver your order #${orderData?.id}`,
      }
    default:
      return {
        title: 'GroFast Update',
        body: 'You have a new update from GroFast!',
      }
  }
}

// Get user notifications
export const getUserNotifications = async (token?: string) => {
  try {
    const authToken = token || localStorage.getItem('grofast_auth_token')
    if (!authToken) throw new Error('No auth token')
    
    const notifications = await notificationApi.getUserNotifications(authToken)
    return notifications
  } catch (error) {
    logger.error('Failed to get notifications', error)
    throw error
  }
}

// Mark notification as read
export const markNotificationAsRead = async (notificationId: number, token?: string) => {
  try {
    const authToken = token || localStorage.getItem('grofast_auth_token')
    if (!authToken) throw new Error('No auth token')
    
    await notificationApi.markAsRead(notificationId, authToken)
    logger.info('Notification marked as read', { notificationId })
  } catch (error) {
    logger.error('Failed to mark notification as read', error)
    throw error
  }
}

// Send order status notification
export const sendOrderStatusNotification = async (orderId: number, status: string, userId: number) => {
  let notificationType: NotificationType
  
  switch (status.toLowerCase()) {
    case 'confirmed':
      notificationType = NotificationTypes.ORDER_CONFIRMED
      break
    case 'preparing':
      notificationType = NotificationTypes.ORDER_PREPARING
      break
    case 'out_for_delivery':
      notificationType = NotificationTypes.ORDER_OUT_FOR_DELIVERY
      break
    case 'delivered':
      notificationType = NotificationTypes.ORDER_DELIVERED
      break
    case 'cancelled':
      notificationType = NotificationTypes.ORDER_CANCELLED
      break
    default:
      return
  }
  
  const message = getNotificationMessage(notificationType, { id: orderId })
  
  try {
    await sendNotification(userId, message.title, message.body, {
      type: notificationType,
      orderId: orderId.toString(),
      url: `/orders/${orderId}`
    })
  } catch (error) {
    logger.error('Failed to send order status notification', error)
  }
}
