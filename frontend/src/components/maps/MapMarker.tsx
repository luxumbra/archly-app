'use client'
import { slugify } from '@/utils/stringUtils'
import { Marker } from '@vis.gl/react-google-maps'
import { useRouter } from 'next/navigation'
import { MapMarkerProps } from '@/types'

const MapMarker = ({
    location = { latitude: 55.9533, longitude: -3.1883 },
    title = 'Edinburgh Castle',
    id = 'ChIJXcSSfmcKcUgRFtOh9msKhd0',
}: MapMarkerProps) => {
    const router = useRouter()
    const slug = slugify(title)
    
    console.log({ slug, id })
    
    const handleNavigate = (slug: string, placeId: string) => {
        router.push(`/site/${slug}?id=${placeId}`)
    }
    
    return (
        <Marker
            position={{ lat: location.latitude, lng: location.longitude }}
            title={title}
            onClick={() => handleNavigate(slug, id)}
        />
    )
}

export default MapMarker