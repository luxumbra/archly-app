'use client'
import { useEffect, useState } from 'react'
import { Location } from '@/types'

interface SearchRadiusCircleProps {
    center: Location
    radius: number // in meters
    visible: boolean
    zoomLevel?: number
}

const SearchRadiusCircle = ({ center, radius, visible, zoomLevel = 10 }: SearchRadiusCircleProps) => {
    const [circleSize, setCircleSize] = useState(500)

    useEffect(() => {
        if (!visible) return

        // Calculate the actual pixel size for the radius based on zoom level
        // This is an approximation - the exact calculation depends on the map projection
        const calculateCircleSize = () => {
            // Earth's circumference is about 40,075 km
            // At zoom level 0, the world is 256 pixels wide
            // Each zoom level doubles the scale
            const worldCircumference = 40075000 // meters
            const pixelsAtZoom0 = 256
            const scaleAtZoom = pixelsAtZoom0 * Math.pow(2, zoomLevel)

            // Calculate how many pixels represent our radius
            const pixelsPerMeter = scaleAtZoom / worldCircumference
            const radiusInPixels = radius * pixelsPerMeter

            // Adjust for latitude (mercator projection distortion)
            const latitudeRadians = center.latitude * Math.PI / 180
            const latitudeAdjustment = 1 / Math.cos(latitudeRadians)
            const adjustedSize = radiusInPixels * latitudeAdjustment

            console.log('SearchRadiusCircle: Calculated size:', adjustedSize, 'px for', radius, 'meters at zoom', zoomLevel)
            setCircleSize(Math.max(50, Math.min(1000, adjustedSize))) // Clamp between 50-1000px
        }

        calculateCircleSize()
    }, [center, radius, visible, zoomLevel])

    console.log('SearchRadiusCircle render:', { center, radius, visible, circleSize, zoomLevel })

    if (!visible) {
        console.log('SearchRadiusCircle: Not visible, returning null')
        return null
    }

    console.log('SearchRadiusCircle: Rendering circle overlay with size:', circleSize)
    return (
        <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            style={{ zIndex: 5 }}
        >
            <div
                className="border-4 border-green-500 rounded-full bg-green-500 bg-opacity-20"
                style={{
                    width: `${circleSize}px`,
                    height: `${circleSize}px`,
                    borderColor: '#99A873',
                    backgroundColor: 'rgba(153, 168, 115, 0.2)',
                    boxShadow: '0 0 20px rgba(153, 168, 115, 0.4)'
                }}
                title={`Search radius: ${Math.round(radius / 1609.34)} miles`}
            />
        </div>
    )
}

export default SearchRadiusCircle