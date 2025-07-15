'use client'

import { Location } from '@/types'

interface GeocodeResult {
  location: Location
  formattedAddress: string
  placeId?: string
}

interface GeocodeError {
  error: string
  code?: string
}

export const geocodeLocation = async (query: string): Promise<GeocodeResult | GeocodeError> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  try {
    console.log("Geocoding query:", query)
    
    const response = await fetch(
      `${API_URL}/places/geocode?query=${encodeURIComponent(query)}`
    )

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Geocoding response:", data)

    if (data.error) {
      return { error: data.error, code: data.code }
    }

    if (data.location) {
      return {
        location: data.location,
        formattedAddress: data.formattedAddress || query,
        placeId: data.placeId
      }
    }

    return { error: "No location found for this search" }
  } catch (error) {
    console.error("Geocoding error:", error)
    return { 
      error: error instanceof Error ? error.message : "Failed to geocode location" 
    }
  }
}

// Fallback to browser geolocation API if backend geocoding fails
export const fallbackGeocode = async (query: string): Promise<GeocodeResult | GeocodeError> => {
  if (!window.google?.maps) {
    return { error: "Google Maps not available for geocoding" }
  }

  return new Promise((resolve) => {
    const geocoder = new window.google.maps.Geocoder()
    
    geocoder.geocode({ address: query }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
        const location = results[0].geometry.location
        resolve({
          location: {
            latitude: location.lat(),
            longitude: location.lng()
          },
          formattedAddress: results[0].formatted_address,
          placeId: results[0].place_id
        })
      } else {
        resolve({
          error: `Geocoding failed: ${status}`,
          code: status
        })
      }
    })
  })
}

// Main geocoding function with fallback
export const geocodeWithFallback = async (query: string): Promise<GeocodeResult | GeocodeError> => {
  // Try backend geocoding first
  const backendResult = await geocodeLocation(query)
  
  if ('location' in backendResult) {
    return backendResult
  }

  // Fallback to browser geocoding if backend fails
  console.log("Backend geocoding failed, trying browser fallback")
  return fallbackGeocode(query)
}