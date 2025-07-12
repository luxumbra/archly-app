import { APIProvider } from '@vis.gl/react-google-maps';
import { ReactNode } from 'react';

interface MapProviderProps {
    children: ReactNode;
}

const MapProvider = ({ children }: MapProviderProps) => {
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    if (!API_KEY) {
        throw new Error('Google Maps API key is required');
    }

    return (
        <APIProvider apiKey={API_KEY}>
            {children}
        </APIProvider>
    );
};

export default MapProvider;