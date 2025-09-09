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
            // Using a free geocoding API (OpenStreetMap Nominatim)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&city=${encodeURIComponent(query)}&limit=10&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'GroFast-App/1.0'
                    }
                }
            )

            if (response.ok) {
                const data = await response.json()
                const formattedCities: City[] = data
                    .filter((item: any) => item.address?.city || item.address?.town || item.address?.village)
                    .map((item: any) => ({
                        name: item.address?.city || item.address?.town || item.address?.village || item.display_name.split(',')[0],
                        state: item.address?.state || 'Unknown State',
                        country: 'India',
                        lat: parseFloat(item.lat),
                        lon: parseFloat(item.lon)
                    }))
                    .filter((city: City, index: number, self: City[]) =>
                        // Remove duplicates
                        index === self.findIndex(c => c.name === city.name && c.state === city.state)
                    )

                setCities(formattedCities)
                logger.info('Cities search completed', { query, resultsCount: formattedCities.length })
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
                                placeholder="Search for your city..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B761] focus:border-transparent outline-none"
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
                                            <div className="font-medium text-gray-900">{city.name}</div>
                                            <div className="text-sm text-gray-500">{city.state}, {city.country}</div>
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
                            <button
                                onClick={() => {
                                    // Request user's current location
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(
                                            async (position) => {
                                                try {
                                                    const { latitude, longitude } = position.coords
                                                    const response = await fetch(
                                                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
                                                        {
                                                            headers: {
                                                                'User-Agent': 'GroFast-App/1.0'
                                                            }
                                                        }
                                                    )

                                                    if (response.ok) {
                                                        const data = await response.json()
                                                        const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown City'
                                                        const state = data.address?.state || 'Unknown State'
                                                        const locationString = `${city}, ${state}`
                                                        onLocationChange(locationString)
                                                        setIsOpen(false)
                                                        logger.userAction('Location Detected', { location: locationString })
                                                    }
                                                } catch (error) {
                                                    logger.error('Failed to get location details', error)
                                                }
                                            },
                                            (error) => {
                                                logger.error('Geolocation failed', error)
                                            }
                                        )
                                    }
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[#00B761] hover:bg-green-50 rounded-md transition-colors"
                            >
                                <MapPin className="h-4 w-4" />
                                <span className="text-sm font-medium">Use Current Location</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LocationSelector