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
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        permission: 'unsupported',
        loading: false
      }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
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
        let errorMessage = 'Failed to get location'
        let permission: GeolocationState['permission'] = 'denied'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            permission = 'denied'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
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
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setState(prev => ({
          ...prev,
          permission: result.state as GeolocationState['permission']
        }))
      }).catch(() => {
        // Fallback if permissions API not available
        setState(prev => ({ ...prev, permission: 'prompt' }))
      })
    }
  }, [])

  return {
    ...state,
    requestLocation
  }
}