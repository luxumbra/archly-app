'use client'

import { useState, useEffect } from 'react'
import type { Location } from '@/types'

interface GeolocationState {
  location: Location | null
  error: string | null
  loading: boolean
  permission: 'granted' | 'denied' | 'prompt' | 'unsupported'
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: false,
    permission: 'prompt'
  })

  const {
    enableHighAccuracy = false,
    timeout = 10000,
    maximumAge = 60000
  } = options

  const requestLocation = () => {
    console.log('requestLocation called')
    
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        permission: 'unsupported',
        loading: false
      }))
      return
    }

    console.log('Setting loading state and requesting position...')
    setState(prev => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Geolocation success:', position)
        setState(prev => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          },
          error: null,
          loading: false,
          permission: 'granted'
        }))
      },
      (error) => {
        console.log('Geolocation error:', error)
        let errorMessage = 'Failed to get location'
        let permission: GeolocationState['permission'] = 'denied'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services in your browser settings.'
            permission = 'denied'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please check that location services are enabled.'
            permission = 'denied'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.'
            break
        }

        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
          permission
        }))
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    )
  }

  // Check initial permission state (but don't auto-request location)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        console.log('Geolocation permission state:', result.state)
        setState(prev => ({
          ...prev,
          permission: result.state as GeolocationState['permission']
        }))
      }).catch((error) => {
        console.log('Permission query failed, defaulting to prompt:', error)
        // Fallback if permissions API not available
        setState(prev => ({ ...prev, permission: 'prompt' }))
      })
    } else {
      // Fallback for environments without permissions API
      setState(prev => ({ ...prev, permission: 'prompt' }))
    }
  }, [])

  return {
    ...state,
    requestLocation
  }
}