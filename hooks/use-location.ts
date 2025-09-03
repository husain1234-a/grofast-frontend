"use client"

import { useState, useEffect } from 'react'
import { logger } from '@/lib/logger'

const LOCATION_STORAGE_KEY = 'grofast_user_location'
const DEFAULT_LOCATION = 'Mumbai, Maharastra'

export function useLocation() {
    const [location, setLocationState] = useState<string>(DEFAULT_LOCATION)
    const [isLoading, setIsLoading] = useState(true)

    // Load location from localStorage on mount
    useEffect(() => {
        try {
            const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY)
            if (savedLocation) {
                setLocationState(savedLocation)
                logger.info('Location loaded from storage', { location: savedLocation })
            }
        } catch (error) {
            logger.error('Failed to load location from storage', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Function to update location
    const setLocation = (newLocation: string) => {
        try {
            setLocationState(newLocation)
            localStorage.setItem(LOCATION_STORAGE_KEY, newLocation)
            logger.userAction('Location Updated', {
                previousLocation: location,
                newLocation
            })
        } catch (error) {
            logger.error('Failed to save location to storage', error)
            // Still update state even if storage fails
            setLocationState(newLocation)
        }
    }

    // Function to clear location (reset to default)
    const clearLocation = () => {
        try {
            localStorage.removeItem(LOCATION_STORAGE_KEY)
            setLocationState(DEFAULT_LOCATION)
            logger.userAction('Location Cleared')
        } catch (error) {
            logger.error('Failed to clear location from storage', error)
            setLocationState(DEFAULT_LOCATION)
        }
    }

    // Function to get current location using browser geolocation
    const getCurrentLocation = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'))
                return
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords

                        // Use OpenStreetMap Nominatim API to reverse geocode
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

                            setLocation(locationString)
                            resolve(locationString)

                            logger.userAction('Current Location Detected', {
                                location: locationString,
                                coordinates: { latitude, longitude }
                            })
                        } else {
                            throw new Error('Failed to get location details')
                        }
                    } catch (error) {
                        logger.error('Failed to reverse geocode location', error)
                        reject(error)
                    }
                },
                (error) => {
                    logger.error('Geolocation failed', error)
                    reject(error)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            )
        })
    }

    return {
        location,
        setLocation,
        clearLocation,
        getCurrentLocation,
        isLoading,
        isDefault: location === DEFAULT_LOCATION
    }
}

export default useLocation