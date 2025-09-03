"use client"

import { useState, useEffect } from 'react'
import { Bell, BellOff, Check, X } from 'lucide-react'
import { initializeNotifications } from '@/lib/notifications'
import { toast } from '@/hooks/use-toast'
import { logger } from '@/lib/logger'

export default function NotificationSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkNotificationStatus()
  }, [])

  const checkNotificationStatus = () => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }

  const toggleNotifications = async () => {
    setLoading(true)
    try {
      if (notificationsEnabled) {
        // Cannot programmatically disable, show instructions
        toast({
          title: "Disable Notifications",
          description: "Please disable notifications in your browser settings."
        })
      } else {
        const token = await initializeNotifications()
        if (token) {
          setNotificationsEnabled(true)
          toast({
            variant: "success",
            title: "Notifications Enabled",
            description: "You'll now receive order updates and offers."
          })
        }
      }
    } catch (error) {
      logger.error('Failed to toggle notifications', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update notification settings."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {notificationsEnabled ? (
            <Bell className="h-5 w-5 text-green-600" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-gray-600">
              Get notified about order updates and special offers
            </p>
          </div>
        </div>
        
        <button
          onClick={toggleNotifications}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            notificationsEnabled
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          {loading ? 'Loading...' : notificationsEnabled ? 'Enabled' : 'Enable'}
        </button>
      </div>
    </div>
  )
}