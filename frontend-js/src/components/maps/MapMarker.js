'use client'
import { slugify, toUnderscore } from '@/utils/stringUtils'
import { Marker } from '@vis.gl/react-google-maps'
import { useRouter } from 'next/navigation'

const MapMarker = ({
    location = { latitude: 55.9533, longitude: -3.1883 },
    title = 'Edinburgh Castle',
    id = 'ChIJXcSSfmcKcUgRFtOh9msKhd0',
}) => {
    const router = useRouter()
    const slug = slugify(title)
    console.log({slug, id});
    const handleNavigate = (slug, placeId) => {
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
