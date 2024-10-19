// SiteDetailMap.js
import MapProvider from '@/providers/MapProvider'
import { Map } from '@vis.gl/react-google-maps'
import MapMarker from '@/components/maps/MapMarker'

const SiteDetailMap = ({ location, title, id }) => {
    const containerStyle = {
        width: '100%',
        height: '100%',
    }

    return (
        <div className="relative text-black w-full h-full flex items-center justify-center z-0">
            <MapProvider>
                <Map
                    style={containerStyle}
                    defaultCenter={{
                        lat: location.latitude,
                        lng: location.longitude,
                    }}
                    defaultZoom={12}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}>
                    <MapMarker location={location} title={title} id={id} />
                </Map>
            </MapProvider>
        </div>
    )
}

export default SiteDetailMap
