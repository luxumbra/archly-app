'use client';
import { Marker } from '@vis.gl/react-google-maps';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation'

const MapMarker = ({ location = { latitude: 55.9533, longitude: -3.1883 }, title = 'Edinburgh Castle', id = 'ChIJXcSSfmcKcUgRFtOh9msKhd0' }) => {
  const router = useRouter()
  return (
    <Marker
      position={{ lat: location.latitude, lng: location.longitude }}
      title={title}
      onClick={() => router.push(`site/${id}`)}
    />
  )
}


export default MapMarker;