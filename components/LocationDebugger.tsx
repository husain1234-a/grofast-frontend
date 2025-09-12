"use client"

import { useState } from 'react'
import { MapPin, RefreshCw, Target, Info } from 'lucide-react'
import { logger } from '@/lib/logger'

interface LocationDebuggerProps {
    onLocationSelect: (location: string) => void
    className?: string
}

export function LocationDebugger({ onLocationSelect, className = "" }: LocationDebuggerProps) {
    const [locationData, setLocationData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [manualLocation, setManualLocation] = useState("")
    
    const getCurrentLocation = async () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.')
            return
        }
        
        setLoading(true)
        setLocationData(null)
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude, accuracy, timestamp } = position.coords
                    
                    // Log detailed position info
                    const positionInfo = {
                        coordinates: { latitude, longitude },
                        accuracy: `${accuracy}m`,
                        timestamp: new Date(timestamp).toISOString(),
                        age: `${Math.round((Date.now() - timestamp) / 1000)}s old`
                    }
                    
                    console.log('🎯 Current Position:', positionInfo)
                    logger.info('Location Debug - Current Position', positionInfo)
                    
                    // Get reverse geocoding
                    const response = await fetch(
                        `/api/geocode?type=reverse&lat=${latitude}&lon=${longitude}`
                    )
                    
                    if (response.ok) {
                        const data = await response.json()
                        console.log('🗺️ Reverse Geocoding Result:', data)
                        
                        const locationInfo = {
                            ...positionInfo,
                            address: data.address,
                            display_name: data.display_name,
                            full_response: data
                        }
                        
                        setLocationData(locationInfo)
                        
                        // Auto-select the detected location
                        const address = data.address || {}
                        const area = address.neighbourhood || address.suburb || address.residential
                        const locality = address.city_district || address.town || address.village
                        const city = address.city || address.county || 'Unknown City'
                        const state = address.state || 'Unknown State'
                        
                        let locationParts = []
                        if (area && area !== city) locationParts.push(area)
                        if (locality && locality !== city && locality !== area) locationParts.push(locality)
                        if (city !== 'Unknown City') locationParts.push(city)
                        if (state !== 'Unknown State') locationParts.push(state)
                        
                        const locationString = locationParts.length > 0 ? locationParts.join(', ') : 'Location not found'
                        onLocationSelect(locationString)
                        
                    } else {
                        throw new Error(`Geocoding failed: ${response.status}`)
                    }
                    
                } catch (error) {
                    console.error('❌ Geocoding Error:', error)
                    setLocationData({
                        ...positionInfo,
                        error: error.message
                    })
                } finally {
                    setLoading(false)
                }
            },
            (error) => {
                setLoading(false)
                let errorMessage = 'Location access failed'
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied'
                        break
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable'
                        break
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out'
                        break
                }
                
                console.error('❌ Geolocation Error:', errorMessage, error)
                setLocationData({ error: errorMessage })
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0  // Force fresh location
            }
        )
    }
    
    const handleManualLocationSet = () => {
        if (manualLocation.trim()) {
            onLocationSelect(manualLocation.trim())
            setManualLocation("")
        }
    }
    
    // Only show in development mode
    if (process.env.NEXT_PUBLIC_ENV !== 'development') {
        return null
    }
    
    return (
        <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
            <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-blue-500" />
                <h3 className="font-medium text-gray-900">Location Debugger</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">DEV ONLY</span>
            </div>
            
            <div className="space-y-3">
                {/* Get Current Location Button */}
                <button
                    onClick={getCurrentLocation}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Getting Location...
                        </>
                    ) : (
                        <>
                            <Target className="h-4 w-4" />
                            Debug Current Location
                        </>
                    )}
                </button>
                
                {/* Manual Location Input */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={manualLocation}
                        onChange={(e) => setManualLocation(e.target.value)}
                        placeholder="Enter manual location..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleManualLocationSet()}
                    />
                    <button
                        onClick={handleManualLocationSet}
                        disabled={!manualLocation.trim()}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm"
                    >
                        Set
                    </button>
                </div>
                
                {/* Location Data Display */}
                {locationData && (
                    <div className="bg-white border border-gray-200 rounded p-3 text-xs font-mono">
                        <div className="text-gray-800 font-semibold mb-2">Location Data:</div>
                        <pre className="text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {JSON.stringify(locationData, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LocationDebugger
