'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Volume2, VolumeX } from 'lucide-react'
import { 
  NotificationPreferences as NotificationPrefsType, 
  getNotificationPreferences, 
  saveNotificationPreferences,
  initializeNotifications
} from '@/lib/notifications'
import { toast } from '@/hooks/use-toast'

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPrefsType>({
    orderUpdates: true,
    promotions: true,
    deliveryUpdates: true,
    accountUpdates: true,
    sound: true,
  })
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Load saved preferences
    const savedPrefs = getNotificationPreferences()
    setPreferences(savedPrefs)

    // Check notification permission status
    if (typeof window !== 'undefined') {
      setPermissionStatus(Notification.permission)
    }
  }, [])

  const handlePreferenceChange = (key: keyof NotificationPrefsType, value: boolean) => {
    const updatedPrefs = { ...preferences, [key]: value }
    setPreferences(updatedPrefs)
    saveNotificationPreferences(updatedPrefs)
    
    toast({
      title: "Preferences Updated",
      description: `${key === 'orderUpdates' ? 'Order updates' : 
                   key === 'promotions' ? 'Promotions' :
                   key === 'deliveryUpdates' ? 'Delivery updates' :
                   key === 'accountUpdates' ? 'Account updates' :
                   'Sound notifications'} ${value ? 'enabled' : 'disabled'}.`,
    })
  }

  const requestNotificationPermission = async () => {
    try {
      const token = await initializeNotifications()
      if (token) {
        setPermissionStatus('granted')
        toast({
          title: "Notifications Enabled!",
          description: "You'll now receive push notifications for important updates.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to enable notifications. Please try again.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
        <p className="text-sm text-gray-600">Choose what notifications you want to receive</p>
      </div>

      {/* Permission Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {permissionStatus === 'granted' ? (
              <Bell className="h-5 w-5 text-green-600" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <h3 className="font-medium text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-600">
                {permissionStatus === 'granted' 
                  ? 'Enabled - You\'ll receive push notifications'
                  : permissionStatus === 'denied'
                  ? 'Blocked - Please enable in browser settings'
                  : 'Click to enable push notifications'
                }
              </p>
            </div>
          </div>
          {permissionStatus !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="px-4 py-2 bg-grofast-green text-white text-sm rounded-lg hover:bg-grofast-green/90"
            >
              Enable
            </button>
          )}
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Order Updates</h3>
              <p className="text-sm text-gray-600">Notifications about your order status</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.orderUpdates}
                onChange={(e) => handlePreferenceChange('orderUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-grofast-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-grofast-green"></div>
            </label>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Delivery Updates</h3>
              <p className="text-sm text-gray-600">Track your delivery partner and ETA</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.deliveryUpdates}
                onChange={(e) => handlePreferenceChange('deliveryUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-grofast-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-grofast-green"></div>
            </label>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Promotions & Offers</h3>
              <p className="text-sm text-gray-600">Special deals and discounts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.promotions}
                onChange={(e) => handlePreferenceChange('promotions', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-grofast-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-grofast-green"></div>
            </label>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Account Updates</h3>
              <p className="text-sm text-gray-600">Security alerts and account changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.accountUpdates}
                onChange={(e) => handlePreferenceChange('accountUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-grofast-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-grofast-green"></div>
            </label>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {preferences.sound ? (
                <Volume2 className="h-5 w-5 text-grofast-green" />
              ) : (
                <VolumeX className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <h3 className="font-medium text-gray-900">Sound Alerts</h3>
                <p className="text-sm text-gray-600">Play sound with notifications</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.sound}
                onChange={(e) => handlePreferenceChange('sound', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-grofast-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-grofast-green"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">About Notifications</h4>
            <p className="text-sm text-blue-700 mt-1">
              We'll only send you important updates about your orders and account. 
              You can change these preferences anytime. To receive push notifications, 
              please allow notifications when prompted by your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
