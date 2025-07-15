import MapView from '@/components/maps/MapView'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Yore - History in your hands',
    description: 'Discover ancient monuments and archaeological sites in England',
}

const Home = () => {
    return (
        <>
            <MapView />
        </>
    )
}

export default Home
