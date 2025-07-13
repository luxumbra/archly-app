import MapProvider from '@/providers/MapProvider'
import { Map } from '@vis.gl/react-google-maps'
import MapMarker from '@/components/maps/MapMarker'
import { SiteDetailMapProps } from '@/types'
import { yoreMapStyle } from '@/utils/mapStyles'

const SiteDetailMap = ({ location, title, id }: SiteDetailMapProps) => {
    const containerStyle = {
        width: '100%',
        height: '100%',
    }

    // Don't render map if location data is missing or invalid
    if (!location || typeof location.latitude === 'undefined' || typeof location.longitude === 'undefined') {
        console.log('SiteDetailMap: Location data missing or invalid:', location)
        return (
            <div className="relative text-black w-full h-full flex items-center justify-center z-0 bg-gray-100">
                <div className="text-gray-600">Location not available for this site</div>
            </div>
        )
    }

    console.log('SiteDetailMap: Rendering map with location:', location)

    return (
        <div className="relative text-black w-full h-full flex items-center justify-center z-0">
            <MapProvider>
                <Map
                    style={containerStyle}
                    defaultCenter={{
                        lat: location.latitude,
                        lng: location.longitude,
                    }}
                    defaultZoom={18}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    mapId="6899f89edbf4a393d05523a5"
                    mapTypeId="satellite"
                    >
                    <MapMarker location={location} title={title || 'Unknown Site'} id={id || ''} />
                </Map>
            </MapProvider>
        </div>
    )
}

export default SiteDetailMap