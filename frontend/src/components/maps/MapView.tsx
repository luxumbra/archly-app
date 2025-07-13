'use client'
import { Map } from '@vis.gl/react-google-maps'
import { useState, useEffect, useCallback, useRef } from 'react'
import MapMarker from '@/components/maps/MapMarker'
import SearchRadiusCircle from '@/components/maps/SearchRadiusCircle'
import MapProvider from '@/providers/MapProvider'
import { useGeolocation } from '@/hooks/useGeolocation'
import { Place, PlacesSearchResponse, Location } from '@/types'
import { yoreMapStyle } from '@/utils/mapStyles'

interface MapViewProps {
    initialQuery?: string
    initialLocation?: Location
}

const MapView = ({
    initialQuery = 'ancient monuments historical archaeological sites',
    initialLocation = { latitude: 55.9533, longitude: -3.1883 }
}: MapViewProps) => {
    const [places, setPlaces] = useState<Place[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [searchLocation, setSearchLocation] = useState<Location>(initialLocation)
    const [mapCenter, setMapCenter] = useState<Location>(initialLocation)
    const [mapZoom, setMapZoom] = useState<number>(5)
    const [useUserLocation, setUseUserLocation] = useState(true) // Track if user wants to use their location
    const API_URI = process.env.NEXT_PUBLIC_API_URL
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const mapRef = useRef<google.maps.Map | null>(null)

    const { location: userLocation, loading: locationLoading, permission, requestLocation } = useGeolocation()

    // Set the container style for a full-screen map
    const containerStyle = {
        width: '100vw',
        height: '100vh',
        zIndex: 0,
    }

    // Maximum allowed radius is 50km (50,000 meters) - approximately 31 miles
    const SEARCH_RADIUS = 50000 // 50,000 meters = ~31 miles (Google Places API limit)

    // Save map state to localStorage
    const saveMapState = useCallback((center: Location, zoom: number, places: Place[]) => {
        const mapState = {
            center,
            zoom,
            places,
            timestamp: Date.now()
        }
        localStorage.setItem('yore-map-state', JSON.stringify(mapState))
    }, [])

    // Restore map state from localStorage
    const restoreMapState = useCallback(() => {
        try {
            const savedState = localStorage.getItem('yore-map-state')
            if (savedState) {
                const mapState = JSON.parse(savedState)
                // Only restore if saved within last 30 minutes
                if (Date.now() - mapState.timestamp < 30 * 60 * 1000) {
                    console.log('Restoring map state:', mapState)
                    setMapCenter(mapState.center)
                    setSearchLocation(mapState.center)
                    setMapZoom(mapState.zoom)
                    if (mapState.places && mapState.places.length > 0) {
                        setPlaces(mapState.places)
                    }
                    return true
                }
            }
        } catch (error) {
            console.error('Error restoring map state:', error)
        }
        return false
    }, [])

    const center = {
        lat: mapCenter.latitude,
        lng: mapCenter.longitude,
    }

    // Fetch places based on location and radius
    const fetchPlaces = useCallback(async (location: Location) => {
        if (!location) return

        console.log('Fetching places for location:', location)
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(
                `${API_URI}/places/search?query=${initialQuery}&location=${location.latitude},${location.longitude}&radius=${SEARCH_RADIUS}&fields=places.displayName,places.formattedAddress,places.id,places.location`
            )

            if (!response.ok) {
                throw new Error('Failed to fetch places')
            }

            const data: PlacesSearchResponse = await response.json()
            console.log('Places API response:', data)

            // Handle both success and error responses
            if (data.places && Array.isArray(data.places)) {
                console.log('Setting places:', data.places.length, 'places found')
                setPlaces(data.places)
                // Save map state after successful search
                saveMapState(location, mapZoom, data.places)
            } else if (data.error) {
                throw new Error(data.error)
            } else {
                console.log('No places found')
                setPlaces([])
                saveMapState(location, mapZoom, [])
            }
        } catch (err) {
            console.error('Error fetching places:', err)
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }, [API_URI, initialQuery, SEARCH_RADIUS, mapZoom, saveMapState])

    // Update search location when user location changes (only if toggle is enabled)
    useEffect(() => {
        if (userLocation && permission === 'granted' && useUserLocation) {
            setSearchLocation(userLocation)
            setMapCenter(userLocation)
        }
    }, [userLocation, permission, useUserLocation])

    // Fetch places when search location changes
    useEffect(() => {
        fetchPlaces(searchLocation)
    }, [searchLocation, fetchPlaces])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
        }
    }, [])

    // Restore map state on component mount
    useEffect(() => {
        console.log('MapView: Component mounted')
        console.log('MapView: Initial search location:', searchLocation)
        console.log('MapView: Initial map center:', mapCenter)

        // Try to restore previous map state
        const restored = restoreMapState()
        if (!restored) {
            // No saved state - user must manually search using "Search this area" button
            console.log('No saved state found - waiting for user to search')
        }
    }, [restoreMapState])

    // Search this area functionality
    const searchThisArea = useCallback(() => {
        console.log('Manual search triggered for area:', mapCenter)
        setSearchLocation(mapCenter)
        // This will trigger the useEffect that calls fetchPlaces
    }, [mapCenter])

    // Toggle location usage
    const toggleLocationUsage = useCallback(() => {
        if (permission === 'granted') {
            if (useUserLocation) {
                // Disable location usage (keep permission but don't use it)
                setUseUserLocation(false)
                // Switch to using current map center
                setSearchLocation(mapCenter)
            } else {
                // Re-enable location usage
                setUseUserLocation(true)
                if (userLocation) {
                    setSearchLocation(userLocation)
                    setMapCenter(userLocation)
                }
            }
        } else {
            // Request location permission
            requestLocation()
            setUseUserLocation(true)
        }
    }, [permission, useUserLocation, userLocation, mapCenter, requestLocation])

    // Handle map center changes
    const handleMapCenterChange = useCallback((event: any) => {
        console.log('MapView: onCenterChanged event fired')

        // Try to get the map instance from the event
        const map = event?.target || event?.map || mapRef.current
        if (!map) {
            console.log('MapView: No map instance in event')
            return
        }

        const center = map.getCenter()
        const zoom = map.getZoom()

        if (center) {
            const newLocation = { latitude: center.lat(), longitude: center.lng() }
            console.log('MapView: Map center changed to:', newLocation, 'zoom:', zoom)
            setMapCenter(newLocation)

            if (zoom !== undefined) {
                setMapZoom(zoom)
            }

            // Don't automatically update search location or make API calls
            // User must explicitly click "Search this area" button
        } else {
            console.log('MapView: getCenter() returned null/undefined')
        }
    }, [mapRef])

    // Handle map bounds changes (alternative to center changed)
    const handleMapBoundsChange = useCallback((event: any) => {
        console.log('MapView: onBoundsChanged event fired')
        handleMapCenterChange(event)
    }, [handleMapCenterChange])

    // Handle map load
    const handleMapLoad = useCallback(() => {
        console.log('Map loaded successfully')
        // Note: Map ID styling is handled by the mapId prop
    }, [])

    // Show "search this area" button if map center differs from search location OR if no places loaded yet
    const shouldShowSearchButton = Math.abs(mapCenter.latitude - searchLocation.latitude) > 0.001 ||
                                  Math.abs(mapCenter.longitude - searchLocation.longitude) > 0.001 ||
                                  places.length === 0

    return (
        <MapProvider>
            <div className="relative text-black w-screen h-screen flex items-center justify-center z-0">
                {/* Location toggle UI - Debug info */}
                <div className="absolute top-4 left-4 z-50">
                    {/* Always show toggle for debugging */}
                    <div className="bg-white p-2 rounded shadow-lg mb-2 text-xs">
                        Permission: {permission} | Use Location: {useUserLocation.toString()}
                    </div>

                    {permission === 'prompt' && (
                        <div
                            className="bg-white p-4 rounded-lg shadow-lg border"
                            role="dialog"
                            aria-labelledby="location-prompt-title"
                            aria-describedby="location-prompt-desc"
                        >
                            <h3 id="location-prompt-title" className="text-sm font-medium mb-2">
                                Find places near you
                            </h3>
                            <p id="location-prompt-desc" className="text-sm mb-3 text-gray-600">
                                Enable location to discover historical sites within 31 miles of your current position
                            </p>
                            <button
                                onClick={toggleLocationUsage}
                                disabled={locationLoading}
                                className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                aria-label={locationLoading ? 'Getting your location' : 'Request location access'}
                            >
                                {locationLoading ? 'Getting location...' : 'Enable Location'}
                            </button>
                        </div>
                    )}

                    {permission === 'granted' && (
                        <button
                            onClick={toggleLocationUsage}
                            className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                useUserLocation
                                    ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500'
                            }`}
                            aria-label={useUserLocation ? 'Switch to map center mode' : 'Use your current location'}
                        >
                            {useUserLocation ? '📍 Following location' : '📍 Use my location'}
                        </button>
                    )}

                    {permission === 'denied' && (
                        <div
                            className="bg-amber-50 border border-amber-200 p-4 rounded-lg shadow-lg"
                            role="alert"
                            aria-live="polite"
                        >
                            <p className="text-sm text-amber-800">
                                Location access denied. Showing places around map center instead.
                            </p>
                        </div>
                    )}
                </div>

                {/* Search this area button */}
                {shouldShowSearchButton && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-green-200 flex flex-col items-center justify-center">
                            <p className="text-xs text-gray-600 mb-2 text-center">
                                Drag the map to explore, then click to search within 31 miles
                            </p>
                            <button
                                onClick={searchThisArea}
                                disabled={loading}
                                className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                                aria-label="Search for places in the current map area"
                            >
                                {loading ? 'Searching...' : '🔍 Search This Area'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading indicator */}
                {loading && (
                    <div
                        className="absolute top-4 right-4 z-50 bg-white p-3 rounded-lg shadow-lg border"
                        role="status"
                        aria-live="polite"
                    >
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" aria-hidden="true"></div>
                            <span className="text-sm">Loading places...</span>
                        </div>
                    </div>
                )}

                {/* Search radius circle overlay */}
                {shouldShowSearchButton && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                        <SearchRadiusCircle
                            center={mapCenter}
                            radius={SEARCH_RADIUS}
                            visible={true}
                            zoomLevel={mapZoom}
                        />
                    </div>
                )}

                <Map
                    style={containerStyle}
                    defaultCenter={center}
                    defaultZoom={mapZoom}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    mapId="6899f89edbf4a393d05523a5"
                    onCenterChanged={handleMapCenterChange}
                    onBoundsChanged={handleMapBoundsChange}
                >
                    {places && places.length > 0 && places.map((place) => (
                        <MapMarker
                            key={place.id}
                            location={place.location}
                            title={place.displayName?.text || 'Unknown Place'}
                            id={place.id}
                        />
                    ))}
                </Map>

                {/* Error display */}
                {error && (
                    <div
                        className="absolute bottom-4 left-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg max-w-sm"
                        role="alert"
                        aria-live="assertive"
                    >
                        <div className="flex items-start space-x-2">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium">Error loading places</h4>
                                <p className="text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MapProvider>
    )
}

export default MapView