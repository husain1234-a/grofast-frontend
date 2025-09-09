"use client"

import { useState, useEffect, useRef } from 'react'
import { MapPin, Search, X, ChevronDown } from 'lucide-react'
import { logger } from '@/lib/logger'

interface City {
    name: string
    state: string
    country: string
    lat?: number
    lon?: number
    type?: string
    fullAddress?: string
}

interface LocationSelectorProps {
    currentLocation: string
    onLocationChange: (location: string) => void
    className?: string
}

export function LocationSelector({
    currentLocation,
    onLocationChange,
    className = ""
}: LocationSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [cities, setCities] = useState<City[]>([])
    const [loading, setLoading] = useState(false)
    const [showManualInput, setShowManualInput] = useState(false)
    const [manualLocation, setManualLocation] = useState("")
    const [popularCities] = useState<City[]>([
        { name: "Mumbai", state: "Maharashtra", country: "India" },
        { name: "Delhi", state: "Delhi", country: "India" },
        { name: "Bangalore", state: "Karnataka", country: "India" },
        { name: "Hyderabad", state: "Telangana", country: "India" },
        { name: "Chennai", state: "Tamil Nadu", country: "India" },
        { name: "Kolkata", state: "West Bengal", country: "India" },
        { name: "Pune", state: "Maharashtra", country: "India" },
        { name: "Ahmedabad", state: "Gujarat", country: "India" },
        { name: "Jaipur", state: "Rajasthan", country: "India" },
        { name: "Surat", state: "Gujarat", country: "India" },
        { name: "Lucknow", state: "Uttar Pradesh", country: "India" },
        { name: "Kanpur", state: "Uttar Pradesh", country: "India" },
        { name: "Nagpur", state: "Maharashtra", country: "India" },
        { name: "Indore", state: "Madhya Pradesh", country: "India" },
        { name: "Thane", state: "Maharashtra", country: "India" },
        { name: "Bhopal", state: "Madhya Pradesh", country: "India" },
        { name: "Visakhapatnam", state: "Andhra Pradesh", country: "India" },
        { name: "Pimpri-Chinchwad", state: "Maharashtra", country: "India" },
        { name: "Patna", state: "Bihar", country: "India" },
        { name: "Vadodara", state: "Gujarat", country: "India" },
        { name: "Ghaziabad", state: "Uttar Pradesh", country: "India" },
        { name: "Ludhiana", state: "Punjab", country: "India" },
        { name: "Agra", state: "Uttar Pradesh", country: "India" },
        { name: "Nashik", state: "Maharashtra", country: "India" },
        { name: "Faridabad", state: "Haryana", country: "India" },
        { name: "Meerut", state: "Uttar Pradesh", country: "India" },
        { name: "Rajkot", state: "Gujarat", country: "India" },
        { name: "Kalyan-Dombivali", state: "Maharashtra", country: "India" },
        { name: "Vasai-Virar", state: "Maharashtra", country: "India" },
        { name: "Varanasi", state: "Uttar Pradesh", country: "India" }
    ])

    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Search cities using a free API
    const searchCities = async (query: string) => {
        if (query.length < 2) {
            setCities([])
            return
        }

        setLoading(true)
        try {
            // Using our proxy API to avoid CORS issues
            // Try multiple search strategies for better results
            const searchQueries = [
                query, // Original query
                `${query} India`, // Add India for better context
                query.split(' ')[0] // First word only
            ]
            
            let bestResults: City[] = []
            
            for (const searchQuery of searchQueries) {
                const response = await fetch(
                    `/api/geocode?type=search&query=${encodeURIComponent(searchQuery)}`
                )
                
                if (response.ok) {
                    const data = await response.json()
                    // Handle both array and object responses
                    let results = []
                    
                    if (Array.isArray(data)) {
                        results = data
                    } else if (data.results && Array.isArray(data.results)) {
                        results = data.results
                    } else if (typeof data === 'object' && data !== null) {
                        // Convert object with numbered keys to array
                        results = Object.keys(data)
                            .filter(key => !isNaN(Number(key))) // Only numeric keys
                            .map(key => data[key])
                            .filter(item => item && typeof item === 'object') // Valid objects only
                    }
                    
                    if (results.length > 0) {
                        bestResults = results
                        break // Use first successful result
                    }
                }
            }
            
            if (bestResults.length > 0) {

                const formattedCities: City[] = bestResults
                    .filter((item: any) => {
                        // Enhanced filtering for cities, streets, landmarks, and areas
                        const address = item.address || {}
                        const hasRelevantLocation = address.city || address.town || address.village || address.municipality || 
                                                  address.suburb || address.neighbourhood || address.road || address.street || 
                                                  address.house_number || item.name
                        const isInIndia = address.country_code === 'in' || address.country === 'India' || item.display_name?.includes('India')
                        
                        // Debug only in development
                        if (process.env.NEXT_PUBLIC_ENV === 'development') {
                            console.log('Filtering city:', item.name, hasRelevantLocation, isInIndia)
                        }
                        
                        return hasRelevantLocation && isInIndia
                    })
                    .map((item: any) => {
                        const address = item.address || {}
                        // Enhanced name extraction for streets and landmarks
                        let locationName = ''
                        let locationType = ''
                        
                        if (address.road || address.street) {
                            // Street/Road
                            locationName = address.road || address.street
                            locationType = 'Street'
                            if (address.house_number) {
                                locationName = `${address.house_number}, ${locationName}`
                            }
                        } else if (address.neighbourhood || address.suburb) {
                            // Area/Neighbourhood
                            locationName = address.neighbourhood || address.suburb
                            locationType = 'Area'
                        } else if (item.name) {
                            // Landmark or named place
                            locationName = item.name
                            locationType = item.class === 'amenity' ? 'Landmark' : 'Place'
                        } else {
                            // City/Town fallback
                            locationName = address.city || address.municipality || address.town || address.village || 
                                         item.display_name.split(',')[0].trim()
                            locationType = 'City'
                        }
                        
                        const cityName = locationName
                        const stateName = address.state || address.state_district || 'Unknown State'
                        
                        return {
                            name: cityName,
                            state: stateName,
                            country: 'India',
                            lat: parseFloat(item.lat),
                            lon: parseFloat(item.lon),
                            type: locationType,
                            fullAddress: item.display_name
                        }
                    })
                    .filter((city: City, index: number, self: City[]) => {
                        // Remove duplicates and filter out invalid names
                        if (!city.name || city.name.length < 2) return false
                        
                        const isDuplicate = index !== self.findIndex(c => 
                            c.name.toLowerCase() === city.name.toLowerCase() && 
                            c.state.toLowerCase() === city.state.toLowerCase()
                        )
                        return !isDuplicate
                    })
                    .slice(0, 8) // Limit to top 8 results

                setCities(formattedCities)
                logger.info('Cities search completed', { query, resultsCount: formattedCities.length })
            } else {
                // No results found from API
                setCities([])
            }
        } catch (error) {
            logger.error('Failed to search cities', error)
            // Fallback to filtering popular cities
            const filtered = popularCities.filter(city =>
                city.name.toLowerCase().includes(query.toLowerCase()) ||
                city.state.toLowerCase().includes(query.toLowerCase())
            )
            setCities(filtered)
        } finally {
            setLoading(false)
        }
    }

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) {
                searchCities(searchTerm)
            } else {
                setCities([])
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm])

    const handleLocationSelect = (city: City) => {
        const locationString = `${city.name}, ${city.state}`
        onLocationChange(locationString)
        setIsOpen(false)
        setSearchTerm("")
        logger.userAction('Location Changed', { from: currentLocation, to: locationString })
    }

    const displayedCities = searchTerm ? cities : popularCities.slice(0, 10)

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 hover:underline text-white"
                aria-label="Change delivery location"
            >
                <MapPin className="h-3 w-3" />
                <span className="font-medium">Delivering to:</span>
                <span>{currentLocation}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">Select Location</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                                aria-label="Close location selector"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Search input */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search for city, area, street, or landmark..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B761] focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
                            />
                        </div>

                        {/* Cities list */}
                        <div className="max-h-60 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00B761]"></div>
                                    <span className="ml-2 text-sm text-gray-600">Searching...</span>
                                </div>
                            ) : displayedCities.length > 0 ? (
                                <div className="space-y-1">
                                    {!searchTerm && (
                                        <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b">
                                            Popular Cities
                                        </div>
                                    )}
                                    {displayedCities.map((city, index) => (
                                        <button
                                            key={`${city.name}-${city.state}-${index}`}
                                            onClick={() => handleLocationSelect(city)}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="font-medium text-gray-900">{city.name}</div>
                                                {city.type && (
                                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                        {city.type}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {city.fullAddress ? city.fullAddress.split(',').slice(1, 3).join(',').trim() : `${city.state}, ${city.country}`}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : searchTerm ? (
                                <div className="text-center py-4 text-gray-500">
                                    <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No cities found for "{searchTerm}"</p>
                                    <p className="text-xs mt-1">Try searching with a different spelling</p>
                                </div>
                            ) : null}
                        </div>

                        {/* Current location option */}
                        <div className="border-t pt-3 mt-3">
                            {/* Show current coordinates for debugging */}
                            {process.env.NEXT_PUBLIC_ENV === 'development' && (
                                <div className="text-xs text-gray-400 mb-2 font-mono">
                                    Debug: Click location button to see coordinates in console
                                </div>
                            )}
                            <button
                                onClick={async () => {
                                    // GPS-optimized location detection
                                    if (!navigator.geolocation) {
                                        console.error('Geolocation is not supported by this browser.')
                                        return
                                    }
                                    
                                    setLoading(true)
                                    
                                    // GPS-first location detection with multiple attempts
                                    const getGPSLocation = () => new Promise((resolve, reject) => {
                                        navigator.geolocation.getCurrentPosition(
                                            async (position) => {
                                                try {
                                                    const { latitude, longitude, accuracy, timestamp } = position.coords
                                                    
                                                    // Safely handle timestamp (might be null/undefined)
                                                    const timestampDate = timestamp ? new Date(timestamp) : new Date()
                                                    const isValidTimestamp = timestamp && !isNaN(timestampDate.getTime())
                                                    
                                                    // Log detailed location info for debugging
                                                    console.log('🎯 GPS COORDINATES:', {
                                                        latitude: latitude.toFixed(6),
                                                        longitude: longitude.toFixed(6),
                                                        accuracy: `±${Math.round(accuracy)}m`,
                                                        timestamp: isValidTimestamp ? timestampDate.toISOString() : 'Unknown',
                                                        age: isValidTimestamp ? `${Math.round((Date.now() - timestamp) / 1000)}s ago` : 'Unknown'
                                                    })
                                                    
                                                    // Warn if accuracy is poor
                                                    if (accuracy > 1000) {
                                                        console.warn('⚠️ GPS ACCURACY WARNING: Very poor accuracy (>1km). Location may be incorrect.')
                                                    }
                                                    
                                                    logger.info('Location coordinates obtained', { 
                                                        latitude, 
                                                        longitude, 
                                                        accuracy, 
                                                        timestamp: isValidTimestamp ? timestampDate.toISOString() : 'Unknown',
                                                        isFresh: isValidTimestamp ? timestamp > Date.now() - 30000 : false
                                                    })
                                                    
                                                    const response = await fetch(
                                                        `/api/geocode?type=reverse&lat=${latitude}&lon=${longitude}`
                                                    )

                                                    if (response.ok) {
                                                        const data = await response.json()
                                                        logger.info('Reverse geocoding response', data)
                                                        
                                                        // Extract detailed location information
                                                        const address = data.address || {}
                                                        
                                                        console.log('🗺️ REVERSE GEOCODING RESULT:', {
                                                            display_name: data.display_name,
                                                            address: address,
                                                            coordinates: { lat: data.lat, lon: data.lon }
                                                        })
                                                        
                                                        // Enhanced location parsing for street-level accuracy
                                                        const street = address.road || address.street
                                                        const houseNumber = address.house_number
                                                        const area = address.neighbourhood || address.suburb || address.residential ||
                                                                   address.commercial || address.industrial || address.retail
                                                        const locality = address.city_district || address.town || address.village
                                                        const city = address.city || address.county || address.state_district
                                                        const state = address.state || 'Unknown State'
                                                        
                                                        // Build a detailed location string with street-level detail
                                                        let locationParts = []
                                                        
                                                        // Add street info if available
                                                        if (street) {
                                                            if (houseNumber) {
                                                                locationParts.push(`${houseNumber}, ${street}`)
                                                            } else {
                                                                locationParts.push(street)
                                                            }
                                                        }
                                                        
                                                        // Add area/neighbourhood
                                                        if (area && area !== city && !locationParts.includes(area)) {
                                                            locationParts.push(area)
                                                        }
                                                        
                                                        // Add locality if different from city and area
                                                        if (locality && locality !== city && locality !== area && !locationParts.includes(locality)) {
                                                            locationParts.push(locality)
                                                        }
                                                        
                                                        // Add city
                                                        if (city && city !== 'Unknown City' && !locationParts.includes(city)) {
                                                            locationParts.push(city)
                                                        }
                                                        
                                                        // Add state
                                                        if (state !== 'Unknown State' && !locationParts.includes(state)) {
                                                            locationParts.push(state)
                                                        }
                                                        
                                                        // Build location string - NEVER show coordinates to user
                                                        let locationString
                                                        
                                                        if (locationParts.length > 0) {
                                                            // Use parsed address parts (preferred)
                                                            locationString = locationParts.join(', ')
                                                        } else if (data.display_name) {
                                                            // Fallback to display_name parsing
                                                            const displayParts = data.display_name.split(',').slice(0, 3)
                                                            locationString = displayParts.map(p => p.trim()).join(', ')
                                                        } else {
                                                            // Last resort: generic location name
                                                            locationString = 'Current Location'
                                                        }
                                                        
                                                        // Show location confirmation if accuracy is poor or city seems wrong
                                                        if (accuracy > 500) {
                                                            const isConfirmed = confirm(
                                                                `Location detected: ${locationString}\n\n` +
                                                                `Accuracy: ±${Math.round(accuracy)}m\n\n` +
                                                                `This location might be inaccurate due to poor GPS signal. Is this correct?`
                                                            )
                                                            
                                                            if (!isConfirmed) {
                                                                // Don't set location, keep the selector open
                                                                console.log('🚫 User rejected detected location')
                                                                return
                                                            }
                                                        }
                                                        
                                                        console.log('✅ FINAL LOCATION SET:', locationString)
                                                        onLocationChange(locationString)
                                                        setIsOpen(false)
                                                        logger.userAction('Location Detected', { 
                                                            location: locationString, 
                                                            coordinates: { latitude, longitude, accuracy },
                                                            rawAddress: address
                                                        })
                                                    } else {
                                                        throw new Error(`Failed to reverse geocode: ${response.status}`)
                                                    }
                                                } catch (error) {
                                                    logger.error('Failed to get location details', error)
                                                    // Fallback - don't show coordinates to user
                                                    onLocationChange('Current Location')
                                                    setIsOpen(false)
                                                } finally {
                                                    setLoading(false)
                                                }
                                            },
                                            (error) => {
                                                // On error, reject with details
                                                reject(error)
                                            },
                                            {
                                                enableHighAccuracy: true,    // 🛰️ Force GPS over WiFi/Cell
                                                timeout: 20000,             // 20s timeout for GPS acquisition
                                                maximumAge: 0               // Force fresh GPS reading (no cache)
                                            }
                                        )
                                    })

                                    try {
                                        // Try up to 3 attempts for better accuracy
                                        let position: GeolocationPosition | null = null
                                        let attempts = 0
                                        let bestAccuracy = Infinity
                                        
                                        while (attempts < 3) {
                                            attempts++
                                            try {
                                                const pos: GeolocationPosition = await getGPSLocation() as GeolocationPosition
                                                if (pos.coords.accuracy < bestAccuracy) {
                                                    position = pos
                                                    bestAccuracy = pos.coords.accuracy
                                                }
                                                // Stop early if accuracy is good enough
                                                if (bestAccuracy <= 50) break
                                            } catch (e) {
                                                // Continue to next attempt
                                            }
                                        }

                                        if (!position) throw new Error('Failed to get GPS location')

                                        // Reuse existing reverse geocoding and parsing with the best position
                                        const { latitude, longitude, accuracy, timestamp } = position.coords

                                        // Safely handle timestamp (might be null/undefined)
                                        const timestampDate = timestamp ? new Date(timestamp) : new Date()
                                        const isValidTimestamp = timestamp && !isNaN(timestampDate.getTime())

                                        // Log detailed location info for debugging
                                        console.log('🎯 GPS (optimized) COORDINATES:', {
                                            latitude: latitude.toFixed(6),
                                            longitude: longitude.toFixed(6),
                                            accuracy: `±${Math.round(accuracy)}m`,
                                            timestamp: isValidTimestamp ? timestampDate.toISOString() : 'Unknown',
                                        })

                                    } catch (error) {
                                        logger.error('Failed to get optimized GPS location', error)
                                        onLocationChange('Current Location')
                                        setIsOpen(false)
                                    } finally {
                                        setLoading(false)
                                    }
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-[#00B761] hover:bg-green-50 rounded-md transition-colors ${
                                    loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00B761]"></div>
                                ) : (
                                    <MapPin className="h-4 w-4" />
                                )}
                                <span className="text-sm font-medium">
                                    {loading ? 'Detecting location...' : 'Use Current Location'}
                                </span>
                            </button>
                            
                            {/* Manual location input - available in all environments */}
                            {(
                                <>
                                    <div className="border-t pt-2 mt-2">
                                        <button
                                            onClick={() => setShowManualInput(!showManualInput)}
                                            className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-md"
                                        >
                                            {showManualInput ? 'Hide Manual Input' : 'Enter Location Manually'}
                                        </button>
                                    </div>
                                    
                                    {showManualInput && (
                                        <div className="pt-2">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={manualLocation}
                                                    onChange={(e) => setManualLocation(e.target.value)}
                                                    placeholder="Enter location manually..."
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-500"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter' && manualLocation.trim()) {
                                                            onLocationChange(manualLocation.trim())
                                                            setIsOpen(false)
                                                            setManualLocation("")
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (manualLocation.trim()) {
                                                            onLocationChange(manualLocation.trim())
                                                            setIsOpen(false)
                                                            setManualLocation("")
                                                        }
                                                    }}
                                                    disabled={!manualLocation.trim()}
                                                    className="px-3 py-2 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                                                >
                                                    Set
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LocationSelector