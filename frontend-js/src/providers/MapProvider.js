// GoogleMapProvider.js
import { APIProvider } from '@vis.gl/react-google-maps';

const MapProvider = ({ children }) => {
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    return (
        <APIProvider apiKey={API_KEY}>
            {children}
        </APIProvider>
    );
};

export default MapProvider;
