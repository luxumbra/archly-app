// src/app/site/[id]/page.js
'use client'; // Declare the component as client-side

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Use next/navigation in the app directory
import axios from 'axios';
import Link from 'next/link';

const SiteDetail = () => {
  const params = useParams();
  const {id} = params;
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //
  const

  useEffect(() => {
    if (id) {
      const fetchPlaceDetails = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/places/details`,
            {
              params: {
                place_id: id, // Use the place_id from the query param
                noCache: true,
                fields: '*',
              },
            }
          );

          const { data } = response;
          console.log({data});
          setPlace(data);
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch place details');
          setLoading(false);
        }
      };

      fetchPlaceDetails();
    }
  }, [id]);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!place) return <p>No place found.</p>;

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="flex flex-col items-start p-32">
        <h1 className="text-3xl">{place.displayName.text}</h1>
        <p>{place.primaryType}</p>
        <p>Address: {place.formattedAddress}</p>
        <p>Location: lat: {place.location.latitude} lng: {place.location.longitude}</p>
        <p>Rating: {place.rating ?? 'Not yet rated. Get out there and check it out.'}</p>
        <div className="mt-5">
          <p><a href="https://www.google.com/maps/dir//51.4256944,-1.7826389" target="_blank">Directions</a></p>
          <p><Link href="/">Back to map</Link></p>
        </div>
        </div>
    </div>
  );
};

export default SiteDetail;
