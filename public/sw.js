// Service Worker for Push Notifications
const CACHE_NAME = 'grofast-v1'
const urlsToCache = [
    '/',
    '/offline.html',
    '/icon-192x192.png',
    '/icon-512x512.png'
]

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache)
            })
    )
})

// Fetch event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request)
            })
    )
})

// Push event
self.addEventListener('push', (event) => {
    console.log('Push event received:', event)

    let notificationData = {}

    if (event.data) {
        try {
            notificationData = event.data.json()
        } catch (e) {
            notificationData = {
                title: 'GroFast Notification',
                body: event.data.text() || 'You have a new notification'
            }
        }
    }

    const options = {
        body: notificationData.body || 'You have a new notification',
        icon: notificationData.icon || '/icon-192x192.png',
        badge: notificationData.badge || '/badge-72x72.png',
        tag: notificationData.tag || 'grofast-notification',
        data: notificationData.data || {},
        actions: notificationData.actions || [
            { action: 'open', title: 'Open App' },
            { action: 'dismiss', title: 'Dismiss' }
        ],
        requireInteraction: true,
        silent: false
    }

    event.waitUntil(
        self.registration.showNotification(
            notificationData.title || 'GroFast',
            options
        )
    )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event)

    event.notification.close()

    const action = event.action
    const data = event.notification.data || {}

    let url = '/'

    // Handle different notification actions
    switch (action) {
        case 'view':
            if (data.orderId) {
                url = `/orders/${data.orderId}`
            }
            break
        case 'track':
            if (data.orderId) {
                url = `/orders/${data.orderId}/track`
            }
            break
        case 'rate':
            if (data.orderId) {
                url = `/orders/${data.orderId}/rate`
            }
            break
        case 'reorder':
            if (data.orderId) {
                url = `/orders/${data.orderId}/reorder`
            }
            break
        case 'shop':
            url = '/categories'
            break
        case 'order':
            if (data.productName) {
                url = `/search?q=${encodeURIComponent(data.productName)}`
            }
            break
        case 'call':
            // Handle call action (would need phone number in data)
            return
        case 'dismiss':
            return
        default:
            // Default action - open app
            if (data.orderId) {
                url = `/orders/${data.orderId}`
            } else if (data.type === 'promotion') {
                url = '/categories'
            }
    }

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // Check if app is already open
            for (const client of clientList) {
                if (client.url.includes(url) && 'focus' in client) {
                    return client.focus()
                }
            }

            // Open new window/tab
            if (clients.openWindow) {
                return clients.openWindow(url)
            }
        })
    )
})

// Background sync (for offline actions)
self.addEventListener('sync', (event) => {
    console.log('Background sync:', event.tag)

    if (event.tag === 'order-sync') {
        event.waitUntil(syncOrders())
    }
})

async function syncOrders() {
    try {
        // Sync pending orders when back online
        const cache = await caches.open('grofast-orders')
        const requests = await cache.keys()

        for (const request of requests) {
            if (request.url.includes('/orders/create')) {
                try {
                    await fetch(request)
                    await cache.delete(request)
                } catch (error) {
                    console.error('Failed to sync order:', error)
                }
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error)
    }
}