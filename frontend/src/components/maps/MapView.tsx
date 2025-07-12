'use client'
import { Map } from '@vis.gl/react-google-maps'
import { useState, useEffect } from 'react'
import MapMarker from '@/components/maps/MapMarker'
import MapProvider from '@/providers/MapProvider'
import { Place, PlacesSearchResponse, Location } from '@/types'

interface MapViewProps {
    initialQuery?: string
    initialLocation?: Location
}

const MapView = ({ 
    initialQuery = 'ancient+monuments+in+england',
    initialLocation = { latitude: 55.9533, longitude: -3.1883 }
}: MapViewProps) => {
    const [places, setPlaces] = useState<Place[]>([])
    const [error, setError] = useState<string | null>(null)
    const API_URI = process.env.NEXT_PUBLIC_API_URL

    // Set the container style for a full-screen map
    const containerStyle = {
        width: '100vw',
        height: '100vh',
        zIndex: 0,
    }

    const center = {
        lat: initialLocation.latitude,
        lng: initialLocation.longitude,
    }

    useEffect(() => {
        // Fetch the places data from the backend API
        const fetchPlaces = async () => {
            try {
                const response = await fetch(
                    `${API_URI}/places/search?query=${initialQuery}&fields=places.displayName,places.formattedAddress,places.id,places.location`
                )
                
                if (!response.ok) {
                    throw new Error('Failed to fetch places')
                }
                
                const data: PlacesSearchResponse = await response.json()
                
                // Handle both success and error responses
                if (data.places && Array.isArray(data.places)) {
                    setPlaces(data.places)
                } else if (data.error) {
                    throw new Error(data.error)
                } else {
                    setPlaces([])
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            }
        }
        
        fetchPlaces()
    }, [API_URI, initialQuery])

    if (error) {
        return <div>Oops. Error: {error}</div>
    }

    return (
        <MapProvider>
            <div className="relative text-black w-screen h-screen flex items-center justify-center z-0">
                <Map
                    style={containerStyle}
                    defaultCenter={center}
                    defaultZoom={5}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                >
                    {places && places.length > 0 ? (
                        places.map((place) => (
                            <MapMarker 
                                key={place.id} 
                                location={place.location} 
                                title={place.displayName.text} 
                                id={place.id} 
                            />
                        ))
                    ) : (
                        <div className="z-50">Loading...</div>
                    )}
                </Map>
            </div>
        </MapProvider>
    )
}

export default MapView