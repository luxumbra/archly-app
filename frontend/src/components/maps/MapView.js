
'use client'
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import { useState, useEffect } from 'react';
import MapMarker from '@/components/maps/MapMarker'
import axios from 'axios';
import MapProvider from '@/providers/MapProvider';

const MapView = () => {
  const [places, setPlaces] = useState([]);
  const [mapRef, setMapRef] = useState(null);
  const [error, setError] = useState(null);
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  // Set the container style for a full-screen map
  const containerStyle = {
    width: '100vw',
    height: '100vh',
    zIndex: 0,
  };

  const center = {
    lat: 55.9533, // Default to Edinburgh, Scotland (example)
    lng: -3.1883,
  };

  useEffect(() => {
    // Fetch the places data from the backend API
    const fetchPlaces = async () => {
      try {
        const response = await fetch('http://archly.local/api/places/search?query=ancient+monuments+in+england&fields=places.displayName,places.formattedAddress,places.id,places.location'); // Update the URL with your backend's API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch places');
        }
        const data = await response.json();
        setPlaces(data.places); // Assuming the API returns a `places` array
      } catch (err) {
        setError(err.message);
      }
    };
    fetchPlaces();
  }, []);

  if (error) {
    return <div>Ooops. Error: {error}</div>
  }

  return (
    <MapProvider>
      <div className="relative text-black w-screen h-screen flex items-center justify-center z-0">
       <Map
        style={containerStyle}
        defaultCenter={center}
        defaultZoom={5}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        {places.length > 0 ? (
            places.map((place, index) => (
              <MapMarker key={place.id} location={place.location} title={place.displayName.text} id={place.id} />
            ))
        ) : (
            <div className="z-50">Loading...</div>
        )}
      </Map>
    </div>
      </MapProvider>
  );
};

export default MapView;
