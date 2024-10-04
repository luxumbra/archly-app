import LoginLinks from '@/app/LoginLinks'
import MapView from '@/components/maps/MapView'

export const metadata = {
    title: 'Laravel',
}

const Home = () => {
    return (
        <>
            <div className="relative flex items-top justify-center min-h-screen bg-gray-100 dark:bg-transparent sm:items-center sm:pt-0">
                <LoginLinks />
                <MapView />
            </div>
        </>
    )
}

export default Home
